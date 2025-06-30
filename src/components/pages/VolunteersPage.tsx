import React, { useState, useEffect } from 'react';
import { Users, Copy, Plus, CheckCircle, Calendar, Clock, X, QrCode, Scan, Check, AlertCircle, UserCheck, Bell, BellRing, List, Grid, Download, BarChart3, Edit, FileSpreadsheet, FileText, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import CalendarView from './CalendarView';
import GridView from './GridView';
import VolunteerDashboard from './VolunteerDashboard';
import ShiftDetailsModal from '../volunteers/ShiftDetailsModal';
import { exportVolunteerShifts, exportVolunteerSignups, quickExport, ExportFormat } from '../../utils/exportUtils';
import { volunteerService, ShiftWithVolunteers } from '../../services/volunteerService';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
};

// Types
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

interface DanceEvent {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  required_volunteer_hours: number;
  status: 'draft' | 'live' | 'completed' | 'cancelled';
  team_submission_deadline: string;
  created_from_template?: string;
}

interface User {
  id?: string;
  role?: string;
  full_name?: string;
  email?: string;
  qr_code?: string;
}

interface VolunteersPageProps {
  t: any;
  currentUser: User | null;
  language: 'fr' | 'en' | 'es';
  volunteerShifts: VolunteerShift[];
  setVolunteerShifts: React.Dispatch<React.SetStateAction<VolunteerShift[]>>;
  volunteerSignups: VolunteerSignup[];
  setVolunteerSignups: React.Dispatch<React.SetStateAction<VolunteerSignup[]>>;
  events: DanceEvent[];
  setEvents: React.Dispatch<React.SetStateAction<DanceEvent[]>>;
}

// 🎯 NOUVEAUTÉ: Interface pour les conflits d'horaires
interface OverlapConflict {
  conflictingShift: VolunteerShift;
  conflictingSignup: VolunteerSignup;
  overlapType: 'complete' | 'partial';
  overlapDetails: string;
}

