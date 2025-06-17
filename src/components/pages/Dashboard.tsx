import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  TrendingUp, 
  Calendar,
  Star,
  Music,
  Filter,
  RefreshCw,
  FileText,
  Target,
  Activity,
  Phone,
  Mail,
  MessageSquare,
  UserX,
  Bell,
  ChevronDown, 
  FileSpreadsheet
} from 'lucide-react';

// Import des fonctions d'export
import { quickExport, exportDashboardReport } from '../../utils/exportUtils';

interface DashboardProps {
  t: any;
  volunteerShifts: any[];
  performanceTeams: any[];
  volunteerSignups: any[];
  currentUser: any;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  t, 
  volunteerShifts, 
  performanceTeams, 
  volunteerSignups, 
  currentUser 
}) => {
  const [timeFilter, setTimeFilter] = useState('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [showVolunteerExportDropdown, setShowVolunteerExportDropdown] = useState(false);
  const [showTeamExportDropdown, setShowTeamExportDropdown] = useState(false);
  const [showAllExportDropdown, setShowAllExportDropdown] = useState(false);

  // Données simulées des bénévoles avec contacts
  const volunteers = [
    { id: 'vol1', full_name: 'Marie Dubois', phone: '+33 6 12 34 56 78', email: 'marie.dubois@email.com' },
    { id: 'vol2', full_name: 'Paul Martin', phone: '+33 7 98 76 54 32', email: 'paul.martin@email.com' },
    { id: 'vol3', full_name: 'Sophie Laurent', phone: '+33 6 45 67 89 01', email: 'sophie.laurent@email.com' },
    { id: 'vol4', full_name: 'Jean Moreau', phone: '+33 7 23 45 67 89', email: 'jean.moreau@email.com' },
    { id: 'vol5', full_name: 'Lisa Chen', phone: '+33 6 78 90 12 34', email: 'lisa.chen@email.com' }
  ];

  // Calculs des métriques
  const totalShifts = volunteerShifts.length;
  const liveShifts = volunteerShifts.filter(s => s.status === 'live').length;
  const fullShifts = volunteerShifts.filter(s => s.status === 'full').length;
  const criticalShifts = volunteerShifts.filter(s => 
    s.status === 'live' && (s.current_volunteers / s.max_volunteers) < 0.5
  ).length;

  const totalVolunteers = volunteerSignups.length;
  const totalTeams = performanceTeams.length;
  const approvedTeams = performanceTeams.filter(t => t.status === 'approved').length;
  const pendingTeams = performanceTeams.filter(t => t.status === 'submitted').length;

  const handleExportVolunteers = (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    try {
      quickExport('volunteers', {
        shifts: volunteerShifts,
        signups: volunteerSignups,
        volunteers: volunteers,
        eventName: 'Boston Salsa Festival 2025'
      }, format);
      setActionFeedback({type: 'success', message: `✅ ${t.exportVolunteers || 'Export bénévoles'} ${t.operationSuccess || 'généré avec succès'} !`});
    } catch (error) {
      console.error('Erreur export bénévoles:', error);
      setActionFeedback({type: 'error', message: `❌ ${t.operationError || 'Erreur lors de l\'export des bénévoles'}`});
    }
    setTimeout(() => setActionFeedback(null), 4000);
    setShowVolunteerExportDropdown(false);
  };
  
  const handleExportTeams = (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    try {
      quickExport('teams', {
        teams: performanceTeams,
        eventName: 'Boston Salsa Festival 2025'
      }, format);
      setActionFeedback({type: 'success', message: `✅ ${t.exportTeams || 'Export équipes'} ${t.operationSuccess || 'généré avec succès'} !`});
    } catch (error) {
      console.error('Erreur export équipes:', error);
      setActionFeedback({type: 'error', message: `❌ ${t.operationError || 'Erreur lors de l\'export des équipes'}`});
    }
    setTimeout(() => setActionFeedback(null), 4000);
    setShowTeamExportDropdown(false);
  };
  
  const handleExportAll = (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    try {
      exportDashboardReport(
        volunteerShifts,
        volunteerSignups,
        performanceTeams,
        volunteers,
        'Boston Salsa Festival 2025',
        format
      );
      setActionFeedback({type: 'success', message: `✅ ${t.exportData || 'Export complet'} ${t.operationSuccess || 'généré avec succès'} !`});
    } catch (error) {
      console.error('Erreur export complet:', error);
      setActionFeedback({type: 'error', message: `❌ ${t.operationError || 'Erreur lors de l\'export complet'}`});
    }
    setTimeout(() => setActionFeedback(null), 4000);
    setShowAllExportDropdown(false);
  };

  // Données pour les graphiques
  const volunteerProgress = volunteerShifts.map(shift => ({
    name: shift.title.substring(0, 15) + '...',
    filled: shift.current_volunteers,
    total: shift.max_volunteers,
    percentage: Math.round((shift.current_volunteers / shift.max_volunteers) * 100)
  }));

  const teamsByStatus = [
    { name: t.approved || 'Approuvées', value: approvedTeams, color: 'bg-green-500' },
    { name: t.pending || 'En attente', value: pendingTeams, color: 'bg-yellow-500' },
    { name: t.draft || 'Brouillon', value: performanceTeams.filter(t => t.status === 'draft').length, color: 'bg-gray-500' }
  ];

  // Calculer les absents attendus (bénévoles inscrits mais pas encore scannés)
  const getExpectedAbsents = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Simuler des créneaux actifs basés sur l'heure
    const activeShifts = volunteerShifts.filter(shift => {
      const startHour = parseInt(shift.start_time.split(':')[0]);
      const endHour = parseInt(shift.end_time.split(':')[0]);
      return currentHour >= startHour && currentHour < endHour;
    });

    const expectedAbsents: any[] = [];
    
    activeShifts.forEach(shift => {
      const signupsForShift = volunteerSignups.filter(signup => 
        signup.shift_id === shift.id && 
        (signup.status === 'signed_up' || signup.status === 'confirmed')
      );
      
      signupsForShift.forEach(signup => {
        const volunteer = volunteers.find(v => v.id === signup.volunteer_id);
        if (volunteer) {
          expectedAbsents.push({
            ...volunteer,
            shift: shift,
            signupTime: signup.signed_up_at,
            status: signup.status
          });
        }
      });
    });

    return expectedAbsents;
  };

  const expectedAbsents = getExpectedAbsents();

  // Actions organisateur
  const handleCallVolunteer = (volunteer: any) => {
    setActionFeedback({type: 'success', message: `📞 ${t.sendEmail || 'Appel simulé vers'} ${volunteer.name}`});
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleSendReminder = (volunteer: any) => {
    setActionFeedback({type: 'success', message: `📱 ${t.reminders || 'Rappel SMS'} ${t.emailSent || 'envoyé à'} ${volunteer.name}`});
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleMarkAbsent = (volunteer: any) => {
    setActionFeedback({type: 'error', message: `❌ ${volunteer.name} ${t.noShow || 'marqué(e) absent(e)'}`});
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="relative py-12 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-bounce"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                {t.dashboardTitle || 'Dashboard Analytics'}
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl">
                {t.overview || 'Tableau de bord temps réel pour Boston Salsa Festival 2025'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                {t.refresh || 'Actualiser'}
              </button>
              
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl font-semibold border border-white/20 focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">{t.today || 'Aujourd\'hui'}</option>
                <option value="week">{t.thisWeek || 'Cette semaine'}</option>
                <option value="month">{t.thisMonth || 'Ce mois'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Créneaux critiques */}
          <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-md border border-red-500/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-2xl font-black text-red-400">{criticalShifts}</span>
            </div>
            <h3 className="text-white font-bold mb-2">{t.criticalShifts || 'Créneaux Critiques'}</h3>
            <p className="text-gray-300 text-sm">{t.critical || 'Moins de 50% remplis'}</p>
            <div className="mt-4 w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(criticalShifts / totalShifts) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Bénévoles inscrits */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-black text-green-400">{totalVolunteers}</span>
            </div>
            <h3 className="text-white font-bold mb-2">{t.volunteersRegistered || 'Bénévoles Inscrits'}</h3>
            <p className="text-gray-300 text-sm">{t.total || 'Total'} {t.signUp || 'inscriptions'}</p>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-semibold">+12% {t.thisWeek || 'cette semaine'}</span>
            </div>
          </div>

          {/* Créneaux complets */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md border border-blue-500/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-black text-blue-400">{fullShifts}</span>
            </div>
            <h3 className="text-white font-bold mb-2">{t.completedShifts || 'Créneaux Complets'}</h3>
            <p className="text-gray-300 text-sm">{t.total || 'Sur'} {totalShifts} {t.volunteers || 'créneaux'}</p>
            <div className="mt-4 w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(fullShifts / totalShifts) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Équipes approuvées */}
          <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-md border border-purple-500/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-black text-purple-400">{approvedTeams}</span>
            </div>
            <h3 className="text-white font-bold mb-2">{t.approvedTeams || 'Équipes Approuvées'}</h3>
            <p className="text-gray-300 text-sm">{t.total || 'Sur'} {totalTeams} {t.teams || 'soumissions'}</p>
            <div className="mt-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-semibold">{pendingTeams} {t.pending || 'en attente'}</span>
            </div>
          </div>
        </div>

        {/* Actions rapides avec boutons d'export */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Download className="w-8 h-8 text-blue-400" />
            {t.exportData || 'Exports de Données'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* Export Bénévoles avec dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowVolunteerExportDropdown(!showVolunteerExportDropdown)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-3 justify-center shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                <Download size={20} />
                {t.exportVolunteers || 'Export Bénévoles'}
                <ChevronDown size={16} className={`transition-transform ${showVolunteerExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showVolunteerExportDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 w-full">
                  <button
                    onClick={() => handleExportVolunteers('xlsx')}
                    className="w-full px-4 py-3 text-left text-green-300 hover:bg-gray-700 rounded-t-xl flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} />
                    {t.excelFormat || 'Excel (XLSX)'}
                  </button>
                  <button
                    onClick={() => handleExportVolunteers('csv')}
                    className="w-full px-4 py-3 text-left text-blue-300 hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FileText size={16} />
                    {t.csvFormat || 'CSV'}
                  </button>
                  <button
                    onClick={() => handleExportVolunteers('pdf')}
                    className="w-full px-4 py-3 text-left text-red-300 hover:bg-gray-700 rounded-b-xl flex items-center gap-2"
                  >
                    <FileText size={16} />
                    {t.pdfFormat || 'PDF'}
                  </button>
                </div>
              )}
            </div>

            {/* Export Équipes avec dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTeamExportDropdown(!showTeamExportDropdown)}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white p-4 rounded-xl font-semibold hover:from-purple-600 hover:to-violet-700 transition-all duration-300 flex items-center gap-3 justify-center shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                <FileText size={20} />
                {t.exportTeams || 'Export Équipes'}
                <ChevronDown size={16} className={`transition-transform ${showTeamExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showTeamExportDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 w-full">
                  <button
                    onClick={() => handleExportTeams('xlsx')}
                    className="w-full px-4 py-3 text-left text-purple-300 hover:bg-gray-700 rounded-t-xl flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} />
                    {t.excelFormat || 'Excel (XLSX)'}
                  </button>
                  <button
                    onClick={() => handleExportTeams('csv')}
                    className="w-full px-4 py-3 text-left text-blue-300 hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FileText size={16} />
                    {t.csvFormat || 'CSV'}
                  </button>
                  <button
                    onClick={() => handleExportTeams('pdf')}
                    className="w-full px-4 py-3 text-left text-red-300 hover:bg-gray-700 rounded-b-xl flex items-center gap-2"
                  >
                    <FileText size={16} />
                    {t.pdfFormat || 'PDF'}
                  </button>
                </div>
              )}
            </div>

            {/* Export Complet avec dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAllExportDropdown(!showAllExportDropdown)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-3 justify-center shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                <BarChart3 size={20} />
                {t.exportData || 'Export Complet'}
                <ChevronDown size={16} className={`transition-transform ${showAllExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showAllExportDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 w-full">
                  <button
                    onClick={() => handleExportAll('xlsx')}
                    className="w-full px-4 py-3 text-left text-blue-300 hover:bg-gray-700 rounded-t-xl flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} />
                    {t.excelFormat || 'Excel (XLSX)'}
                  </button>
                  <button
                    onClick={() => handleExportAll('csv')}
                    className="w-full px-4 py-3 text-left text-blue-300 hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FileText size={16} />
                    {t.csvFormat || 'CSV'}
                  </button>
                  <button
                    onClick={() => handleExportAll('pdf')}
                    className="w-full px-4 py-3 text-left text-red-300 hover:bg-gray-700 rounded-b-xl flex items-center gap-2"
                  >
                    <FileText size={16} />
                    {t.pdfFormat || 'PDF'}
                  </button>
                </div>
              )}
            </div>

            {/* Analyse Avancée */}
            <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex items-center gap-3 justify-center shadow-lg hover:shadow-2xl transform hover:scale-105">
              <Target size={20} />
              {t.statistics || 'Analyse Avancée'}
            </button>
          </div>

          {/* Feedback des exports */}
          {actionFeedback && (
            <div className={`p-4 rounded-xl border-2 ${
              actionFeedback.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center gap-3">
                {actionFeedback.type === 'success' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}
                <span className="font-semibold text-lg">{actionFeedback.message}</span>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <h4 className="text-indigo-300 font-semibold mb-2">{t.overview || 'Performance Globale'}</h4>
            <div className="text-3xl font-black text-white mb-1">87%</div>
            <p className="text-gray-300 text-sm">{t.progressPercentage || 'Taux de remplissage'} {t.total || 'global'}</p>
          </div>
        </div>

        {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progression des créneaux bénévoles */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                {t.shiftProgress || 'Progression Créneaux'}
              </h3>
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                <Filter size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {volunteerProgress.slice(0, 6).map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">{item.name}</span>
                    <span className="text-white font-bold">{item.filled}/{item.total}</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        item.percentage < 50 ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                        item.percentage < 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-gray-400">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Statut des équipes */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Target className="w-8 h-8 text-purple-400" />
                {t.teamStatus || 'Statut Équipes'}
              </h3>
            </div>
            
            <div className="space-y-6">
              {teamsByStatus.map((item, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">{item.name}</span>
                    <span className="text-white font-bold text-xl">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${(item.value / totalTeams) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-semibold">{t.statistics || 'Performance Insights'}</span>
              </div>
              <p className="text-gray-300 text-sm">
                {t.rating || 'Score moyen des équipes'}: <span className="text-white font-bold">8.2/10</span>
              </p>
              <p className="text-gray-300 text-sm">
                {t.duration || 'Temps moyen d\'approbation'}: <span className="text-white font-bold">2.3 {t.days || 'jours'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Alertes et actions rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Section Absents Attendus */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <UserX className="w-8 h-8 text-red-400" />
              {t.noShow || 'Absents Attendus'} ({expectedAbsents.length})
            </h3>
            
            {expectedAbsents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-green-300 text-lg font-semibold">{t.checkedIn || 'Tous les bénévoles sont présents'} !</p>
                <p className="text-gray-400">{t.noData || 'Aucun absent pour les créneaux actuels'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expectedAbsents.map((volunteer, index) => (
                  <div key={index} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-bold text-lg">{volunteer.name}</h4>
                        <p className="text-red-300 text-sm">
                          {t.shiftTitle || 'Créneau'}: {volunteer.shift.title} ({volunteer.shift.start_time} - {volunteer.shift.end_time})
                        </p>
                        <p className="text-gray-400 text-xs">
                          {t.signedUp || 'Inscrit le'} {new Date(volunteer.signupTime).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        volunteer.status === 'confirmed' 
                          ? 'bg-yellow-500/20 text-yellow-300' 
                          : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {volunteer.status === 'confirmed' ? t.confirmed || 'Confirmé' : t.signedUp || 'Inscrit'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 text-gray-300 text-sm">
                      <Phone size={16} className="text-blue-400" />
                      <span>{volunteer.phone}</span>
                      <Mail size={16} className="text-green-400 ml-4" />
                      <span>{volunteer.email}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCallVolunteer(volunteer)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <Phone size={16} />
                        {t.contactArtist || 'Appeler'}
                      </button>
                      <button
                        onClick={() => handleSendReminder(volunteer)}
                        className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <MessageSquare size={16} />
                        {t.reminders || 'Rappel SMS'}
                      </button>
                      <button
                        onClick={() => handleMarkAbsent(volunteer)}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <UserX size={16} />
                        {t.noShow || 'Marquer absent'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">{t.quickActions || 'Actions Rapides'}</h3>
            
            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white p-4 rounded-xl font-semibold hover:from-purple-600 hover:to-violet-700 transition-all duration-300 flex items-center gap-3">
                <Calendar size={20} />
                {t.teams || 'Planning Équipes'}
              </button>
              
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex items-center gap-3">
                <Bell size={20} />
                {t.notifications || 'Envoyer Notifications'}
              </button>
            </div>

            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <h4 className="text-indigo-300 font-semibold mb-2">{t.overview || 'Performance Globale'}</h4>
              <div className="text-3xl font-black text-white mb-1">87%</div>
              <p className="text-gray-300 text-sm">{t.progressPercentage || 'Taux de remplissage'} {t.total || 'global'}</p>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">{t.statistics || 'Statistiques Détaillées'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-black text-blue-400 mb-2">700</div>
              <p className="text-gray-300">{t.attendee || 'Participants'} {t.upcoming || 'attendus'}</p>
              <p className="text-sm text-gray-400 mt-1">Boston Salsa Festival</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-black text-green-400 mb-2">~200</div>
              <p className="text-gray-300">{t.volunteers || 'Créneaux bénévoles'}</p>
              <p className="text-sm text-gray-400 mt-1">{t.total || 'Sur'} 3 {t.days || 'jours'}</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-black text-purple-400 mb-2">45</div>
              <p className="text-gray-300">{t.teams || 'Équipes'} {t.teamPerformance || 'performance'}</p>
              <p className="text-sm text-gray-400 mt-1">{t.location || 'Venues du monde entier'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;