import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Edit, ChevronLeft, ChevronRight, UserPlus, X, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import { volunteerService } from '../../services/volunteerService';
import { useTranslation } from '../../locales/translations';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
};

interface VolunteerShift {
  id: string;
  title: string;
  description: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  max_volunteers: number;
  current_volunteers: number;
  role_type: string;
  status: 'draft' | 'live' | 'full' | 'cancelled';
  check_in_required: boolean;
}

interface VolunteerSignup {
  id: string;
  shift_id: string;
  volunteer_id: string;
  status: 'signed_up' | 'confirmed' | 'checked_in' | 'no_show' | 'cancelled';
  signed_up_at: string;
  reminder_sent: boolean;
  checked_in_at?: string;
  qr_code?: string;
}

interface CalendarViewProps {
  t: any;
  currentUser: any;
  language: 'fr' | 'en' | 'es';
  volunteerShifts: VolunteerShift[];
  setVolunteerShifts: React.Dispatch<React.SetStateAction<VolunteerShift[]>>;
  volunteerSignups: VolunteerSignup[];
  setVolunteerSignups: React.Dispatch<React.SetStateAction<VolunteerSignup[]>>;
  onSignUp: (shiftId: string) => void;
  onCreateShift: (shift: Partial<VolunteerShift>) => void;
  onShiftClick?: (shift: VolunteerShift) => void; // 🎯 NOUVEAU
}

// Types de vue
type ViewMode = 'day' | 'fourDays' | 'week';

