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
}import React, { useState, useEffect } from 'react';
import { Users, Copy, Plus, CheckCircle, Calendar, Clock, X, QrCode, Scan, Check, AlertCircle, UserCheck, Bell, BellRing, List, Grid, Download, BarChart3, Edit, FileSpreadsheet, FileText, File, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import CalendarView from './CalendarView';
import GridView from './GridView';
import VolunteerDashboard from './VolunteerDashboard';
import ShiftDetailsModal from '../volunteers/ShiftDetailsModal';
import VolunteerAccountsModal from '../volunteers/VolunteerAccountsModal';
import { exportVolunteerShifts, exportVolunteerSignups, quickExport, ExportFormat } from '../../utils/exportUtils';
import { volunteerService, ShiftWithVolunteers } from '../../services/volunteerService';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
};

// 🎯 CORRECTION: Interfaces locales pour éviter l'import
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
  status: 'draft' | 'live' | 'full' | 'cancelled' | 'unpublished';
  check_in_required: boolean;
  organizer_in_charge?: string;
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

interface OverlapConflict {
  conflictingShift: VolunteerShift;
  conflictingSignup: VolunteerSignup;
  overlapType: 'complete' | 'partial';
  overlapDetails: string;
}

interface HourLimitWarning {
  currentHours: number;
  newHours: number;
  totalHours: number;
  limit: number;
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
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [qrInput, setQrInput] = useState('');
  const [userVolunteerHours, setUserVolunteerHours] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 🎯 NOUVEAU: État pour la modal de gestion des comptes bénévoles
  const [showVolunteerAccountsModal, setShowVolunteerAccountsModal] = useState(false);

  // 🎯 MODIFICATION: Vue par défaut maintenant 'calendar' selon feedback Hernan
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'grid'>('calendar');

  // 🎯 SUPPRESSION: Tri supprimé pour bénévoles selon feedback - CONSERVÉ POUR ORGANISATEURS
  const [sortBy, setSortBy] = useState<'date' | 'missing' | 'none'>('none');
  const [showVolunteerDashboard, setShowVolunteerDashboard] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // 🎯 NOUVEAU: États pour la gestion des conflits
  const [showOverlapModal, setShowOverlapModal] = useState(false);
  const [overlapConflicts, setOverlapConflicts] = useState<OverlapConflict[]>([]);
  const [pendingShiftId, setPendingShiftId] = useState<string | null>(null);

  // 🎯 NOUVEAU: États pour la limite d'heures
  const [showHourLimitModal, setShowHourLimitModal] = useState(false);
  const [hourLimitWarning, setHourLimitWarning] = useState<HourLimitWarning | null>(null);

