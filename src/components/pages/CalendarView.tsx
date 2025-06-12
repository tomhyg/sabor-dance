import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Edit, ChevronLeft, ChevronRight, UserPlus, X, Check, AlertCircle } from 'lucide-react';

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
  volunteerShifts: VolunteerShift[];
  setVolunteerShifts: React.Dispatch<React.SetStateAction<VolunteerShift[]>>;
  volunteerSignups: VolunteerSignup[];
  setVolunteerSignups: React.Dispatch<React.SetStateAction<VolunteerSignup[]>>;
  onSignUp: (shiftId: string) => void;
  onCreateShift: (shift: Partial<VolunteerShift>) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  t,
  currentUser,
  volunteerShifts,
  setVolunteerShifts,
  volunteerSignups = [], // Valeur par défaut
  setVolunteerSignups,
  onSignUp,
  onCreateShift
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [draggedShift, setDraggedShift] = useState<VolunteerShift | null>(null);
  const [draggedOverSlot, setDraggedOverSlot] = useState<{day: number, hour: number} | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{day: number, hour: number, date: string} | null>(null);
  const [showShiftDetails, setShowShiftDetails] = useState<VolunteerShift | null>(null);
  const [showEditShift, setShowEditShift] = useState<VolunteerShift | null>(null);
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
    duration: 2
  });

  // Configuration du calendrier
  const hoursRange = Array.from({ length: 18 }, (_, i) => i + 6); // 6h à 23h
  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  // Calculer les dates de la semaine
  const getWeekDates = (date: Date) => {
    const week = [];
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

  const weekDates = getWeekDates(currentWeek);

  // Navigation semaine
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  // Obtenir les créneaux pour une date et heure spécifiques
  const getShiftsForSlot = (date: Date, hour: number) => {
    // Utiliser la date locale au lieu d'UTC pour éviter le décalage
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const nowDay = now.getDate().toString().padStart(2, '0');
    const currentDateStr = `${nowYear}-${nowMonth}-${nowDay}`;
    const currentHour = now.getHours();
    
    return volunteerShifts.filter(shift => {
      if (shift.shift_date !== dateStr) return false;
      
      // Filtrer les brouillons pour les bénévoles
      if (currentUser?.role === 'volunteer' && shift.status === 'draft') return false;
      
      // Filtrer les événements passés pour les bénévoles (ils ne peuvent pas s'inscrire)
      if (currentUser?.role === 'volunteer') {
        const shiftDate = new Date(shift.shift_date);
        const shiftEndHour = parseInt(shift.end_time.split(':')[0]);
        const shiftEndMinute = parseInt(shift.end_time.split(':')[1]);
        
        // Si c'est une date passée
        if (date < new Date(currentDateStr)) return false;
        
        // Si c'est aujourd'hui mais l'heure est passée
        if (shift.shift_date === currentDateStr) {
          const currentTime = currentHour * 60 + now.getMinutes();
          const shiftEndTime = shiftEndHour * 60 + shiftEndMinute;
          if (currentTime > shiftEndTime) return false;
        }
      }
      
      const startHour = parseInt(shift.start_time.split(':')[0]);
      const endHour = parseInt(shift.end_time.split(':')[0]);
      return hour >= startHour && hour < endHour;
    });
  };

  // Calculer la hauteur d'un créneau en fonction de sa durée
  const getShiftHeight = (shift: VolunteerShift) => {
    const startHour = parseInt(shift.start_time.split(':')[0]);
    const startMinute = parseInt(shift.start_time.split(':')[1]);
    const endHour = parseInt(shift.end_time.split(':')[0]);
    const endMinute = parseInt(shift.end_time.split(':')[1]);
    
    const durationInMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    return (durationInMinutes / 60) * 60; // 60px par heure
  };

  // Calculer la position verticale d'un créneau
  const getShiftTop = (shift: VolunteerShift) => {
    const startHour = parseInt(shift.start_time.split(':')[0]);
    const startMinute = parseInt(shift.start_time.split(':')[1]);
    
    // Position relative à l'heure de début du slot (pas 6h)
    return (startMinute * 64) / 60; // 64px par heure, proportionnel aux minutes
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

  // Couleur selon le status du créneau et si l'utilisateur est inscrit
  const getShiftColor = (shift: VolunteerShift) => {
    const fillRate = shift.current_volunteers / shift.max_volunteers;
    
    // PRIORITÉ: Vérifier si l'utilisateur actuel est inscrit à ce créneau
    const isUserSignedUp = currentUser?.role === 'volunteer' && 
                          currentUser?.id && 
                          volunteerSignups && 
                          Array.isArray(volunteerSignups) &&
                          volunteerSignups.some(signup => 
                            signup.shift_id === shift.id && 
                            signup.volunteer_id === currentUser.id &&
                            signup.status !== 'cancelled'
                          );
    
    if (shift.status === 'cancelled') return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
    if (shift.status === 'draft') return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
    
    // PRIORITÉ: Si l'utilisateur est inscrit, toujours afficher en bleu, même si complet
    if (isUserSignedUp) {
      return 'bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-blue-300 text-white shadow-xl shadow-blue-500/40 ring-4 ring-blue-400/30';
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
    setDraggedOverSlot(null); // Reset du slot survolé
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, dayIndex: number, hour: number) => {
    if (!draggedShift) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverSlot({ day: dayIndex, hour });
  };

  const handleDragEnd = () => {
    // Nettoyer tous les états drag & drop
    setDraggedShift(null);
    setDraggedOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number, hour: number) => {
    e.preventDefault();
    if (!draggedShift) return;

    const newDate = weekDates[dayIndex];
    // Utiliser la date locale au lieu d'UTC
    const year = newDate.getFullYear();
    const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = newDate.getDate().toString().padStart(2, '0');
    const newDateStr = `${year}-${month}-${dayStr}`;
    
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const nowDay = now.getDate().toString().padStart(2, '0');
    const currentDateStr = `${nowYear}-${nowMonth}-${nowDay}`;
    
    // Empêcher le déplacement vers le passé
    if (newDate < new Date()) {
      alert('Impossible de déplacer un créneau vers une date passée');
      setDraggedShift(null);
      setDraggedOverSlot(null);
      return;
    }
    
    // Si c'est aujourd'hui, vérifier l'heure
    if (newDateStr === currentDateStr && hour < now.getHours()) {
      alert('Impossible de déplacer un créneau vers une heure passée');
      setDraggedShift(null);
      setDraggedOverSlot(null);
      return;
    }
    
    // Calculer la durée exacte du créneau original
    const startHour = parseInt(draggedShift.start_time.split(':')[0]);
    const startMinute = parseInt(draggedShift.start_time.split(':')[1]);
    const endHour = parseInt(draggedShift.end_time.split(':')[0]);
    const endMinute = parseInt(draggedShift.end_time.split(':')[1]);
    
    const durationHours = endHour - startHour;
    const durationMinutes = endMinute - startMinute;
    
    // Nouvelle heure de fin
    const newEndHour = hour + durationHours;
    const newEndMinute = durationMinutes;

    // Mettre à jour le créneau
    setVolunteerShifts(shifts =>
      shifts.map(shift =>
        shift.id === draggedShift.id
          ? {
              ...shift,
              shift_date: newDateStr,
              start_time: `${hour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
              end_time: `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`
            }
          : shift
      )
    );

    setDraggedShift(null);
    setDraggedOverSlot(null);
  };

  // Gestion des clics sur les créneaux
  const handleSlotClick = (dayIndex: number, hour: number) => {
    const date = weekDates[dayIndex];
    const existingShifts = getShiftsForSlot(date, hour);
    
    // Pour les bénévoles - toujours ouvrir le modal de détails
    if (currentUser?.role === 'volunteer' && currentUser?.id) {
      if (existingShifts.length > 0) {
        const shift = existingShifts[0];
        if (shift.status === 'live') {
          setShowShiftDetails(shift);
        }
      }
      return;
    }
    
    // Pour les organisateurs
    if (currentUser?.role !== 'organizer' && currentUser?.role !== 'admin') return;
    
    // Utiliser la date locale au lieu d'UTC
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const nowDay = now.getDate().toString().padStart(2, '0');
    const currentDateStr = `${nowYear}-${nowMonth}-${nowDay}`;
    
    // Empêcher la création d'événements passés
    if (date < new Date()) {
      alert('Impossible de créer un créneau dans le passé');
      return;
    }
    
    // Si c'est aujourd'hui, vérifier l'heure
    if (dateStr === currentDateStr && hour < now.getHours()) {
      alert('Impossible de créer un créneau à une heure passée');
      return;
    }
    
    // Vérifier s'il y a déjà un créneau
    if (existingShifts.length > 0) {
      setShowShiftDetails(existingShifts[0]);
      return;
    }

    setSelectedSlot({ day: dayIndex, hour, date: dateStr });
    setShowCreateModal(true);
  };

  const createQuickShift = () => {
    if (!selectedSlot) return;

    const newShift: Partial<VolunteerShift> = {
      title: quickCreateData.title || `Créneau ${selectedSlot.hour}h`,
      description: '',
      shift_date: selectedSlot.date,
      start_time: `${selectedSlot.hour.toString().padStart(2, '0')}:00`,
      end_time: `${(selectedSlot.hour + quickCreateData.duration).toString().padStart(2, '0')}:00`,
      max_volunteers: quickCreateData.max_volunteers,
      role_type: 'general',
      check_in_required: true
    };

    onCreateShift(newShift);
    setShowCreateModal(false);
    setQuickCreateData({ title: '', max_volunteers: 1, duration: 2 });
    setSelectedSlot(null);
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

  const saveEditShift = () => {
    if (!showEditShift) return;

    const updatedShift = { ...showEditShift, ...editShiftData };
    
    setVolunteerShifts(shifts =>
      shifts.map(shift =>
        shift.id === showEditShift.id 
          ? updatedShift
          : shift
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
      
      {/* Header avec navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-8 h-8 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Planning Bénévoles</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousWeek}
            className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors font-semibold"
          >
            Aujourd'hui
          </button>
          
          <button
            onClick={goToNextWeek}
            className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Semaine affichée */}
      <div className="text-center mb-6">
        <h3 className="text-xl text-white font-semibold">
          {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - {weekDates[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h3>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/20 border border-red-500/40 rounded"></div>
          <span className="text-gray-300">Vide</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500/20 border border-orange-500/40 rounded"></div>
          <span className="text-gray-300">Partiellement rempli</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/20 border border-green-500/40 rounded"></div>
          <span className="text-gray-300">Complet</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/40 rounded"></div>
          <span className="text-gray-300">Brouillon</span>
        </div>
        {currentUser?.role === 'volunteer' && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-blue-300 rounded shadow-lg"></div>
            <span className="text-blue-300 font-semibold">Mes créneaux</span>
          </div>
        )}
      </div>

      {/* Grille calendrier */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          
          {/* Header des jours */}
          <div className="grid grid-cols-8 gap-px mb-2">
            <div className="p-3 text-center text-gray-400 font-semibold">Heure</div>
            {weekDates.map((date, index) => (
              <div key={index} className="p-3 text-center">
                <div className="text-white font-semibold">{daysOfWeek[index]}</div>
                <div className="text-gray-400 text-sm">
                  {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>

          {/* Grille horaire */}
          <div className="relative">
            {hoursRange.map(hour => (
              <div key={hour} className="grid grid-cols-8 gap-px mb-px">
                
                {/* Colonne heure */}
                <div className="h-16 bg-gray-700/30 flex items-center justify-center text-gray-400 font-medium">
                  {hour}:00
                </div>
                
                {/* Colonnes jours */}
                {weekDates.map((date, dayIndex) => {
                  const shiftsInSlot = getShiftsForSlot(date, hour);
                  const isCurrentHour = new Date().getHours() === hour && 
                                       date.toDateString() === new Date().toDateString();
                  const isDragOver = draggedOverSlot?.day === dayIndex && draggedOverSlot?.hour === hour;
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`h-16 bg-gray-700/20 border border-gray-600/20 relative cursor-pointer hover:bg-gray-600/30 transition-colors ${
                        isCurrentHour ? 'bg-green-500/10 border-green-500/30' : ''
                      } ${isDragOver ? 'bg-blue-500/20 border-blue-500/40' : ''}`}
                      onClick={() => handleSlotClick(dayIndex, hour)}
                      onDragOver={(e) => handleDragOver(e, dayIndex, hour)}
                      onDrop={(e) => handleDrop(e, dayIndex, hour)}
                    >
                      
                      {/* Créneaux dans ce slot */}
                      {shiftsInSlot.map(shift => {
                        const isMainSlot = parseInt(shift.start_time.split(':')[0]) === hour;
                        if (!isMainSlot) return null; // Afficher seulement dans le slot de début
                        
                        return (
                          <div
                            key={shift.id}
                            className={`absolute inset-x-1 rounded-lg border-2 p-2 text-xs cursor-move z-10 group ${getShiftColor(shift)}`}
                            style={{
                              top: `${getShiftTop(shift)}px`,
                              height: `${getShiftHeight(shift)}px`,
                              minHeight: '48px'
                            }}
                            draggable={currentUser?.role === 'organizer' || currentUser?.role === 'admin'}
                            onDragStart={(e) => handleDragStart(e, shift)}
                            onDragEnd={handleDragEnd}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowShiftDetails(shift);
                            }}
                          >
                            <div className="font-semibold truncate">{shift.title}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <Users size={12} />
                              <span>{shift.current_volunteers}/{shift.max_volunteers}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>{shift.start_time}-{shift.end_time}</span>
                            </div>
                            
                            {/* Indicateur si bénévole inscrit - Plus visible */}
                            {currentUser?.role === 'volunteer' && 
                             currentUser?.id && 
                             volunteerSignups && 
                             Array.isArray(volunteerSignups) &&
                             volunteerSignups.some(signup => 
                               signup.shift_id === shift.id && 
                               signup.volunteer_id === currentUser.id &&
                               signup.status !== 'cancelled'
                             ) && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-400 rounded-full border-2 border-white shadow-lg">
                                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
                                <div className="absolute inset-1 bg-white rounded-full"></div>
                              </div>
                            )}
                            
                            {/* Boutons action rapide pour organisateurs */}
                            {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVolunteerShifts(shifts =>
                                      shifts.map(s =>
                                        s.id === shift.id 
                                          ? { ...s, status: s.status === 'draft' ? 'live' : 'draft' }
                                          : s
                                      )
                                    );
                                  }}
                                  className={`w-5 h-5 rounded text-xs font-bold ${
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
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Plus className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal création rapide */}
      {showCreateModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Nouveau Créneau</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Titre</label>
                <input
                  type="text"
                  value={quickCreateData.title}
                  onChange={(e) => setQuickCreateData({...quickCreateData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  placeholder={`Créneau ${selectedSlot.hour}h`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Bénévoles</label>
                  <input
                    type="number"
                    min="1"
                    value={quickCreateData.max_volunteers}
                    onChange={(e) => setQuickCreateData({...quickCreateData, max_volunteers: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Durée (h)</label>
                  <select
                    value={quickCreateData.duration}
                    onChange={(e) => setQuickCreateData({...quickCreateData, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  >
                    <option value={1}>1h</option>
                    <option value={2}>2h</option>
                    <option value={3}>3h</option>
                    <option value={4}>4h</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                <p><strong>Date:</strong> {weekDates[selectedSlot.day].toLocaleDateString('fr-FR')}</p>
                <p><strong>Horaire:</strong> {selectedSlot.hour}:00 - {selectedSlot.hour + quickCreateData.duration}:00</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={createQuickShift}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails créneau */}
      {showShiftDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{showShiftDetails.title}</h3>
              <button onClick={() => setShowShiftDetails(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">{showShiftDetails.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Date:</span>
                  <p className="text-white font-semibold">{new Date(showShiftDetails.shift_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <span className="text-gray-400">Horaire:</span>
                  <p className="text-white font-semibold">{showShiftDetails.start_time} - {showShiftDetails.end_time}</p>
                </div>
                <div>
                  <span className="text-gray-400">Bénévoles:</span>
                  <p className="text-white font-semibold">{showShiftDetails.current_volunteers}/{showShiftDetails.max_volunteers}</p>
                </div>
                <div>
                  <span className="text-gray-400">Statut:</span>
                  <p className={`font-semibold ${
                    showShiftDetails.status === 'live' ? 'text-green-400' :
                    showShiftDetails.status === 'draft' ? 'text-yellow-400' :
                    isShiftFull(showShiftDetails) ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {showShiftDetails.status === 'live' ? 'PUBLIÉ' :
                     showShiftDetails.status === 'draft' ? 'BROUILLON' :
                     isShiftFull(showShiftDetails) ? 'COMPLET' :
                     'ANNULÉ'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {/* Boutons pour bénévoles */}
                {currentUser?.role === 'volunteer' && 
                 showShiftDetails.status === 'live' && (
                  <div className="flex gap-3 w-full">
                    {(() => {
                      // Vérifier si l'utilisateur est inscrit
                      const isUserSignedUp = currentUser?.id && 
                                            volunteerSignups && 
                                            Array.isArray(volunteerSignups) &&
                                            volunteerSignups.some(signup => 
                                              signup.shift_id === showShiftDetails.id && 
                                              signup.volunteer_id === currentUser.id &&
                                              signup.status !== 'cancelled'
                                            );

                      if (isUserSignedUp) {
                        // ✅ Si inscrit → Bouton "Se désinscrire" (toujours, même si complet)
                        return (
                          <button
                            onClick={() => {
                              if (!currentUser?.id || !volunteerSignups || !setVolunteerSignups) return;
                              const signup = volunteerSignups.find(s => 
                                s.shift_id === showShiftDetails.id && 
                                s.volunteer_id === currentUser.id &&
                                s.status !== 'cancelled'
                              );
                              if (signup) {
                                setVolunteerSignups(signups =>
                                  signups.map(s =>
                                    s.id === signup.id ? { ...s, status: 'cancelled' as const } : s
                                  )
                                );
                                setVolunteerShifts(shifts =>
                                  shifts.map(s =>
                                    s.id === showShiftDetails.id 
                                      ? { 
                                          ...s, 
                                          current_volunteers: Math.max(0, s.current_volunteers - 1),
                                          status: s.current_volunteers - 1 < s.max_volunteers ? 'live' : s.status
                                        }
                                      : s
                                  )
                                );
                              }
                              setShowShiftDetails(null);
                            }}
                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <X size={16} />
                            Se désinscrire
                          </button>
                        );
                      } else if (canSignUpForShift(showShiftDetails)) {
                        // ✅ Si pas inscrit + places libres → Bouton "S'inscrire"
                        return (
                          <button
                            onClick={() => {
                              onSignUp(showShiftDetails.id);
                              setShowShiftDetails(null);
                            }}
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <UserPlus size={16} />
                            S'inscrire
                          </button>
                        );
                      } else {
                        // ✅ Si pas inscrit + complet → Rien (mais on peut afficher un message)
                        return (
                          <div className="flex-1 bg-gray-600/30 text-gray-400 px-4 py-2 rounded-lg font-semibold text-center border border-gray-500/30">
                            Créneau complet
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
                
                {/* Boutons pour organisateurs */}
                {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                  <>
                    <button 
                      onClick={() => {
                        const newStatus = showShiftDetails.status === 'draft' ? 'live' : 'draft';
                        setVolunteerShifts(shifts =>
                          shifts.map(s =>
                            s.id === showShiftDetails.id 
                              ? { ...s, status: newStatus }
                              : s
                          )
                        );
                        setShowShiftDetails({...showShiftDetails, status: newStatus});
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${
                        showShiftDetails.status === 'draft' 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      {showShiftDetails.status === 'draft' ? 'Publier' : 'Brouillon'}
                    </button>
                    {showShiftDetails.status === 'draft' && (
                      <button 
                        onClick={() => handleEditShift(showShiftDetails)}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Modifier
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition de créneau */}
      {showEditShift && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Modifier le Créneau</h3>
              <button onClick={cancelEditShift} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Titre</label>
                <input
                  type="text"
                  value={editShiftData.title}
                  onChange={(e) => setEditShiftData({...editShiftData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <textarea
                  value={editShiftData.description}
                  onChange={(e) => setEditShiftData({...editShiftData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={editShiftData.shift_date}
                    onChange={(e) => setEditShiftData({...editShiftData, shift_date: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Max bénévoles</label>
                  <input
                    type="number"
                    min="1"
                    value={editShiftData.max_volunteers}
                    onChange={(e) => setEditShiftData({...editShiftData, max_volunteers: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Heure début</label>
                  <input
                    type="time"
                    value={editShiftData.start_time}
                    onChange={(e) => setEditShiftData({...editShiftData, start_time: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Heure fin</label>
                  <input
                    type="time"
                    value={editShiftData.end_time}
                    onChange={(e) => setEditShiftData({...editShiftData, end_time: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Type de rôle</label>
                <input
                  type="text"
                  value={editShiftData.role_type}
                  onChange={(e) => setEditShiftData({...editShiftData, role_type: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: accueil, technique, sécurité..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editShiftData.check_in_required}
                  onChange={(e) => setEditShiftData({...editShiftData, check_in_required: e.target.checked})}
                  className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label className="text-gray-300 font-medium">Check-in requis</label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={cancelEditShift}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={saveEditShift}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  Sauvegarder
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