const CalendarView: React.FC<CalendarViewProps> = ({
  t,
  currentUser,
  language = 'en',
  volunteerShifts,
  setVolunteerShifts,
  volunteerSignups = [],
  setVolunteerSignups,
  onSignUp,
  onCreateShift,
  onShiftClick // 🎯 NOUVEAU: Callback pour gérer les clics organisateurs
}) => {
  const { translate } = useTranslation(language);
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  // État pour le mode d'affichage
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  // État pour le jour de début en vue 4 jours
  const [fourDaysStartIndex, setFourDaysStartIndex] = useState(0); // 0 = lundi, 1 = mardi, etc.
  
  const [draggedShift, setDraggedShift] = useState<VolunteerShift | null>(null);
  const [draggedOverSlot, setDraggedOverSlot] = useState<{day: number, hour: number, minutes?: number} | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{day: number, hour: number, date: string, startMinutes?: number} | null>(null);
  const [showShiftDetails, setShowShiftDetails] = useState<VolunteerShift | null>(null);
  const [showEditShift, setShowEditShift] = useState<VolunteerShift | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editShiftData, setEditShiftData] = useState({
    title: '',
    description: '',
    shift_date: '',
    start_time: '',
    end_time: '',
    max_volunteers: 1,
    role_type: '',
    check_in_required: true
  });
  const [quickCreateData, setQuickCreateData] = useState({
    title: '',
    max_volunteers: 1,
    duration: 120, // 🎯 NOUVEAU: Durée en minutes par défaut (2h)
    startMinutes: 0 // 🎯 NOUVEAU: Minutes de début (0, 15, 30, 45)
  });

  // 🎯 NOUVEAU: Options de minutes
  const minuteOptions = [
    { value: 0, label: ':00' },
    { value: 15, label: ':15' },
    { value: 30, label: ':30' },
    { value: 45, label: ':45' }
  ];

  // 🎯 NOUVEAU: Options de durée en minutes
  const durationOptions = [
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '1h00' },
    { value: 75, label: '1h15' },
    { value: 90, label: '1h30' },
    { value: 120, label: '2h00' },
    { value: 180, label: '3h00' },
    { value: 240, label: '4h00' }
  ];

  // Fonction pour vérifier les conflits d'horaires avant l'affichage
  const checkOverlapForDisplay = (targetShift: VolunteerShift, volunteerId: string): boolean => {
    if (currentUser?.role !== 'volunteer' || !volunteerId) return false;

    // Récupérer les inscriptions actives du bénévole
    const activeSignups = volunteerSignups.filter(signup => 
      signup.volunteer_id === volunteerId && 
      signup.status !== 'cancelled'
    );

    return activeSignups.some(signup => {
      const existingShift = volunteerShifts.find(s => s.id === signup.shift_id);
      if (!existingShift || existingShift.shift_date !== targetShift.shift_date) return false;

      // Convertir les heures en minutes pour la comparaison
      const targetStart = timeToMinutes(targetShift.start_time);
      const targetEnd = timeToMinutes(targetShift.end_time);
      const existingStart = timeToMinutes(existingShift.start_time);
      const existingEnd = timeToMinutes(existingShift.end_time);

      // Vérifier le chevauchement
      return targetStart < existingEnd && targetEnd > existingStart;
    });
  };

  // Fonction utilitaire pour convertir l'heure en minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Configuration du calendrier
  const hoursRange = Array.from({ length: 18 }, (_, i) => i + 6); // 6h à 23h
  
  // Fonction pour obtenir les jours à afficher selon le mode
  const getDisplayDays = () => {
    const today = new Date();
    const week = getWeekDates(currentWeek);
    
    switch (viewMode) {
      case 'day':
        // Vue jour : jour actuel ou jour sélectionné
        return [currentWeek];
      case 'fourDays':
        // Vue 4 jours : 4 jours consécutifs à partir de l'index sélectionné
        return week.slice(fourDaysStartIndex, fourDaysStartIndex + 4);
      case 'week':
      default:
        // Vue semaine : toute la semaine
        return week;
    }
  };

  // Jours de la semaine traduits
  const daysOfWeek = [
    translate('dayMonday') || 'Lundi',
    translate('dayTuesday') || 'Mardi',
    translate('dayWednesday') || 'Mercredi',
    translate('dayThursday') || 'Jeudi',
    translate('dayFriday') || 'Vendredi',
    translate('daySaturday') || 'Samedi',
    translate('daySunday') || 'Dimanche'
  ];
  
  // Calculer les dates de la semaine
  const getWeekDates = (date: Date): Date[] => {
    const week: Date[] = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lundi = premier jour
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      week.push(currentDate);
    }
    return week;
  };

  // Obtenir les dates à afficher
  const displayDates = getDisplayDays();
  const weekDates = getWeekDates(currentWeek);

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(currentWeek);
    if (viewMode === 'day') {
      newDate.setDate(currentWeek.getDate() - 1);
    } else if (viewMode === 'fourDays') {
      // En vue 4 jours, déplacer de 4 jours OU décaler l'index de début
      if (fourDaysStartIndex > 0) {
        // Si on peut encore décaler dans la semaine actuelle
        setFourDaysStartIndex(prev => Math.max(0, prev - 1));
        return; // Ne pas changer la semaine
      } else {
        // Sinon, aller à la semaine précédente et se positionner à la fin
        newDate.setDate(currentWeek.getDate() - 7);
        setFourDaysStartIndex(3); // Commencer à jeudi de la semaine précédente
      }
    } else {
      newDate.setDate(currentWeek.getDate() - 7);
    }
    setCurrentWeek(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentWeek);
    if (viewMode === 'day') {
      newDate.setDate(currentWeek.getDate() + 1);
    } else if (viewMode === 'fourDays') {
      // En vue 4 jours, déplacer de 4 jours OU décaler l'index de début
      if (fourDaysStartIndex < 3) { // 3 car on va jusqu'à l'index 6 (dimanche)
        // Si on peut encore décaler dans la semaine actuelle
        setFourDaysStartIndex(prev => Math.min(3, prev + 1));
        return; // Ne pas changer la semaine
      } else {
        // Sinon, aller à la semaine suivante et se positionner au début
        newDate.setDate(currentWeek.getDate() + 7);
        setFourDaysStartIndex(0); // Commencer à lundi de la semaine suivante
      }
    } else {
      newDate.setDate(currentWeek.getDate() + 7);
    }
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
    // Réinitialiser l'index pour la vue 4 jours
    if (viewMode === 'fourDays') {
      setFourDaysStartIndex(0);
    }
  };

  // Fonction pour obtenir les créneaux qui se chevauchent
  const getOverlappingShifts = (shifts: VolunteerShift[]) => {
    const sortedShifts = [...shifts].sort((a, b) => {
      const timeA = parseInt(a.start_time.replace(':', ''));
      const timeB = parseInt(b.start_time.replace(':', ''));
      return timeA - timeB;
    });

    const overlappingGroups: VolunteerShift[][] = [];
    let currentGroup: VolunteerShift[] = [];

    for (const shift of sortedShifts) {
      const shiftStart = parseInt(shift.start_time.replace(':', ''));
      const shiftEnd = parseInt(shift.end_time.replace(':', ''));

      // Vérifier si ce créneau chevauche avec le groupe actuel
      const overlapsWithCurrent = currentGroup.some(groupShift => {
        const groupStart = parseInt(groupShift.start_time.replace(':', ''));
        const groupEnd = parseInt(groupShift.end_time.replace(':', ''));
        return (shiftStart < groupEnd && shiftEnd > groupStart);
      });

      if (overlapsWithCurrent) {
        currentGroup.push(shift);
      } else {
        if (currentGroup.length > 0) {
          overlappingGroups.push([...currentGroup]);
        }
        currentGroup = [shift];
      }
    }

    if (currentGroup.length > 0) {
      overlappingGroups.push(currentGroup);
    }

    return overlappingGroups;
  };

  // Fonction pour formater les dates selon la langue et le mode
  const formatPeriodRange = (): string => {
    const locales = {
      fr: 'fr-FR',
      en: 'en-US',
      es: 'es-ES'
    };
    
    const locale = locales[language];
    
    if (viewMode === 'day') {
      return currentWeek.toLocaleDateString(locale, { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } else if (viewMode === 'fourDays') {
      const start = displayDates[0];
      const end = displayDates[displayDates.length - 1];
      const startStr = start.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
      const endStr = end.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    } else {
      const start = displayDates[0];
      const end = displayDates[displayDates.length - 1];
      const startStr = start.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
      const endStr = end.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    }
  };

  const formatDate = (date: Date): string => {
    const locales = {
      fr: 'fr-FR',
      en: 'en-US',
      es: 'es-ES'
    };
    
    return date.toLocaleDateString(locales[language], { 
      day: 'numeric', 
      month: 'short'
    });
  };

  // 🎯 NOUVEAU: Obtenir les créneaux pour un slot avec gestion des chevauchements et quarts d'heure
  const getShiftsForSlot = (date: Date, hour: number) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const nowParis = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Paris"}));
    const nowYear = nowParis.getFullYear();
    const nowMonth = (nowParis.getMonth() + 1).toString().padStart(2, '0');
    const nowDay = nowParis.getDate().toString().padStart(2, '0');
    const currentDateStr = `${nowYear}-${nowMonth}-${nowDay}`;
    const currentHour = nowParis.getHours();
    
    const shiftsForDate = volunteerShifts.filter(shift => {
      if (shift.shift_date !== dateStr) return false;
      
      if (currentUser?.role === 'volunteer' && shift.status === 'draft') return false;
      
      if (currentUser?.role === 'volunteer') {
        const shiftDate = new Date(shift.shift_date);
        const shiftEndHour = parseInt(shift.end_time.split(':')[0]);
        const shiftEndMinute = parseInt(shift.end_time.split(':')[1]);
        
        if (date < new Date(currentDateStr)) return false;
        
        if (shift.shift_date === currentDateStr) {
          const currentTime = currentHour * 60 + nowParis.getMinutes();
          const shiftEndTime = shiftEndHour * 60 + shiftEndMinute;
          if (currentTime > shiftEndTime) return false;
        }
      }
      
      const startHour = parseInt(shift.start_time.split(':')[0]);
      const endHour = parseInt(shift.end_time.split(':')[0]);
      const endMinute = parseInt(shift.end_time.split(':')[1]);
      
      // 🎯 NOUVEAU: Inclure le créneau si l'heure de début est dans cette heure
      // OU si la fin dépasse dans cette heure
      return (startHour === hour) || (startHour < hour && (endHour > hour || (endHour === hour && endMinute > 0)));
    });

    return shiftsForDate;
  };

  // 🎯 NOUVEAU: Calculer la hauteur d'un créneau en fonction de sa durée (avec gestion des minutes)
  const getShiftHeight = (shift: VolunteerShift) => {
    const [startHour, startMinute] = shift.start_time.split(':').map(Number);
    const [endHour, endMinute] = shift.end_time.split(':').map(Number);
    
    const durationInMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    return (durationInMinutes / 60) * 64; // 64px par heure
  };

  // 🎯 NOUVEAU: Calculer la position verticale d'un créneau (avec gestion des minutes)
  const getShiftTop = (shift: VolunteerShift) => {
    const [startHour, startMinute] = shift.start_time.split(':').map(Number);
    
    return (startMinute * 64) / 60; // 64px par heure, proportionnel aux minutes
  };

  // Calculer la position horizontale pour les créneaux qui se chevauchent
  const getShiftPosition = (shift: VolunteerShift, shiftsInSlot: VolunteerShift[]) => {
    if (shiftsInSlot.length <= 1) {
      return { left: '4px', right: '4px', width: 'calc(100% - 8px)' };
    }

    const overlappingGroups = getOverlappingShifts(shiftsInSlot);
    
    for (const group of overlappingGroups) {
      const shiftIndex = group.findIndex(s => s.id === shift.id);
      if (shiftIndex !== -1) {
        const totalInGroup = group.length;
        const widthPercentage = 100 / totalInGroup;
        const leftPercentage = shiftIndex * widthPercentage;
        
        return {
          left: `${leftPercentage}%`,
          width: `${widthPercentage}%`,
          right: 'auto'
        };
      }
    }

    return { left: '4px', right: '4px', width: 'calc(100% - 8px)' };
  };

  // Vérifier si l'utilisateur est inscrit à un créneau
  const isUserSignedUpForShift = (shiftId: string) => {
    if (currentUser?.role !== 'volunteer' || !currentUser?.id || !volunteerSignups || !Array.isArray(volunteerSignups)) return false;
    return volunteerSignups.some(signup => 
      signup.shift_id === shiftId && 
      signup.volunteer_id === currentUser.id &&
      signup.status !== 'cancelled'
    );
  };

  // Helper pour vérifier si un créneau est complet
  const isShiftFull = (shift: VolunteerShift) => {
    return shift.current_volunteers >= shift.max_volunteers || shift.status === 'full';
  };

  // Helper pour vérifier si on peut s'inscrire à un créneau
  const canSignUpForShift = (shift: VolunteerShift) => {
    return shift.status === 'live' && !isShiftFull(shift);
  };

  // Fonction pour obtenir le statut traduit
  const getLocalizedShiftStatus = (status: string): string => {
    switch (status) {
      case 'draft':
        return translate('shiftStatusDraft') || 'Draft';
      case 'live':
        return translate('shiftStatusLive') || 'Live';
      case 'full':
        return translate('shiftStatusFull') || 'Full';
      case 'cancelled':
        return translate('shiftStatusCancelled') || 'Cancelled';
      default:
        return status;
    }
  };

  // Couleur selon le status du créneau et si l'utilisateur est inscrit + gestion des conflits
  const getShiftColor = (shift: VolunteerShift) => {
    const fillRate = shift.current_volunteers / shift.max_volunteers;
    
    const isUserSignedUp = currentUser?.role === 'volunteer' && 
                          currentUser?.id && 
                          volunteerSignups && 
                          Array.isArray(volunteerSignups) &&
                          volunteerSignups.some(signup => 
                            signup.shift_id === shift.id && 
                            signup.volunteer_id === currentUser.id &&
                            signup.status !== 'cancelled'
                          );

    // Vérifier les conflits d'horaires pour les bénévoles
    const hasOverlapConflict = currentUser?.role === 'volunteer' && 
                              currentUser?.id && 
                              !isUserSignedUp &&
                              checkOverlapForDisplay(shift, currentUser.id);
    
    if (shift.status === 'cancelled') return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
    if (shift.status === 'draft') return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
    
    if (isUserSignedUp) {
      return 'bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-blue-300 text-white shadow-xl shadow-blue-500/40 ring-4 ring-blue-400/30';
    }

    // Afficher les créneaux en conflit avec une couleur spéciale
    if (hasOverlapConflict) {
      return 'bg-gradient-to-r from-red-500/30 to-orange-500/30 border-2 border-red-400/60 text-red-200 shadow-lg shadow-red-500/20 ring-2 ring-red-400/40';
    }
    
    if (shift.status === 'full' || fillRate >= 1) return 'bg-green-500/20 border-green-500/40 text-green-300';
    
    if (fillRate === 0) return 'bg-red-500/20 border-red-500/40 text-red-300';
    if (fillRate < 0.5) return 'bg-orange-500/20 border-orange-500/40 text-orange-300';
    if (fillRate < 1) return 'bg-lime-500/20 border-lime-500/40 text-lime-300';
    return 'bg-green-500/20 border-green-500/40 text-green-300';
  };

  // Drag & Drop pour organisateurs
  const handleDragStart = (e: React.DragEvent, shift: VolunteerShift) => {
    if (currentUser?.role !== 'organizer' && currentUser?.role !== 'admin') return;
    setDraggedShift(shift);
    setDraggedOverSlot(null);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 🎯 NOUVEAU: Drag & Drop amélioré avec gestion des quarts d'heure
  const handleDragOver = (e: React.DragEvent, dayIndex: number, hour: number, minutes: number = 0) => {
    if (!draggedShift) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverSlot({ day: dayIndex, hour, minutes });
  };

  const handleDragEnd = () => {
    setDraggedShift(null);
    setDraggedOverSlot(null);
  };

  // 🎯 NOUVEAU: DRAG & DROP avec Supabase et gestion des quarts d'heure
  const handleDrop = async (e: React.DragEvent, dayIndex: number, hour: number, minutes: number = 0) => {
    e.preventDefault();
    if (!draggedShift) return;

    const newDate = displayDates[dayIndex];
    const year = newDate.getFullYear();
    const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = newDate.getDate().toString().padStart(2, '0');
    const newDateStr = `${year}-${month}-${dayStr}`;
    
    const nowParis = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Paris"}));
    const nowYear = nowParis.getFullYear();
    const nowMonth = (nowParis.getMonth() + 1).toString().padStart(2, '0');
    const nowDay = nowParis.getDate().toString().padStart(2, '0');
    const currentDateStr = `${nowYear}-${nowMonth}-${nowDay}`;
    
    const newDateParis = new Date(newDate.toLocaleString("en-US", {timeZone: "Europe/Paris"}));
    const todayParis = new Date(nowParis.toDateString());
    
    if (newDateParis < todayParis) {
      alert(translate('errorCannotMoveToPast') || 'Cannot move to past date');
      setDraggedShift(null);
      setDraggedOverSlot(null);
      return;
    }
    
    // 🎯 NOUVEAU: Vérification avec les minutes
    const newTimeInMinutes = hour * 60 + minutes;
    const currentTimeInMinutes = nowParis.getHours() * 60 + nowParis.getMinutes();
    
    if (newDateStr === currentDateStr && newTimeInMinutes < currentTimeInMinutes) {
      alert(translate('errorCannotMoveToCurrentPastHour') || 'Cannot move to past hour');
      setDraggedShift(null);
      setDraggedOverSlot(null);
      return;
    }
    
    // 🎯 NOUVEAU: Calculer la durée du shift original
    const [originalStartHour, originalStartMinute] = draggedShift.start_time.split(':').map(Number);
    const [originalEndHour, originalEndMinute] = draggedShift.end_time.split(':').map(Number);
    
    const originalDurationMinutes = (originalEndHour * 60 + originalEndMinute) - (originalStartHour * 60 + originalStartMinute);
    
    // 🎯 NOUVEAU: Calculer les nouvelles heures avec les minutes
    const newStartTimeMinutes = hour * 60 + minutes;
    const newEndTimeMinutes = newStartTimeMinutes + originalDurationMinutes;
    
    const newStartHour = Math.floor(newStartTimeMinutes / 60);
    const newStartMinute = newStartTimeMinutes % 60;
    const newEndHour = Math.floor(newEndTimeMinutes / 60);
    const newEndMinute = newEndTimeMinutes % 60;

    const updates = {
      shift_date: newDateStr,
      start_time: `${newStartHour.toString().padStart(2, '0')}:${newStartMinute.toString().padStart(2, '0')}`,
      end_time: `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`
    };

    try {
      console.log('🔄 Déplacement shift vers quart d\'heure:', draggedShift.id, updates);
      
      const { error } = await volunteerService.updateShift(draggedShift.id, updates);
      
      if (error) {
        console.error('❌ Erreur déplacement:', error);
        alert(`${translate('errorMoveError') || 'Error moving shift'}: ${error.message}`);
        setDraggedShift(null);
        setDraggedOverSlot(null);
        return;
      }

      console.log('✅ Shift déplacé avec succès vers quart d\'heure');

      // Mettre à jour l'état local
      setVolunteerShifts(shifts =>
        shifts.map(shift =>
          shift.id === draggedShift.id
            ? { ...shift, ...updates }
            : shift
        )
      );

    } catch (error) {
      console.error('❌ Erreur catch déplacement:', error);
      alert(`${translate('errorMoveError') || 'Error moving shift'}: ${getErrorMessage(error)}`);
    }

    setDraggedShift(null);
    setDraggedOverSlot(null);
  };

  // 🎯 NOUVEAU: Calculer l'heure de fin basée sur la durée en minutes
  const calculateEndTime = (startHour: number, startMinutes: number, durationMinutes: number) => {
    const totalStartMinutes = startHour * 60 + startMinutes;
    const totalEndMinutes = totalStartMinutes + durationMinutes;
    
    const endHour = Math.floor(totalEndMinutes / 60);
    const endMinutes = totalEndMinutes % 60;
    
    return {
      hour: endHour,
      minutes: endMinutes,
      formatted: `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
    };
  };

  // 🎯 MODIFIER: Gestion des clics sur les créneaux avec support du callback organisateur
  const handleSlotClick = (dayIndex: number, hour: number, quarterHour: number | null = null) => {
    const date = displayDates[dayIndex];
    const existingShifts = getShiftsForSlot(date, hour);
    
    if (currentUser?.role === 'volunteer' && currentUser?.id) {
      if (existingShifts.length > 0 && quarterHour === null) {
        const shift = existingShifts[0];
        if (shift.status === 'live') {
          // Vérifier le conflit avant d'afficher les détails
          const hasOverlapConflict = checkOverlapForDisplay(shift, currentUser.id);
          const isAlreadySignedUp = isUserSignedUpForShift(shift.id);
          
          if (hasOverlapConflict && !isAlreadySignedUp) {
            // Afficher une alerte pour informer du conflit
            const conflictMessage = language === 'fr' 
              ? `⚠️ Attention: Ce créneau chevauche avec vos inscriptions existantes. Vous pouvez consulter les détails mais l'inscription pourrait créer un conflit d'horaires.`
              : language === 'es'
              ? `⚠️ Atención: Este turno se superpone con tus inscripciones existentes. Puedes consultar los detalles pero la inscripción podría crear un conflicto de horarios.`
              : `⚠️ Warning: This shift overlaps with your existing signups. You can view details but signup may create scheduling conflicts.`;
            
            if (confirm(`${conflictMessage}\n\nVoulez-vous continuer? / ¿Quieres continuar? / Do you want to continue?`)) {
              setShowShiftDetails(shift);
            }
          } else {
            setShowShiftDetails(shift);
          }
        }
      }
      return;
    }
    
    if (currentUser?.role !== 'organizer' && currentUser?.role !== 'admin') return;
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    
    const nowParis = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Paris"}));
    const nowYear = nowParis.getFullYear();
    const nowMonth = (nowParis.getMonth() + 1).toString().padStart(2, '0');
    const nowDay = nowParis.getDate().toString().padStart(2, '0');
    const currentDateStr = `${nowYear}-${nowMonth}-${nowDay}`;
    
    const selectedDateParis = new Date(date.toLocaleString("en-US", {timeZone: "Europe/Paris"}));
    const todayParis = new Date(nowParis.toDateString());
    
    if (selectedDateParis < todayParis) {
      alert(translate('errorCannotCreateInPast') || 'Cannot create in the past');
      return;
    }
    
    if (dateStr === currentDateStr && hour < nowParis.getHours()) {
      alert(translate('errorCannotCreateAtPastHour') || 'Cannot create at past hour');
      return;
    }
    
    if (existingShifts.length > 0 && quarterHour === null) {
      // 🎯 NOUVEAU: Utiliser le callback pour les organisateurs
      if (onShiftClick) {
        onShiftClick(existingShifts[0]);
      } else {
        setShowShiftDetails(existingShifts[0]);
      }
      return;
    }

    // 🎯 NOUVEAU: Définir les minutes de début selon le clic
    const startMinutes = quarterHour !== null ? quarterHour : 0;
    
    setSelectedSlot({ 
      day: dayIndex, 
      hour, 
      date: dateStr,
      startMinutes // 🎯 NOUVEAU: Stocker les minutes de début
    });
    setQuickCreateData(prev => ({
      ...prev,
      startMinutes // 🎯 NOUVEAU: Mettre à jour les minutes dans le formulaire
    }));
    setShowCreateModal(true);
  };

  // CRÉATION avec Supabase et messages traduits
  const createQuickShift = async () => {
    if (!selectedSlot || isCreating) return;

    setIsCreating(true);
    try {
      console.log('🚀 Création rapide shift calendrier:', selectedSlot);

      // 🎯 NOUVEAU: Calcul des heures avec gestion des minutes
      const startTime = `${selectedSlot.hour.toString().padStart(2, '0')}:${(selectedSlot.startMinutes || 0).toString().padStart(2, '0')}`;
      const endTime = calculateEndTime(selectedSlot.hour, selectedSlot.startMinutes || 0, quickCreateData.duration).formatted;

      const shiftData = {
        event_id: 'a9d1c983-1456-4007-9aec-b297dd095ff7',
        title: quickCreateData.title || `${translate('quickCreatePlaceholder') || 'Shift'} ${selectedSlot.hour}h${(selectedSlot.startMinutes || 0).toString().padStart(2, '0')}`,
        description: '',
        shift_date: selectedSlot.date,
        start_time: startTime,
        end_time: endTime,
        max_volunteers: quickCreateData.max_volunteers,
        current_volunteers: 0,
        role_type: 'general',
        difficulty_level: 'beginner',
        status: 'draft',
        check_in_required: true,
        qr_code_enabled: true,
        created_by: currentUser?.id || ''
      };

      const { data, error } = await volunteerService.createShift(shiftData);

      if (error) {
        console.error('❌ Erreur création shift calendrier:', error);
        alert(`${translate('errorCreateError') || 'Error creating shift'}: ${error.message}`);
        return;
      }

      console.log('✅ Shift créé avec succès:', data);

      const localShift = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        shift_date: data.shift_date,
        start_time: data.start_time,
        end_time: data.end_time,
        max_volunteers: data.max_volunteers,
        current_volunteers: data.current_volunteers || 0,
        role_type: data.role_type,
        status: data.status,
        check_in_required: data.check_in_required || false
      };

      // Mettre à jour l'état local directement
      setVolunteerShifts(prev => [...prev, localShift]);
      
      // Fermer le modal
      setShowCreateModal(false);
      setQuickCreateData({ title: '', max_volunteers: 1, duration: 120, startMinutes: 0 });
      setSelectedSlot(null);

      alert(translate('successShiftCreated') || 'Shift created successfully');

    } catch (error) {
      console.error('❌ Erreur catch:', error);
      alert(`${translate('errorCreateError') || 'Error creating shift'}: ${getErrorMessage(error)}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditShift = (shift: VolunteerShift) => {
    setEditShiftData({
      title: shift.title,
      description: shift.description,
      shift_date: shift.shift_date,
      start_time: shift.start_time,
      end_time: shift.end_time,
      max_volunteers: shift.max_volunteers,
      role_type: shift.role_type,
      check_in_required: shift.check_in_required
    });
    setShowEditShift(shift);
    setShowShiftDetails(null);
  };

  // ÉDITION avec Supabase et messages traduits
  const saveEditShift = async () => {
    if (!showEditShift || isUpdating) return;

    setIsUpdating(true);
    try {
      console.log('🔄 Mise à jour shift calendrier:', showEditShift.id, editShiftData);

      const { data, error } = await volunteerService.updateShift(showEditShift.id, editShiftData);

      if (error) {
        console.error('❌ Erreur mise à jour calendrier:', error);
        alert(`${translate('errorUpdateError') || 'Error updating shift'}: ${error.message}`);
        return;
      }

      console.log('✅ Shift mis à jour:', data);

      const updatedShift = { ...showEditShift, ...editShiftData };
      
      setVolunteerShifts(shifts =>
        shifts.map(shift =>
          shift.id === showEditShift.id ? updatedShift : shift
        )
      );

      setShowEditShift(null);
      setEditShiftData({
        title: '',
        description: '',
        shift_date: '',
        start_time: '',
        end_time: '',
        max_volunteers: 1,
        role_type: '',
        check_in_required: true
      });

      alert(translate('successShiftUpdated') || 'Shift updated successfully');

    } catch (error) {
      console.error('❌ Erreur catch:', error);
      alert(`${translate('errorUpdateError') || 'Error updating shift'}: ${getErrorMessage(error)}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // CHANGEMENT DE STATUT avec Supabase et messages traduits
  const changeShiftStatus = async (shiftId: string, newStatus: 'draft' | 'live' | 'full' | 'cancelled') => {
    try {
      console.log('🔄 Changement statut:', shiftId, 'vers', newStatus);
      
      const { error } = await volunteerService.updateShift(shiftId, { status: newStatus });
      
      if (error) {
        console.error('❌ Erreur changement statut:', error);
        alert(`${translate('errorStatusChangeError') || 'Error changing status'}: ${error.message}`);
        return;
      }
      
      console.log('✅ Statut changé avec succès');
      
      setVolunteerShifts(shifts =>
        shifts.map(s =>
          s.id === shiftId ? { ...s, status: newStatus } : s
        )
      );
    } catch (error) {
      console.error('❌ Erreur catch:', error);
      alert(`${translate('errorStatusChangeError') || 'Error changing status'}: ${getErrorMessage(error)}`);
    }
  };

  const cancelEditShift = () => {
    setShowEditShift(null);
    setEditShiftData({
      title: '',
      description: '',
      shift_date: '',
      start_time: '',
      end_time: '',
      max_volunteers: 1,
      role_type: '',
      check_in_required: true
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-6">
      
      {/* Header avec navigation et modes d'affichage */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-8 h-8 text-green-400" />
          <h2 className="text-2xl font-bold text-white">{translate('volunteerPlanning') || 'Volunteer Planning'}</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sélecteur de mode d'affichage */}
          <div className="flex items-center gap-2 bg-gray-700/30 rounded-xl p-1">
            <button
              onClick={() => {
                setViewMode('day');
                setFourDaysStartIndex(0); // Reset l'index
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'day' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              {translate('viewDay') || 'Day'}
            </button>
            <button
              onClick={() => {
                setViewMode('fourDays');
                setFourDaysStartIndex(0); // Reset à lundi par défaut
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'fourDays' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              {translate('viewFourDays') || '4 Days'}
            </button>
            <button
              onClick={() => {
                setViewMode('week');
                setFourDaysStartIndex(0); // Reset l'index
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'week' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              {translate('viewWeek') || 'Week'}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
              title={translate('navigationPrevious') || 'Previous'}
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors font-semibold"
            >
              {translate('navigationToday') || 'Today'}
            </button>
            
            <button
              onClick={goToNext}
              className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
              title={translate('navigationNext') || 'Next'}
            >
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Période affichée */}
      <div className="text-center mb-6">
        <h3 className="text-xl text-white font-semibold">
          {formatPeriodRange()}
        </h3>
        <div className="flex items-center justify-center gap-4 mt-2">
          <p className="text-gray-400 text-sm">
            {translate('currentMode') || 'Current mode'}: {
              viewMode === 'day' ? (translate('viewDay') || 'Day') : 
              viewMode === 'fourDays' ? (translate('viewFourDays') || '4 Days') : 
              (translate('viewWeek') || 'Week')
            }
          </p>
          
          {/* Indicateur de position pour vue 4 jours */}
          {viewMode === 'fourDays' && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">{translate('position') || 'Position'}:</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map(index => (
                  <button
                    key={index}
                    onClick={() => setFourDaysStartIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      fourDaysStartIndex === index 
                        ? 'bg-green-400' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    title={`${translate('startFrom') || 'Start from'} ${daysOfWeek[index]}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Légende mise à jour avec indication des conflits */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/20 border border-red-500/40 rounded"></div>
          <span className="text-gray-300">{translate('legendEmpty') || 'Empty'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500/20 border border-orange-500/40 rounded"></div>
          <span className="text-gray-300">{translate('legendPartial') || 'Partially filled'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/20 border border-green-500/40 rounded"></div>
          <span className="text-gray-300">{translate('legendFull') || 'Full'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/40 rounded"></div>
          <span className="text-gray-300">{translate('legendDraft') || 'Draft'}</span>
        </div>
        {currentUser?.role === 'volunteer' && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-blue-300 rounded shadow-lg"></div>
              <span className="text-blue-300 font-semibold">{translate('legendMyShifts') || 'My shifts'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-red-500/30 to-orange-500/30 border-2 border-red-400/60 rounded shadow-lg"></div>
              <span className="text-red-300 font-semibold">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {translate('legendTimeConflict') || 'Time conflict'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Grille calendrier */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          
          {/* Header des jours */}
          <div className={`grid gap-px mb-2`} style={{ gridTemplateColumns: `80px repeat(${displayDates.length}, 1fr)` }}>
            <div className="p-3 text-center text-gray-400 font-semibold">{translate('hour') || 'Hour'}</div>
            {displayDates.map((date, index) => {
              const dayIndex = viewMode === 'week' ? index : weekDates.findIndex(d => d.toDateString() === date.toDateString());
              return (
                <div key={index} className="p-3 text-center">
                  <div className="text-white font-semibold">
                    {viewMode === 'day' ? (translate('today') || 'Today') : (daysOfWeek[dayIndex] || daysOfWeek[index])}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {formatDate(date)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 🎯 NOUVEAU: Grille horaire avec sous-divisions par quarts d'heure */}
          <div className="relative">
            {hoursRange.map(hour => (
              <div key={hour} className="relative">
                {/* Ligne principale de l'heure */}
                <div className={`grid gap-px mb-px`} style={{ gridTemplateColumns: `80px repeat(${displayDates.length}, 1fr)` }}>
                  
                  {/* Colonne heure */}
                  <div className="h-16 bg-gray-700/30 flex items-center justify-center text-gray-400 font-medium relative">
                    <span className="text-lg">{hour}:00</span>
                    
                    {/* 🎯 NOUVEAU: Indicateurs de quarts d'heure */}
                    <div className="absolute right-1 top-1 flex flex-col gap-0.5 text-xs text-gray-500">
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Colonnes jours */}
                  {displayDates.map((date, dayIndex) => {
                    const shiftsInSlot = getShiftsForSlot(date, hour);
                    const isCurrentHour = new Date().getHours() === hour && 
                                         date.toDateString() === new Date().toDateString();
                    const isDragOver = draggedOverSlot?.day === dayIndex && 
                                      draggedOverSlot?.hour === hour &&
                                      draggedOverSlot?.minutes === 0;
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`h-16 bg-gray-700/20 border border-gray-600/20 relative cursor-pointer hover:bg-gray-600/30 transition-colors group ${
                          isCurrentHour ? 'bg-green-500/10 border-green-500/30' : ''
                        } ${isDragOver ? 'bg-blue-500/20 border-blue-500/40' : ''}`}
                        onClick={() => handleSlotClick(dayIndex, hour)}
                        onDragOver={(e) => handleDragOver(e, dayIndex, hour, 0)}
                        onDrop={(e) => handleDrop(e, dayIndex, hour, 0)}
                      >
                        
                        {/* 🎯 CORRECTION: Zone invisible pour capture du drag - SEULEMENT si pas de quarts d'heure affichés */}
                        {draggedShift && !(draggedOverSlot?.day === dayIndex && draggedOverSlot?.hour === hour) && (
                          <div 
                            className="absolute inset-0 z-5"
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDragOver(e, dayIndex, hour, 0);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDrop(e, dayIndex, hour, 0);
                            }}
                          />
                        )}
                        
                        {/* 🎯 CORRECTION: Zones cliquables et droppables pour les quarts d'heure - SEULEMENT dans l'heure survolée pendant le drag */}
                        {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && 
                         draggedShift && 
                         draggedOverSlot?.day === dayIndex && 
                         draggedOverSlot?.hour === hour && (
                          <div className="absolute inset-0 grid grid-rows-4 z-15">
                            {[0, 15, 30, 45].map(minutes => {
                              const isQuarterDragOver = draggedOverSlot?.day === dayIndex && 
                                                       draggedOverSlot?.hour === hour &&
                                                       draggedOverSlot?.minutes === minutes;
                              
                              return (
                                <div
                                  key={minutes}
                                  className={`relative hover:bg-blue-500/20 transition-colors cursor-pointer ${
                                    isQuarterDragOver ? 'bg-blue-500/40 border-2 border-blue-400 rounded' : ''
                                  }`}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDragOver(e, dayIndex, hour, minutes);
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDrop(e, dayIndex, hour, minutes);
                                  }}
                                  onDragEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  title={`${translate('moveTo') || 'Move to'} ${hour}:${minutes.toString().padStart(2, '0')}`}
                                >
                                  {/* Ligne de séparation des quarts d'heure */}
                                  {minutes > 0 && (
                                    <div className="absolute top-0 left-0 right-0 h-px bg-blue-400/80"></div>
                                  )}
                                  
                                  {/* Indicateur pendant le drag actif */}
                                  <div className={`absolute right-1 top-1 text-xs text-blue-200 bg-blue-900/90 px-1 rounded transition-all ${
                                    isQuarterDragOver ? 'opacity-100 font-bold scale-110' : 'opacity-70'
                                  }`}>
                                    :{minutes.toString().padStart(2, '0')}
                                  </div>
                                  
                                  {/* Indicateur de drop zone - plus visible */}
                                  {isQuarterDragOver && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500/30">
                                      <div className="w-12 h-12 bg-blue-500/80 rounded-full flex items-center justify-center border-3 border-blue-200 shadow-lg">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full animate-pulse"></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Créneaux dans ce slot avec gestion des chevauchements */}
                        {shiftsInSlot.map(shift => {
                          const isMainSlot = parseInt(shift.start_time.split(':')[0]) === hour;
                          if (!isMainSlot) return null;
                          
                          const position = getShiftPosition(shift, shiftsInSlot);
                          const hasOverlapConflict = currentUser?.role === 'volunteer' && 
                                                    currentUser?.id && 
                                                    !isUserSignedUpForShift(shift.id) &&
                                                    checkOverlapForDisplay(shift, currentUser.id);
                          
                          return (
                            <div
                              key={shift.id}
                              className={`absolute rounded-lg border-2 p-2 text-xs cursor-move z-30 group ${getShiftColor(shift)}`}
                              style={{
                                top: `${getShiftTop(shift)}px`,
                                height: `${getShiftHeight(shift)}px`,
                                minHeight: '48px',
                                left: position.left,
                                width: position.width,
                                right: position.right
                              }}
                              draggable={currentUser?.role === 'organizer' || currentUser?.role === 'admin'}
                              onDragStart={(e) => handleDragStart(e, shift)}
                              onDragEnd={handleDragEnd}
                              onClick={(e) => {
                                e.stopPropagation();
                                // 🎯 NOUVEAU: Utiliser le callback pour les organisateurs
                                if ((currentUser?.role === 'organizer' || currentUser?.role === 'admin') && onShiftClick) {
                                  onShiftClick(shift);
                                } else {
                                  setShowShiftDetails(shift);
                                }
                              }}
                            >
                              <div className="font-semibold truncate">{shift.title}</div>
                              <div className="flex items-center gap-1 mt-1">
                                <Users size={10} />
                                <span className="text-xs">{shift.current_volunteers}/{shift.max_volunteers}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={10} />
                                <span className="text-xs">{shift.start_time}-{shift.end_time}</span>
                              </div>
                              
                              {/* 🎯 NOUVEAU: Indicateur visuel du nombre de bénévoles pour organisateurs */}
                              {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">{shift.current_volunteers}</span>
                                </div>
                              )}
                              
                              {/* Indicateur de conflit d'horaire */}
                              {hasOverlapConflict && (
                                <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                  <AlertTriangle className="w-3 h-3 text-white animate-pulse" />
                                </div>
                              )}
                              
                              {/* Indicateur si bénévole inscrit */}
                              {currentUser?.role === 'volunteer' && 
                               currentUser?.id && 
                               volunteerSignups && 
                               Array.isArray(volunteerSignups) &&
                               volunteerSignups.some(signup => 
                                 signup.shift_id === shift.id && 
                                 signup.volunteer_id === currentUser.id &&
                                 signup.status !== 'cancelled'
                               ) && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg">
                                  <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
                                  <div className="absolute inset-1 bg-white rounded-full"></div>
                                </div>
                              )}
                              
                              {/* Boutons action rapide pour organisateurs */}
                              {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const newStatus = shift.status === 'draft' ? 'live' : 'draft';
                                      await changeShiftStatus(shift.id, newStatus);
                                    }}
                                    className={`w-4 h-4 rounded text-xs font-bold ${
                                      shift.status === 'draft' 
                                        ? 'bg-green-500 hover:bg-green-600' 
                                        : 'bg-gray-500 hover:bg-gray-600'
                                    } text-white flex items-center justify-center`}
                                  >
                                    {shift.status === 'draft' ? '✓' : 'D'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Indicateur pour créer un créneau */}
                        {shiftsInSlot.length === 0 && !draggedShift && (currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10">
                            <Plus className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🎯 NOUVEAU: Modal création rapide avec gestion des quarts d'heure */}
      {showCreateModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{translate('quickCreateTitle') || 'Quick Create'}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">{translate('quickCreateTitleField') || 'Title'}</label>
                <input
                  type="text"
                  value={quickCreateData.title}
                  onChange={(e) => setQuickCreateData({...quickCreateData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  placeholder={`${translate('quickCreatePlaceholder') || 'Shift'} ${selectedSlot.hour}h${(selectedSlot.startMinutes || 0).toString().padStart(2, '0')}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">{translate('quickCreateVolunteers') || 'Volunteers'}</label>
                  <input
                    type="number"
                    min="1"
                    value={quickCreateData.max_volunteers}
                    onChange={(e) => setQuickCreateData({...quickCreateData, max_volunteers: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">{translate('quickCreateStartMinutes') || 'Start minutes'}</label>
                  <select
                    value={quickCreateData.startMinutes}
                    onChange={(e) => setQuickCreateData({...quickCreateData, startMinutes: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  >
                    {minuteOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">{translate('quickCreateDuration') || 'Duration'}</label>
                <select
                  value={quickCreateData.duration}
                  onChange={(e) => setQuickCreateData({...quickCreateData, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg">
                <p><strong>📅 {translate('quickCreateDate') || 'Date'}:</strong> {formatDate(displayDates[selectedSlot.day])}</p>
                <p><strong>🕐 {translate('quickCreateStart') || 'Start'}:</strong> {selectedSlot.hour}:{(selectedSlot.startMinutes || 0).toString().padStart(2, '0')}</p>
                <p><strong>🕑 {translate('quickCreateEnd') || 'End'}:</strong> {calculateEndTime(selectedSlot.hour, selectedSlot.startMinutes || 0, quickCreateData.duration).formatted}</p>
                <p><strong>⏱️ {translate('quickCreateTotalDuration') || 'Total duration'}:</strong> {quickCreateData.duration} {translate('quickCreateMinutes') || 'minutes'}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {translate('cancel') || 'Cancel'}
                </button>
                <button
                  onClick={createQuickShift}
                  disabled={isCreating}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isCreating 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isCreating ? `🔄 ${translate('creating') || 'Creating'}...` : `✨ ${translate('create') || 'Create'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails de créneau */}
      {showShiftDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{translate('shiftDetailsTitle') || 'Shift Details'}</h3>
              <button onClick={() => setShowShiftDetails(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white">{showShiftDetails.title}</h4>
                <p className="text-gray-400">{showShiftDetails.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-blue-400" />
                    <span className="text-gray-300">{translate('fieldTime') || 'Time'}</span>
                  </div>
                  <p className="text-white font-semibold">
                    {showShiftDetails.start_time} - {showShiftDetails.end_time}
                  </p>
                </div>

                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-green-400" />
                    <span className="text-gray-300">{translate('volunteers') || 'Volunteers'}</span>
                  </div>
                  <p className="text-white font-semibold">
                    {showShiftDetails.current_volunteers}/{showShiftDetails.max_volunteers}
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-gray-300 text-sm mb-1">{translate('fieldStatus') || 'Status'}</p>
                <p className={`font-semibold ${
                  showShiftDetails.status === 'live' ? 'text-green-400' :
                  showShiftDetails.status === 'draft' ? 'text-yellow-400' :
                  showShiftDetails.status === 'full' ? 'text-blue-400' :
                  'text-gray-400'
                }`}>
                  {getLocalizedShiftStatus(showShiftDetails.status)}
                </p>
              </div>

              {/* Actions pour organisateurs */}
              {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditShift(showShiftDetails)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Edit size={16} />
                    {translate('actionEdit') || 'Edit'}
                  </button>
                  <button
                    onClick={async () => {
                      const newStatus = showShiftDetails.status === 'draft' ? 'live' : 'draft';
                      await changeShiftStatus(showShiftDetails.id, newStatus);
                      setShowShiftDetails({...showShiftDetails, status: newStatus});
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      showShiftDetails.status === 'draft' 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    }`}
                  >
                    {showShiftDetails.status === 'draft' ? (translate('actionPublish') || 'Publish') : (translate('actionDraft') || 'Unpublish')}
                  </button>
                </div>
              )}

              {/* Actions pour bénévoles */}
              {currentUser?.role === 'volunteer' && showShiftDetails.status === 'live' && (
                <div className="space-y-3">
                  {!isUserSignedUpForShift(showShiftDetails.id) ? (
                    canSignUpForShift(showShiftDetails) ? (
                      <button
                        onClick={() => {
                          onSignUp(showShiftDetails.id);
                          setShowShiftDetails(null);
                        }}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 justify-center"
                      >
                        <UserPlus size={16} />
                        {translate('actionSignUp') || 'Sign Up'}
                      </button>
                    ) : (
                      <div className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded-lg text-center">
                        {translate('shiftFull') || 'Shift is full'}
                      </div>
                    )
                  ) : (
                    <div className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-lg text-center">
                      ✓ {translate('signedUp') || 'You are signed up'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal édition de créneau */}
      {showEditShift && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{translate('editShiftTitle') || 'Edit Shift'}</h3>
              <button onClick={cancelEditShift} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">{translate('editFieldTitle') || 'Title'}</label>
                <input
                  type="text"
                  value={editShiftData.title}
                  onChange={(e) => setEditShiftData({...editShiftData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">{translate('editFieldDescription') || 'Description'}</label>
                <textarea
                  value={editShiftData.description}
                  onChange={(e) => setEditShiftData({...editShiftData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">{translate('editFieldStartTime') || 'Start time'}</label>
                  <input
                    type="time"
                    value={editShiftData.start_time}
                    onChange={(e) => setEditShiftData({...editShiftData, start_time: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">{translate('editFieldEndTime') || 'End time'}</label>
                  <input
                    type="time"
                    value={editShiftData.end_time}
                    onChange={(e) => setEditShiftData({...editShiftData, end_time: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">{translate('editFieldMaxVolunteers') || 'Max volunteers'}</label>
                <input
                  type="number"
                  min="1"
                  value={editShiftData.max_volunteers}
                  onChange={(e) => setEditShiftData({...editShiftData, max_volunteers: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">{translate('editFieldRoleType') || 'Role type'}</label>
                <input
                  type="text"
                  value={editShiftData.role_type}
                  onChange={(e) => setEditShiftData({...editShiftData, role_type: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="check_in_required"
                  checked={editShiftData.check_in_required}
                  onChange={(e) => setEditShiftData({...editShiftData, check_in_required: e.target.checked})}
                  className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                />
                <label htmlFor="check_in_required" className="text-gray-300">
                  {translate('editFieldCheckInRequired') || 'Check-in required'}
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelEditShift}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {translate('cancel') || 'Cancel'}
                </button>
                <button
                  onClick={saveEditShift}
                  disabled={isUpdating}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isUpdating 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isUpdating ? `🔄 ${translate('saving') || 'Saving'}...` : (translate('save') || 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CalendarView;