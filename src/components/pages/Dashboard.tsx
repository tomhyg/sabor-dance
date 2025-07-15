import React, { useState, useEffect } from 'react';
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
  FileSpreadsheet,
  UserCheck,
  Timer,
  Award,
  Send,
  Eye,
  Settings,
  Zap,
  CalendarDays,
  ListTodo,
  Megaphone,
  Archive
} from 'lucide-react';

// Import des services
import { quickExport, exportDashboardReport } from '../../utils/exportUtils';
import volunteerAccountsService from '../../services/volunteerAccountsService';
import { teamService } from '../../services/teamService';

// Import du modal des comptes bénévoles
import VolunteerAccountsModal from '../volunteers/VolunteerAccountsModal';

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
  const [dashboardView, setDashboardView] = useState('general');
  const [timeFilter, setTimeFilter] = useState('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [showVolunteerExportDropdown, setShowVolunteerExportDropdown] = useState(false);
  const [showTeamExportDropdown, setShowTeamExportDropdown] = useState(false);
  const [showAllExportDropdown, setShowAllExportDropdown] = useState(false);
  const [showVolunteerAccountsModal, setShowVolunteerAccountsModal] = useState(false);

  // 🎯 NOUVELLES DONNÉES RÉELLES
  const [realVolunteers, setRealVolunteers] = useState<any[]>([]);
  const [realTeams, setRealTeams] = useState<any[]>([]);
  const [volunteerStats, setVolunteerStats] = useState({
    total_volunteers: 0,
    active_volunteers: 0,
    completed_quota: 0,
    without_shifts: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 🎯 CHARGER LES VRAIES DONNÉES AU MONTAGE ET QUAND LES INSCRIPTIONS CHANGENT
  useEffect(() => {
    loadRealData();
  }, []);

  // 🎯 NOUVEAU: Recharger les données quand les inscriptions changent
  useEffect(() => {
    if (realVolunteers.length > 0) {
      loadRealData();
    }
  }, [volunteerSignups]);

  const loadRealData = async () => {
    setIsLoadingData(true);
    try {
      // Charger les vrais bénévoles
      const volunteersResult = await volunteerAccountsService.getAllVolunteerAccounts('a9d1c983-1456-4007-9aec-b297dd095ff7');
      if (volunteersResult.success && volunteersResult.data) {
        setRealVolunteers(volunteersResult.data);
        console.log('✅ Vrais bénévoles chargés:', volunteersResult.data);
      }

      // Charger les statistiques des bénévoles
      const statsResult = await volunteerAccountsService.getVolunteerStats('a9d1c983-1456-4007-9aec-b297dd095ff7');
      if (statsResult.success && statsResult.data) {
        setVolunteerStats(statsResult.data);
        console.log('✅ Statistiques bénévoles chargées:', statsResult.data);
      }

      // Charger les vraies équipes
      const teamsResult = await teamService.getTeams('a9d1c983-1456-4007-9aec-b297dd095ff7');
      if (teamsResult.success && teamsResult.data) {
        setRealTeams(teamsResult.data);
        console.log('✅ Vraies équipes chargées:', teamsResult.data);
      }

    } catch (error) {
      console.error('❌ Erreur chargement données réelles:', error);
      setActionFeedback({
        type: 'error', 
        message: '❌ Erreur lors du chargement des données réelles'
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  // 🎯 UTILISER LES VRAIES DONNÉES (avec fallback sur les props pour compatibilité)
  const volunteers = realVolunteers.length > 0 ? realVolunteers : [];
  const teams = realTeams.length > 0 ? realTeams : performanceTeams;

  // General metrics calculations avec vraies données
  const totalShifts = volunteerShifts.length;
  const liveShifts = volunteerShifts.filter(s => s.status === 'live').length;
  const fullShifts = volunteerShifts.filter(s => s.status === 'full').length;
  const criticalShifts = volunteerShifts.filter(s => 
    s.status === 'live' && (s.current_volunteers / s.max_volunteers) < 0.5
  ).length;

  // 🎯 UTILISER LES VRAIES STATISTIQUES
  const totalVolunteers = volunteerStats.total_volunteers || volunteers.length;
  const totalSignups = volunteerSignups.length;
  const totalTeams = teams.length;
  const approvedTeams = teams.filter(t => t.status === 'approved').length;
  const pendingTeams = teams.filter(t => t.status === 'submitted').length;
  const fullySetupTeams = teams.filter(t => t.music_file_url && t.team_photo_url && t.status !== 'draft').length;

  // Specific volunteer calculations (for Kelly) avec vraies données
  const shiftsFilledRate = totalShifts > 0 ? (fullShifts / totalShifts) * 100 : 0;
  const volunteersCompletedHours = volunteerStats.completed_quota || volunteers.filter(v => v.volunteer_hours >= v.required_hours).length;
  const volunteersCompletedRate = totalVolunteers > 0 ? (volunteersCompletedHours / totalVolunteers) * 100 : 0;

  // Shift color coding for fill rate
  const shiftsByFillRate = volunteerShifts.reduce((acc, shift) => {
    const fillRate = shift.max_volunteers > 0 ? (shift.current_volunteers / shift.max_volunteers) * 100 : 0;
    if (fillRate >= 75) acc.green++;
    else if (fillRate >= 50) acc.yellow++;
    else acc.red++;
    return acc;
  }, { green: 0, yellow: 0, red: 0 });

  // Team completion rate
  const teamCompletionRate = totalTeams > 0 ? (fullySetupTeams / totalTeams) * 100 : 0;

  // Event countdown (BSF 2025 - simulated date)
  const eventDate = new Date('2025-02-14');
  const today = new Date();
  const daysToEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Critical tasks simulation
  const criticalTasks = [
    { type: 'volunteers', message: `${criticalShifts} critical shifts need volunteers`, urgent: criticalShifts > 0 },
    { type: 'teams', message: `${pendingTeams} teams pending approval`, urgent: pendingTeams > 3 },
    { type: 'setup', message: `${totalTeams - fullySetupTeams} teams missing music/photos`, urgent: (totalTeams - fullySetupTeams) > 2 },
    { type: 'deadline', message: `Team submission deadline in ${Math.max(0, daysToEvent - 30)} days`, urgent: daysToEvent <= 45 }
  ].filter(task => task.urgent);

  // Notification activity simulation
  const notificationActivity = {
    today: 12,
    thisWeek: 89,
    total: 245
  };

  const handleExportVolunteers = (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    try {
      quickExport('volunteers', {
        shifts: volunteerShifts,
        signups: volunteerSignups,
        volunteers: volunteers, // 🎯 UTILISER LES VRAIES DONNÉES
        eventName: 'Boston Salsa Festival 2025'
      }, format);
      setActionFeedback({type: 'success', message: `✅ Volunteers export generated successfully!`});
    } catch (error) {
      console.error('Volunteer export error:', error);
      setActionFeedback({type: 'error', message: `❌ Error exporting volunteers`});
    }
    setTimeout(() => setActionFeedback(null), 4000);
    setShowVolunteerExportDropdown(false);
  };
  
  const handleExportTeams = (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    try {
      quickExport('teams', {
        teams: teams, // 🎯 UTILISER LES VRAIES DONNÉES
        eventName: 'Boston Salsa Festival 2025'
      }, format);
      setActionFeedback({type: 'success', message: `✅ Teams export generated successfully!`});
    } catch (error) {
      console.error('Teams export error:', error);
      setActionFeedback({type: 'error', message: `❌ Error exporting teams`});
    }
    setTimeout(() => setActionFeedback(null), 4000);
    setShowTeamExportDropdown(false);
  };
  
  const handleExportAll = (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    try {
      exportDashboardReport(
        volunteerShifts,
        volunteerSignups,
        teams, // 🎯 UTILISER LES VRAIES DONNÉES
        volunteers, // 🎯 UTILISER LES VRAIES DONNÉES
        'Boston Salsa Festival 2025',
        format
      );
      setActionFeedback({type: 'success', message: `✅ Complete export generated successfully!`});
    } catch (error) {
      console.error('Complete export error:', error);
      setActionFeedback({type: 'error', message: `❌ Error generating complete export`});
    }
    setTimeout(() => setActionFeedback(null), 4000);
    setShowAllExportDropdown(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRealData(); // 🎯 RECHARGER LES VRAIES DONNÉES
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSendNotification = (type: string) => {
    setActionFeedback({type: 'success', message: `📧 "${type}" notification sent successfully!`});
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // 🎯 INDICATEUR DE CHARGEMENT
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Chargement des données réelles...</p>
        </div>
      </div>
    );
  }

  // 🎯 GENERAL DASHBOARD (Hernan's view)
  const DashboardGeneral = () => (
    <>
      {/* Main tiles based on mockup */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* 🧑‍🤝‍🧑 Volunteer Shift Fill Rate - CLICKABLE */}
        <div 
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md border border-blue-500/20 rounded-3xl p-6 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setDashboardView('volunteers')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-2xl font-black text-blue-400">{Math.round(shiftsFilledRate)}%</span>
          </div>
          <h3 className="text-white font-bold mb-2">Volunteer Shift Fill Rate</h3>
          <p className="text-gray-300 text-sm">% shifts filled + alert for unfilled critical shifts</p>
          {criticalShifts > 0 && (
            <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-xs font-semibold">⚠️ {criticalShifts} critical shifts need attention</p>
            </div>
          )}
          <p className="text-blue-300 text-xs mt-2">👆 Click for details</p>
        </div>

        {/* 🎭 Team Completion - CLICKABLE */}
        <div 
          className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-md border border-purple-500/20 rounded-3xl p-6 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setDashboardView('teams')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-2xl font-black text-purple-400">{Math.round(teamCompletionRate)}%</span>
          </div>
          <h3 className="text-white font-bold mb-2">Team Completion</h3>
          <p className="text-gray-300 text-sm">% teams fully set up + pending approvals</p>
          <div className="mt-3 text-xs text-gray-400">
            <span className="text-green-300">{fullySetupTeams} complete</span> • 
            <span className="text-yellow-300 ml-1">{pendingTeams} pending</span>
          </div>
          <p className="text-purple-300 text-xs mt-2">👆 Click to manage</p>
        </div>

        {/* 📅 Event Countdown */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-2xl font-black text-green-400">{daysToEvent}</span>
          </div>
          <h3 className="text-white font-bold mb-2">Event Countdown</h3>
          <p className="text-gray-300 text-sm">Days to event + key deadlines</p>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Team submissions:</span>
              <span className="text-yellow-300">{Math.max(0, daysToEvent - 30)} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">BSF 2025:</span>
              <span className="text-green-300">Feb 14-16</span>
            </div>
          </div>
        </div>

        {/* 🧠 Critical Tasks */}
        <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-md border border-red-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <ListTodo className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-2xl font-black text-red-400">{criticalTasks.length}</span>
          </div>
          <h3 className="text-white font-bold mb-2">Critical Tasks</h3>
          <p className="text-gray-300 text-sm">Dynamic list of all to-do bottlenecks</p>
          <div className="mt-3 space-y-1">
            {criticalTasks.slice(0, 2).map((task, index) => (
              <div key={index} className="text-xs text-red-300 bg-red-500/10 p-2 rounded">
                • {task.message}
              </div>
            ))}
            {criticalTasks.length > 2 && (
              <div className="text-xs text-gray-400">+ {criticalTasks.length - 2} more tasks</div>
            )}
          </div>
        </div>

        {/* 💬 Notification Activity */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-md border border-yellow-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-2xl font-black text-yellow-400">{notificationActivity.today}</span>
          </div>
          <h3 className="text-white font-bold mb-2">Notification Activity</h3>
          <p className="text-gray-300 text-sm">Summary of messages sent to volunteers/teams</p>
          <div className="mt-3 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>This week:</span>
              <span className="text-yellow-300">{notificationActivity.thisWeek}</span>
            </div>
            <div className="flex justify-between">
              <span>Total sent:</span>
              <span className="text-white">{notificationActivity.total}</span>
            </div>
          </div>
        </div>

        {/* 📊 Export & Reports */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 backdrop-blur-md border border-indigo-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
              <Archive className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-2xl font-black text-indigo-400">6</span>
          </div>
          <h3 className="text-white font-bold mb-2">Export & Reports</h3>
          <p className="text-gray-300 text-sm">Buttons for downloading schedules, rosters, or data</p>
          <div className="mt-3 space-y-2">
            <button 
              onClick={() => setShowAllExportDropdown(!showAllExportDropdown)}
              className="w-full bg-indigo-500/20 text-indigo-300 p-2 rounded-lg text-xs hover:bg-indigo-500/30 transition-colors"
            >
              📥 Quick Export All Data
            </button>
          </div>
        </div>
      </div>

      {/* Quick access to detailed dashboards */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Download className="w-6 h-6 text-blue-400" />
            Global Export & Reports
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Export Volunteers */}
            <div className="relative">
              <button
                onClick={() => setShowVolunteerExportDropdown(!showVolunteerExportDropdown)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-3 justify-center"
              >
                <Users size={20} />
                Export Volunteers
                <ChevronDown size={16} className={`transition-transform ${showVolunteerExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showVolunteerExportDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 w-full">
                  <button onClick={() => handleExportVolunteers('xlsx')} className="w-full px-4 py-3 text-left text-green-300 hover:bg-gray-700 rounded-t-xl flex items-center gap-2">
                    <FileSpreadsheet size={16} />Excel (XLSX)
                  </button>
                  <button onClick={() => handleExportVolunteers('csv')} className="w-full px-4 py-3 text-left text-blue-300 hover:bg-gray-700 flex items-center gap-2">
                    <FileText size={16} />CSV
                  </button>
                  <button onClick={() => handleExportVolunteers('pdf')} className="w-full px-4 py-3 text-left text-red-300 hover:bg-gray-700 rounded-b-xl flex items-center gap-2">
                    <FileText size={16} />PDF
                  </button>
                </div>
              )}
            </div>

            {/* Export Teams */}
            <div className="relative">
              <button
                onClick={() => setShowTeamExportDropdown(!showTeamExportDropdown)}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white p-4 rounded-xl font-semibold hover:from-purple-600 hover:to-violet-700 transition-all duration-300 flex items-center gap-3 justify-center"
              >
                <Music size={20} />
                Export Teams
                <ChevronDown size={16} className={`transition-transform ${showTeamExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showTeamExportDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 w-full">
                  <button onClick={() => handleExportTeams('xlsx')} className="w-full px-4 py-3 text-left text-purple-300 hover:bg-gray-700 rounded-t-xl flex items-center gap-2">
                    <FileSpreadsheet size={16} />Excel (XLSX)
                  </button>
                  <button onClick={() => handleExportTeams('csv')} className="w-full px-4 py-3 text-left text-blue-300 hover:bg-gray-700 flex items-center gap-2">
                    <FileText size={16} />CSV
                  </button>
                  <button onClick={() => handleExportTeams('pdf')} className="w-full px-4 py-3 text-left text-red-300 hover:bg-gray-700 rounded-b-xl flex items-center gap-2">
                    <FileText size={16} />PDF
                  </button>
                </div>
              )}
            </div>

            {/* Export Complete */}
            <div className="relative">
              <button
                onClick={() => setShowAllExportDropdown(!showAllExportDropdown)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-3 justify-center"
              >
                <BarChart3 size={20} />
                Complete Export
                <ChevronDown size={16} className={`transition-transform ${showAllExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showAllExportDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 w-full">
                  <button onClick={() => handleExportAll('xlsx')} className="w-full px-4 py-3 text-left text-blue-300 hover:bg-gray-700 rounded-t-xl flex items-center gap-2">
                    <FileSpreadsheet size={16} />Excel (XLSX)
                  </button>
                  <button onClick={() => handleExportAll('csv')} className="w-full px-4 py-3 text-left text-blue-300 hover:bg-gray-700 flex items-center gap-2">
                    <FileText size={16} />CSV
                  </button>
                  <button onClick={() => handleExportAll('pdf')} className="w-full px-4 py-3 text-left text-red-300 hover:bg-gray-700 rounded-b-xl flex items-center gap-2">
                    <FileText size={16} />PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // 🎯 VOLUNTEER DASHBOARD (Kelly's view) - AVEC VRAIES DONNÉES
  const DashboardVolunteers = () => (
    <>
      {/* Volunteer-specific metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* # Volunteers registered */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md border border-blue-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-2xl font-black text-blue-400">{totalVolunteers}</span>
          </div>
          <h3 className="text-white font-bold mb-2"># Volunteers Registered</h3>
          <p className="text-gray-300 text-sm">Total accounts created</p>
        </div>

        {/* % shifts fulfilled with color coding */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-2xl font-black text-green-400">{Math.round(shiftsFilledRate)}%</span>
          </div>
          <h3 className="text-white font-bold mb-2">% Shifts Fulfilled</h3>
          <div className="flex gap-2 text-xs">
            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">Green: {shiftsByFillRate.green}</span>
            <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">Yellow: {shiftsByFillRate.yellow}</span>
            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded">Red: {shiftsByFillRate.red}</span>
          </div>
          <p className="text-gray-300 text-xs mt-2">Green (&gt;75%), Yellow (50-75%), Red (&lt;50%)</p>
        </div>

        {/* % volunteers completed 9 hours */}
        <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-md border border-purple-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Timer className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-2xl font-black text-purple-400">{Math.round(volunteersCompletedRate)}%</span>
          </div>
          <h3 className="text-white font-bold mb-2">% Completed 9 Hours</h3>
          <p className="text-gray-300 text-sm">{volunteersCompletedHours}/{totalVolunteers} volunteers</p>
        </div>

        {/* # critical shifts */}
        <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-md border border-red-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-2xl font-black text-red-400">{criticalShifts}</span>
          </div>
          <h3 className="text-white font-bold mb-2"># Critical Shifts</h3>
          <p className="text-gray-300 text-sm">Need urgent volunteers</p>
        </div>
      </div>

      {/* Quick actions for Kelly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Send className="w-6 h-6 text-blue-400" />
            Quick Actions Section
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => handleSendNotification('signed up volunteers')}
              className="w-full bg-blue-500/20 text-blue-300 p-3 rounded-xl hover:bg-blue-500/30 transition-colors flex items-center gap-2"
            >
              <Bell size={18} />
              Send notifications to signed up volunteers
            </button>
            <button 
              onClick={() => handleSendNotification('volunteers who need more hours')}
              className="w-full bg-yellow-500/20 text-yellow-300 p-3 rounded-xl hover:bg-yellow-500/30 transition-colors flex items-center gap-2"
            >
              <Timer size={18} />
              Send notifications to those who need more hours
            </button>
            <button 
              onClick={() => handleSendNotification('all volunteers')}
              className="w-full bg-green-500/20 text-green-300 p-3 rounded-xl hover:bg-green-500/30 transition-colors flex items-center gap-2"
            >
              <Users size={18} />
              Send notifications to all volunteers
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Export Volunteers</h3>
          <div className="relative mb-4">
            <button
              onClick={() => setShowVolunteerExportDropdown(!showVolunteerExportDropdown)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-3 justify-center"
            >
              <Download size={20} />
              Export Volunteer Data
              <ChevronDown size={16} className={`transition-transform ${showVolunteerExportDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showVolunteerExportDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 w-full">
                <button onClick={() => handleExportVolunteers('xlsx')} className="w-full px-4 py-3 text-left text-green-300 hover:bg-gray-700 rounded-t-xl flex items-center gap-2">
                  <FileSpreadsheet size={16} />Excel (XLSX)
                </button>
                <button onClick={() => handleExportVolunteers('csv')} className="w-full px-4 py-3 text-left text-blue-300 hover:bg-gray-700 flex items-center gap-2">
                  <FileText size={16} />CSV
                </button>
                <button onClick={() => handleExportVolunteers('pdf')} className="w-full px-4 py-3 text-left text-red-300 hover:bg-gray-700 rounded-b-xl flex items-center gap-2">
                  <FileText size={16} />PDF
                </button>
              </div>
            )}
          </div>

          {/* Upcoming shifts at a glance */}
          <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <h4 className="text-indigo-300 font-semibold mb-2 flex items-center gap-2">
              <Clock size={16} />
              Upcoming Shifts at a Glance
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Today:</span>
                <span className="text-white">{volunteerShifts.filter(s => s.shift_date === new Date().toISOString().split('T')[0]).length} shifts</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tomorrow:</span>
                <span className="text-yellow-300">8 shifts</span>
              </div>
              <button className="text-indigo-300 text-xs hover:text-indigo-200 transition-colors">
                → Click to see day-by-day view
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 TABLEAU AVEC VRAIES DONNÉES */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-green-400" />
            List of All Volunteer Information ({totalVolunteers} volunteers)
          </h3>
          <button
            onClick={() => setShowVolunteerAccountsModal(true)}
            className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
          >
            <Eye size={16} />
            View Full Database
          </button>
        </div>
        
        {/* Preview table avec vraies données - TOUS LES BÉNÉVOLES */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-800/90 backdrop-blur-md">
              <tr className="border-b border-gray-600">
                <th className="text-left text-gray-300 p-3">Name</th>
                <th className="text-left text-gray-300 p-3">Email</th>
                <th className="text-left text-gray-300 p-3">Phone</th>
                <th className="text-left text-gray-300 p-3">Hours Progress</th>
                <th className="text-left text-gray-300 p-3">Status</th>
                <th className="text-left text-gray-300 p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 p-6">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-gray-600" />
                      <p>Aucun bénévole trouvé</p>
                      <p className="text-sm">Les données seront chargées automatiquement</p>
                    </div>
                  </td>
                </tr>
              ) : (
                volunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="text-white p-3 font-semibold">{volunteer.full_name}</td>
                    <td className="text-gray-300 p-3">{volunteer.email}</td>
                    <td className="text-gray-300 p-3">{volunteer.phone || 'Non renseigné'}</td>
                    <td className="text-white p-3">
                      <div className="flex items-center gap-2">
                        <span>{volunteer.volunteer_hours}/{volunteer.required_hours}h</span>
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${volunteer.volunteer_hours >= volunteer.required_hours ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${Math.min(100, (volunteer.volunteer_hours / volunteer.required_hours) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        volunteer.volunteer_hours >= volunteer.required_hours 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {volunteer.volunteer_hours >= volunteer.required_hours ? '✅ Completed' : '⏳ In Progress'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button className="text-blue-400 hover:text-blue-300 p-1" title="Call">
                          <Phone size={16} />
                        </button>
                        <button className="text-green-400 hover:text-green-300 p-1" title="Email">
                          <Mail size={16} />
                        </button>
                        <button className="text-purple-400 hover:text-purple-300 p-1" title="View Details">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // 🎯 TEAM DASHBOARD (Andres's view) - AVEC VRAIES DONNÉES
  const DashboardTeams = () => (
    <>
      {/* Team-specific metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Teams submitted */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md border border-blue-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-2xl font-black text-blue-400">{totalTeams}</span>
          </div>
          <h3 className="text-white font-bold mb-2">Teams Submitted</h3>
          <p className="text-gray-300 text-sm">Total applications</p>
        </div>

        {/* Teams approved */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border border-green-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-2xl font-black text-green-400">{approvedTeams}</span>
          </div>
          <h3 className="text-white font-bold mb-2">Teams Approved</h3>
          <p className="text-gray-300 text-sm">Validation completed</p>
        </div>

        {/* Pending approvals */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-md border border-yellow-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-2xl font-black text-yellow-400">{pendingTeams}</span>
          </div>
          <h3 className="text-white font-bold mb-2">Pending Approvals</h3>
          <p className="text-gray-300 text-sm">To review within 48h</p>
        </div>

        {/* Average score */}
        <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-md border border-purple-500/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-2xl font-black text-purple-400">8.2</span>
          </div>
          <h3 className="text-white font-bold mb-2">Average Score</h3>
          <p className="text-gray-300 text-sm">Quality evaluation</p>
        </div>
      </div>

      {/* Quick actions for Andres */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            Team Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-yellow-500/20 text-yellow-300 p-3 rounded-xl hover:bg-yellow-500/30 transition-colors flex items-center gap-2">
              <Eye size={18} />
              Review pending teams ({pendingTeams})
            </button>
            <button className="w-full bg-green-500/20 text-green-300 p-3 rounded-xl hover:bg-green-500/30 transition-colors flex items-center gap-2">
              <CheckCircle size={18} />
              Validate final performances
            </button>
            <button className="w-full bg-blue-500/20 text-blue-300 p-3 rounded-xl hover:bg-blue-500/30 transition-colors flex items-center gap-2">
              <Calendar size={18} />
              Schedule performance order
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Export Teams</h3>
          <div className="relative">
            <button
              onClick={() => setShowTeamExportDropdown(!showTeamExportDropdown)}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white p-4 rounded-xl font-semibold hover:from-purple-600 hover:to-violet-700 transition-all duration-300 flex items-center gap-3 justify-center"
            >
              <Download size={20} />
              Export Team Data
              <ChevronDown size={16} className={`transition-transform ${showTeamExportDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showTeamExportDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 w-full">
                <button onClick={() => handleExportTeams('xlsx')} className="w-full px-4 py-3 text-left text-purple-300 hover:bg-gray-700 rounded-t-xl flex items-center gap-2">
                  <FileSpreadsheet size={16} />Excel (XLSX)
                </button>
                <button onClick={() => handleExportTeams('csv')} className="w-full px-4 py-3 text-left text-blue-300 hover:bg-gray-700 flex items-center gap-2">
                  <FileText size={16} />CSV
                </button>
                <button onClick={() => handleExportTeams('pdf')} className="w-full px-4 py-3 text-left text-red-300 hover:bg-gray-700 rounded-b-xl flex items-center gap-2">
                  <FileText size={16} />PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🎯 LISTE AVEC VRAIES ÉQUIPES */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Music className="w-6 h-6 text-purple-400" />
          Recent Teams
        </h3>
        <div className="space-y-4">
          {teams.length === 0 ? (
            <div className="text-center text-gray-400 p-6">
              <div className="flex flex-col items-center gap-2">
                <Music className="w-12 h-12 text-gray-600" />
                <p>Aucune équipe trouvée</p>
                <p className="text-sm">Les données seront chargées automatiquement</p>
              </div>
            </div>
          ) : (
            teams.slice(0, 5).map((team) => (
              <div key={team.id} className="p-4 bg-gray-700/30 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold">{team.team_name}</h4>
                  <p className="text-gray-300 text-sm">{team.city}, {team.country}</p>
                  <p className="text-gray-400 text-xs">{team.dance_styles?.join(', ') || 'Styles non spécifiés'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    team.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                    team.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {team.status === 'approved' ? '✅ Approved' :
                     team.status === 'submitted' ? '⏳ Pending' : '📝 Draft'}
                  </span>
                  <button className="text-blue-400 hover:text-blue-300 p-2">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );

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
                Dashboard Analytics
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl">
                Boston Salsa Festival 2025 - Real-time Management Console
              </p>
              {/* 🎯 INDICATEUR DE DONNÉES RÉELLES */}
              <div className="mt-2 flex items-center gap-2 text-sm text-green-200">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Données Supabase en temps réel</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl font-semibold border border-white/20 focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 🎯 TAB NAVIGATION */}
        <div className="flex gap-2 mb-8 bg-gray-800/30 p-2 rounded-2xl backdrop-blur-md border border-gray-600/30">
          <button
            onClick={() => setDashboardView('general')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 justify-center ${
              dashboardView === 'general'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <BarChart3 size={20} />
            📈 General Dashboard
          </button>
          <button
            onClick={() => setDashboardView('volunteers')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 justify-center ${
              dashboardView === 'volunteers'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Users size={20} />
            👥 Volunteer Dashboard
          </button>
          <button
            onClick={() => setDashboardView('teams')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 justify-center ${
              dashboardView === 'teams'
                ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Music size={20} />
            🎵 Team Dashboard
          </button>
        </div>

        {/* Action feedback */}
        {actionFeedback && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
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

        {/* 🎯 CONDITIONAL CONTENT */}
        {dashboardView === 'general' && <DashboardGeneral />}
        {dashboardView === 'volunteers' && <DashboardVolunteers />}
        {dashboardView === 'teams' && <DashboardTeams />}
      </div>
      
      {/* Volunteer Accounts Modal */}
      <VolunteerAccountsModal
        isOpen={showVolunteerAccountsModal}
        onClose={() => setShowVolunteerAccountsModal(false)}
        currentUser={currentUser}
        language={'en'}
        volunteerShifts={volunteerShifts}
        volunteerSignups={volunteerSignups}
      />
    </div>
  );
};

export default Dashboard;