const VolunteersPage: React.FC<VolunteersPageProps> = ({
  t,
  currentUser,
  language = 'en',
  volunteerShifts,
  setVolunteerShifts,
  volunteerSignups,
  setVolunteerSignups,
  events,
  setEvents
}) => {
  const [showCreateShift, setShowCreateShift] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showMyQR, setShowMyQR] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scanResult, setScanResult] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [qrInput, setQrInput] = useState('');
  const [userVolunteerHours, setUserVolunteerHours] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'missing' | 'none'>('none');
  const [showVolunteerDashboard, setShowVolunteerDashboard] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // 🎯 NOUVEAUTÉ: États pour la gestion des conflits
  const [showOverlapModal, setShowOverlapModal] = useState(false);
  const [overlapConflicts, setOverlapConflicts] = useState<OverlapConflict[]>([]);
  const [pendingShiftId, setPendingShiftId] = useState<string | null>(null);
  
  // 🎯 NOUVEAUTÉ: États pour la visibilité des affectations
  const [showShiftDetailsModal, setShowShiftDetailsModal] = useState<any>(null);
  const [shiftsWithAssignments, setShiftsWithAssignments] = useState<ShiftWithVolunteers[]>([]);
  
  // États pour l'édition
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
  
  const requiredHours = 8;

  // Données simulées des bénévoles pour l'export
  const volunteers = [
    { id: 'vol1', full_name: 'Marie Dubois', phone: '+33 6 12 34 56 78', email: 'marie.dubois@email.com' },
    { id: 'vol2', full_name: 'Paul Martin', phone: '+33 7 98 76 54 32', email: 'paul.martin@email.com' },
    { id: 'vol3', full_name: 'Sophie Laurent', phone: '+33 6 45 67 89 01', email: 'sophie.laurent@email.com' },
    { id: 'vol4', full_name: 'Jean Moreau', phone: '+33 7 23 45 67 89', email: 'jean.moreau@email.com' },
    { id: 'vol5', full_name: 'Lisa Chen', phone: '+33 6 78 90 12 34', email: 'lisa.chen@email.com' }
  ];

  // Textes traduits
  const texts = {
    fr: {
      pageTitle: 'Gestion des Bénévoles',
      pageSubtitle: 'Organisez et gérez vos équipes bénévoles avec simplicité et efficacité',
      myDashboard: 'Mon Dashboard',
      createSlot: 'Créer un créneau',
      scanQR: 'Scanner QR',
      myProgress: 'Mon Progression Bénévolat',
      hoursCompleted: 'Heures complétées',
      congratulations: 'Félicitations ! Vos heures bénévoles sont complétées !',
      notifications: 'Notifications',
      myQRCode: 'Mon QR Code',
      listView: 'Vue Liste',
      calendarView: 'Vue Calendrier',
      gridView: 'Vue Grille',
      normalOrder: 'Ordre normal',
      byDate: '📅 Par date',
      urgentFirst: '🚨 Urgents d\'abord',
      draft: 'BROUILLON',
      published: 'PUBLIÉ',
      full: 'COMPLET',
      cancelled: 'ANNULÉ',
      checkInRequired: 'Check-in requis',
      present: 'présents',
      publish: 'Publier',
      signUp: 'S\'inscrire',
      unsubscribe: 'Se désinscrire',
      progress: 'Progression',
      createShift: 'Créer un créneau',
      title: 'Titre',
      description: 'Description',
      date: 'Date',
      startTime: 'Heure début',
      endTime: 'Heure fin',
      nbVolunteers: 'Nb bénévoles',
      roleType: 'Type de rôle',
      checkInRequiredDay: 'Check-in requis le jour J',
      createShiftBtn: 'Créer le créneau',
      creating: 'Création en cours...',
      scanQRCode: 'Scanner QR Code',
      scanSimulated: 'Scanner simulé',
      pasteQRBelow: 'Collez le code QR ci-dessous',
      pasteQRHere: 'Collez le code QR ici',
      validateScan: 'Valider Scan',
      testQRCodes: 'Codes QR de test:',
      notificationCenter: 'Centre de Notifications',
      unread: 'non lues',
      markAllRead: 'Tout marquer lu',
      noNotifications: 'Aucune notification pour le moment',
      usefulShortcuts: 'Raccourcis utiles',
      planning: 'Planning',
      modifyShift: 'Modifier le Créneau',
      currentInfo: '📊 Informations actuelles',
      currentlyRegistered: 'Inscrits actuellement:',
      status: 'Statut:',
      cancel: 'Annuler',
      saveChanges: 'Sauvegarder les Modifications',
      // 🎯 NOUVEAUTÉ: Messages de conflit d'horaires
      overlapDetected: 'Conflit d\'horaires détecté !',
      overlapWarning: 'Ce créneau chevauche avec vos inscriptions existantes :',
      overlapDetails: 'Détails du conflit :',
      conflictDate: 'Date :',
      conflictTime: 'Horaires :',
      conflictShift: 'Créneau en conflit :',
      overlapComplete: 'Chevauchement complet',
      overlapPartial: 'Chevauchement partiel',
      continueAnyway: 'Continuer quand même',
      cancelSignup: 'Annuler l\'inscription',
      // 🎯 NOUVEAUTÉ: Affectations
      assignedVolunteers: 'bénévoles assignés',
      viewDetails: 'Voir détails',
      noVolunteersAssigned: 'Aucun bénévole assigné',
      urgentNeedsVolunteers: 'Besoin urgent de bénévoles',
      manageAssignments: 'Gérer les affectations',
      // Rôles
      roleRegistration: 'Accueil',
      roleTechSupport: 'Support technique',
      roleSecurity: 'Sécurité',
      roleArtistPickup: 'Transport artistes',
      roleMerchandise: 'Merchandising',
      roleGeneral: 'Général',
      // Messages
      fillAllFields: 'Veuillez remplir tous les champs obligatoires',
      shiftCreatedSuccess: '✅ Créneau créé avec succès et sauvegardé !',
      signupSuccess: '✅ Inscription réussie !',
      unsubscribeSuccess: '✅ Désinscription réussie !',
      statusChangedSuccess: '✅ Statut changé avec succès !',
      changesPerformed: '✅ Modifications sauvegardées !',
      qrInvalid: 'Code QR invalide',
      volunteerNotFound: 'Bénévole non trouvé ou non inscrit',
      alreadyCheckedIn: 'Bénévole déjà pointé',
      checkedInSuccess: 'Bénévole pointé avec succès !',
      enterQRCode: 'Veuillez saisir un code QR',
      mustBeLoggedIn: 'Vous devez être connecté pour vous inscrire'
    },
    en: {
      pageTitle: 'Volunteer Management',
      pageSubtitle: 'Organize and manage your volunteer teams with simplicity and efficiency',
      myDashboard: 'My Dashboard',
      createSlot: 'Create Shift',
      scanQR: 'Scan QR',
      myProgress: 'My Volunteer Progress',
      hoursCompleted: 'Hours completed',
      congratulations: 'Congratulations! Your volunteer hours are completed!',
      notifications: 'Notifications',
      myQRCode: 'My QR Code',
      listView: 'List View',
      calendarView: 'Calendar View',
      gridView: 'Grid View',
      normalOrder: 'Normal order',
      byDate: '📅 By date',
      urgentFirst: '🚨 Urgent first',
      draft: 'DRAFT',
      published: 'PUBLISHED',
      full: 'FULL',
      cancelled: 'CANCELLED',
      checkInRequired: 'Check-in required',
      present: 'present',
      publish: 'Publish',
      signUp: 'Sign Up',
      unsubscribe: 'Unsubscribe',
      progress: 'Progress',
      createShift: 'Create shift',
      title: 'Title',
      description: 'Description',
      date: 'Date',
      startTime: 'Start Time',
      endTime: 'End Time',
      nbVolunteers: 'Max volunteers',
      roleType: 'Role Type',
      checkInRequiredDay: 'Check-in required on the day',
      createShiftBtn: 'Create shift',
      creating: 'Creating...',
      scanQRCode: 'Scan QR Code',
      scanSimulated: 'Simulated scanner',
      pasteQRBelow: 'Paste QR code below',
      pasteQRHere: 'Paste QR code here',
      validateScan: 'Validate Scan',
      testQRCodes: 'Test QR codes:',
      notificationCenter: 'Notification Center',
      unread: 'unread',
      markAllRead: 'Mark all read',
      noNotifications: 'No notifications at the moment',
      usefulShortcuts: 'Useful shortcuts',
      planning: 'Schedule',
      modifyShift: 'Modify Shift',
      currentInfo: '📊 Current information',
      currentlyRegistered: 'Currently registered:',
      status: 'Status:',
      cancel: 'Cancel',
      saveChanges: 'Save Changes',
      // 🎯 NOUVEAUTÉ: Messages de conflit d'horaires
      overlapDetected: 'Schedule conflict detected!',
      overlapWarning: 'This shift overlaps with your existing signups:',
      overlapDetails: 'Conflict details:',
      conflictDate: 'Date:',
      conflictTime: 'Time:',
      conflictShift: 'Conflicting shift:',
      overlapComplete: 'Complete overlap',
      overlapPartial: 'Partial overlap',
      continueAnyway: 'Continue anyway',
      cancelSignup: 'Cancel signup',
      // 🎯 NOUVEAUTÉ: Affectations
      assignedVolunteers: 'volunteers assigned',
      viewDetails: 'View details',
      noVolunteersAssigned: 'No volunteers assigned',
      urgentNeedsVolunteers: 'Urgent need for volunteers',
      manageAssignments: 'Manage assignments',
      // Rôles
      roleRegistration: 'Registration',
      roleTechSupport: 'Tech Support',
      roleSecurity: 'Security',
      roleArtistPickup: 'Artist Pickup',
      roleMerchandise: 'Merchandise',
      roleGeneral: 'General',
      // Messages
      fillAllFields: 'Please fill all required fields',
      shiftCreatedSuccess: '✅ Shift created and saved successfully!',
      signupSuccess: '✅ Signup successful!',
      unsubscribeSuccess: '✅ Unsubscribe successful!',
      statusChangedSuccess: '✅ Status changed successfully!',
      changesPerformed: '✅ Changes saved!',
      qrInvalid: 'Invalid QR code',
      volunteerNotFound: 'Volunteer not found or not registered',
      alreadyCheckedIn: 'Volunteer already checked in',
      checkedInSuccess: 'Volunteer checked in successfully!',
      enterQRCode: 'Please enter a QR code',
      mustBeLoggedIn: 'You must be logged in to sign up'
    },
    es: {
      pageTitle: 'Gestión de Voluntarios',
      pageSubtitle: 'Organiza y gestiona tus equipos de voluntarios con simplicidad y eficiencia',
      myDashboard: 'Mi Panel',
      createSlot: 'Crear Turno',
      scanQR: 'Escanear QR',
      myProgress: 'Mi Progreso Voluntario',
      hoursCompleted: 'Horas completadas',
      congratulations: '¡Felicitaciones! ¡Tus horas de voluntariado están completadas!',
      notifications: 'Notificaciones',
      myQRCode: 'Mi Código QR',
      listView: 'Vista Lista',
      calendarView: 'Vista Calendario',
      gridView: 'Vista Cuadrícula',
      normalOrder: 'Orden normal',
      byDate: '📅 Por fecha',
      urgentFirst: '🚨 Urgentes primero',
      draft: 'BORRADOR',
      published: 'PUBLICADO',
      full: 'COMPLETO',
      cancelled: 'CANCELADO',
      checkInRequired: 'Check-in requerido',
      present: 'presentes',
      publish: 'Publicar',
      signUp: 'Inscribirse',
      unsubscribe: 'Desuscribirse',
      progress: 'Progreso',
      createShift: 'Crear turno',
      title: 'Título',
      description: 'Descripción',
      date: 'Fecha',
      startTime: 'Hora inicio',
      endTime: 'Hora fin',
      nbVolunteers: 'Máx. voluntarios',
      roleType: 'Tipo de rol',
      checkInRequiredDay: 'Check-in requerido el día',
      createShiftBtn: 'Crear turno',
      creating: 'Creando...',
      scanQRCode: 'Escanear Código QR',
      scanSimulated: 'Escáner simulado',
      pasteQRBelow: 'Pega el código QR abajo',
      pasteQRHere: 'Pega el código QR aquí',
      validateScan: 'Validar Escaneo',
      testQRCodes: 'Códigos QR de prueba:',
      notificationCenter: 'Centro de Notificaciones',
      unread: 'sin leer',
      markAllRead: 'Marcar todo leído',
      noNotifications: 'No hay notificaciones por el momento',
      usefulShortcuts: 'Accesos directos útiles',
      planning: 'Planificación',
      modifyShift: 'Modificar Turno',
      currentInfo: '📊 Información actual',
      currentlyRegistered: 'Actualmente inscritos:',
      status: 'Estado:',
      cancel: 'Cancelar',
      saveChanges: 'Guardar Cambios',
      // 🎯 NOUVEAUTÉ: Messages de conflit d'horaires
      overlapDetected: '¡Conflicto de horarios detectado!',
      overlapWarning: 'Este turno se superpone con tus inscripciones existentes:',
      overlapDetails: 'Detalles del conflicto:',
      conflictDate: 'Fecha:',
      conflictTime: 'Horarios:',
      conflictShift: 'Turno en conflicto:',
      overlapComplete: 'Superposición completa',
      overlapPartial: 'Superposición parcial',
      continueAnyway: 'Continuar de todos modos',
      cancelSignup: 'Cancelar inscripción',
      // 🎯 NOUVEAUTÉ: Affectations
      assignedVolunteers: 'voluntarios asignados',
      viewDetails: 'Ver detalles',
      noVolunteersAssigned: 'Ningún voluntario asignado',
      urgentNeedsVolunteers: 'Necesidad urgente de voluntarios',
      manageAssignments: 'Gestionar asignaciones',
      // Rôles
      roleRegistration: 'Registro',
      roleTechSupport: 'Soporte Técnico',
      roleSecurity: 'Seguridad',
      roleArtistPickup: 'Transporte de Artistas',
      roleMerchandise: 'Merchandising',
      roleGeneral: 'General',
      // Messages
      fillAllFields: 'Por favor complete todos los campos requeridos',
      shiftCreatedSuccess: '✅ ¡Turno creado y guardado exitosamente!',
      signupSuccess: '✅ ¡Inscripción exitosa!',
      unsubscribeSuccess: '✅ ¡Desinscripción exitosa!',
      statusChangedSuccess: '✅ ¡Estado cambiado exitosamente!',
      changesPerformed: '✅ ¡Cambios guardados!',
      qrInvalid: 'Código QR inválido',
      volunteerNotFound: 'Voluntario no encontrado o no registrado',
      alreadyCheckedIn: 'Voluntario ya registrado',
      checkedInSuccess: '¡Voluntario registrado exitosamente!',
      enterQRCode: 'Por favor ingrese un código QR',
      mustBeLoggedIn: 'Debe estar conectado para inscribirse'
    }
  };

  const txt = texts[language];

  // 🎯 NOUVEAU: Charger les shifts avec leurs affectations pour les organisateurs
  useEffect(() => {
    if ((currentUser?.role === 'organizer' || currentUser?.role === 'admin') && volunteerShifts.length > 0) {
      loadShiftsWithAssignments();
    }
  }, [currentUser, volunteerShifts]);

  const loadShiftsWithAssignments = async () => {
    try {
      const { data, error } = await volunteerService.getShiftsWithAssignments('a9d1c983-1456-4007-9aec-b297dd095ff7');
      
      if (!error && data) {
        setShiftsWithAssignments(data);
      }
    } catch (error) {
      console.error('Erreur chargement shifts avec affectations:', error);
    }
  };

  // 🎯 NOUVELLE FONCTION: Obtenir les affectations pour un shift
  const getShiftAssignments = (shiftId: string) => {
    const shiftWithAssignments = shiftsWithAssignments.find(s => s.id === shiftId);
    return shiftWithAssignments?.volunteer_signups?.filter(signup => signup.status !== 'cancelled') || [];
  };

  // 🎯 NOUVELLE FONCTION: Obtenir les noms des bénévoles assignés
  const getAssignedVolunteerNames = (shiftId: string): string[] => {
    const assignments = getShiftAssignments(shiftId);
    return assignments.map(assignment => assignment.volunteer?.full_name || 'Nom inconnu');
  };

  // 🎯 NOUVELLE FONCTION: Calculer le niveau d'urgence d'un shift
  const getShiftUrgencyLevel = (shift: VolunteerShift) => {
    const fillRate = shift.current_volunteers / shift.max_volunteers;
    
    if (fillRate >= 1) return { level: 'complete', color: 'bg-green-500/20 text-green-300', label: 'Complet' };
    if (fillRate >= 0.75) return { level: 'good', color: 'bg-lime-500/20 text-lime-300', label: 'Bien rempli' };
    if (fillRate >= 0.5) return { level: 'medium', color: 'bg-yellow-500/20 text-yellow-300', label: 'À surveiller' };
    if (fillRate >= 0.25) return { level: 'urgent', color: 'bg-orange-500/20 text-orange-300', label: 'Urgent' };
    return { level: 'critical', color: 'bg-red-500/20 text-red-300', label: 'Critique' };
  };

  // 🎯 NOUVEAU: Gestionnaire d'actions sur les bénévoles
  const handleVolunteerAction = async (action: string, signupId: string) => {
    // Recharger les données après une action
    await loadShiftsWithAssignments();
    
    // Optionnel : recharger aussi les shifts principaux
    // Vous pouvez ajouter une fonction de callback ici si nécessaire
  };

  // 🎯 NOUVEAU: Gestionnaire de mise à jour de shift
  const handleShiftUpdated = (updatedShift: any) => {
    setVolunteerShifts(shifts =>
      shifts.map(shift =>
        shift.id === updatedShift.id ? { ...shift, ...updatedShift } : shift
      )
    );
    
    // Recharger les affectations
    loadShiftsWithAssignments();
  };

  // 🎯 NOUVEAUTÉ: Fonction pour détecter les chevauchements d'horaires
  const checkForOverlappingShifts = (targetShiftId: string, volunteerId: string): OverlapConflict[] => {
    const targetShift = volunteerShifts.find(s => s.id === targetShiftId);
    if (!targetShift) return [];

    // Récupérer les inscriptions actives du bénévole
    const activeSignups = volunteerSignups.filter(signup => 
      signup.volunteer_id === volunteerId && 
      signup.status !== 'cancelled'
    );

    const conflicts: OverlapConflict[] = [];

    activeSignups.forEach(signup => {
      const existingShift = volunteerShifts.find(s => s.id === signup.shift_id);
      if (!existingShift || existingShift.shift_date !== targetShift.shift_date) return;

      // Convertir les heures en minutes pour la comparaison
      const targetStart = timeToMinutes(targetShift.start_time);
      const targetEnd = timeToMinutes(targetShift.end_time);
      const existingStart = timeToMinutes(existingShift.start_time);
      const existingEnd = timeToMinutes(existingShift.end_time);

      // Vérifier le chevauchement
      const hasOverlap = targetStart < existingEnd && targetEnd > existingStart;

      if (hasOverlap) {
        const overlapType = (targetStart >= existingStart && targetEnd <= existingEnd) || 
                           (existingStart >= targetStart && existingEnd <= targetEnd) 
                           ? 'complete' : 'partial';

        const overlapDetails = `${Math.max(targetStart, existingStart)} - ${Math.min(targetEnd, existingEnd)} min`;

        conflicts.push({
          conflictingShift: existingShift,
          conflictingSignup: signup,
          overlapType,
          overlapDetails
        });
      }
    });

    return conflicts;
  };

  // 🎯 NOUVEAUTÉ: Fonction utilitaire pour convertir l'heure en minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 🎯 NOUVEAUTÉ: Fonction utilitaire pour convertir les minutes en heure
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Fonction pour ouvrir le dashboard bénévole
  const openVolunteerDashboard = () => {
    if (currentUser?.role === 'volunteer') {
      setShowVolunteerDashboard(true);
    }
  };

  // Handler pour export Excel avec langue
  const handleExportVolunteers = (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    try {
      quickExport('volunteers', {
        shifts: volunteerShifts,
        signups: volunteerSignups,
        volunteers: volunteers,
        eventName: 'Boston Salsa Festival 2025'
      }, format);
      console.log(`Export volunteers ${format.toUpperCase()} generated successfully`);
    } catch (error) {
      console.error('Error exporting volunteers:', error);
    }
  };

  // Handler pour export grille (CSV par défaut)
  const handleExportGrid = (selectedWeek?: Date) => {
    try {
      quickExport('volunteers', {
        shifts: volunteerShifts,
        signups: volunteerSignups,
        volunteers: volunteers,
        eventName: `BSF 2025 - Week of ${selectedWeek?.toLocaleDateString() || 'current'}`
      }, 'csv');
      console.log('Grid export generated successfully');
    } catch (error) {
      console.error('Error exporting grid:', error);
    }
  };

  const [newShift, setNewShift] = useState({
    title: '',
    description: '',
    shift_date: '',
    start_time: '',
    end_time: '',
    max_volunteers: 1,
    role_type: '',
    check_in_required: true
  });

  // Générer notifications automatiques
  useEffect(() => {
    if (currentUser?.role === 'volunteer') {
      const generateNotifications = () => {
        const now = new Date();
        const currentHour = now.getHours();
        
        const mySignups = volunteerSignups.filter(signup => 
          signup.volunteer_id === currentUser.id && 
          (signup.status === 'signed_up' || signup.status === 'confirmed')
        );

        const upcomingNotifications: any[] = [];

        mySignups.forEach(signup => {
          const shift = volunteerShifts.find(s => s.id === signup.shift_id);
          if (shift) {
            const shiftHour = parseInt(shift.start_time.split(':')[0]);
            
            if (currentHour === shiftHour - 1) {
              upcomingNotifications.push({
                id: `reminder-${shift.id}`,
                type: 'reminder',
                title: language === 'fr' ? '⏰ Rappel : Créneau dans 1h' : 
                       language === 'es' ? '⏰ Recordatorio: Turno en 1h' : 
                       '⏰ Reminder: Shift in 1h',
                message: language === 'fr' ? `${shift.title} commence à ${shift.start_time}` :
                         language === 'es' ? `${shift.title} comienza a las ${shift.start_time}` :
                         `${shift.title} starts at ${shift.start_time}`,
                time: new Date().toLocaleTimeString(),
                shift: shift,
                read: false
              });
            }
            
            if (currentHour === shiftHour && new Date().getMinutes() >= 30) {
              upcomingNotifications.push({
                id: `urgent-${shift.id}`,
                type: 'urgent',
                title: language === 'fr' ? '🚨 Urgent : Créneau dans 30min' :
                       language === 'es' ? '🚨 Urgente: Turno en 30min' :
                       '🚨 Urgent: Shift in 30min',
                message: language === 'fr' ? `N'oubliez pas votre QR Code pour ${shift.title}` :
                         language === 'es' ? `No olvides tu código QR para ${shift.title}` :
                         `Don't forget your QR Code for ${shift.title}`,
                time: new Date().toLocaleTimeString(),
                shift: shift,
                read: false
              });
            }
          }
        });

        const welcomeMessage = language === 'fr' ? '🎭 Bienvenue au Boston Salsa Festival !' :
                              language === 'es' ? '🎭 ¡Bienvenido al Boston Salsa Festival!' :
                              '🎭 Welcome to Boston Salsa Festival!';
        const welcomeDescription = language === 'fr' ? 'Merci d\'être bénévole. Consultez vos créneaux ci-dessous.' :
                                  language === 'es' ? 'Gracias por ser voluntario. Consulta tus turnos abajo.' :
                                  'Thank you for volunteering. Check your shifts below.';

        upcomingNotifications.push({
          id: 'welcome',
          type: 'info',
          title: welcomeMessage,
          message: welcomeDescription,
          time: '08:00',
          read: false
        });

        if (userVolunteerHours >= requiredHours) {
          const completedMessage = language === 'fr' ? '✅ Heures bénévoles complétées !' :
                                  language === 'es' ? '✅ ¡Horas de voluntariado completadas!' :
                                  '✅ Volunteer hours completed!';
          const completedDescription = language === 'fr' ? 'Félicitations ! Vous avez terminé vos 8h requises.' :
                                      language === 'es' ? '¡Felicitaciones! Has completado tus 8h requeridas.' :
                                      'Congratulations! You have completed your required 8h.';

          upcomingNotifications.push({
            id: 'completed',
            type: 'success',
            title: completedMessage,
            message: completedDescription,
            time: new Date().toLocaleTimeString(),
            read: false
          });
        }

        setNotifications(upcomingNotifications);
        setUnreadCount(upcomingNotifications.filter(n => !n.read).length);
      };

      generateNotifications();
    }
  }, [currentUser, volunteerSignups, volunteerShifts, userVolunteerHours, language]);

  const markNotificationRead = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const generateQRCode = (userId: string) => {
    return `SABOR_VOL_${userId}_${Date.now()}`;
  };

  const handleQRScan = () => {
    if (!qrInput.trim()) {
      setScanResult({type: 'error', message: txt.enterQRCode});
      return;
    }

    const qrMatch = qrInput.match(/SABOR_VOL_([^_]+)_/);
    if (!qrMatch) {
      setScanResult({type: 'error', message: txt.qrInvalid});
      return;
    }

    const scannedUserId = qrMatch[1];
    
    const volunteerSignup = volunteerSignups.find(signup => 
      signup.volunteer_id === scannedUserId && 
      signup.status !== 'cancelled'
    );

    if (!volunteerSignup) {
      setScanResult({type: 'error', message: txt.volunteerNotFound});
      return;
    }

    if (volunteerSignup.status === 'checked_in') {
      setScanResult({type: 'error', message: txt.alreadyCheckedIn});
      return;
    }

    setVolunteerSignups(signups =>
      signups.map(signup =>
        signup.id === volunteerSignup.id
          ? { ...signup, status: 'checked_in' as const, checked_in_at: new Date().toISOString() }
          : signup
      )
    );

    setScanResult({type: 'success', message: txt.checkedInSuccess});
    setQrInput('');
  };

  const copyQRCode = (qrCode: string) => {
    navigator.clipboard.writeText(qrCode);
  };

  const handleCreateShift = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      if (!newShift.title || !newShift.shift_date || !newShift.start_time || !newShift.end_time) {
        alert(txt.fillAllFields);
        return;
      }

      const shiftData = {
        event_id: 'a9d1c983-1456-4007-9aec-b297dd095ff7',
        title: newShift.title,
        description: newShift.description || '',
        shift_date: newShift.shift_date,
        start_time: newShift.start_time,
        end_time: newShift.end_time,
        max_volunteers: newShift.max_volunteers,
        current_volunteers: 0,
        role_type: newShift.role_type || 'general',
        difficulty_level: 'beginner',
        status: 'draft',
        check_in_required: newShift.check_in_required,
        qr_code_enabled: true,
        created_by: currentUser?.id || ''
      };

      const { data, error } = await volunteerService.createShift(shiftData);

      if (error) {
        console.error('❌ Error creating shift:', error);
        alert(`Error creating shift: ${error.message}`);
        return;
      }

      const localShift: VolunteerShift = {
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

      setVolunteerShifts(prevShifts => [...prevShifts, localShift]);
      
      setShowCreateShift(false);
      setNewShift({
        title: '',
        description: '',
        shift_date: '',
        start_time: '',
        end_time: '',
        max_volunteers: 1,
        role_type: '',
        check_in_required: true
      });

      alert(txt.shiftCreatedSuccess);

    } catch (error: any) {
      console.error('❌ Error catch:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // 🎯 NOUVEAUTÉ: Fonction modifiée pour gérer les conflits
  const signUpForShift = async (shiftId: string) => {
    if (!currentUser?.id) {
      alert(txt.mustBeLoggedIn);
      return;
    }

    // 🎯 NOUVEAUTÉ: Vérifier les conflits d'horaires AVANT l'inscription
    if (currentUser.role === 'volunteer') {
      const conflicts = checkForOverlappingShifts(shiftId, currentUser.id);
      
      if (conflicts.length > 0) {
        console.log('🚨 Conflits détectés:', conflicts);
        setOverlapConflicts(conflicts);
        setPendingShiftId(shiftId);
        setShowOverlapModal(true);
        return; // Arrêter ici et attendre la décision de l'utilisateur
      }
    }

    // 🎯 NOUVEAUTÉ: Si pas de conflit, procéder normalement
    await proceedWithSignup(shiftId);
  };

  // 🎯 NOUVEAUTÉ: Fonction pour effectuer l'inscription (extraite pour réutilisation)
  const proceedWithSignup = async (shiftId: string) => {
    if (!currentUser?.id) return;

    try {
      const existingCancelledSignup = volunteerSignups.find(signup => 
        signup.shift_id === shiftId && 
        signup.volunteer_id === currentUser.id &&
        signup.status === 'cancelled'
      );
  
      if (existingCancelledSignup) {
        const { data, error } = await volunteerService.updateSignup(existingCancelledSignup.id, {
          status: 'signed_up',
          signed_up_at: new Date().toISOString(),
          cancelled_at: null
        });
  
        if (error) {
          console.error('❌ Error reactivating:', error);
          alert(`Error during re-registration: ${error.message}`);
          return;
        }
  
        setVolunteerSignups(signups =>
          signups.map(s =>
            s.id === existingCancelledSignup.id 
              ? { ...s, status: 'signed_up', signed_up_at: new Date().toISOString() }
              : s
          )
        );
  
      } else {
        const { data, error } = await volunteerService.signUpForShift(
          shiftId, 
          currentUser.id, 
          'a9d1c983-1456-4007-9aec-b297dd095ff7'
        );
  
        if (error) {
          console.error('❌ Error signing up:', error);
          alert(`Error during signup: ${getErrorMessage(error)}`);
          return;
        }
  
        const localSignup = {
          id: data.id,
          shift_id: shiftId,
          volunteer_id: currentUser.id,
          status: data.status,
          signed_up_at: data.signed_up_at,
          reminder_sent: data.reminder_sent || false,
          qr_code: data.qr_code
        };
  
        setVolunteerSignups(prev => [...prev, localSignup]);
      }
      
      const shift = volunteerShifts.find(s => s.id === shiftId);
      if (shift) {
        const shiftDuration = calculateShiftDuration(shift.start_time, shift.end_time);
        setUserVolunteerHours(prev => prev + shiftDuration);
        
        setVolunteerShifts(shifts =>
          shifts.map(s =>
            s.id === shiftId 
              ? { 
                  ...s, 
                  current_volunteers: s.current_volunteers + 1,
                  status: s.current_volunteers + 1 >= s.max_volunteers ? 'full' : s.status
                }
              : s
          )
        );
      }
  
      alert(txt.signupSuccess);
  
    } catch (error) {
      console.error('❌ Error catch:', error);
      alert(`Erreur: ${getErrorMessage(error)}`);
    }
  };

  // 🎯 NOUVEAUTÉ: Fonction pour continuer malgré le conflit
  const handleContinueAnywaySignup = async () => {
    if (pendingShiftId) {
      await proceedWithSignup(pendingShiftId);
      setShowOverlapModal(false);
      setOverlapConflicts([]);
      setPendingShiftId(null);
    }
  };

  // 🎯 NOUVEAUTÉ: Fonction pour annuler l'inscription en cas de conflit
  const handleCancelSignupDueToConflict = () => {
    setShowOverlapModal(false);
    setOverlapConflicts([]);
    setPendingShiftId(null);
  };

  // Calculer les heures depuis les inscriptions Supabase
  const calculateUserHours = () => {
    let totalHours = 0;
  
    volunteerSignups.forEach(signup => {
     if (signup.status !== 'cancelled') {
       const shift = volunteerShifts.find(s => s.id === signup.shift_id);
        if (shift) {
          const shiftDuration = calculateShiftDuration(shift.start_time, shift.end_time);
          totalHours += shiftDuration;
       }
     }
    });
  
    setUserVolunteerHours(totalHours);
  };

  useEffect(() => {
    if (volunteerSignups.length > 0 && volunteerShifts.length > 0) {
      calculateUserHours();
    }
  }, [volunteerSignups, volunteerShifts]);

  const unsubscribeFromShift = async (shiftId: string) => {
    if (!currentUser?.id) return;
  
    const signup = volunteerSignups.find(s => 
      s.shift_id === shiftId && 
      s.volunteer_id === currentUser.id &&
      s.status !== 'cancelled'
    );
    
    if (!signup) return;
  
    try {
      const { data, error } = await volunteerService.cancelSignup(signup.id);
  
      if (error) {
        console.error('❌ Error cancelling:', error);
        alert(`Error during cancellation: ${error.message}`);
        return;
      }
  
      setVolunteerSignups(signups =>
        signups.map(s =>
          s.id === signup.id ? { ...s, status: 'cancelled' } : s
        )
      );
      
      const shift = volunteerShifts.find(s => s.id === shiftId);
      if (shift) {
        const shiftDuration = calculateShiftDuration(shift.start_time, shift.end_time);
        setUserVolunteerHours(prev => Math.max(0, prev - shiftDuration));
        
        setVolunteerShifts(shifts =>
          shifts.map(s =>
            s.id === shiftId 
              ? { 
                  ...s, 
                  current_volunteers: Math.max(0, s.current_volunteers - 1),
                  status: s.current_volunteers - 1 < s.max_volunteers ? 'live' : s.status
                }
              : s
          )
        );
      }
  
      alert(txt.unsubscribeSuccess);
  
    } catch (error) {
      console.error('❌ Error catch:', error);
      alert(`Erreur: ${getErrorMessage(error)}`);
    }
  };

  const isSignedUpForShift = (shiftId: string) => {
    return volunteerSignups.some(signup => 
      signup.shift_id === shiftId && 
      signup.volunteer_id === (currentUser?.id || '1') &&
      signup.status !== 'cancelled'
    );
  };

  const calculateShiftDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const changeShiftStatus = async (shiftId: string, newStatus: 'draft' | 'live' | 'full' | 'cancelled') => {
    try {
      const { data, error } = await volunteerService.updateShift(shiftId, { status: newStatus });
  
      if (error) {
        console.error('❌ Error changing status:', error);
        alert(`Error changing status: ${error.message}`);
        return;
      }
  
      setVolunteerShifts(shifts =>
        shifts.map(shift =>
          shift.id === shiftId ? { ...shift, status: newStatus } : shift
        )
      );
  
      alert(txt.statusChangedSuccess);
  
    } catch (error) {
      console.error('❌ Error catch:', error);
      alert(`Erreur: ${getErrorMessage(error)}`);
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
  };

  const saveEditShift = async () => {
    if (!showEditShift) return;
    
    try {
      const { data, error } = await volunteerService.updateShift(showEditShift.id, editShiftData);

      if (error) {
        console.error('❌ Error updating:', error);
        alert(`Error updating: ${error.message}`);
        return;
      }

      const updatedShift = { ...showEditShift, ...editShiftData };
      setVolunteerShifts(shifts =>
        shifts.map(shift =>
          shift.id === showEditShift.id ? updatedShift : shift
        )
      );
      
      setShowEditShift(null);
      resetEditForm();
      alert(txt.changesPerformed);

    } catch (error: any) {
      console.error('❌ Error catch:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const cancelEditShift = () => {
    setShowEditShift(null);
    resetEditForm();
  };

  const resetEditForm = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      {/* Hero Header */}
      <div className="relative py-20 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-teal-400/20 to-green-400/20 rounded-full blur-3xl animate-bounce"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
                {txt.pageTitle}
              </h1>
              <p className="text-xl text-green-100 max-w-2xl">
                {txt.pageSubtitle}
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Bouton Dashboard Bénévole */}
              {currentUser?.role === 'volunteer' && (
                <button
                  onClick={openVolunteerDashboard}
                  className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2"
                >
                  <UserCheck size={20} />
                  {txt.myDashboard}
                </button>
              )}
              
              {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                <>
                  <button
                    onClick={() => setShowCreateShift(true)}
                    disabled={isCreating}
                    className={`group bg-gradient-to-r from-lime-500 to-green-500 text-white px-8 py-4 rounded-xl font-bold hover:from-lime-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Plus size={20} />
                    {isCreating ? txt.creating : txt.createSlot}
                  </button>
                  <button
                    onClick={() => setShowQRScanner(true)}
                    className="group bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-violet-700 transition-all duration-300 flex items-center gap-2"
                  >
                    <Scan size={18} />
                    {txt.scanQR}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportVolunteers('xlsx')}
                      className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center gap-2 font-semibold"
                    >
                      <FileSpreadsheet size={16} />
                      XLSX
                    </button>
                    <button
                      onClick={() => handleExportVolunteers('csv')}
                      className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center gap-2 font-semibold"
                    >
                      <FileText size={16} />
                      CSV
                    </button>
                    <button
                      onClick={() => handleExportVolunteers('pdf')}
                      className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center gap-2 font-semibold"
                    >
                      <FileText size={16} />
                      PDF
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progression des heures bénévoles */}
        {currentUser?.role === 'volunteer' && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 rounded-3xl p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-400" />
                  {txt.myProgress}
                </h2>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-300 text-lg">{txt.hoursCompleted}</span>
                  <span className="font-bold text-2xl text-white">{userVolunteerHours}h / {requiredHours}h</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-4 mb-4">
                  <div
                    className="bg-gradient-to-r from-lime-500 to-green-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${Math.min((userVolunteerHours / requiredHours) * 100, 100)}%` }}
                  ></div>
                </div>
                {userVolunteerHours >= requiredHours && (
                  <div className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl">
                    <div className="flex items-center gap-3 text-green-300">
                      <CheckCircle size={24} />
                      <span className="font-bold text-lg">{txt.congratulations}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions bénévole */}
              <div className="ml-8 flex flex-col gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 relative"
                  >
                    <Bell size={20} />
                    {txt.notifications}
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                
                <button
                  onClick={() => setShowMyQR(true)}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-violet-700 transition-all duration-300 flex items-center gap-2"
                >
                  <QrCode size={20} />
                  {txt.myQRCode}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Vue Liste / Calendrier / Grille */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-2xl p-2">
            <div className="flex">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <List size={20} />
                {txt.listView}
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  viewMode === 'calendar'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Grid size={20} />
                {txt.calendarView}
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <BarChart3 size={20} />
                {txt.gridView}
              </button>
            </div>
          </div>
        </div>

        {/* Tri pour vue liste */}
        {viewMode === 'list' && (
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-xl p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('none')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    sortBy === 'none'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {txt.normalOrder}
                </button>
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    sortBy === 'date'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {txt.byDate}
                </button>
                <button
                  onClick={() => setSortBy('missing')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    sortBy === 'missing'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {txt.urgentFirst}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenu selon le mode de vue */}
        {viewMode === 'calendar' ? (
          <CalendarView
            t={t}
            currentUser={currentUser}
            volunteerShifts={volunteerShifts}
            language={language}
            setVolunteerShifts={setVolunteerShifts}
            volunteerSignups={volunteerSignups}
            setVolunteerSignups={setVolunteerSignups}
            onSignUp={signUpForShift}
            onCreateShift={(shift) => {
              const newShift: VolunteerShift = {
                id: Date.now().toString(),
                current_volunteers: 0,
                status: 'draft',
                title: shift.title || '',
                description: shift.description || '',
                shift_date: shift.shift_date || '',
                start_time: shift.start_time || '',
                end_time: shift.end_time || '',
                max_volunteers: shift.max_volunteers || 1,
                role_type: shift.role_type || '',
                check_in_required: shift.check_in_required !== undefined ? shift.check_in_required : false
              };
              setVolunteerShifts([...volunteerShifts, newShift]);
            }}
            onShiftClick={(shift) => {
              if (currentUser?.role === 'organizer' || currentUser?.role === 'admin') {
                setShowShiftDetailsModal(shift);
              }
            }}
          />
        ) : viewMode === 'grid' ? (
          <GridView
            volunteerShifts={volunteerShifts}
            language={language}
            volunteerSignups={volunteerSignups}
            currentUser={currentUser}
            onSignUp={signUpForShift}
            onEditShift={handleEditShift}
            onExportGrid={handleExportGrid}
          />
        ) : (
          // Vue liste avec affichage des affectations
          <div className="grid gap-6">
          {(() => {
            let sortedShifts = [...volunteerShifts];
            
            if (sortBy === 'date') {
              sortedShifts.sort((a, b) => {
                const dateA = new Date(a.shift_date + 'T' + a.start_time);
                const dateB = new Date(b.shift_date + 'T' + b.start_time);
                return dateA.getTime() - dateB.getTime();
              });
            } else if (sortBy === 'missing') {
              sortedShifts.sort((a, b) => {
                const missingA = a.max_volunteers - a.current_volunteers;
                const missingB = b.max_volunteers - b.current_volunteers;
                
                if (missingA > 0 && missingB > 0) {
                  const dateA = new Date(a.shift_date + 'T' + a.start_time);
                  const dateB = new Date(b.shift_date + 'T' + b.start_time);
                  return dateA.getTime() - dateB.getTime();
                }
                
                return missingB - missingA;
              });
            }
            
            return sortedShifts
              .filter(shift => {
                if (currentUser?.role === 'volunteer' && shift.status === 'draft') {
                  return false;
                }
                return true;
              })
              .map(shift => {
                const checkedInCount = volunteerSignups.filter(signup => 
                  signup.shift_id === shift.id && signup.status === 'checked_in'
                ).length;
                
                // 🎯 NOUVEAU: Obtenir les données d'affectation pour les organisateurs
                const assignments = getShiftAssignments(shift.id);
                const assignedNames = getAssignedVolunteerNames(shift.id);
                const urgency = getShiftUrgencyLevel(shift);
                const isUrgent = urgency.level === 'urgent' || urgency.level === 'critical';
                
                return (
                  <div key={shift.id} className={`group bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 ${isUrgent ? 'ring-2 ring-orange-500/40' : ''}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-2xl font-bold text-white group-hover:text-green-100 transition-colors">{shift.title}</h3>
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            shift.status === 'draft' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                            shift.status === 'live' ? (shift.current_volunteers >= shift.max_volunteers ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30') :
                            shift.current_volunteers >= shift.max_volunteers ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {shift.status === 'draft' ? txt.draft :
                             shift.status === 'live' ? (shift.current_volunteers >= shift.max_volunteers ? txt.full : txt.published) :
                             shift.status === 'cancelled' ? txt.cancelled :
                             shift.current_volunteers >= shift.max_volunteers ? txt.full : txt.published}
                          </span>

                          {/* 🎯 NOUVEAU: Badge d'urgence pour organisateurs */}
                          {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && isUrgent && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${urgency.color} animate-pulse`}>
                              🚨 {urgency.label}
                            </span>
                          )}

                          {shift.check_in_required && (
                            <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                              {txt.checkInRequired}
                            </span>
                          )}
                          {shift.check_in_required && (
                            <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                              <UserCheck size={12} />
                              {checkedInCount}/{shift.current_volunteers} {txt.present}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 mb-6 text-lg leading-relaxed">{shift.description}</p>
                        
                        <div className="flex flex-wrap gap-6 text-gray-400 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={20} className="text-green-400" />
                            <span className="font-medium">{new Date(shift.shift_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={20} className="text-green-400" />
                            <span className="font-medium">{shift.start_time} - {shift.end_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={20} className="text-green-400" />
                            <span className="font-medium">{shift.current_volunteers}/{shift.max_volunteers} {t.volunteers}</span>
                          </div>
                        </div>

                        {/* 🎯 NOUVEAU: Affichage des bénévoles assignés pour organisateurs */}
                        {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && assignedNames.length > 0 && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                            <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                              <Users size={16} />
                              Bénévoles assignés ({assignedNames.length}/{shift.max_volunteers})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {assignedNames.slice(0, 3).map((name, index) => (
                                <span key={index} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                                  {name}
                                </span>
                              ))}
                              {assignedNames.length > 3 && (
                                <span className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full text-sm">
                                  +{assignedNames.length - 3} autres
                                </span>
                              )}
                            </div>
                            
                            {/* Bouton voir détails pour organisateurs */}
                            <button
                              onClick={() => setShowShiftDetailsModal(shift)}
                              className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1 hover:underline"
                            >
                              <Eye size={14} />
                              {txt.viewDetails}
                            </button>
                          </div>
                        )}

                        {/* 🎯 NOUVEAU: Message si aucun bénévole pour organisateurs */}
                        {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && assignedNames.length === 0 && shift.status === 'live' && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                            <h4 className="text-red-300 font-semibold mb-2 flex items-center gap-2">
                              <AlertTriangle size={16} />
                              {txt.noVolunteersAssigned}
                            </h4>
                            <p className="text-red-200 text-sm">
                              {txt.urgentNeedsVolunteers}
                            </p>
                            <button
                              onClick={() => setShowShiftDetailsModal(shift)}
                              className="mt-2 text-red-400 hover:text-red-300 text-sm font-semibold flex items-center gap-1 hover:underline"
                            >
                              <Users size={14} />
                              {txt.manageAssignments}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-8 flex flex-col gap-3">
                        {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                          <div className="flex gap-2">
                            {/* 🎯 NOUVEAU: Bouton détails avec compteur pour organisateurs */}
                            <button
                              onClick={() => setShowShiftDetailsModal(shift)}
                              className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl text-sm font-bold hover:bg-blue-500/30 transition-all duration-300 flex items-center gap-2"
                            >
                              <Eye size={16} />
                              Détails
                              {assignments.length > 0 && (
                                <span className="bg-blue-500/40 px-2 py-1 rounded-full text-xs">
                                  {assignments.length}
                                </span>
                              )}
                            </button>

                            <button
                              onClick={() => changeShiftStatus(shift.id, shift.status === 'draft' ? 'live' : 'draft')}
                              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                                shift.status === 'draft' 
                                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/25' 
                                  : 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg hover:shadow-gray-500/25'
                              }`}
                            >
                              {shift.status === 'draft' ? txt.publish : t.draft}
                            </button>
                          </div>
                        )}
                        
                        {shift.status === 'live' && currentUser?.role === 'volunteer' ? (
                          isSignedUpForShift(shift.id) ? (
                            <button
                              onClick={() => unsubscribeFromShift(shift.id)}
                              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                            >
                              {txt.unsubscribe}
                            </button>
                          ) : (
                            shift.current_volunteers < shift.max_volunteers && (
                              <button
                                onClick={() => signUpForShift(shift.id)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                              >
                                {txt.signUp}
                              </button>
                            )
                          )
                        ) : (shift.current_volunteers >= shift.max_volunteers) ? (
                          !isSignedUpForShift(shift.id) && (
                            <div className="bg-gray-600/30 text-gray-400 px-6 py-3 rounded-xl font-bold text-center border border-gray-500/30">
                              {txt.full}
                            </div>
                          )
                        ) : null}
                      </div>
                    </div>

                    {/* Progress bar avec indicateur d'urgence */}
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-300">{txt.progress}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            {Math.round((shift.current_volunteers / shift.max_volunteers) * 100)}%
                          </span>
                          {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${urgency.color}`}>
                              {urgency.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-600/50 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 shadow-lg ${
                            isUrgent 
                              ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                              : 'bg-gradient-to-r from-lime-500 to-green-500'
                          }`}
                          style={{ width: `${(shift.current_volunteers / shift.max_volunteers) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              });
          })()}
        </div>
        )}

        {/* 🎯 NOUVEAUTÉ: Modal de conflit d'horaires */}
        {showOverlapModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-red-900/90 to-orange-900/90 border border-red-500/30 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-4 mb-8">
                <AlertTriangle className="w-12 h-12 text-red-400 animate-pulse" />
                <div>
                  <h2 className="text-3xl font-bold text-white">{txt.overlapDetected}</h2>
                  <p className="text-red-200 mt-2">{txt.overlapWarning}</p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                {overlapConflicts.map((conflict, index) => (
                  <div key={index} className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="w-8 h-8 text-red-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-white mb-3">
                          {conflict.conflictingShift.title}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-red-300 font-semibold">{txt.conflictDate}</span>
                            <div className="text-white">
                              {new Date(conflict.conflictingShift.shift_date).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-red-300 font-semibold">{txt.conflictTime}</span>
                            <div className="text-white">
                              {conflict.conflictingShift.start_time} - {conflict.conflictingShift.end_time}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-red-300 font-semibold">{txt.overlapDetails}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            conflict.overlapType === 'complete' 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                              : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          }`}>
                            {conflict.overlapType === 'complete' ? txt.overlapComplete : txt.overlapPartial}
                          </span>
                        </div>

                        {conflict.conflictingShift.description && (
                          <p className="text-gray-300 text-sm italic">
                            "{conflict.conflictingShift.description}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div className="text-yellow-200 text-sm">
                    <p className="font-semibold mb-2">
                      {language === 'fr' ? '⚠️ Attention :' : 
                       language === 'es' ? '⚠️ Atención:' : 
                       '⚠️ Warning:'}
                    </p>
                    <p>
                      {language === 'fr' ? 'S\'inscrire à des créneaux qui se chevauchent peut créer des conflits d\'horaires. Vous ne pourrez physiquement être présent qu\'à un seul endroit à la fois.' :
                       language === 'es' ? 'Inscribirse en turnos superpuestos puede crear conflictos de horarios. Solo podrás estar físicamente presente en un lugar a la vez.' :
                       'Signing up for overlapping shifts may create scheduling conflicts. You can only be physically present at one location at a time.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCancelSignupDueToConflict}
                  className="flex-1 px-6 py-4 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  {txt.cancelSignup}
                </button>
                <button
                  onClick={handleContinueAnywaySignup}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={20} />
                  {txt.continueAnyway}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Volunteer Dashboard */}
        {showVolunteerDashboard && currentUser && (
          <VolunteerDashboard
            currentUser={currentUser}
            volunteerShifts={volunteerShifts}
            volunteerSignups={volunteerSignups}
            setVolunteerSignups={setVolunteerSignups}
            setVolunteerShifts={setVolunteerShifts}
            onClose={() => setShowVolunteerDashboard(false)}
          />
        )}

        {/* 🎯 NOUVEAU: Modal détails de créneau avec affectations */}
        {showShiftDetailsModal && (
          <ShiftDetailsModal
            shift={showShiftDetailsModal}
            isOpen={!!showShiftDetailsModal}
            onClose={() => setShowShiftDetailsModal(null)}
            currentUser={currentUser}
            language={language}
            onShiftUpdated={handleShiftUpdated}
            onVolunteerAction={handleVolunteerAction}
          />
        )}

        {/* Modal de création de créneau */}
        {showCreateShift && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">{txt.createShift}</h2>
                <button onClick={() => setShowCreateShift(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{txt.title} *</label>
                  <input
                    type="text"
                    value={newShift.title}
                    onChange={(e) => setNewShift({...newShift, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder={language === 'fr' ? "Ex: Accueil et enregistrement" : 
                                language === 'es' ? "Ej: Recepción y registro" : 
                                "Ex: Reception and registration"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{txt.description}</label>
                  <textarea
                    value={newShift.description}
                    onChange={(e) => setNewShift({...newShift, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 h-24 transition-all duration-200"
                    placeholder={language === 'fr' ? "Décrivez les tâches du bénévole..." : 
                                language === 'es' ? "Describe las tareas del voluntario..." : 
                                "Describe the volunteer tasks..."}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{txt.date} *</label>
                    <input
                      type="date"
                      value={newShift.shift_date}
                      onChange={(e) => setNewShift({...newShift, shift_date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{txt.nbVolunteers}</label>
                    <input
                      type="number"
                      min="1"
                      value={newShift.max_volunteers}
                      onChange={(e) => setNewShift({...newShift, max_volunteers: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{txt.startTime} *</label>
                    <input
                      type="time"
                      value={newShift.start_time}
                      onChange={(e) => setNewShift({...newShift, start_time: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{txt.endTime} *</label>
                    <input
                      type="time"
                      value={newShift.end_time}
                      onChange={(e) => setNewShift({...newShift, end_time: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{txt.roleType}</label>
                  <select
                    value={newShift.role_type}
                    onChange={(e) => setNewShift({...newShift, role_type: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  >
                    <option value="">{language === 'fr' ? 'Sélectionner un type' : language === 'es' ? 'Seleccionar un tipo' : 'Select a type'}</option>
                    <option value="registration_desk">{txt.roleRegistration}</option>
                    <option value="tech_support">{txt.roleTechSupport}</option>
                    <option value="security">{txt.roleSecurity}</option>
                    <option value="artist_pickup">{txt.roleArtistPickup}</option>
                    <option value="merchandise">{txt.roleMerchandise}</option>
                    <option value="general">{txt.roleGeneral}</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newShift.check_in_required}
                    onChange={(e) => setNewShift({...newShift, check_in_required: e.target.checked})}
                    className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <label className="text-gray-300 font-medium">{txt.checkInRequiredDay}</label>
                </div>

                <button
                  onClick={handleCreateShift}
                  disabled={isCreating}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl ${
                    isCreating 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                  }`}
                >
                  {isCreating ? `🔄 ${txt.creating}` : txt.createShiftBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal QR Scanner pour organisateurs */}
        {showQRScanner && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Scan className="w-8 h-8 text-blue-400" />
                  {txt.scanQRCode}
                </h2>
                <button onClick={() => setShowQRScanner(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <div className="relative bg-gray-700/30 border-2 border-dashed border-gray-500 rounded-xl h-48 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">{txt.scanSimulated}</p>
                    <p className="text-gray-500 text-sm">{txt.pasteQRBelow}</p>
                  </div>
                  
                  <div className="absolute inset-4 border border-blue-500/50 rounded-lg">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder={`${txt.pasteQRHere} (ex: SABOR_VOL_1_...)`}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  
                  <button
                    onClick={handleQRScan}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    {txt.validateScan}
                  </button>
                </div>

                {scanResult && (
                  <div className={`mt-4 p-4 rounded-xl border ${
                    scanResult.type === 'success' 
                      ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      {scanResult.type === 'success' ? (
                        <CheckCircle size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                      <span className="font-semibold">{scanResult.message}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-600/30 pt-6">
                <h4 className="text-white font-semibold mb-3">{txt.testQRCodes}</h4>
                <div className="space-y-2 text-sm">
                  <button
                    onClick={() => setQrInput('SABOR_VOL_1_1735804800000')}
                    className="block w-full text-left p-2 bg-gray-700/30 rounded-lg hover:bg-gray-600/30 transition-colors text-gray-300 font-mono"
                  >
                    SABOR_VOL_1_1735804800000
                  </button>
                  <button
                    onClick={() => setQrInput('SABOR_VOL_vol2_1735804900000')}
                    className="block w-full text-left p-2 bg-gray-700/30 rounded-lg hover:bg-gray-600/30 transition-colors text-gray-300 font-mono"
                  >
                    SABOR_VOL_vol2_1735804900000
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Mon QR Code pour bénévoles */}
        {showMyQR && currentUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <QrCode className="w-8 h-8 text-purple-400" />
                  {txt.myQRCode}
                </h2>
                <button onClick={() => setShowMyQR(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                  <X size={24} />
                </button>
              </div>

              <div className="text-center">
                <div className="bg-white rounded-xl p-8 mb-6 mx-auto w-fit">
                  <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-2 grid grid-cols-8 gap-1">
                      {[...Array(64)].map((_, i) => (
                        <div
                          key={i}
                          className={`aspect-square ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} rounded-sm`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{currentUser.full_name || (language === 'fr' ? 'Bénévole' : language === 'es' ? 'Voluntario' : 'Volunteer')}</h3>
                  <p className="text-gray-400">{currentUser.email || 'Email'}</p>
                </div>

                <div className="bg-gray-700/30 rounded-xl p-4 mb-6">
                  <p className="text-gray-400 text-sm mb-2">{language === 'fr' ? 'Code QR:' : language === 'es' ? 'Código QR:' : 'QR Code:'}</p>
                  <p className="font-mono text-white text-sm break-all">
                    {generateQRCode(currentUser.id || '1')}
                  </p>
                  <button
                    onClick={() => copyQRCode(generateQRCode(currentUser.id || '1'))}
                    className="mt-3 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Copy size={16} />
                    {language === 'fr' ? 'Copier' : language === 'es' ? 'Copiar' : 'Copy'}
                  </button>
                </div>

                <div className="text-gray-400 text-sm text-left space-y-2">
                  <p>• {language === 'fr' ? 'Présentez ce QR code à l\'organisateur' : 
                         language === 'es' ? 'Presenta este código QR al organizador' : 
                         'Present this QR code to the organizer'}</p>
                  <p>• {language === 'fr' ? 'Utilisable pour tous vos créneaux' : 
                         language === 'es' ? 'Utilizable para todos tus turnos' : 
                         'Usable for all your shifts'}</p>
                  <p>• {language === 'fr' ? 'Permet de valider votre présence' : 
                         language === 'es' ? 'Permite validar tu presencia' : 
                         'Allows to validate your presence'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Centre de Notifications */}
        {showNotifications && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <BellRing className="w-8 h-8 text-orange-400" />
                  {txt.notificationCenter}
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                      {unreadCount} {txt.unread}
                    </span>
                  )}
                </h2>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-orange-400 hover:text-orange-300 text-sm font-semibold"
                    >
                      {txt.markAllRead}
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">{txt.noNotifications}</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        notification.read 
                          ? 'bg-gray-700/30 border-gray-600/30' 
                          : notification.type === 'urgent'
                            ? 'bg-red-500/10 border-red-500/30'
                            : notification.type === 'success'
                            ? 'bg-green-500/10 border-green-500/30'
                            : notification.type === 'reminder'
                            ? 'bg-orange-500/10 border-orange-500/30'
                            : 'bg-blue-500/10 border-blue-500/30'
                      }`}
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-bold ${
                          notification.read ? 'text-gray-300' : 'text-white'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{notification.time}</span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm ${
                        notification.read ? 'text-gray-400' : 'text-gray-300'
                      }`}>
                        {notification.message}
                      </p>

                      {notification.shift && (
                        <div className="mt-3 p-3 bg-gray-600/20 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">
                              📍 {notification.shift.start_time} - {notification.shift.end_time}
                            </span>
                            <span className="text-orange-400 font-semibold">
                              {notification.shift.title}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 border-t border-gray-600/30 pt-6">
                <h4 className="text-white font-semibold mb-4">{txt.usefulShortcuts}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setShowMyQR(true);
                    }}
                    className="bg-purple-500/20 text-purple-300 p-3 rounded-xl hover:bg-purple-500/30 transition-colors flex items-center gap-2"
                  >
                    <QrCode size={16} />
                    {txt.myQRCode}
                  </button>
                  <button className="bg-blue-500/20 text-blue-300 p-3 rounded-xl hover:bg-blue-500/30 transition-colors flex items-center gap-2">
                    <Calendar size={16} />
                    {txt.planning}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'édition de créneau */}
        {showEditShift && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Edit size={24} className="text-blue-400" />
                  {txt.modifyShift}
                </h2>
                <button onClick={cancelEditShift} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{txt.title}</label>
                  <input
                    type="text"
                    value={editShiftData.title}
                    onChange={(e) => setEditShiftData({...editShiftData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{txt.description}</label>
                  <textarea
                    value={editShiftData.description}
                    onChange={(e) => setEditShiftData({...editShiftData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{txt.date}</label>
                    <input
                      type="date"
                      value={editShiftData.shift_date}
                      onChange={(e) => setEditShiftData({...editShiftData, shift_date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{language === 'fr' ? 'Max bénévoles' : language === 'es' ? 'Máx. voluntarios' : 'Max volunteers'}</label>
                    <input
                      type="number"
                      min="1"
                      value={editShiftData.max_volunteers}
                      onChange={(e) => setEditShiftData({...editShiftData, max_volunteers: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{txt.startTime}</label>
                    <input
                      type="time"
                      value={editShiftData.start_time}
                      onChange={(e) => setEditShiftData({...editShiftData, start_time: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{txt.endTime}</label>
                    <input
                      type="time"
                      value={editShiftData.end_time}
                      onChange={(e) => setEditShiftData({...editShiftData, end_time: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{txt.roleType}</label>
                  <select
                    value={editShiftData.role_type}
                    onChange={(e) => setEditShiftData({...editShiftData, role_type: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">{language === 'fr' ? 'Sélectionner un type' : language === 'es' ? 'Seleccionar un tipo' : 'Select a type'}</option>
                    <option value="registration_desk">{txt.roleRegistration}</option>
                    <option value="tech_support">{txt.roleTechSupport}</option>
                    <option value="security">{txt.roleSecurity}</option>
                    <option value="artist_pickup">{txt.roleArtistPickup}</option>
                    <option value="merchandise">{txt.roleMerchandise}</option>
                    <option value="general">{txt.roleGeneral}</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editShiftData.check_in_required}
                    onChange={(e) => setEditShiftData({...editShiftData, check_in_required: e.target.checked})}
                    className="w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label className="text-gray-300 font-medium">{txt.checkInRequired}</label>
                </div>

                {/* Informations supplémentaires */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h4 className="text-blue-300 font-semibold mb-2">{txt.currentInfo}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">{txt.currentlyRegistered}</span>
                      <span className="text-white font-bold ml-2">{showEditShift.current_volunteers}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">{txt.status}</span>
                      <span className="text-white font-bold ml-2 capitalize">{showEditShift.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={cancelEditShift}
                    className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  >
                    {txt.cancel}
                  </button>
                  <button
                    onClick={saveEditShift}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {txt.saveChanges}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteersPage;