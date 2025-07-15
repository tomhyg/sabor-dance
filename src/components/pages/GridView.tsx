import React, { useState } from 'react';
import { Calendar, Users, AlertTriangle, CheckCircle, Clock, Filter, Download } from 'lucide-react';
import { useTranslation } from '../../locales/translations'; // Import du système de traduction

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
}

interface GridViewProps {
  volunteerShifts: VolunteerShift[];
  volunteerSignups: VolunteerSignup[];
  currentUser: any;
  language: 'fr' | 'en' | 'es'; // ✅ Nouveau prop pour la langue
  onSignUp: (shiftId: string) => void;
  onEditShift: (shift: VolunteerShift) => void;
  onExportGrid: (selectedWeek: Date) => void;
}

const GridView: React.FC<GridViewProps> = ({
  volunteerShifts,
  volunteerSignups,
  currentUser,
  language = 'fr', // ✅ Valeur par défaut
  onSignUp,
  onEditShift,
  onExportGrid
}) => {
  // ✅ Hook de traduction avec la langue passée en prop
  const { translate } = useTranslation(language);
  
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [filterRole, setFilterRole] = useState('all');

  // ✅ Jours de la semaine traduits
  const daysOfWeek = [
    translate('calendar.days.mon'),
    translate('calendar.days.tue'),
    translate('calendar.days.wed'),
    translate('calendar.days.thu'),
    translate('calendar.days.fri'),
    translate('calendar.days.sat'),
    translate('calendar.days.sun')
  ];

  // ✅ Rôles traduits pour le filtre - UTILISATION DE gridViewDetails
  const roleOptions = [
    { value: 'all', label: translate('gridViewDetails.filters.allRoles') },
    { value: 'registration_desk', label: translate('gridViewDetails.filters.registrationDesk') },
    { value: 'tech_support', label: translate('gridViewDetails.filters.techSupport') },
    { value: 'security', label: translate('gridViewDetails.filters.security') },
    { value: 'artist_pickup', label: translate('gridViewDetails.filters.artistPickup') },
    { value: 'cleanup', label: translate('gridViewDetails.filters.cleanup') },
    { value: 'photography', label: translate('gridViewDetails.filters.photography') },
    { value: 'setup', label: translate('gridViewDetails.filters.setup') }
  ];

  // ✅ CORRECTION: Génération des dates de la semaine avec typage explicite
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

  const weekDates = getWeekDates(selectedWeek);

  // ✅ Fonction pour formater les plages de dates selon la langue
  const formatWeekRange = (startDate: Date, endDate: Date): string => {
    const locales = {
      fr: 'fr-FR',
      en: 'en-US',
      es: 'es-ES'
    };
    
    const locale = locales[language];
    const start = startDate.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
    const end = endDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    
    return `${start} - ${end}`;
  };

  // ✅ Fonction pour formater une date selon la langue
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

  // Grouper les créneaux par type de rôle et créer des "time blocks"
  const getTimeBlocks = () => {
    const blocks = new Map();
    
    volunteerShifts
      .filter(shift => shift.status !== 'draft' || currentUser?.role === 'organizer')
      .forEach(shift => {
        const key = `${shift.role_type}_${shift.start_time}-${shift.end_time}`;
        if (!blocks.has(key)) {
          blocks.set(key, {
            role_type: shift.role_type,
            time_range: `${shift.start_time}-${shift.end_time}`,
            title: shift.title,
            shifts_by_date: new Map()
          });
        }
        
        blocks.get(key).shifts_by_date.set(shift.shift_date, shift);
      });
    
    return Array.from(blocks.values());
  };

  const timeBlocks = getTimeBlocks();

  // Calculer le statut d'un créneau (couleur)
  const getShiftStatus = (shift: VolunteerShift | undefined) => {
    if (!shift) return { 
      color: 'bg-gray-600/20', 
      text: 'text-gray-500', 
      label: '-', 
      ratio: '0/0' 
    };
    
    const fillRate = shift.current_volunteers / shift.max_volunteers;
    const ratio = `${shift.current_volunteers}/${shift.max_volunteers}`;
    
    if (fillRate === 0) {
      return { 
        color: 'bg-red-500/20 border border-red-500/40', 
        text: 'text-red-300', 
        label: translate('gridViewDetails.indicators.empty'), 
        ratio 
      };
    } else if (fillRate < 0.8) {
      return { 
        color: 'bg-yellow-500/20 border border-yellow-500/40', 
        text: 'text-yellow-300', 
        label: translate('gridViewDetails.indicators.partial'), 
        ratio 
      };
    } else {
      return { 
        color: 'bg-green-500/20 border border-green-500/40', 
        text: 'text-green-300', 
        label: translate('gridViewDetails.indicators.full'), 
        ratio 
      };
    }
  };

  // Vérifier si l'utilisateur est inscrit
  const isUserSignedUp = (shiftId: string) => {
    return volunteerSignups.some(signup => 
      signup.shift_id === shiftId && 
      signup.volunteer_id === currentUser?.id &&
      signup.status !== 'cancelled'
    );
  };

  // ✅ Navigation avec traductions
  const goToPreviousWeek = () => {
    const prevWeek = new Date(selectedWeek);
    prevWeek.setDate(selectedWeek.getDate() - 7);
    setSelectedWeek(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(selectedWeek);
    nextWeek.setDate(selectedWeek.getDate() + 7);
    setSelectedWeek(nextWeek);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Calendar className="w-8 h-8 text-green-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">{translate('gridViewDetails.title')}</h2>
            <p className="text-gray-400">{translate('gridViewDetails.subtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-gray-700/50 border border-gray-600/30 rounded-lg px-3 py-2 text-white text-sm"
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button 
            onClick={() => onExportGrid(selectedWeek)}
            className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            {translate('gridViewDetails.actions.exportGrid')}
          </button>
        </div>
      </div>

      {/* Navigation semaine */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <button
          onClick={goToPreviousWeek}
          className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ← {translate('gridViewDetails.previousWeek')}
        </button>
        
        <h3 className="text-white font-bold text-lg">
          {formatWeekRange(weekDates[0], weekDates[6])}
        </h3>
        
        <button
          onClick={goToNextWeek}
          className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {translate('gridViewDetails.nextWeek')} →
        </button>
      </div>

      {/* Légende traduite */}
      <div className="flex justify-center gap-8 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/20 border border-red-500/40 rounded"></div>
          <span className="text-gray-300">🔴 {translate('gridViewDetails.legend.empty')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/40 rounded"></div>
          <span className="text-gray-300">🟡 {translate('gridViewDetails.legend.partial')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/20 border border-green-500/40 rounded"></div>
          <span className="text-gray-300">🟢 {translate('gridViewDetails.legend.full')}</span>
        </div>
      </div>

      {/* Grille principale */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          
          {/* Header de la grille */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="text-white font-bold text-center">{translate('gridViewDetails.columns.shifts')}</div>
            </div>
            {weekDates.map((date, index) => (
              <div key={index} className="bg-gray-700/30 p-4 rounded-lg text-center">
                <div className="text-white font-bold">{daysOfWeek[index]}</div>
                <div className="text-gray-400 text-sm">
                  {formatDate(date)}
                </div>
              </div>
            ))}
          </div>

          {/* Lignes de la grille */}
          {timeBlocks
            .filter(block => filterRole === 'all' || block.role_type === filterRole)
            .map((block, blockIndex) => (
            <div key={blockIndex} className="grid grid-cols-8 gap-2 mb-2">
              
              {/* Colonne description du créneau */}
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <div className="text-white font-bold text-sm">{block.time_range}</div>
                <div className="text-gray-300 text-xs mt-1">{block.title}</div>
                <div className="text-gray-500 text-xs mt-1 capitalize">
                  {block.role_type.replace('_', ' ')}
                </div>
              </div>

              {/* Colonnes pour chaque jour */}
              {weekDates.map((date, dayIndex) => {
                const dateStr = date.toISOString().split('T')[0];
                const shift = block.shifts_by_date.get(dateStr);
                const status = getShiftStatus(shift);
                const userSignedUp = shift && isUserSignedUp(shift.id);

                return (
                  <div
                    key={dayIndex}
                    className={`p-4 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 ${status.color} ${
                      userSignedUp ? 'ring-2 ring-blue-400' : ''
                    }`}
                    onClick={() => {
                      if (shift && currentUser?.role === 'organizer') {
                        onEditShift(shift);
                      } else if (shift && currentUser?.role === 'volunteer') {
                        if (!userSignedUp && shift.current_volunteers < shift.max_volunteers) {
                          onSignUp(shift.id);
                        }
                      }
                    }}
                  >
                    <div className="text-center">
                      <div className={`text-lg font-bold mb-1 ${status.text}`}>
                        {status.label}
                      </div>
                      <div className={`text-sm font-medium ${status.text}`}>
                        {status.ratio}
                      </div>
                      
                      {userSignedUp && (
                        <div className="text-xs text-blue-300 mt-1 font-bold">
                          {translate('gridViewDetails.indicators.userSignedUp')}
                        </div>
                      )}
                      
                      {shift && shift.status === 'draft' && (
                        <div className="text-xs text-gray-400 mt-1">
                          {translate('gridViewDetails.indicators.draft')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Message si aucun créneau */}
          {timeBlocks.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">{translate('gridViewDetails.messages.noShifts')}</h3>
              <p className="text-gray-500">{translate('gridViewDetails.messages.noShiftsDescription')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques de la semaine traduites */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {timeBlocks.reduce((count, block) => {
              const emptyShifts = Array.from(block.shifts_by_date.values())
                .filter((shift: any) => shift.current_volunteers === 0).length;
              return count + emptyShifts;
            }, 0)}
          </div>
          <div className="text-red-300 text-sm font-medium">{translate('gridViewDetails.stats.emptyShifts')}</div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {timeBlocks.reduce((count, block) => {
              const partialShifts = Array.from(block.shifts_by_date.values())
                .filter((shift: any) => {
                  const rate = shift.current_volunteers / shift.max_volunteers;
                  return rate > 0 && rate < 0.8;
                }).length;
              return count + partialShifts;
            }, 0)}
          </div>
          <div className="text-yellow-300 text-sm font-medium">{translate('gridViewDetails.stats.partialShifts')}</div>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {timeBlocks.reduce((count, block) => {
              const fullShifts = Array.from(block.shifts_by_date.values())
                .filter((shift: any) => shift.current_volunteers >= shift.max_volunteers).length;
              return count + fullShifts;
            }, 0)}
          </div>
          <div className="text-green-300 text-sm font-medium">{translate('gridViewDetails.stats.fullShifts')}</div>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {timeBlocks.reduce((count, block) => {
              return count + block.shifts_by_date.size;
            }, 0)}
          </div>
          <div className="text-blue-300 text-sm font-medium">{translate('gridViewDetails.stats.totalShifts')}</div>
        </div>
      </div>

      {/* Instructions traduites */}
      <div className="mt-6 p-4 bg-gray-700/20 rounded-xl">
        <h4 className="text-white font-semibold mb-2">{translate('gridViewDetails.instructions.title')}</h4>
        <div className="text-gray-300 text-sm space-y-1">
          {currentUser?.role === 'organizer' ? (
            <>
              <p>• {translate('gridViewDetails.instructions.organizer.0')}</p>
              <p>• {translate('gridViewDetails.instructions.organizer.1')}</p>
              <p>• {translate('gridViewDetails.instructions.organizer.2')}</p>
            </>
          ) : (
            <>
              <p>• {translate('gridViewDetails.instructions.volunteer.0')}</p>
              <p>• {translate('gridViewDetails.instructions.volunteer.1')}</p>
              <p>• {translate('gridViewDetails.instructions.volunteer.2')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GridView;