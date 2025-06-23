import React, { useState, useEffect } from 'react';
import { 
  X, BellRing, CheckCircle, ChevronRight, 
  Users, Music, FileText, Calendar, Clock, AlertTriangle 
} from 'lucide-react';
import { notificationService, UrgentTask, UserRole } from '../../services/notifications/notificationService';

interface UrgentTasksModalProps {
  userRole: UserRole;
  onClose: () => void;
  onTaskAction?: (task: UrgentTask) => void;
}

export const UrgentTasksModal: React.FC<UrgentTasksModalProps> = ({ 
  userRole, 
  onClose, 
  onTaskAction 
}) => {
  const [tasks, setTasks] = useState<UrgentTask[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(() => {
      setTasks(notificationService.getTasksForRole(userRole));
    });
    setTasks(notificationService.getTasksForRole(userRole));
    return unsubscribe;
  }, [userRole]);

  const handleTaskAction = (task: UrgentTask) => {
    if (onTaskAction) {
      onTaskAction(task);
    }
    notificationService.markTaskCompleted(userRole, task.id);
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactElement> = {
      Users: <Users className="w-4 h-4" />,
      Music: <Music className="w-4 h-4" />,
      FileText: <FileText className="w-4 h-4" />,
      Calendar: <Calendar className="w-4 h-4" />,
      Clock: <Clock className="w-4 h-4" />,
      CheckCircle: <CheckCircle className="w-4 h-4" />,
      AlertTriangle: <AlertTriangle className="w-4 h-4" />
    };
    return icons[iconName] || <Users className="w-4 h-4" />;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      red: 'border-l-red-500 bg-red-500/10',
      orange: 'border-l-orange-500 bg-orange-500/10',
      blue: 'border-l-blue-500 bg-blue-500/10',
      green: 'border-l-green-500 bg-green-500/10',
      purple: 'border-l-purple-500 bg-purple-500/10'
    };
    return colors[color] || colors.blue;
  };

  const getRoleTitle = () => {
    const titles: Record<UserRole, string> = {
      organizer: '👨‍💼 Organisateur',
      volunteer: '🙋‍♀️ Bénévole',
      team_director: '💃 Directeur d\'Équipe',
      admin: '⚡ Administrateur',
      assistant: '👥 Assistant'
    };
    return titles[userRole] || userRole;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-purple-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BellRing className="w-7 h-7 text-orange-500" />
                Tâches Urgentes
              </h2>
              <p className="text-gray-600 mt-1">{getRoleTitle()}</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="flex-1 overflow-y-auto p-6">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Toutes les tâches sont à jour !</h3>
              <p className="text-gray-600">Aucune action urgente requise pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`border-l-4 rounded-r-xl p-5 transition-all duration-200 hover:shadow-md ${
                    getColorClasses(task.color)
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`p-2 rounded-lg ${
                        task.color === 'red' ? 'bg-red-500/20' :
                        task.color === 'orange' ? 'bg-orange-500/20' :
                        task.color === 'blue' ? 'bg-blue-500/20' :
                        task.color === 'green' ? 'bg-green-500/20' :
                        task.color === 'purple' ? 'bg-purple-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {getIcon(task.icon)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {task.title}
                          {task.count > 1 && (
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              task.color === 'red' ? 'bg-red-500/30 text-red-800' :
                              task.color === 'orange' ? 'bg-orange-500/30 text-orange-800' :
                              task.color === 'blue' ? 'bg-blue-500/30 text-blue-800' :
                              task.color === 'green' ? 'bg-green-500/30 text-green-800' :
                              task.color === 'purple' ? 'bg-purple-500/30 text-purple-800' :
                              'bg-blue-500/30 text-blue-800'
                            }`}>
                              {task.count}
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2">
                          {task.urgency === 'high' && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                              URGENT
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {task.deadline}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">
                        {task.description}
                      </p>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleTaskAction(task)}
                          className={`px-4 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2 ${
                            task.color === 'red' ? 'bg-red-500 hover:bg-red-600 text-white' :
                            task.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                            task.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                            task.color === 'green' ? 'bg-green-500 hover:bg-green-600 text-white' :
                            task.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                            'bg-blue-500 hover:bg-blue-600 text-white'
                          } text-sm`}
                        >
                          {task.action}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">
              {tasks.filter(t => t.urgency === 'high').length} tâches urgentes · {tasks.length} total
            </p>
            <button 
              onClick={() => notificationService.clearAllTasks(userRole)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded-lg transition-colors"
            >
              Effacer tout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
