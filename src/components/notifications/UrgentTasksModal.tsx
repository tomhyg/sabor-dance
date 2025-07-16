// src/components/notifications/UrgentTasksModal.tsx - VERSION ÉPURÉE
import React, { useState } from 'react';
import { 
  X, 
  BellRing, 
  CheckCircle, 
  ChevronRight, 
  Users, 
  Music, 
  FileText, 
  Calendar, 
  Clock, 
  AlertTriangle,
  UserCheck,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { UrgentTask, UserRole } from '../../services/notifications/notificationService';

interface UrgentTasksModalProps {
  userRole: UserRole;
  urgentTasks: UrgentTask[];
  loading: boolean;
  onClose: () => void;
  onTaskAction?: (task: UrgentTask) => void;
  onDismissTask?: (taskId: string) => void;
  onRefresh?: () => void;
  onTestEmail?: (type: 'volunteer' | 'team_director' | 'organizer') => Promise<{ success: boolean; error?: string }>;
}

export const UrgentTasksModal: React.FC<UrgentTasksModalProps> = ({
  userRole,
  urgentTasks,
  loading,
  onClose,
  onTaskAction,
  onDismissTask,
  onRefresh,
  onTestEmail
}) => {
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; error?: string } | null>(null);

  // Trier les tâches par urgence
  const sortedTasks = [...urgentTasks].sort((a, b) => {
    const urgencyOrder = { high: 3, medium: 2, low: 1 };
    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
  });

  // Grouper par type
  const groupedTasks = sortedTasks.reduce((groups, task) => {
    const key = task.type;
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
    return groups;
  }, {} as Record<string, UrgentTask[]>);

  // Obtenir l'icône selon le type
  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'volunteer': return <Users className="w-5 h-5" />;
      case 'team': return <Music className="w-5 h-5" />;
      case 'shift': return <Calendar className="w-5 h-5" />;
      case 'approval': return <UserCheck className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  // Obtenir la couleur selon l'urgence
  const getColorForUrgency = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-orange-500 bg-orange-500/10';
      case 'low': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  // Obtenir le label du type
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'critical': return 'Critique';
      case 'urgent': return 'Urgent';
      case 'reminder': return 'Rappel';
      default: return type;
    }
  };

  // Tester l'envoi d'email
  const handleTestEmail = async () => {
    if (!onTestEmail) return;
    
    setTestEmailLoading(true);
    setTestEmailResult(null);
    
    try {
      const emailType = userRole === 'volunteer' ? 'volunteer' : 
                       userRole === 'team_director' ? 'team_director' : 'organizer';
      
      const result = await onTestEmail(emailType);
      setTestEmailResult(result);
    } catch (error) {
      setTestEmailResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellRing className="w-6 h-6 text-yellow-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <p className="text-gray-400 text-sm">
                  {urgentTasks.length} notification{urgentTasks.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Bouton actualiser */}
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="Actualiser"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* État de chargement */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-400">Chargement des notifications...</span>
            </div>
          )}

          {/* Aucune notification */}
          {!loading && urgentTasks.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                Aucune notification
              </h3>
              <p className="text-gray-500">
                Tout est à jour ! Revenez plus tard.
              </p>
            </div>
          )}

          {/* Liste des notifications */}
          {!loading && urgentTasks.length > 0 && (
            <div className="space-y-4">
              {Object.entries(groupedTasks).map(([type, tasks]) => (
                <div key={type}>
                  <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    {type === 'critical' ? <AlertTriangle className="w-5 h-5 text-red-400" /> : 
                     type === 'urgent' ? <BellRing className="w-5 h-5 text-orange-400" /> : 
                     <Clock className="w-5 h-5 text-blue-400" />}
                    {getTypeLabel(type)} ({tasks.length})
                  </h3>
                  
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${getColorForUrgency(task.urgency)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-gray-400 mt-1">
                              {getIconForCategory(task.category)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-white">{task.title}</h4>
                                {task.count > 1 && (
                                  <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                                    {task.count}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                              
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
                                <span>•</span>
                                <span className="capitalize">{task.urgency}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {/* Bouton d'action */}
                            {onTaskAction && (
                              <button
                                onClick={() => onTaskAction(task)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                              >
                                {task.action}
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                            
                            {/* Bouton supprimer */}
                            {onDismissTask && (
                              <button
                                onClick={() => onDismissTask(task.id)}
                                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                title="Marquer comme traité"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer avec boutons de test en développement */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Mode développement</span>
              
              <div className="flex items-center gap-2">
                {testEmailResult && (
                  <span className={`text-xs px-2 py-1 rounded ${testEmailResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {testEmailResult.success ? 'Email envoyé ✓' : `Erreur: ${testEmailResult.error}`}
                  </span>
                )}
                
                <button
                  onClick={handleTestEmail}
                  disabled={testEmailLoading || !onTestEmail}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {testEmailLoading ? 'Envoi...' : 'Test Email'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};