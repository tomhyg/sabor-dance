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
  status: 'draft' | 'live' | 'full' | 'cancelled' | 'unpublished'; // 🎯 AJOUT: 'unpublished'
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
  onShiftClick?: (shift: VolunteerShift) => void;
  userVolunteerHours: number;
  setUserVolunteerHours: React.Dispatch<React.SetStateAction<number>>;
}

// Types de vue - 🎯 MODIFICATION: Vue 4 jours par défaut selon feedback
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
  onShiftClick,
  userVolunteerHours,
  setUserVolunteerHours
}) => {
  const { translate } = useTranslation(language);
  
  // 🎯 MODIFICATION: Définition des textes selon langue
  const txt = {
    fr: {
      volunteerPlanning: 'Planification Bénévoles',
      viewDay: 'Jour',
      viewFourDays: '4 Jours',
      viewWeek: 'Semaine',
      navigationPrevious: 'Précédent',
      navigationNext: 'Suivant',
      navigationToday: 'Aujourd\'hui',
      currentMode: 'Mode actuel',
      position: 'Position',
      startFrom: 'Commencer à',
      hour: 'Heure',
      today: 'Aujourd\'hui',
      legendAvailable: 'Disponible',
      legendPartial: 'Partiellement rempli',
      legendFull: 'Complet',
      legendDraft: 'Brouillon',
      legendMyShifts: 'Mes créneaux',
      legendTimeConflict: 'Conflit d\'horaire',
      quickCreateTitle: 'Création Rapide',
      quickCreateTitleField: 'Titre',
      quickCreatePlaceholder: 'Créneau',
      quickCreateVolunteers: 'Bénévoles',
      quickCreateStartMinutes: 'Minutes de début',
      quickCreateDuration: 'Durée',
      quickCreateDate: 'Date',
      quickCreateStart: 'Début',
      quickCreateEnd: 'Fin',
      quickCreateTotalDuration: 'Durée totale',
      quickCreateMinutes: 'minutes',
      cancel: 'Annuler',
      create: 'Créer',
      creating: 'Création',
      save: 'Sauvegarder',
      saving: 'Sauvegarde',
      shiftDetailsTitle: 'Détails du Créneau',
      fieldTime: 'Horaire',
      volunteers: 'Bénévoles',
      fieldStatus: 'Statut',
      actionEdit: 'Modifier',
      actionPublish: 'Publier',
      actionDraft: 'Dépublier',
      actionSignUp: 'S\'inscrire',
      shiftFull: 'Créneau complet',
      signedUp: 'Vous êtes inscrit',
      editShiftTitle: 'Modifier le Créneau',
      editFieldTitle: 'Titre',
      editFieldDescription: 'Description',
      editFieldStartTime: 'Heure de début',
      editFieldEndTime: 'Heure de fin',
      editFieldMaxVolunteers: 'Nombre max de bénévoles',
      editFieldRoleType: 'Type de rôle',
      editFieldCheckInRequired: 'Pointage requis',
      moveTo: 'Déplacer vers',
      shiftStatusDraft: 'Brouillon',
      shiftStatusLive: 'Publié',
      shiftStatusFull: 'Complet',
      shiftStatusCancelled: 'Annulé',
      errorCannotMoveToPast: 'Impossible de déplacer dans le passé',
      errorCannotMoveToCurrentPastHour: 'Impossible de déplacer à une heure passée',
      errorCannotCreateInPast: 'Impossible de créer dans le passé',
      errorCannotCreateAtPastHour: 'Impossible de créer à une heure passée',
      errorCreateError: 'Erreur lors de la création',
      errorUpdateError: 'Erreur lors de la mise à jour',
      errorMoveError: 'Erreur lors du déplacement',
      errorStatusChangeError: 'Erreur lors du changement de statut',
      successShiftCreated: 'Créneau créé avec succès',
      successShiftUpdated: 'Créneau mis à jour avec succès',
      // 🎯 NOUVEAU: Messages de conflit d'horaires
      overlapDetected: 'Conflit d\'horaire détecté !',
      overlapWarning: 'Ce créneau chevauche avec vos inscriptions existantes',
      overlapContinue: 'Continuer quand même ?',
      hourLimitWarning: 'Vous dépassez la limite de 9 heures recommandée',
      hourLimitContinue: 'Voulez-vous continuer ?',
      // 🎯 NOUVEAU: Messages simplifiés pour statuts
      available: 'Disponible',
      full: 'Complet',
      signedUpStatus: 'Inscrit',
      timeConflict: 'Conflit horaire',
      // 🎯 NOUVEAU: Créneaux parallèles
      createParallelShift: 'Créer un créneau parallèle'
    },
    en: {
      volunteerPlanning: 'Volunteer Planning',
      viewDay: 'Day',
      viewFourDays: '4 Days',
      viewWeek: 'Week',
      navigationPrevious: 'Previous',
      navigationNext: 'Next',
      navigationToday: 'Today',
      currentMode: 'Current mode',
      position: 'Position',
      startFrom: 'Start from',
      hour: 'Hour',
      today: 'Today',
      legendAvailable: 'Available',
      legendPartial: 'Partially filled',
      legendFull: 'Full',
      legendDraft: 'Draft',
      legendMyShifts: 'My shifts',
      legendTimeConflict: 'Time conflict',
      quickCreateTitle: 'Quick Create',
      quickCreateTitleField: 'Title',
      quickCreatePlaceholder: 'Shift',
      quickCreateVolunteers: 'Volunteers',
      quickCreateStartMinutes: 'Start minutes',
      quickCreateDuration: 'Duration',
      quickCreateDate: 'Date',
      quickCreateStart: 'Start',
      quickCreateEnd: 'End',
      quickCreateTotalDuration: 'Total duration',
      quickCreateMinutes: 'minutes',
      cancel: 'Cancel',
      create: 'Create',
      creating: 'Creating',
      save: 'Save',
      saving: 'Saving',
      shiftDetailsTitle: 'Shift Details',
      fieldTime: 'Time',
      volunteers: 'Volunteers',
      fieldStatus: 'Status',
      actionEdit: 'Edit',
      actionPublish: 'Publish',
      actionDraft: 'Unpublish',
      actionSignUp: 'Sign Up',
      shiftFull: 'Shift is full',
      signedUp: 'You are signed up',
      editShiftTitle: 'Edit Shift',
      editFieldTitle: 'Title',
      editFieldDescription: 'Description',
      editFieldStartTime: 'Start time',
      editFieldEndTime: 'End time',
      editFieldMaxVolunteers: 'Max volunteers',
      editFieldRoleType: 'Role type',
      editFieldCheckInRequired: 'Check-in required',
      moveTo: 'Move to',
      shiftStatusDraft: 'Draft',
      shiftStatusLive: 'Live',
      shiftStatusFull: 'Full',
      shiftStatusCancelled: 'Cancelled',
      errorCannotMoveToPast: 'Cannot move to past date',
      errorCannotMoveToCurrentPastHour: 'Cannot move to past hour',
      errorCannotCreateInPast: 'Cannot create in the past',
      errorCannotCreateAtPastHour: 'Cannot create at past hour',
      errorCreateError: 'Error creating shift',
      errorUpdateError: 'Error updating shift',
      errorMoveError: 'Error moving shift',
      errorStatusChangeError: 'Error changing status',
      successShiftCreated: 'Shift created successfully',
      successShiftUpdated: 'Shift updated successfully',
      // 🎯 NOUVEAU: Messages de conflit d'horaires
      overlapDetected: 'Schedule conflict detected!',
      overlapWarning: 'This shift overlaps with your existing signups',
      overlapContinue: 'Continue anyway?',
      hourLimitWarning: 'You exceed the recommended 9-hour limit',
      hourLimitContinue: 'Do you want to continue?',
      // 🎯 NOUVEAU: Messages simplifiés pour statuts
      available: 'Available',
      full: 'Full',
      signedUpStatus: 'Signed Up',
      timeConflict: 'Time Conflict',
      // 🎯 NOUVEAU: Créneaux parallèles
      createParallelShift: 'Create parallel shift'
    },
    es: {
      volunteerPlanning: 'Planificación de Voluntarios',
      viewDay: 'Día',
      viewFourDays: '4 Días',
      viewWeek: 'Semana',
      navigationPrevious: 'Anterior',
      navigationNext: 'Siguiente',
      navigationToday: 'Hoy',
      currentMode: 'Modo actual',
      position: 'Posición',
      startFrom: 'Comenzar desde',
      hour: 'Hora',
      today: 'Hoy',
      legendAvailable: 'Disponible',
      legendPartial: 'Parcialmente lleno',
      legendFull: 'Completo',
      legendDraft: 'Borrador',
      legendMyShifts: 'Mis turnos',
      legendTimeConflict: 'Conflicto de horario',
      quickCreateTitle: 'Creación Rápida',
      quickCreateTitleField: 'Título',
      quickCreatePlaceholder: 'Turno',
      quickCreateVolunteers: 'Voluntarios',
      quickCreateStartMinutes: 'Minutos de inicio',
      quickCreateDuration: 'Duración',
      quickCreateDate: 'Fecha',
      quickCreateStart: 'Inicio',
      quickCreateEnd: 'Fin',
      quickCreateTotalDuration: 'Duración total',
      quickCreateMinutes: 'minutos',
      cancel: 'Cancelar',
      create: 'Crear',
      creating: 'Creando',
      save: 'Guardar',
      saving: 'Guardando',
      shiftDetailsTitle: 'Detalles del Turno',
      fieldTime: 'Horario',
      volunteers: 'Voluntarios',
      fieldStatus: 'Estado',
      actionEdit: 'Editar',
      actionPublish: 'Publicar',
      actionDraft: 'Despublicar',
      actionSignUp: 'Inscribirse',
      shiftFull: 'Turno completo',
      signedUp: 'Estás inscrito',
      editShiftTitle: 'Editar Turno',
      editFieldTitle: 'Título',
      editFieldDescription: 'Descripción',
      editFieldStartTime: 'Hora de inicio',
      editFieldEndTime: 'Hora de fin',
      editFieldMaxVolunteers: 'Máximo voluntarios',
      editFieldRoleType: 'Tipo de rol',
      editFieldCheckInRequired: 'Check-in requerido',
      moveTo: 'Mover a',
      shiftStatusDraft: 'Borrador',
      shiftStatusLive: 'Publicado',
      shiftStatusFull: 'Completo',
      shiftStatusCancelled: 'Cancelado',
      errorCannotMoveToPast: 'No se puede mover al pasado',
      errorCannotMoveToCurrentPastHour: 'No se puede mover a una hora pasada',
      errorCannotCreateInPast: 'No se puede crear en el pasado',
      errorCannotCreateAtPastHour: 'No se puede crear en una hora pasada',
      errorCreateError: 'Error al crear turno',
      errorUpdateError: 'Error al actualizar turno',
      errorMoveError: 'Error al mover turno',
      errorStatusChangeError: 'Error al cambiar estado',
      successShiftCreated: 'Turno creado exitosamente',
      successShiftUpdated: 'Turno actualizado exitosamente',
      // 🎯 NOUVEAU: Messages de conflit d'horaires
      overlapDetected: '¡Conflicto de horario detectado!',
      overlapWarning: 'Este turno se superpone con tus inscripciones existentes',
      overlapContinue: '¿Continuar de todos modos?',
      hourLimitWarning: 'Excedes el límite recomendado de 9 horas',
      hourLimitContinue: '¿Quieres continuar?',
      // 🎯 NOUVEAU: Messages simplifiés pour statuts
      available: 'Disponible',
      full: 'Completo',
      signedUpStatus: 'Inscrito',
      timeConflict: 'Conflicto de Horario',
      // 🎯 NOUVEAU: Créneaux parallèles
      createParallelShift: 'Crear turno paralelo'
    }
  };

  const currentTxt = txt[language];
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  // 🎯 MODIFICATION: Vue 4 jours par défaut selon feedback
  const [viewMode, setViewMode] = useState<ViewMode>('fourDays');
  const [fourDaysStartIndex, setFourDaysStartIndex] = useState(0);
  
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
    duration: 120,
    startMinutes: 0
  });

  // Options de minutes
  const minuteOptions = [
    { value: 0, label: ':00' },
    { value: 15, label: ':15' },
    { value: 30, label: ':30' },
    { value: 45, label: ':45' }
  ];

  // Options de durée en minutes
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

  // 🎯 MODIFICATION: Fonction pour vérifier les conflits d'horaires simplifiée
  const checkTimeConflict = (targetShift: VolunteerShift, volunteerId: string): boolean => {
    if (currentUser?.role !== 'volunteer' || !volunteerId) return false;

    const activeSignups = volunteerSignups.filter(signup => 
      signup.volunteer_id === volunteerId && 
      signup.status !== 'cancelled'
    );

    return activeSignups.some(signup => {
      const existingShift = volunteerShifts.find(s => s.id === signup.shift_id);
      if (!existingShift || existingShift.shift_date !== targetShift.shift_date) return false;

      const targetStart = timeToMinutes(targetShift.start_time);
      const targetEnd = timeToMinutes(targetShift.end_time);
      const existingStart = timeToMinutes(existingShift.start_time);
      const existingEnd = timeToMinutes(existingShift.end_time);

      return targetStart < existingEnd && targetEnd > existingStart;
    });
  };

  // 🎯 NOUVEAU: Fonction pour vérifier la limite d'heures
  const checkHourLimit = (shiftId: string): boolean => {
    if (currentUser?.role !== 'volunteer') return false;
    
    const targetShift = volunteerShifts.find(s => s.id === shiftId);
    if (!targetShift) return false;
    
    const shiftDuration = calculateShiftDuration(targetShift.start_time, targetShift.end_time);
    const totalHours = userVolunteerHours + shiftDuration;
    
    return totalHours > 9;
  };

  // Fonction utilitaire pour convertir l'heure en minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 🎯 NOUVEAU: Fonction pour calculer la durée d'un shift
  const calculateShiftDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  // Configuration du calendrier
  const hoursRange = Array.from({ length: 18 }, (_, i) => i + 6);
  
  // Fonction pour obtenir les jours à afficher selon le mode
  const getDisplayDays = () => {
    const today = new Date();
    const week = getWeekDates(currentWeek);
    
    switch (viewMode) {
      case 'day':
        return [currentWeek];
      case 'fourDays':
        return week.slice(fourDaysStartIndex, fourDaysStartIndex + 4);
      case 'week':
      default:
        return week;
    }
  };

  // Jours de la semaine traduits
  const daysOfWeek = [
    translate('dayMonday') || currentTxt.today,
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
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
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

  // 🎯 MODIFICATION: Navigation améliorée pour afficher automatiquement la première date avec un slot disponible
  const findFirstAvailableShiftDate = (): Date | null => {
    const today = new Date();
    const availableShifts = volunteerShifts.filter(shift => {
      const shiftDate = new Date(shift.shift_date);
      return shiftDate >= today && shift.status === 'live' && shift.current_volunteers < shift.max_volunteers;
    });

    if (availableShifts.length === 0) return null;

    const sortedShifts = availableShifts.sort((a, b) => 
      new Date(a.shift_date).getTime() - new Date(b.shift_date).getTime()
    );

    return new Date(sortedShifts[0].shift_date);
  };

  // 🎯 MODIFICATION: Initialiser avec la première date disponible
  useEffect(() => {
    if (currentUser?.role === 'volunteer') {
      const firstAvailableDate = findFirstAvailableShiftDate();
      if (firstAvailableDate) {
        setCurrentWeek(firstAvailableDate);
      }
    }
  }, [volunteerShifts, currentUser]);

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(currentWeek);
    if (viewMode === 'day') {
      newDate.setDate(currentWeek.getDate() - 1);
    } else if (viewMode === 'fourDays') {
      if (fourDaysStartIndex > 0) {
        setFourDaysStartIndex(prev => Math.max(0, prev - 1));
        return;
      } else {
        newDate.setDate(currentWeek.getDate() - 7);
        setFourDaysStartIndex(3);
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
      if (fourDaysStartIndex < 3) {
        setFourDaysStartIndex(prev => Math.min(3, prev + 1));
        return;
      } else {
        newDate.setDate(currentWeek.getDate() + 7);
        setFourDaysStartIndex(0);
      }
    } else {
      newDate.setDate(currentWeek.getDate() + 7);
    }
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    // 🎯 MODIFICATION: Aller à la première date disponible pour les bénévoles
    if (currentUser?.role === 'volunteer') {
      const firstAvailableDate = findFirstAvailableShiftDate();
      if (firstAvailableDate) {
        setCurrentWeek(firstAvailableDate);
      } else {
        setCurrentWeek(new Date());
      }
    } else {
      setCurrentWeek(new Date());
    }
    
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

  // Obtenir les créneaux pour un slot avec gestion des chevauchements et quarts d'heure
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
      
      return (startHour === hour) || (startHour < hour && (endHour > hour || (endHour === hour && endMinute > 0)));
    });

    return shiftsForDate;
  };

  // Calculer la hauteur d'un créneau en fonction de sa durée
  const getShiftHeight = (shift: VolunteerShift) => {
    const [startHour, startMinute] = shift.start_time.split(':').map(Number);
    const [endHour, endMinute] = shift.end_time.split(':').map(Number);
    
    const durationInMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    return (durationInMinutes / 60) * 64;
  };

  // Calculer la position verticale d'un créneau
  const getShiftTop = (shift: VolunteerShift) => {
    const [startHour, startMinute] = shift.start_time.split(':').map(Number);
    
    return (startMinute * 64) / 60;
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

  // Fonction pour obtenir le statut traduit simplifiée
  const getLocalizedShiftStatus = (shift: VolunteerShift): string => {
    // 🎯 MODIFICATION: Statuts simplifiés selon feedback
    if (currentUser?.role === 'volunteer') {
      const isSignedUp = isUserSignedUpForShift(shift.id);
      const hasConflict = checkTimeConflict(shift, currentUser.id);
      
      if (isSignedUp) return currentTxt.signedUpStatus;
      if (hasConflict) return currentTxt.timeConflict;
      if (shift.current_volunteers >= shift.max_volunteers) return currentTxt.full;
      return currentTxt.available;
    }
    
    // Pour les organisateurs, garder les statuts détaillés
    switch (shift.status) {
      case 'draft':
        return currentTxt.shiftStatusDraft;
      case 'live':
        return currentTxt.shiftStatusLive;
      case 'full':
        return currentTxt.shiftStatusFull;
      case 'cancelled':
        return currentTxt.shiftStatusCancelled;
      default:
        return shift.status;
    }
  };

  // 🎯 MODIFICATION: Couleurs simplifiées selon feedback
  const getShiftColor = (shift: VolunteerShift) => {
    if (currentUser?.role === 'volunteer') {
      const isUserSignedUp = isUserSignedUpForShift(shift.id);
      const hasTimeConflict = checkTimeConflict(shift, currentUser.id);
      
      if (shift.status === 'cancelled') return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
      if (shift.status === 'draft') return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
      
      if (isUserSignedUp) {
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-blue-300 text-white shadow-xl shadow-blue-500/40 ring-4 ring-blue-400/30';
      }

      if (hasTimeConflict) {
        return 'bg-gradient-to-r from-red-500/30 to-orange-500/30 border-2 border-red-400/60 text-red-200 shadow-lg shadow-red-500/20 ring-2 ring-red-400/40';
      }
      
      if (shift.current_volunteers >= shift.max_volunteers) {
        return 'bg-green-500/20 border-green-500/40 text-green-300';
      }
      
      return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
    }
    
    // Pour les organisateurs, garder la logique existante
    const fillRate = shift.current_volunteers / shift.max_volunteers;
    
    if (shift.status === 'cancelled') return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
    if (shift.status === 'draft') return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
    
    if (shift.status === 'full' || fillRate >= 1) return 'bg-green-500/20 border-green-500/40 text-green-300';
    
    if (fillRate === 0) return 'bg-red-500/20 border-red-500/40 text-red-300';
    if (fillRate < 0.5) return 'bg-orange-500/20 border-orange-500/40 text-orange-300';
    if (fillRate < 1) return 'bg-lime-500/20 border-lime-500/40 text-lime-300';
    return 'bg-green-500/20 border-green-500/40 text-green-300';
  };

  // 🎯 NOUVEAU: Fonction pour créer un créneau parallèle
  const handleCreateParallelShift = (existingShift: VolunteerShift) => {
    // Récupérer les infos du créneau existant pour pré-remplir
    const shiftDate = new Date(existingShift.shift_date);
    const year = shiftDate.getFullYear();
    const month = (shiftDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = shiftDate.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    
    const startHour = parseInt(existingShift.start_time.split(':')[0]);
    const startMinutes = parseInt(existingShift.start_time.split(':')[1]);
    
    // Trouver l'index du jour dans displayDates
    const dayIndex = displayDates.findIndex(date => {
      const displayYear = date.getFullYear();
      const displayMonth = (date.getMonth() + 1).toString().padStart(2, '0');
      const displayDay = date.getDate().toString().padStart(2, '0');
      const displayDateStr = `${displayYear}-${displayMonth}-${displayDay}`;
      return displayDateStr === dateStr;
    });
    
    if (dayIndex !== -1) {
      setSelectedSlot({ 
        day: dayIndex, 
        hour: startHour, 
        date: dateStr,
        startMinutes: startMinutes
      });
      setQuickCreateData(prev => ({
        ...prev,
        startMinutes: startMinutes
      }));
      setShowCreateModal(true);
    }
  };

  // Drag & Drop pour organisateurs
  const handleDragStart = (e: React.DragEvent, shift: VolunteerShift) => {
    if (currentUser?.role !== 'organizer' && currentUser?.role !== 'admin') return;
    setDraggedShift(shift);
    setDraggedOverSlot(null);
    e.dataTransfer.effectAllowed = 'move';
  };

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

  // DRAG & DROP avec Supabase et gestion des quarts d'heure
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
      alert(currentTxt.errorCannotMoveToPast);
      setDraggedShift(null);
      setDraggedOverSlot(null);
      return;
    }
    
    const newTimeInMinutes = hour * 60 + minutes;
    const currentTimeInMinutes = nowParis.getHours() * 60 + nowParis.getMinutes();
    
    if (newDateStr === currentDateStr && newTimeInMinutes < currentTimeInMinutes) {
      alert(currentTxt.errorCannotMoveToCurrentPastHour);
      setDraggedShift(null);
      setDraggedOverSlot(null);
      return;
    }
    
    const [originalStartHour, originalStartMinute] = draggedShift.start_time.split(':').map(Number);
    const [originalEndHour, originalEndMinute] = draggedShift.end_time.split(':').map(Number);
    
    const originalDurationMinutes = (originalEndHour * 60 + originalEndMinute) - (originalStartHour * 60 + originalStartMinute);
    
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
      const { error } = await volunteerService.updateShift(draggedShift.id, updates);
      
      if (error) {
        alert(`${currentTxt.errorMoveError}: ${error.message}`);
        setDraggedShift(null);
        setDraggedOverSlot(null);
        return;
      }

      setVolunteerShifts(shifts =>
        shifts.map(shift =>
          shift.id === draggedShift.id
            ? { ...shift, ...updates }
            : shift
        )
      );

    } catch (error) {
      alert(`${currentTxt.errorMoveError}: ${getErrorMessage(error)}`);
    }

    setDraggedShift(null);
    setDraggedOverSlot(null);
  };

  // Calculer l'heure de fin basée sur la durée en minutes
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

  // 🎯 MODIFICATION: Gestion des clics sur les créneaux améliorée avec vérifications
  const handleSlotClick = (dayIndex: number, hour: number, quarterHour: number | null = null) => {
    const date = displayDates[dayIndex];
    const existingShifts = getShiftsForSlot(date, hour);
    
    if (currentUser?.role === 'volunteer' && currentUser?.id) {
      if (existingShifts.length > 0 && quarterHour === null) {
        const shift = existingShifts[0];
        if (shift.status === 'live') {
          const hasTimeConflict = checkTimeConflict(shift, currentUser.id);
          const isAlreadySignedUp = isUserSignedUpForShift(shift.id);
          
          if (hasTimeConflict && !isAlreadySignedUp) {
            const conflictMessage = `⚠️ ${currentTxt.overlapWarning}`;
            if (confirm(`${conflictMessage}\n\n${currentTxt.overlapContinue}`)) {
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
      alert(currentTxt.errorCannotCreateInPast);
      return;
    }
    
    if (dateStr === currentDateStr && hour < nowParis.getHours()) {
      alert(currentTxt.errorCannotCreateAtPastHour);
      return;
    }
    
    if (existingShifts.length > 0 && quarterHour === null) {
      if (onShiftClick) {
        onShiftClick(existingShifts[0]);
      } else {
        setShowShiftDetails(existingShifts[0]);
      }
      return;
    }

    const startMinutes = quarterHour !== null ? quarterHour : 0;
    
    setSelectedSlot({ 
      day: dayIndex, 
      hour, 
      date: dateStr,
      startMinutes
    });
    setQuickCreateData(prev => ({
      ...prev,
      startMinutes
    }));
    setShowCreateModal(true);
  };

  // 🎯 MODIFICATION: Création avec auto-publication selon feedback
  const createQuickShift = async () => {
    if (!selectedSlot || isCreating) return;

    setIsCreating(true);
    try {
      const startTime = `${selectedSlot.hour.toString().padStart(2, '0')}:${(selectedSlot.startMinutes || 0).toString().padStart(2, '0')}`;
      const endTime = calculateEndTime(selectedSlot.hour, selectedSlot.startMinutes || 0, quickCreateData.duration).formatted;

      const shiftData = {
        event_id: 'a9d1c983-1456-4007-9aec-b297dd095ff7',
        title: quickCreateData.title || `${currentTxt.quickCreatePlaceholder} ${selectedSlot.hour}h${(selectedSlot.startMinutes || 0).toString().padStart(2, '0')}`,
        description: '',
        shift_date: selectedSlot.date,
        start_time: startTime,
        end_time: endTime,
        max_volunteers: quickCreateData.max_volunteers,
        current_volunteers: 0,
        role_type: 'general',
        difficulty_level: 'beginner',
        status: 'live', // 🎯 MODIFICATION: Auto-publication selon feedback
        check_in_required: true,
        qr_code_enabled: true,
        created_by: currentUser?.id || ''
      };

      const { data, error } = await volunteerService.createShift(shiftData);

      if (error) {
        alert(`${currentTxt.errorCreateError}: ${error.message}`);
        return;
      }

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

      setVolunteerShifts(prev => [...prev, localShift]);
      
      setShowCreateModal(false);
      setQuickCreateData({ title: '', max_volunteers: 1, duration: 120, startMinutes: 0 });
      setSelectedSlot(null);

      alert(currentTxt.successShiftCreated);

    } catch (error) {
      alert(`${currentTxt.errorCreateError}: ${getErrorMessage(error)}`);
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
      const { data, error } = await volunteerService.updateShift(showEditShift.id, editShiftData);

      if (error) {
        alert(`${currentTxt.errorUpdateError}: ${error.message}`);
        return;
      }

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

      alert(currentTxt.successShiftUpdated);

    } catch (error) {
      alert(`${currentTxt.errorUpdateError}: ${getErrorMessage(error)}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // 🎯 MODIFICATION: Changement de statut avec libellé "Unpublish" selon feedback
  const changeShiftStatus = async (shiftId: string, newStatus: 'draft' | 'live' | 'full' | 'cancelled') => {
    try {
      const { error } = await volunteerService.updateShift(shiftId, { status: newStatus });
      
      if (error) {
        alert(`${currentTxt.errorStatusChangeError}: ${error.message}`);
        return;
      }
      
      setVolunteerShifts(shifts =>
        shifts.map(s =>
          s.id === shiftId ? { ...s, status: newStatus } : s
        )
      );
    } catch (error) {
      alert(`${currentTxt.errorStatusChangeError}: ${getErrorMessage(error)}`);
    }
  };

  // 🎯 MODIFICATION: Gestion améliorée de l'inscription avec vérifications
  const handleSignUp = async (shiftId: string) => {
    if (!currentUser?.id) return;

    const shift = volunteerShifts.find(s => s.id === shiftId);
    if (!shift) return;

    // Vérifier le conflit d'horaires
    const hasTimeConflict = checkTimeConflict(shift, currentUser.id);
    if (hasTimeConflict) {
      if (!confirm(`${currentTxt.overlapDetected}\n${currentTxt.overlapWarning}\n\n${currentTxt.overlapContinue}`)) {
        return;
      }
    }

    // Vérifier la limite d'heures
    const exceedsHourLimit = checkHourLimit(shiftId);
    if (exceedsHourLimit) {
      if (!confirm(`${currentTxt.hourLimitWarning}\n\n${currentTxt.hourLimitContinue}`)) {
        return;
      }
    }

    // Procéder à l'inscription
    onSignUp(shiftId);
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
          <h2 className="text-2xl font-bold text-white">{currentTxt.volunteerPlanning}</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sélecteur de mode d'affichage */}
          <div className="flex items-center gap-2 bg-gray-700/30 rounded-xl p-1">
            <button
              onClick={() => {
                setViewMode('day');
                setFourDaysStartIndex(0);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'day' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              {currentTxt.viewDay}
            </button>
            <button
              onClick={() => {
                setViewMode('fourDays');
                setFourDaysStartIndex(0);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'fourDays' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              {currentTxt.viewFourDays}
            </button>
            <button
              onClick={() => {
                setViewMode('week');
                setFourDaysStartIndex(0);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'week' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              {currentTxt.viewWeek}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
              title={currentTxt.navigationPrevious}
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors font-semibold"
            >
              {currentTxt.navigationToday}
            </button>
            
            <button
              onClick={goToNext}
              className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
              title={currentTxt.navigationNext}
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
            {currentTxt.currentMode}: {
              viewMode === 'day' ? currentTxt.viewDay : 
              viewMode === 'fourDays' ? currentTxt.viewFourDays : 
              currentTxt.viewWeek
            }
          </p>
          
          {/* Indicateur de position pour vue 4 jours */}
          {viewMode === 'fourDays' && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">{currentTxt.position}:</span>
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
                    title={`${currentTxt.startFrom} ${daysOfWeek[index]}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🎯 MODIFICATION: Légende simplifiée selon feedback */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/20 border border-emerald-500/40 rounded"></div>
          <span className="text-gray-300">{currentTxt.available}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/20 border border-green-500/40 rounded"></div>
          <span className="text-gray-300">{currentTxt.full}</span>
        </div>
        {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/40 rounded"></div>
            <span className="text-gray-300">{currentTxt.shiftStatusDraft}</span>
          </div>
        )}
        {currentUser?.role === 'volunteer' && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-blue-300 rounded shadow-lg"></div>
              <span className="text-blue-300 font-semibold">{currentTxt.signedUpStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-red-500/30 to-orange-500/30 border-2 border-red-400/60 rounded shadow-lg"></div>
              <span className="text-red-300 font-semibold">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {currentTxt.timeConflict}
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
            <div className="p-3 text-center text-gray-400 font-semibold">{currentTxt.hour}</div>
            {displayDates.map((date, index) => {
              const dayIndex = viewMode === 'week' ? index : weekDates.findIndex(d => d.toDateString() === date.toDateString());
              return (
                <div key={index} className="p-3 text-center">
                  <div className="text-white font-semibold">
                    {viewMode === 'day' ? currentTxt.today : (daysOfWeek[dayIndex] || daysOfWeek[index])}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {formatDate(date)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grille horaire avec sous-divisions par quarts d'heure */}
          <div className="relative">
            {hoursRange.map(hour => (
              <div key={hour} className="relative">
                {/* Ligne principale de l'heure */}
                <div className={`grid gap-px mb-px`} style={{ gridTemplateColumns: `80px repeat(${displayDates.length}, 1fr)` }}>
                  
                  {/* Colonne heure */}
                  <div className="h-16 bg-gray-700/30 flex items-center justify-center text-gray-400 font-medium relative">
                    <span className="text-lg">{hour}:00</span>
                    
                    {/* Indicateurs de quarts d'heure */}
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
                        
                        {/* Zone invisible pour capture du drag - SEULEMENT si pas de quarts d'heure affichés */}
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
                        
                        {/* Zones cliquables et droppables pour les quarts d'heure - SEULEMENT dans l'heure survolée pendant le drag */}
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
                                  title={`${currentTxt.moveTo} ${hour}:${minutes.toString().padStart(2, '0')}`}
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
                          const hasTimeConflict = currentUser?.role === 'volunteer' && 
                                                    currentUser?.id && 
                                                    !isUserSignedUpForShift(shift.id) &&
                                                    checkTimeConflict(shift, currentUser.id);
                          
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
                                <span className="text-xs">{shift.start_time.slice(0, 5)}-{shift.end_time.slice(0, 5)}</span>
                              </div>
                              
                              {/* 🎯 NOUVEAU: Bouton "+" pour créer un créneau parallèle - SEULEMENT sur le créneau le plus à droite */}
                              {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                                (() => {
                                  // Trouver tous les créneaux qui se chevauchent avec celui-ci
                                  const overlappingShifts = shiftsInSlot.filter(s => {
                                    const currentStart = timeToMinutes(shift.start_time);
                                    const currentEnd = timeToMinutes(shift.end_time);
                                    const otherStart = timeToMinutes(s.start_time);
                                    const otherEnd = timeToMinutes(s.end_time);
                                    return currentStart < otherEnd && currentEnd > otherStart;
                                  });
                                  
                                  // Trier par heure de début pour déterminer l'ordre
                                  const sortedOverlapping = overlappingShifts.sort((a, b) => {
                                    const timeA = timeToMinutes(a.start_time);
                                    const timeB = timeToMinutes(b.start_time);
                                    return timeA - timeB;
                                  });
                                  
                                  // Vérifier si ce créneau est le dernier (le plus à droite)
                                  const isRightmost = sortedOverlapping[sortedOverlapping.length - 1]?.id === shift.id;
                                  
                                  return isRightmost && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCreateParallelShift(shift);
                                      }}
                                      className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-green-500 hover:bg-green-600 rounded-full border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center z-40"
                                      title={currentTxt.createParallelShift}
                                    >
                                      <Plus className="w-3 h-3 text-white" />
                                    </button>
                                  );
                                })()
                              )}
                              
                              {/* Indicateur visuel du nombre de bénévoles pour organisateurs */}
                              {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">{shift.current_volunteers}</span>
                                </div>
                              )}
                              
                              {/* Indicateur de conflit d'horaire */}
                              {hasTimeConflict && (
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
                              
                              {/* 🎯 MODIFICATION: Boutons action rapide pour organisateurs avec libellé "Unpublish" */}
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
                                    title={shift.status === 'draft' ? currentTxt.actionPublish : currentTxt.actionDraft}
                                  >
                                    {shift.status === 'draft' ? '✓' : 'U'}
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

      {/* Modal création rapide avec gestion des quarts d'heure */}
      {showCreateModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{currentTxt.quickCreateTitle}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">{currentTxt.quickCreateTitleField}</label>
                <input
                  type="text"
                  value={quickCreateData.title}
                  onChange={(e) => setQuickCreateData({...quickCreateData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  placeholder={`${currentTxt.quickCreatePlaceholder} ${selectedSlot.hour}h${(selectedSlot.startMinutes || 0).toString().padStart(2, '0')}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">{currentTxt.quickCreateVolunteers}</label>
                  <input
                    type="number"
                    min="1"
                    value={quickCreateData.max_volunteers}
                    onChange={(e) => setQuickCreateData({...quickCreateData, max_volunteers: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">{currentTxt.quickCreateStartMinutes}</label>
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
                <label className="block text-sm font-semibold text-gray-300 mb-2">{currentTxt.quickCreateDuration}</label>
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
                <p><strong>📅 {currentTxt.quickCreateDate}:</strong> {formatDate(displayDates[selectedSlot.day])}</p>
                <p><strong>🕐 {currentTxt.quickCreateStart}:</strong> {selectedSlot.hour}:{(selectedSlot.startMinutes || 0).toString().padStart(2, '0')}</p>
                <p><strong>🕑 {currentTxt.quickCreateEnd}:</strong> {calculateEndTime(selectedSlot.hour, selectedSlot.startMinutes || 0, quickCreateData.duration).formatted}</p>
                <p><strong>⏱️ {currentTxt.quickCreateTotalDuration}:</strong> {quickCreateData.duration} {currentTxt.quickCreateMinutes}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {currentTxt.cancel}
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
                  {isCreating ? `🔄 ${currentTxt.creating}...` : `✨ ${currentTxt.create}`}
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
              <h3 className="text-xl font-bold text-white">{currentTxt.shiftDetailsTitle}</h3>
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
                    <span className="text-gray-300">{currentTxt.fieldTime}</span>
                  </div>
                  <p className="text-white font-semibold">
                    {showShiftDetails.start_time.slice(0, 5)} - {showShiftDetails.end_time.slice(0, 5)}
                  </p>
                </div>

                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-green-400" />
                    <span className="text-gray-300">{currentTxt.volunteers}</span>
                  </div>
                  <p className="text-white font-semibold">
                    {showShiftDetails.current_volunteers}/{showShiftDetails.max_volunteers}
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-gray-300 text-sm mb-1">{currentTxt.fieldStatus}</p>
                <p className={`font-semibold ${
                  showShiftDetails.status === 'live' ? 'text-green-400' :
                  showShiftDetails.status === 'draft' ? 'text-yellow-400' :
                  showShiftDetails.status === 'full' ? 'text-blue-400' :
                  'text-gray-400'
                }`}>
                  {getLocalizedShiftStatus(showShiftDetails)}
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
                    {currentTxt.actionEdit}
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
                    {showShiftDetails.status === 'draft' ? currentTxt.actionPublish : currentTxt.actionDraft}
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
                          handleSignUp(showShiftDetails.id);
                          setShowShiftDetails(null);
                        }}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 justify-center"
                      >
                        <UserPlus size={16} />
                        {currentTxt.actionSignUp}
                      </button>
                    ) : (
                      <div className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded-lg text-center">
                        {currentTxt.shiftFull}
                      </div>
                    )
                  ) : (
                    <div className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-lg text-center">
                      ✓ {currentTxt.signedUp}
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
              <h3 className="text-xl font-bold text-white">{currentTxt.editShiftTitle}</h3>
              <button onClick={cancelEditShift} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">{currentTxt.editFieldTitle}</label>
                <input
                  type="text"
                  value={editShiftData.title}
                  onChange={(e) => setEditShiftData({...editShiftData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">{currentTxt.editFieldDescription}</label>
                <textarea
                  value={editShiftData.description}
                  onChange={(e) => setEditShiftData({...editShiftData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">{currentTxt.editFieldStartTime}</label>
                  <input
                    type="time"
                    value={editShiftData.start_time}
                    onChange={(e) => setEditShiftData({...editShiftData, start_time: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">{currentTxt.editFieldEndTime}</label>
                  <input
                    type="time"
                    value={editShiftData.end_time}
                    onChange={(e) => setEditShiftData({...editShiftData, end_time: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">{currentTxt.editFieldMaxVolunteers}</label>
                <input
                  type="number"
                  min="1"
                  value={editShiftData.max_volunteers}
                  onChange={(e) => setEditShiftData({...editShiftData, max_volunteers: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">{currentTxt.editFieldRoleType}</label>
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
                  {currentTxt.editFieldCheckInRequired}
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelEditShift}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {currentTxt.cancel}
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
                  {isUpdating ? `🔄 ${currentTxt.saving}...` : currentTxt.save}
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