  // États pour la visibilité des affectations
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
    check_in_required: false
  });

  // 🎯 NOUVEAU: État pour le dropdown d'export
  const [showVolunteerExportDropdown, setShowVolunteerExportDropdown] = useState(false);

  const requiredHours = 9; // 🎯 MODIFICATION: Limite à 9h selon feedback

  // Données simulées des bénévoles pour l'export
  const volunteers = [
    { id: 'vol1', full_name: 'Marie Dubois', phone: '+33 6 12 34 56 78', email: 'marie.dubois@email.com' },
    { id: 'vol2', full_name: 'Paul Martin', phone: '+33 7 98 76 54 32', email: 'paul.martin@email.com' },
    { id: 'vol3', full_name: 'Sophie Laurent', phone: '+33 6 45 67 89 01', email: 'sophie.laurent@email.com' },
    { id: 'vol4', full_name: 'Jean Moreau', phone: '+33 7 23 45 67 89', email: 'jean.moreau@email.com' },
    { id: 'vol5', full_name: 'Lisa Chen', phone: '+33 6 78 90 12 34', email: 'lisa.chen@email.com' }
  ];

  // 🎯 NOUVEAU: Textes traduits selon feedback avec statuts clarifiés
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
      unpublished: 'DÉPUBLIÉ', // 🎯 NOUVEAU: selon feedback
      full: 'COMPLET',
      cancelled: 'ANNULÉ',
      // 🎯 NOUVEAU: Statuts simplifiés selon feedback
      available: 'Disponible',
      signedUp: 'Inscrit',
      timeConflict: 'Conflit horaire',
      checkInRequired: 'Check-in requis',
      present: 'présents',
      publish: 'Publier',
      unpublish: 'Dépublier', // 🎯 NOUVEAU: selon feedback
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
      export: 'Export', // 🎯 NOUVEAU
      manageAccounts: 'Gestion Comptes', // 🎯 NOUVEAU
      // 🎯 NOUVEAU: Messages de conflit d'horaires
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
      // 🎯 NOUVEAU: Limite d'heures
      hourLimitWarning: 'Limite d\'heures dépassée',
      hourLimitMessage: 'Vous avez déjà {current}h d\'inscriptions. Ce créneau ajoute {additional}h (Total: {total}h, limite: {limit}h).',
      // Affectations
      assignedVolunteers: 'bénévoles assignés',
      viewDetails: 'Voir détails',
      noVolunteersAssigned: 'Aucun bénévole assigné',
      urgentNeedsVolunteers: 'Besoin urgent de bénévoles',
      manageAssignments: 'Gérer les affectations',
      // Rôles personnalisables
      roleRegistration: 'Accueil',
      roleTechSupport: 'Support technique',
      roleSecurity: 'Sécurité',
      roleArtistPickup: 'Transport artistes',
      roleMerchandise: 'Merchandising',
      roleGeneral: 'Général',
      // Messages
      fillAllFields: 'Veuillez remplir tous les champs obligatoires',
      shiftCreatedSuccess: '✅ Créneau créé avec succès !',
      signupSuccess: '✅ Inscription réussie !',
      unsubscribeSuccess: '✅ Désinscription réussie !',
      statusChangedSuccess: '✅ Statut changé avec succès !',
      changesPerformed: '✅ Modifications sauvegardées !',
      qrInvalid: 'Code QR invalide',
      volunteerNotFound: 'Bénévole non trouvé ou non inscrit',
      alreadyCheckedIn: 'Bénévole déjà pointé',
      checkedInSuccess: 'Bénévole pointé avec succès !',
      enterQRCode: 'Veuillez saisir un code QR',
      mustBeLoggedIn: 'Vous devez être connecté pour vous inscrire',
      error: 'Erreur' // 🎯 AJOUT: propriété manquante
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
      unpublished: 'UNPUBLISHED', // 🎯 NOUVEAU
      full: 'FULL',
      cancelled: 'CANCELLED',
      // 🎯 NOUVEAU: Statuts simplifiés
      available: 'Available',
      signedUp: 'Signed Up',
      timeConflict: 'Time Conflict',
      checkInRequired: 'Check-in required',
      present: 'present',
      publish: 'Publish',
      unpublish: 'Unpublish', // 🎯 NOUVEAU
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
      export: 'Export', // 🎯 NOUVEAU
      manageAccounts: 'Manage Accounts', // 🎯 NOUVEAU
      // 🎯 NOUVEAU: Messages de conflit d'horaires
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
      // 🎯 NOUVEAU: Limite d'heures
      hourLimitWarning: 'Hour limit exceeded',
      hourLimitMessage: 'You already have {current}h of signups. This shift adds {additional}h (Total: {total}h, limit: {limit}h).',
      // Affectations
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
      shiftCreatedSuccess: '✅ Shift created successfully!',
      signupSuccess: '✅ Signup successful!',
      unsubscribeSuccess: '✅ Unsubscribe successful!',
      statusChangedSuccess: '✅ Status changed successfully!',
      changesPerformed: '✅ Changes saved!',
      qrInvalid: 'Invalid QR code',
      volunteerNotFound: 'Volunteer not found or not registered',
      alreadyCheckedIn: 'Volunteer already checked in',
      checkedInSuccess: 'Volunteer checked in successfully!',
      enterQRCode: 'Please enter a QR code',
      mustBeLoggedIn: 'You must be logged in to sign up',
      error: 'Error' // 🎯 AJOUT: propriété manquante
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
      gridView: 'Vista Grilla',
      normalOrder: 'Orden normal',
      byDate: '📅 Por fecha',
      urgentFirst: '🚨 Urgentes primero',
      draft: 'BORRADOR',
      published: 'PUBLICADO',
      unpublished: 'DESPUBLICADO', // 🎯 NOUVEAU
      full: 'COMPLETO',
      cancelled: 'CANCELADO',
      // 🎯 NOUVEAU: Statuts simplifiés
      available: 'Disponible',
      signedUp: 'Inscrito',
      timeConflict: 'Conflicto Horario',
      checkInRequired: 'Check-in requerido',
      present: 'presentes',
      publish: 'Publicar',
      unpublish: 'Despublicar', // 🎯 NOUVEAU
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
      export: 'Export', // 🎯 NOUVEAU
      manageAccounts: 'Gestionar Cuentas', // 🎯 NOUVEAU
      // 🎯 NOUVEAU: Messages de conflit d'horaires
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
      // 🎯 NOUVEAU: Limite d'heures
      hourLimitWarning: 'Límite de horas excedido',
      hourLimitMessage: 'Ya tienes {current}h de inscripciones. Este turno añade {additional}h (Total: {total}h, límite: {limit}h).',
      // Affectations
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
      shiftCreatedSuccess: '✅ ¡Turno creado exitosamente!',
      signupSuccess: '✅ ¡Inscripción exitosa!',
      unsubscribeSuccess: '✅ ¡Desinscripción exitosa!',
      statusChangedSuccess: '✅ ¡Estado cambiado exitosamente!',
      changesPerformed: '✅ ¡Cambios guardados!',
      qrInvalid: 'Código QR inválido',
      volunteerNotFound: 'Voluntario no encontrado o no registrado',
      alreadyCheckedIn: 'Voluntario ya registrado',
      checkedInSuccess: '¡Voluntario registrado exitosamente!',
      enterQRCode: 'Por favor ingrese un código QR',
      mustBeLoggedIn: 'Debe estar conectado para inscribirse',
      error: 'Error' // 🎯 AJOUT: propriété manquante
    }
  };

  const txt = texts[language];

  // Charger les shifts avec leurs affectations pour les organisateurs
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

  // Obtenir les affectations pour un shift
  const getShiftAssignments = (shiftId: string) => {
    const shiftWithAssignments = shiftsWithAssignments.find(s => s.id === shiftId);
    return shiftWithAssignments?.volunteer_signups?.filter(signup => signup.status !== 'cancelled') || [];
  };

  // Obtenir les noms des bénévoles assignés
  const getAssignedVolunteerNames = (shiftId: string): string[] => {
    const assignments = getShiftAssignments(shiftId);
    return assignments.map(assignment => assignment.volunteer?.full_name || 'Nom inconnu');
  };

  // Calculer le niveau d'urgence d'un shift
  const getShiftUrgencyLevel = (shift: VolunteerShift) => {
    const fillRate = shift.current_volunteers / shift.max_volunteers;

    if (fillRate >= 1) return { level: 'complete', color: 'bg-green-500/20 text-green-300', label: 'Complet' };
    if (fillRate >= 0.75) return { level: 'good', color: 'bg-lime-500/20 text-lime-300', label: 'Bien rempli' };
    if (fillRate >= 0.5) return { level: 'medium', color: 'bg-yellow-500/20 text-yellow-300', label: 'À surveiller' };
    if (fillRate >= 0.25) return { level: 'urgent', color: 'bg-orange-500/20 text-orange-300', label: 'Urgent' };
    return { level: 'critical', color: 'bg-red-500/20 text-red-300', label: 'Critique' };
  };

  // Gestionnaire d'actions sur les bénévoles
  const handleVolunteerAction = async (action: string, signupId: string) => {
    await loadShiftsWithAssignments();
  };

  // Gestionnaire de mise à jour de shift
  const handleShiftUpdated = (updatedShift: any) => {
    setVolunteerShifts(shifts =>
      shifts.map(shift =>
        shift.id === updatedShift.id ? { ...shift, ...updatedShift } : shift
      )
    );

    loadShiftsWithAssignments();
  };

  // 🎯 NOUVEAU: Fonction pour calculer les heures totales d'un bénévole
  const calculateVolunteerHours = (volunteerSignups: VolunteerSignup[], shifts: VolunteerShift[]): number => {
    return volunteerSignups.reduce((total, signup) => {
      if (signup.status === 'signed_up') {
        const shift = shifts.find(s => s.id === signup.shift_id);
        if (shift) {
          const start = new Date(`${shift.shift_date}T${shift.start_time}`);
          const end = new Date(`${shift.shift_date}T${shift.end_time}`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return total + hours;
        }
      }
      return total;
    }, 0);
  };

  // 🎯 NOUVEAU: Fonction pour détecter les conflits d'horaires
  const detectTimeConflicts = (shiftId: string, userSignups: VolunteerSignup[]): OverlapConflict[] => {
    const targetShift = volunteerShifts.find(s => s.id === shiftId);
    if (!targetShift) return [];

    const conflicts: OverlapConflict[] = [];
    const targetStart = new Date(`${targetShift.shift_date}T${targetShift.start_time}`);
    const targetEnd = new Date(`${targetShift.shift_date}T${targetShift.end_time}`);

    userSignups.forEach(signup => {
      if (signup.status === 'signed_up') {
        const conflictShift = volunteerShifts.find(s => s.id === signup.shift_id);
        if (conflictShift) {
          const conflictStart = new Date(`${conflictShift.shift_date}T${conflictShift.start_time}`);
          const conflictEnd = new Date(`${conflictShift.shift_date}T${conflictShift.end_time}`);

          // Vérifier le chevauchement
          if (targetStart < conflictEnd && targetEnd > conflictStart) {
            conflicts.push({
              conflictingShift: conflictShift,
              conflictingSignup: signup,
              overlapType: (targetStart >= conflictStart && targetEnd <= conflictEnd) ? 'complete' : 'partial',
              overlapDetails: `${conflictShift.title} (${conflictShift.shift_date} ${conflictShift.start_time}-${conflictShift.end_time})`
            });
          }
        }
      }
    });

    return conflicts;
  };

  // 🎯 NOUVEAU: Fonction améliorée pour l'inscription avec vérifications
  const signUpForShift = async (shiftId: string) => {
    if (!currentUser?.id) {
      alert(txt.mustBeLoggedIn);
      return;
    }

    try {
      const shift = volunteerShifts.find(s => s.id === shiftId);
      if (!shift) return;

      const userSignups = volunteerSignups.filter(s => s.volunteer_id === currentUser.id);

      // 🎯 NOUVEAU: Vérifier les conflits d'horaires
      const conflicts = detectTimeConflicts(shiftId, userSignups);
      if (conflicts.length > 0) {
        setOverlapConflicts(conflicts);
        setPendingShiftId(shiftId);
        setShowOverlapModal(true);
        return;
      }

      // 🎯 NOUVEAU: Vérifier la limite d'heures (9h)
      const currentHours = calculateVolunteerHours(userSignups, volunteerShifts);
      const shiftStart = new Date(`${shift.shift_date}T${shift.start_time}`);
      const shiftEnd = new Date(`${shift.shift_date}T${shift.end_time}`);
      const shiftHours = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);
      const totalHours = currentHours + shiftHours;

      if (totalHours > 9) {
        setHourLimitWarning({
          currentHours,
          newHours: shiftHours,
          totalHours,
          limit: 9
        });
        setPendingShiftId(shiftId);
        setShowHourLimitModal(true);
        return;
      }

      // Procéder à l'inscription normale
      await proceedWithSignup(shiftId);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      alert('Erreur lors de l\'inscription'); // 🎯 CORRECTION: texte fixe au lieu de txt.error
    }
  };

  // 🎯 NOUVEAU: Fonction pour procéder à l'inscription (après vérifications)
  const proceedWithSignup = async (shiftId: string) => {
    try {
      console.log('🎯 Inscription en cours...', { shiftId, userId: currentUser?.id });

      // 🎯 CORRECTION: Utiliser le service Supabase au lieu de l'état local
      const { data, error } = await volunteerService.signUpForShift(
        shiftId,
        currentUser?.id || '',
        'a9d1c983-1456-4007-9aec-b297dd095ff7' // Event ID
      );

      if (error) {
        console.error('❌ Erreur Supabase inscription:', error);
        alert(`Erreur: ${error.message || 'Impossible de s\'inscrire'}`);
        return;
      }

      console.log('✅ Inscription réussie dans Supabase:', data);

      // Mettre à jour l'état local seulement après succès Supabase
      const newSignup = {
        id: data.id,
        shift_id: shiftId,
        volunteer_id: currentUser?.id || '',
        status: 'signed_up' as const,
        signed_up_at: data.signed_up_at || new Date().toISOString(),
        reminder_sent: false,
        qr_code: data.qr_code
      };

      setVolunteerSignups(prev => [...prev, newSignup]);

      // Mettre à jour le nombre de bénévoles dans le shift
      setVolunteerShifts(shifts =>
        shifts.map(shift =>
          shift.id === shiftId
            ? { ...shift, current_volunteers: shift.current_volunteers + 1 }
            : shift
        )
      );

      alert(txt.signupSuccess);

      // Recharger les données pour être sûr d'avoir les dernières infos
      // Vous pouvez ajouter une fonction de rechargement ici si nécessaire

    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      alert('Erreur technique lors de l\'inscription');
    }
  };

  // 🎯 NOUVEAU: Fonction pour continuer malgré le conflit
  const handleContinueAnywaySignup = async () => {
    if (pendingShiftId) {
      await proceedWithSignup(pendingShiftId);
      setShowOverlapModal(false);
      setOverlapConflicts([]);
      setPendingShiftId(null);
    }
  };

  // 🎯 NOUVEAU: Fonction pour annuler l'inscription en cas de conflit
  const handleCancelSignupDueToConflict = () => {
    setShowOverlapModal(false);
    setOverlapConflicts([]);
    setPendingShiftId(null);
  };

  // 🎯 NOUVEAU: Fonction pour continuer malgré la limite d'heures
  const handleContinueAnywayHourLimit = async () => {
    if (pendingShiftId) {
      await proceedWithSignup(pendingShiftId);
      setShowHourLimitModal(false);
      setHourLimitWarning(null);
      setPendingShiftId(null);
    }
  };

  // 🎯 NOUVEAU: Fonction pour annuler en cas de limite d'heures
  const handleCancelSignupDueToHourLimit = () => {
    setShowHourLimitModal(false);
    setHourLimitWarning(null);
    setPendingShiftId(null);
  };

  // Ouvrir le dashboard bénévole
  const openVolunteerDashboard = () => {
    if (currentUser?.role === 'volunteer') {
      setShowVolunteerDashboard(true);
    }
  };

  // Handler pour export Excel avec langue
  const handleExportVolunteers = (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    try {
      // 🎯 NOUVEAU: Export avec noms et emails selon feedback
      exportVolunteerShifts(volunteerShifts, volunteerSignups, volunteers, format);
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
    check_in_required: false
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
          const completedDescription = language === 'fr' ? 'Félicitations ! Vous avez terminé vos 9h requises.' :
            language === 'es' ? '¡Felicitaciones! Has completado tus 9h requeridas.' :
              'Congratulations! You have completed your required 9h.';

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
      setScanResult({ type: 'error', message: txt.enterQRCode });
      return;
    }

    const qrMatch = qrInput.match(/SABOR_VOL_([^_]+)_/);
    if (!qrMatch) {
      setScanResult({ type: 'error', message: txt.qrInvalid });
      return;
    }

    const scannedUserId = qrMatch[1];

    const volunteerSignup = volunteerSignups.find(signup =>
      signup.volunteer_id === scannedUserId &&
      signup.status !== 'cancelled'
    );

    if (!volunteerSignup) {
      setScanResult({ type: 'error', message: txt.volunteerNotFound });
      return;
    }

    if (volunteerSignup.status === 'checked_in') {
      setScanResult({ type: 'error', message: txt.alreadyCheckedIn });
      return;
    }

    setVolunteerSignups(signups =>
      signups.map(signup =>
        signup.id === volunteerSignup.id
          ? { ...signup, status: 'checked_in' as const, checked_in_at: new Date().toISOString() }
          : signup
      )
    );

    setScanResult({ type: 'success', message: txt.checkedInSuccess });
    setQrInput('');
  };

  const copyQRCode = (qrCode: string) => {
    navigator.clipboard.writeText(qrCode);
  };

  // 🎯 NOUVEAU: Fonction pour créer un créneau avec auto-publication
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
        // 🎯 NOUVEAU: Auto-publication selon feedback Hernan
        status: 'live',
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
        check_in_required: false
      });

      alert(txt.shiftCreatedSuccess);

    } catch (error: any) {
      console.error('❌ Error catch:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
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
      console.log('🎯 Désinscription en cours...', { signupId: signup.id });

      // 🎯 CORRECTION: Utiliser le service Supabase
      const { data, error } = await volunteerService.cancelSignup(signup.id);

      if (error) {
        console.error('❌ Error cancelling:', error);
        alert(`Error during cancellation: ${error.message}`);
        return;
      }

      console.log('✅ Désinscription réussie dans Supabase:', data);

      // Mettre à jour l'état local après succès Supabase
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

  // 🎯 NOUVEAU: Fonction pour basculer entre publié/non publié
  const changeShiftStatus = async (shiftId: string, newStatus: 'draft' | 'live' | 'full' | 'cancelled' | 'unpublished') => {
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
      check_in_required: false
    });
  };

  const isOrganizer = currentUser?.role === 'organizer' || currentUser?.role === 'admin';
  const isVolunteer = currentUser?.role === 'volunteer';

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
              {isVolunteer && (
                <button
                  onClick={openVolunteerDashboard}
                  className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2"
                >
                  <UserCheck size={20} />
                  {txt.myDashboard}
                </button>
              )}

              {isOrganizer && (
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
                  <button
                    onClick={() => setShowVolunteerAccountsModal(true)}
                    className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2"
                  >
                    <Users size={18} />
                    {txt.manageAccounts || 'Gestion Comptes'}
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
        {isVolunteer && (
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

        {/* 🎯 NETTOYAGE: Interface simplifiée pour bénévoles - Calendrier + Liste */}
        {isVolunteer ? (
          // Vue simplifiée pour bénévoles - calendrier et liste seulement
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-2xl p-2">
              <div className="flex">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${viewMode === 'calendar'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <Calendar size={20} />
                  {txt.calendarView}
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${viewMode === 'list'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <List size={20} />
                  {txt.listView}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Vue complète pour organisateurs avec toutes les options
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-2xl p-2">
              <div className="flex">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${viewMode === 'calendar'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <Calendar size={20} />
                  {txt.calendarView}
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${viewMode === 'list'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <List size={20} />
                  {txt.listView}
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${viewMode === 'grid'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  <Grid size={20} />
                  {txt.gridView}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 NETTOYAGE: Filtres de tri - seulement pour organisateurs */}
        {isOrganizer && viewMode === 'list' && (
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-xl p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('none')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${sortBy === 'none'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  {txt.normalOrder}
                </button>
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${sortBy === 'date'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  {txt.byDate}
                </button>
                <button
                  onClick={() => setSortBy('missing')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${sortBy === 'missing'
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
              const newShift: any = { // 🎯 CORRECTION: Type any temporaire
                id: Date.now().toString(),
                current_volunteers: 0,
                status: 'live',
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
              if (isOrganizer) {
                setShowShiftDetailsModal(shift);
              }
            }}
            userVolunteerHours={userVolunteerHours}
            setUserVolunteerHours={setUserVolunteerHours} // 🎯 CORRECTION: Ajout de la prop manquante
          />
        ) : viewMode === 'grid' ? (
          <GridView
            volunteerShifts={volunteerShifts as any} // 🎯 CORRECTION: Cast temporaire
            language={language}
            volunteerSignups={volunteerSignups}
            currentUser={currentUser}
            onSignUp={signUpForShift}
            onEditShift={handleEditShift}
            onExportGrid={handleExportGrid}
          />
        ) : (
          // Vue liste avec affichage des affectations - 🎯 NETTOYAGE: Progress bar supprimée pour bénévoles
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
                  if (isVolunteer && (shift.status === 'draft' || shift.status === 'unpublished')) {
                    return false;
                  }
                  return true;
                })
                .map(shift => {
                  const checkedInCount = volunteerSignups.filter(signup =>
                    signup.shift_id === shift.id && signup.status === 'checked_in'
                  ).length;

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

                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${shift.status === 'draft' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                                shift.status === 'unpublished' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                  shift.status === 'live' ? (shift.current_volunteers >= shift.max_volunteers ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30') :
                                    shift.current_volunteers >= shift.max_volunteers ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                      'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}>
                              {shift.status === 'draft' ? txt.draft :
                                shift.status === 'unpublished' ? txt.unpublished :
                                  shift.status === 'live' ? (shift.current_volunteers >= shift.max_volunteers ? txt.full : txt.published) :
                                    shift.status === 'cancelled' ? txt.cancelled :
                                      shift.current_volunteers >= shift.max_volunteers ? txt.full : txt.published}
                            </span>

                            {isOrganizer && isUrgent && (
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
                              <span className="font-medium">{shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users size={20} className="text-green-400" />
                              <span className="font-medium">{shift.current_volunteers}/{shift.max_volunteers} bénévoles</span>
                            </div>
                          </div>

                          {isOrganizer && assignedNames.length > 0 && (
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

                              <button
                                onClick={() => setShowShiftDetailsModal(shift)}
                                className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1 hover:underline"
                              >
                                <Eye size={14} />
                                {txt.viewDetails}
                              </button>
                            </div>
                          )}

                          {isOrganizer && assignedNames.length === 0 && shift.status === 'live' && (
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
                          {isOrganizer && (
                            <div className="flex gap-2">
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
                                onClick={() => changeShiftStatus(shift.id, shift.status === 'live' ? 'unpublished' : 'live')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${shift.status === 'live'
                                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-orange-500/25'
                                    : 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/25'
                                  }`}
                              >
                                {shift.status === 'live' ? txt.unpublish : txt.publish}
                              </button>
                            </div>
                          )}

                          {shift.status === 'live' && isVolunteer ? (
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

                      {/* 🎯 NETTOYAGE: Progress bar - seulement pour organisateurs */}
                      {isOrganizer && (
                        <div className="bg-gray-700/50 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-300">{txt.progress}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400">
                                {Math.round((shift.current_volunteers / shift.max_volunteers) * 100)}%
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${urgency.color}`}>
                                {urgency.label}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-600/50 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 shadow-lg ${isUrgent
                                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                  : 'bg-gradient-to-r from-lime-500 to-green-500'
                                }`}
                              style={{ width: `${(shift.current_volunteers / shift.max_volunteers) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
            })()}
          </div>
        )}

        {/* 🎯 NOUVEAU: Modal de gestion des comptes bénévoles */}
        <VolunteerAccountsModal
          isOpen={showVolunteerAccountsModal}
          onClose={() => setShowVolunteerAccountsModal(false)}
          currentUser={currentUser}
          language={language}
          volunteerShifts={volunteerShifts}
          volunteerSignups={volunteerSignups}
        />

        {/* Toutes les autres modals... */}
        {/* Modal Volunteer Dashboard */}
        {showVolunteerDashboard && currentUser && (
          <VolunteerDashboard
            currentUser={currentUser}
            volunteerShifts={volunteerShifts.filter(shift =>
              shift.status === 'live' || shift.status === 'full'
            ) as any}
            volunteerSignups={volunteerSignups}
            setVolunteerSignups={setVolunteerSignups}
            setVolunteerShifts={setVolunteerShifts as any}
            onClose={() => setShowVolunteerDashboard(false)}
          />
        )}

        {/* Modal détails de créneau avec affectations */}
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
                    onChange={(e) => setNewShift({ ...newShift, title: e.target.value })}
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
                    onChange={(e) => setNewShift({ ...newShift, description: e.target.value })}
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
                      onChange={(e) => setNewShift({ ...newShift, shift_date: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{txt.nbVolunteers}</label>
                    <input
                      type="number"
                      min="1"
                      value={newShift.max_volunteers}
                      onChange={(e) => setNewShift({ ...newShift, max_volunteers: parseInt(e.target.value) })}
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
                      onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">{txt.endTime} *</label>
                    <input
                      type="time"
                      value={newShift.end_time}
                      onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">{txt.roleType}</label>
                  <select
                    value={newShift.role_type}
                    onChange={(e) => setNewShift({ ...newShift, role_type: e.target.value })}
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
                    onChange={(e) => setNewShift({ ...newShift, check_in_required: e.target.checked })}
                    className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <label className="text-gray-300 font-medium">{txt.checkInRequiredDay}</label>
                </div>

                <button
                  onClick={handleCreateShift}
                  disabled={isCreating}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl ${isCreating
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

        {/* Toutes les autres modals existantes... */}

      </div>
    </div>
  );
};

export default VolunteersPage;