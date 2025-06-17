import React from 'react';
import { Calendar, Users, Settings, Clock, Music, Star, BarChart3, MapPin, Bell, QrCode, Download, Eye, Plus, Filter, Search } from 'lucide-react';

interface User {
  id: string;
  role: 'admin' | 'organizer' | 'assistant' | 'volunteer' | 'team_director' | 'artist' | 'attendee';
  full_name: string;
  email: string;
}

interface BSFNavigationProps {
  currentUser: User | null;
  currentView: 'overview' | 'volunteers' | 'teams' | 'dashboard' | 'settings';
  setCurrentView: (view: 'overview' | 'volunteers' | 'teams' | 'dashboard' | 'settings') => void;
  criticalShifts?: number;
  pendingTeams?: number;
  totalVolunteers?: number;
  approvedTeams?: number;
}

const BSFNavigation: React.FC<BSFNavigationProps> = ({
  currentUser,
  currentView,
  setCurrentView,
  criticalShifts = 0,
  pendingTeams = 0,
  totalVolunteers = 0,
  approvedTeams = 0
}) => {
  
  const navigationItems = [
    {
      id: 'overview' as const,
      label: 'Vue d\'ensemble',
      icon: MapPin,
      color: 'from-red-500 to-orange-500',
      description: 'Informations générales BSF',
      badge: null,
      access: ['admin', 'organizer', 'volunteer', 'team_director', 'artist', 'attendee', 'assistant']
    },
    {
      id: 'volunteers' as const,
      label: 'Bénévoles',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      description: 'Gestion des créneaux',
      badge: criticalShifts > 0 ? { count: criticalShifts, type: 'warning' } : null,
      access: ['admin', 'organizer', 'volunteer', 'assistant']
    },
    {
      id: 'teams' as const,
      label: 'Équipes',
      icon: Music,
      color: 'from-purple-500 to-violet-500',
      description: 'Performances & spectacle',
      badge: pendingTeams > 0 ? { count: pendingTeams, type: 'info' } : null,
      access: ['admin', 'organizer', 'team_director', 'assistant']
    },
    {
      id: 'dashboard' as const,
      label: 'Analytics',
      icon: BarChart3,
      color: 'from-blue-500 to-indigo-500',
      description: 'Statistiques & rapports',
      badge: null,
      access: ['admin', 'organizer']
    },
    {
      id: 'settings' as const,
      label: 'Paramètres',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      description: 'Configuration BSF',
      badge: null,
      access: ['admin', 'organizer']
    }
  ];

  const quickActions = [
    {
      label: 'Nouveau créneau',
      icon: Plus,
      action: () => console.log('Nouveau créneau'),
      color: 'bg-green-500 hover:bg-green-600',
      access: ['admin', 'organizer']
    },
    {
      label: 'Scanner QR',
      icon: QrCode,
      action: () => console.log('Scanner QR'),
      color: 'bg-blue-500 hover:bg-blue-600',
      access: ['admin', 'organizer', 'assistant']
    },
    {
      label: 'Export',
      icon: Download,
      action: () => console.log('Export'),
      color: 'bg-purple-500 hover:bg-purple-600',
      access: ['admin', 'organizer']
    },
    {
      label: 'Notifications',
      icon: Bell,
      action: () => console.log('Notifications'),
      color: 'bg-orange-500 hover:bg-orange-600',
      access: ['admin', 'organizer']
    }
  ];

  const stats = [
    {
      label: 'Bénévoles',
      value: totalVolunteers,
      icon: Users,
      color: 'text-green-500'
    },
    {
      label: 'Équipes',
      value: approvedTeams,
      icon: Star,
      color: 'text-purple-500'
    },
    {
      label: 'Créneaux critiques',
      value: criticalShifts,
      icon: Clock,
      color: 'text-red-500'
    }
  ];

  if (!currentUser) return null;

  const hasAccess = (allowedRoles: string[]) => {
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
      <div className="container mx-auto px-4">
        {/* Header avec titre et stats rapides */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              Boston Salsa Festival 2025
            </h1>
            <p className="text-gray-500 mt-1">18-20 Juillet • Hynes Convention Center</p>
          </div>

          {/* Stats rapides */}
          <div className="hidden lg:flex items-center gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation principale */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            {navigationItems
              .filter(item => hasAccess(item.access))
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                      isActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105` 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden md:inline">{item.label}</span>
                    
                    {/* Badge de notification */}
                    {item.badge && (
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        item.badge.type === 'warning' ? 'bg-red-500 text-white' :
                        item.badge.type === 'info' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {item.badge.count}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Actions rapides */}
          <div className="flex items-center space-x-2">
            {quickActions
              .filter(action => hasAccess(action.access))
              .map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-white font-semibold transition-all duration-200 ${action.color} transform hover:scale-105 shadow-md hover:shadow-lg`}
                    title={action.label}
                  >
                    <Icon size={16} />
                    <span className="hidden lg:inline text-sm">{action.label}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Barre de contexte selon la vue */}
        {currentView !== 'overview' && (
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              {/* Titre de section */}
              <h2 className="text-lg font-semibold text-gray-900">
                {currentView === 'volunteers' && '👥 Gestion des Bénévoles'}
                {currentView === 'teams' && '🎭 Équipes de Performance'}
                {currentView === 'dashboard' && '📊 Analytics & Rapports'}
                {currentView === 'settings' && '⚙️ Paramètres de l\'Événement'}
              </h2>

              {/* Indicateur de contexte */}
              {currentView === 'volunteers' && criticalShifts > 0 && (
                <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Clock size={14} />
                  {criticalShifts} créneaux critiques
                </div>
              )}
              
              {currentView === 'teams' && pendingTeams > 0 && (
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Eye size={14} />
                  {pendingTeams} en attente de validation
                </div>
              )}
            </div>

            {/* Actions contextuelles */}
            <div className="flex items-center space-x-2">
              {currentView === 'volunteers' && (
                <>
                  <button className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Filter size={14} />
                    <span className="text-sm">Filtrer</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Search size={14} />
                    <span className="text-sm">Rechercher</span>
                  </button>
                </>
              )}
              
              {currentView === 'teams' && (
                <>
                  <button className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Filter size={14} />
                    <span className="text-sm">Par statut</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Star size={14} />
                    <span className="text-sm">Notation</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BSFNavigation;
