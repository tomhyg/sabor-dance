// src/components/volunteers/ShiftDetailsModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Clock, 
  Calendar, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  CheckCircle, 
  Edit,
  Trash2,
  Phone,
  Mail,
  Shield,
  User,
  UserPlus,
  BarChart3,
  Save,
  Eye,
  RotateCcw
} from 'lucide-react';
import { volunteerService, ShiftWithVolunteers, ShiftAssignmentStats } from '../../services/volunteerService';

interface ShiftDetailsModalProps {
  shift: any; // VolunteerShift de base
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  language?: 'fr' | 'en' | 'es';
  onShiftUpdated?: (updatedShift: any) => void;
  onVolunteerAction?: (action: string, signupId: string) => void;
}

interface VolunteerAssignment {
  id: string;
  volunteer_id: string;
  status: 'signed_up' | 'confirmed' | 'checked_in' | 'no_show' | 'cancelled';
  signed_up_at: string;
  checked_in_at?: string;
  volunteer: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

const ShiftDetailsModal: React.FC<ShiftDetailsModalProps> = ({
  shift,
  isOpen,
  onClose,
  currentUser,
  language = 'fr',
  onShiftUpdated,
  onVolunteerAction
}) => {
  const [loading, setLoading] = useState(false);
  const [detailedShift, setDetailedShift] = useState<ShiftWithVolunteers | null>(null);
  const [stats, setStats] = useState<ShiftAssignmentStats | null>(null);
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [showEditMode, setShowEditMode] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 🎯 NOUVEAU: État pour l'édition du shift
  const [editShiftData, setEditShiftData] = useState({
    title: '',
    description: '',
    shift_date: '',
    start_time: '',
    end_time: '',
    max_volunteers: 1,
    role_type: '',
    check_in_required: true,
    status: 'draft' as 'draft' | 'live' | 'full' | 'cancelled'
  });

  // Textes traduits
  const texts = {
    fr: {
      title: 'Détails du créneau',
      assignments: 'Affectations des bénévoles',
      statistics: 'Statistiques',
      volunteerList: 'Liste des bénévoles',
      noVolunteers: 'Aucun bénévole assigné pour le moment',
      assignedVolunteers: 'bénévoles assignés',
      spotsRemaining: 'places restantes',
      fillRate: 'Taux de remplissage',
      urgencyLevel: 'Niveau d\'urgence',
      urgency: {
        low: 'Faible',
        medium: 'Moyen', 
        high: 'Élevé',
        critical: 'Critique'
      },
      status: {
        signed_up: 'Inscrit',
        confirmed: 'Confirmé',
        checked_in: 'Présent',
        no_show: 'Absent',
        cancelled: 'Annulé'
      },
      shiftStatus: {
        draft: 'Brouillon',
        live: 'Publié',
        full: 'Complet',
        cancelled: 'Annulé'
      },
      actions: {
        confirm: 'Confirmer',
        checkIn: 'Marquer présent',
        remove: 'Retirer',
        contact: 'Contacter'
      },
      confirmAction: 'Êtes-vous sûr de vouloir',
      removeVolunteer: 'retirer ce bénévole du créneau ?',
      confirmVolunteer: 'confirmer ce bénévole ?',
      checkInVolunteer: 'marquer ce bénévole comme présent ?',
      edit: 'Modifier',
      close: 'Fermer',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      publish: 'Publier',
      draft: 'Dépublier',
      viewMode: 'Mode consultation',
      editMode: 'Mode édition',
      loading: 'Chargement...',
      updating: 'Mise à jour...',
      saving: 'Sauvegarde...',
      error: 'Une erreur est survenue',
      success: 'Action effectuée avec succès',
      shiftUpdated: 'Créneau mis à jour avec succès',
      statusChanged: 'Statut changé avec succès',
      shiftInfo: 'Informations du créneau',
      time: 'Horaire',
      date: 'Date',
      location: 'Lieu',
      roleType: 'Type de rôle',
      description: 'Description',
      requirements: 'Prérequis',
      checkInRequired: 'Check-in requis',
      maxVolunteers: 'Nombre max de bénévoles',
      currentVolunteers: 'Bénévoles actuels',
      signedUpAt: 'Inscrit le',
      checkedInAt: 'Présent depuis',
      since: 'depuis',
      startTime: 'Heure de début',
      endTime: 'Heure de fin'
    },
    en: {
      title: 'Shift Details',
      assignments: 'Volunteer Assignments',
      statistics: 'Statistics',
      volunteerList: 'Volunteer List',
      noVolunteers: 'No volunteers assigned yet',
      assignedVolunteers: 'volunteers assigned',
      spotsRemaining: 'spots remaining',
      fillRate: 'Fill Rate',
      urgencyLevel: 'Urgency Level',
      urgency: {
        low: 'Low',
        medium: 'Medium',
        high: 'High', 
        critical: 'Critical'
      },
      status: {
        signed_up: 'Signed Up',
        confirmed: 'Confirmed',
        checked_in: 'Checked In',
        no_show: 'No Show',
        cancelled: 'Cancelled'
      },
      shiftStatus: {
        draft: 'Draft',
        live: 'Published',
        full: 'Full',
        cancelled: 'Cancelled'
      },
      actions: {
        confirm: 'Confirm',
        checkIn: 'Check In',
        remove: 'Remove',
        contact: 'Contact'
      },
      confirmAction: 'Are you sure you want to',
      removeVolunteer: 'remove this volunteer from the shift?',
      confirmVolunteer: 'confirm this volunteer?',
      checkInVolunteer: 'check in this volunteer?',
      edit: 'Edit',
      close: 'Close',
      save: 'Save',
      cancel: 'Cancel',
      publish: 'Publish',
      draft: 'Unpublish',
      viewMode: 'View Mode',
      editMode: 'Edit Mode',
      loading: 'Loading...',
      updating: 'Updating...',
      saving: 'Saving...',
      error: 'An error occurred',
      success: 'Action completed successfully',
      shiftUpdated: 'Shift updated successfully',
      statusChanged: 'Status changed successfully',
      shiftInfo: 'Shift Information',
      time: 'Time',
      date: 'Date',
      location: 'Location',
      roleType: 'Role Type',
      description: 'Description',
      requirements: 'Requirements',
      checkInRequired: 'Check-in required',
      maxVolunteers: 'Max volunteers',
      currentVolunteers: 'Current volunteers',
      signedUpAt: 'Signed up on',
      checkedInAt: 'Checked in at',
      since: 'since',
      startTime: 'Start time',
      endTime: 'End time'
    },
    es: {
      title: 'Detalles del Turno',
      assignments: 'Asignaciones de Voluntarios',
      statistics: 'Estadísticas',
      volunteerList: 'Lista de Voluntarios',
      noVolunteers: 'Ningún voluntario asignado aún',
      assignedVolunteers: 'voluntarios asignados',
      spotsRemaining: 'lugares restantes',
      fillRate: 'Tasa de Ocupación',
      urgencyLevel: 'Nivel de Urgencia',
      urgency: {
        low: 'Bajo',
        medium: 'Medio',
        high: 'Alto',
        critical: 'Crítico'
      },
      status: {
        signed_up: 'Inscrito',
        confirmed: 'Confirmado',
        checked_in: 'Presente',
        no_show: 'Ausente',
        cancelled: 'Cancelado'
      },
      shiftStatus: {
        draft: 'Borrador',
        live: 'Publicado',
        full: 'Completo',
        cancelled: 'Cancelado'
      },
      actions: {
        confirm: 'Confirmar',
        checkIn: 'Marcar presente',
        remove: 'Remover',
        contact: 'Contactar'
      },
      confirmAction: '¿Estás seguro de que quieres',
      removeVolunteer: 'remover este voluntario del turno?',
      confirmVolunteer: 'confirmar este voluntario?',
      checkInVolunteer: 'marcar este voluntario como presente?',
      edit: 'Editar',
      close: 'Cerrar',
      save: 'Guardar',
      cancel: 'Cancelar',
      publish: 'Publicar',
      draft: 'Despublicar',
      viewMode: 'Modo Vista',
      editMode: 'Modo Edición',
      loading: 'Cargando...',
      updating: 'Actualizando...',
      saving: 'Guardando...',
      error: 'Ocurrió un error',
      success: 'Acción completada exitosamente',
      shiftUpdated: 'Turno actualizado exitosamente',
      statusChanged: 'Estado cambiado exitosamente',
      shiftInfo: 'Información del Turno',
      time: 'Horario',
      date: 'Fecha',
      location: 'Ubicación',
      roleType: 'Tipo de Rol',
      description: 'Descripción',
      requirements: 'Requisitos',
      checkInRequired: 'Check-in requerido',
      maxVolunteers: 'Máx. voluntarios',
      currentVolunteers: 'Voluntarios actuales',
      signedUpAt: 'Inscrito el',
      checkedInAt: 'Presente desde',
      since: 'desde',
      startTime: 'Hora de inicio',
      endTime: 'Hora de fin'
    }
  };

  const t = texts[language];

  // Charger les détails du shift au montage
  useEffect(() => {
    if (isOpen && shift?.id) {
      loadShiftDetails();
      // 🎯 NOUVEAU: Initialiser les données d'édition
      initializeEditData();
    }
  }, [isOpen, shift?.id]);

  // 🎯 NOUVEAU: Initialiser les données d'édition
  const initializeEditData = () => {
    if (shift) {
      setEditShiftData({
        title: shift.title || '',
        description: shift.description || '',
        shift_date: shift.shift_date || '',
        start_time: shift.start_time || '',
        end_time: shift.end_time || '',
        max_volunteers: shift.max_volunteers || 1,
        role_type: shift.role_type || '',
        check_in_required: shift.check_in_required || false,
        status: shift.status || 'draft'
      });
    }
  };

  const loadShiftDetails = async () => {
    if (!shift?.id) return;
    
    setLoading(true);
    try {
      // Charger les détails complets du shift
      const { data: shiftData, error: shiftError } = await volunteerService.getShiftWithAssignments(shift.id);
      
      if (shiftError) {
        console.error('Erreur chargement shift:', shiftError);
        return;
      }

      setDetailedShift(shiftData || null);
      
      // Extraire les affectations
      const volunteerAssignments = shiftData?.volunteer_signups?.filter(
        signup => signup.status !== 'cancelled'
      ) || [];
      
      setAssignments(volunteerAssignments);

      // Charger les statistiques
      const { data: statsData, error: statsError } = await volunteerService.getShiftAssignmentStats(shift.id);
      
      if (!statsError && statsData) {
        setStats(statsData);
      }

    } catch (error) {
      console.error('Erreur chargement détails shift:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 NOUVEAU: Sauvegarder les modifications du shift
  const saveShiftChanges = async () => {
    if (!shift?.id || isUpdating) return;

    setIsUpdating(true);
    try {
      console.log('🔄 Mise à jour shift:', shift.id, editShiftData);

      const { data, error } = await volunteerService.updateShift(shift.id, editShiftData);

      if (error) {
        console.error('❌ Erreur mise à jour:', error);
        alert(`${t.error}: ${error.message}`);
        return;
      }

      console.log('✅ Shift mis à jour:', data);

      // Mettre à jour le shift local
      const updatedShift = { ...shift, ...editShiftData };
      
      // Notifier le parent
      if (onShiftUpdated) {
        onShiftUpdated(updatedShift);
      }

      // Sortir du mode édition
      setShowEditMode(false);
      
      // Recharger les détails
      await loadShiftDetails();

      alert(t.shiftUpdated);

    } catch (error: any) {
      console.error('❌ Erreur catch:', error);
      alert(`${t.error}: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // 🎯 NOUVEAU: Changer le statut du shift
  const changeShiftStatus = async (newStatus: 'draft' | 'live' | 'full' | 'cancelled') => {
    if (!shift?.id || isUpdating) return;

    setIsUpdating(true);
    try {
      console.log('🔄 Changement statut:', shift.id, 'vers', newStatus);
      
      const { error } = await volunteerService.updateShift(shift.id, { status: newStatus });
      
      if (error) {
        console.error('❌ Erreur changement statut:', error);
        alert(`${t.error}: ${error.message}`);
        return;
      }
      
      console.log('✅ Statut changé avec succès');
      
      // Mettre à jour localement
      const updatedShift = { ...shift, status: newStatus };
      setEditShiftData(prev => ({ ...prev, status: newStatus }));
      
      // Notifier le parent
      if (onShiftUpdated) {
        onShiftUpdated(updatedShift);
      }
      
      // Recharger les détails
      await loadShiftDetails();
      
      alert(t.statusChanged);
    } catch (error: any) {
      console.error('❌ Erreur catch:', error);
      alert(`${t.error}: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // 🎯 NOUVEAU: Annuler l'édition
  const cancelEdit = () => {
    setShowEditMode(false);
    initializeEditData();
  };

  // Actions sur les bénévoles
  const handleVolunteerAction = async (action: string, signupId: string, volunteerName: string) => {
    const confirmMessages = {
      remove: `${t.confirmAction} ${t.removeVolunteer}`,
      confirm: `${t.confirmAction} ${t.confirmVolunteer}`,
      checkIn: `${t.confirmAction} ${t.checkInVolunteer}`
    };

    const message = confirmMessages[action as keyof typeof confirmMessages];
    if (message && !window.confirm(`${message}\n\nBénévole: ${volunteerName}`)) {
      return;
    }

    setActionLoading(signupId);
    try {
      let result;
      
      switch (action) {
        case 'remove':
          result = await volunteerService.removeVolunteerFromShift(signupId, currentUser?.id);
          break;
        case 'confirm':
          result = await volunteerService.confirmVolunteer(signupId, currentUser?.id);
          break;
        case 'checkIn':
          result = await volunteerService.checkIn(signupId, currentUser?.id, 'manual');
          break;
        default:
          throw new Error(`Action non supportée: ${action}`);
      }

      if (result?.error) {
        throw new Error(result.error.message || 'Erreur lors de l\'action');
      }

      // Recharger les données
      await loadShiftDetails();
      
      // Notifier le parent si nécessaire
      if (onVolunteerAction) {
        onVolunteerAction(action, signupId);
      }

      alert(t.success);

    } catch (error: any) {
      console.error(`Erreur ${action}:`, error);
      alert(`${t.error}: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    const colors = {
      signed_up: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      confirmed: 'bg-green-500/20 text-green-300 border-green-500/40',
      checked_in: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      no_show: 'bg-red-500/20 text-red-300 border-red-500/40',
      cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500/40'
    };
    return colors[status as keyof typeof colors] || colors.signed_up;
  };

  // 🎯 NOUVEAU: Obtenir la couleur du statut de shift
  const getShiftStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      live: 'bg-green-500/20 text-green-300 border-green-500/40',
      full: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500/40'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  // Obtenir la couleur du niveau d'urgence
  const getUrgencyColor = (level: string) => {
    const colors = {
      low: 'bg-green-500/20 text-green-300',
      medium: 'bg-yellow-500/20 text-yellow-300',
      high: 'bg-orange-500/20 text-orange-300',
      critical: 'bg-red-500/20 text-red-300'
    };
    return colors[level as keyof typeof colors] || colors.low;
  };

  // Formatter la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatter l'heure
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculer la durée depuis l'inscription/check-in
  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}min`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-600/30">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">{t.title}</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-400">{showEditMode ? editShiftData.title : shift?.title}</p>
                {/* 🎯 NOUVEAU: Badge de statut */}
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getShiftStatusColor(showEditMode ? editShiftData.status : shift?.status)}`}>
                  {t.shiftStatus[(showEditMode ? editShiftData.status : shift?.status) as keyof typeof t.shiftStatus]}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 🎯 NOUVEAU: Indicateur de mode */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {showEditMode ? (
                <>
                  <Edit size={16} className="text-blue-400" />
                  <span className="text-blue-400">{t.editMode}</span>
                </>
              ) : (
                <>
                  <Eye size={16} className="text-gray-400" />
                  <span>{t.viewMode}</span>
                </>
              )}
            </div>

            {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
              <div className="flex items-center gap-2">
                {!showEditMode ? (
                  <>
                    {/* Bouton Edit */}
                    <button
                      onClick={() => setShowEditMode(true)}
                      className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                    >
                      <Edit size={16} />
                      {t.edit}
                    </button>

                    {/* Bouton Publish/Draft */}
                    <button
                      onClick={() => changeShiftStatus(shift?.status === 'draft' ? 'live' : 'draft')}
                      disabled={isUpdating}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        shift?.status === 'draft' 
                          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                      }`}
                    >
                      {isUpdating ? (
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                      ) : (
                        <RotateCcw size={16} />
                      )}
                      {shift?.status === 'draft' ? t.publish : t.draft}
                    </button>
                  </>
                ) : (
                  // Boutons mode édition
                  <>
                    <button
                      onClick={saveShiftChanges}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
                    >
                      {isUpdating ? (
                        <div className="animate-spin w-4 h-4 border-2 border-green-300 border-t-transparent rounded-full"></div>
                      ) : (
                        <Save size={16} />
                      )}
                      {isUpdating ? t.saving : t.save}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
                    >
                      {t.cancel}
                    </button>
                  </>
                )}
              </div>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">{t.loading}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              
              {/* 🎯 NOUVEAU: Informations du créneau avec mode édition */}
              <div className="bg-gray-700/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-green-400" />
                  {t.shiftInfo}
                </h3>
                
                {showEditMode ? (
                  // Mode édition
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Titre</label>
                      <input
                        type="text"
                        value={editShiftData.title}
                        onChange={(e) => setEditShiftData({...editShiftData, title: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">{t.description}</label>
                      <textarea
                        value={editShiftData.description}
                        onChange={(e) => setEditShiftData({...editShiftData, description: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">{t.startTime}</label>
                        <input
                          type="time"
                          value={editShiftData.start_time}
                          onChange={(e) => setEditShiftData({...editShiftData, start_time: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">{t.endTime}</label>
                        <input
                          type="time"
                          value={editShiftData.end_time}
                          onChange={(e) => setEditShiftData({...editShiftData, end_time: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">{t.maxVolunteers}</label>
                        <input
                          type="number"
                          min="1"
                          value={editShiftData.max_volunteers}
                          onChange={(e) => setEditShiftData({...editShiftData, max_volunteers: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">{t.roleType}</label>
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
                        {t.checkInRequired}
                      </label>
                    </div>
                  </div>
                ) : (
                  // Mode consultation
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300 text-sm">{t.date}</span>
                      </div>
                      <p className="text-white font-semibold">
                        {shift?.shift_date ? formatDate(shift.shift_date) : 'Non défini'}
                      </p>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 text-sm">{t.time}</span>
                      </div>
                      <p className="text-white font-semibold">
                        {shift?.start_time} - {shift?.end_time}
                      </p>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300 text-sm">{t.maxVolunteers}</span>
                      </div>
                      <p className="text-white font-semibold">
                        {shift?.max_volunteers} {t.assignedVolunteers}
                      </p>
                    </div>

                    {shift?.role_type && (
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-orange-400" />
                          <span className="text-gray-300 text-sm">{t.roleType}</span>
                        </div>
                        <p className="text-white font-semibold capitalize">
                          {shift.role_type.replace('_', ' ')}
                        </p>
                      </div>
                    )}

                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-300 text-sm">{t.checkInRequired}</span>
                      </div>
                      <p className="text-white font-semibold">
                        {shift?.check_in_required ? 'Oui' : 'Non'}
                      </p>
                    </div>
                  </div>
                )}

                {shift?.description && !showEditMode && (
                  <div className="mt-4 bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="text-gray-300 text-sm mb-2">{t.description}</h4>
                    <p className="text-white">{shift.description}</p>
                  </div>
                )}
              </div>

              {/* Statistiques */}
              {stats && !showEditMode && (
                <div className="bg-gray-700/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-green-400" />
                    {t.statistics}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-500/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-300">
                        {stats.total_assigned}
                      </div>
                      <div className="text-blue-200 text-sm">
                        {t.assignedVolunteers}
                      </div>
                    </div>

                    <div className="bg-green-500/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-300">
                        {stats.spots_remaining}
                      </div>
                      <div className="text-green-200 text-sm">
                        {t.spotsRemaining}
                      </div>
                    </div>

                    <div className="bg-purple-500/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-300">
                        {stats.fill_percentage}%
                      </div>
                      <div className="text-purple-200 text-sm">
                        {t.fillRate}
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg text-center ${getUrgencyColor(stats.urgency_level)}`}>
                      <div className="text-2xl font-bold">
                        <AlertTriangle className="w-6 h-6 mx-auto" />
                      </div>
                      <div className="text-sm">
                        {t.urgency[stats.urgency_level as keyof typeof t.urgency]}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Liste des bénévoles */}
              {!showEditMode && (
                <div className="bg-gray-700/30 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Users className="w-6 h-6 text-green-400" />
                      {t.volunteerList}
                      <span className="text-sm text-gray-400 font-normal">
                        ({assignments.length})
                      </span>
                    </h3>

                    {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                      <button className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2">
                        <UserPlus size={16} />
                        Ajouter bénévole
                      </button>
                    )}
                  </div>

                  {assignments.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">{t.noVolunteers}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-800/70 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-white font-semibold">
                                  {assignment.volunteer.full_name}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                                  {t.status[assignment.status as keyof typeof t.status]}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {assignment.volunteer.email}
                                </div>
                                
                                {assignment.volunteer.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {assignment.volunteer.phone}
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {t.signedUpAt} {formatTime(assignment.signed_up_at)}
                                  <span className="text-gray-500">
                                    ({getTimeSince(assignment.signed_up_at)} {t.since})
                                  </span>
                                </div>

                                {assignment.checked_in_at && (
                                  <div className="flex items-center gap-1 text-green-400">
                                    <CheckCircle className="w-3 h-3" />
                                    {t.checkedInAt} {formatTime(assignment.checked_in_at)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions pour organisateurs */}
                          {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                            <div className="flex items-center gap-2">
                              {assignment.status === 'signed_up' && (
                                <button
                                  onClick={() => handleVolunteerAction('confirm', assignment.id, assignment.volunteer.full_name)}
                                  disabled={actionLoading === assignment.id}
                                  className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center gap-1"
                                >
                                  <CheckCircle size={14} />
                                  {actionLoading === assignment.id ? '...' : t.actions.confirm}
                                </button>
                              )}

                              {(assignment.status === 'signed_up' || assignment.status === 'confirmed') && (
                                <button
                                  onClick={() => handleVolunteerAction('checkIn', assignment.id, assignment.volunteer.full_name)}
                                  disabled={actionLoading === assignment.id}
                                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center gap-1"
                                >
                                  <UserCheck size={14} />
                                  {actionLoading === assignment.id ? '...' : t.actions.checkIn}
                                </button>
                              )}

                              <button
                                onClick={() => window.open(`mailto:${assignment.volunteer.email}`, '_blank')}
                                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm flex items-center gap-1"
                              >
                                <Mail size={14} />
                                {t.actions.contact}
                              </button>

                              <button
                                onClick={() => handleVolunteerAction('remove', assignment.id, assignment.volunteer.full_name)}
                                disabled={actionLoading === assignment.id}
                                className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center gap-1"
                              >
                                <UserX size={14} />
                                {actionLoading === assignment.id ? '...' : t.actions.remove}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-600/30 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftDetailsModal;