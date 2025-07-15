// src/components/volunteers/VolunteerAccountsModal.tsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  User,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  File
} from 'lucide-react';
import volunteerAccountsService, { VolunteerAccountData } from '../../services/volunteerAccountsService';

interface VolunteerAccount {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  volunteer_hours: number;
  required_hours: number;
  assigned_shifts: Array<{
    id: string;
    title: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    status: string;
  }>;
}

interface VolunteerAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  language: 'fr' | 'en' | 'es';
  volunteerShifts: any[];
  volunteerSignups: any[];
}

const VolunteerAccountsModal: React.FC<VolunteerAccountsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  language,
  volunteerShifts,
  volunteerSignups
}) => {
  const [volunteers, setVolunteers] = useState<VolunteerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with_shifts' | 'without_shifts' | 'quota_completed'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'hours' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  const ITEMS_PER_PAGE = 20;

  // Textes selon la langue
  const texts = {
    fr: {
      title: 'Gestion des Comptes Bénévoles',
      subtitle: 'Liste de tous les bénévoles inscrits sur la plateforme',
      searchPlaceholder: 'Rechercher par nom ou email...',
      filters: {
        all: 'Tous',
        with_shifts: 'Avec créneaux',
        without_shifts: 'Sans créneaux',
        quota_completed: 'Quota complété'
      },
      headers: {
        name: 'Nom',
        email: 'Email',
        phone: 'Téléphone',
        registered: 'Inscrit le',
        hours: 'Heures',
        shifts: 'Créneaux',
        actions: 'Actions'
      },
      noPhone: 'Non renseigné',
      hoursProgress: '{completed}/{required}h',
      quotaCompleted: 'Quota complété !',
      shiftsCount: '{count} créneau{s}',
      noShifts: 'Aucun créneau',
      contact: 'Contacter',
      viewDetails: 'Voir détails',
      export: 'Exporter',
      exportExcel: 'Excel (XLSX)',
      exportCSV: 'CSV',
      exportPDF: 'PDF',
      loading: 'Chargement...',
      noResults: 'Aucun bénévole trouvé',
      totalVolunteers: 'Total: {count} bénévole{s}',
      page: 'Page {current} sur {total}',
      previous: 'Précédent',
      next: 'Suivant',
      refresh: 'Actualiser'
    },
    en: {
      title: 'Volunteer Accounts Management',
      subtitle: 'List of all volunteers registered on the platform',
      searchPlaceholder: 'Search by name or email...',
      filters: {
        all: 'All',
        with_shifts: 'With shifts',
        without_shifts: 'Without shifts', 
        quota_completed: 'Quota completed'
      },
      headers: {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        registered: 'Registered',
        hours: 'Hours',
        shifts: 'Shifts',
        actions: 'Actions'
      },
      noPhone: 'Not provided',
      hoursProgress: '{completed}/{required}h',
      quotaCompleted: 'Quota completed!',
      shiftsCount: '{count} shift{s}',
      noShifts: 'No shifts',
      contact: 'Contact',
      viewDetails: 'View details',
      export: 'Export',
      exportExcel: 'Excel (XLSX)',
      exportCSV: 'CSV', 
      exportPDF: 'PDF',
      loading: 'Loading...',
      noResults: 'No volunteers found',
      totalVolunteers: 'Total: {count} volunteer{s}',
      page: 'Page {current} of {total}',
      previous: 'Previous',
      next: 'Next',
      refresh: 'Refresh'
    },
    es: {
      title: 'Gestión de Cuentas de Voluntarios',
      subtitle: 'Lista de todos los voluntarios registrados en la plataforma',
      searchPlaceholder: 'Buscar por nombre o email...',
      filters: {
        all: 'Todos',
        with_shifts: 'Con turnos',
        without_shifts: 'Sin turnos',
        quota_completed: 'Cuota completada'
      },
      headers: {
        name: 'Nombre',
        email: 'Email',
        phone: 'Teléfono',
        registered: 'Registrado',
        hours: 'Horas',
        shifts: 'Turnos',
        actions: 'Acciones'
      },
      noPhone: 'No proporcionado',
      hoursProgress: '{completed}/{required}h',
      quotaCompleted: '¡Cuota completada!',
      shiftsCount: '{count} turno{s}',
      noShifts: 'Sin turnos',
      contact: 'Contactar',
      viewDetails: 'Ver detalles',
      export: 'Exportar',
      exportExcel: 'Excel (XLSX)',
      exportCSV: 'CSV',
      exportPDF: 'PDF',
      loading: 'Cargando...',
      noResults: 'No se encontraron voluntarios',
      totalVolunteers: 'Total: {count} voluntario{s}',
      page: 'Página {current} de {total}',
      previous: 'Anterior',
      next: 'Siguiente',
      refresh: 'Actualizar'
    }
  };

  const t = texts[language];

  // 🎯 CORRECTION: Charger les données au montage ET quand volunteerSignups change
  useEffect(() => {
    if (isOpen) {
      loadVolunteers();
    }
  }, [isOpen, volunteerSignups]); // 🎯 AJOUT: Recharger quand les inscriptions changent

  const loadVolunteers = async () => {
    setLoading(true);
    
    try {
      console.log('🔍 Chargement des bénévoles depuis Supabase...');
      
      // Utiliser le service corrigé
      const result = await volunteerAccountsService.getAllVolunteerAccounts('a9d1c983-1456-4007-9aec-b297dd095ff7');
      
      if (result.success && result.data) {
        console.log(`✅ ${result.data.length} bénévoles chargés depuis Supabase`);
        
        // Convertir les données du service vers notre interface locale
        const convertedVolunteers: VolunteerAccount[] = result.data.map(v => ({
          id: v.id,
          full_name: v.full_name,
          email: v.email,
          phone: v.phone,
          created_at: v.created_at,
          volunteer_hours: v.volunteer_hours,
          required_hours: v.required_hours,
          assigned_shifts: v.assigned_shifts
        }));
        
        setVolunteers(convertedVolunteers);
        
        // 🎯 DEBUG: Afficher les détails pour Test Volunteer 1
        const testVolunteer = convertedVolunteers.find(v => v.full_name === 'Test Volunteer 1');
        if (testVolunteer) {
          console.log('🔍 Test Volunteer 1 dans modal:', {
            hours: testVolunteer.volunteer_hours,
            shifts: testVolunteer.assigned_shifts.length,
            shifts_details: testVolunteer.assigned_shifts
          });
        }
        
      } else {
        console.error('❌ Erreur chargement bénévoles:', result.message);
        alert(`Erreur: ${result.message || 'Impossible de charger les bénévoles'}`);
        setVolunteers([]);
      }
    } catch (error) {
      console.error('❌ Erreur loadVolunteers:', error);
      alert('Erreur de connexion lors du chargement des bénévoles');
      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer et trier les bénévoles
  const filteredAndSortedVolunteers = React.useMemo(() => {
    let filtered = volunteers.filter(volunteer => {
      // Filtre de recherche
      const matchesSearch = 
        volunteer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre de statut
      const matchesFilter = (() => {
        switch (filterStatus) {
          case 'with_shifts':
            return volunteer.assigned_shifts.length > 0;
          case 'without_shifts':
            return volunteer.assigned_shifts.length === 0;
          case 'quota_completed':
            return volunteer.volunteer_hours >= volunteer.required_hours;
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesFilter;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'hours':
          aValue = a.volunteer_hours;
          bValue = b.volunteer_hours;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [volunteers, searchTerm, filterStatus, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedVolunteers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVolunteers = filteredAndSortedVolunteers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Gérer le tri
  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Formatage des dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US');
  };

  // 🎯 CORRECTION: Formatage du texte avec variables
  const formatText = (template: string, variables: Record<string, any>) => {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const value = variables[key];
      return value !== undefined ? String(value) : match;
    });
  };

  // Actions d'export utilisant le vrai service
  const handleExport = async (format: 'xlsx' | 'csv' | 'pdf') => {
    try {
      const result = await volunteerAccountsService.exportVolunteerAccounts(
        filteredAndSortedVolunteers,
        format
      );
      
      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ Erreur: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Erreur export:', error);
      alert('❌ Erreur lors de l\'export');
    }
    
    setShowExportDropdown(false);
  };

  // Action de contact
  const handleContact = (volunteer: VolunteerAccount) => {
    if (volunteer.email) {
      window.open(`mailto:${volunteer.email}`, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-600/30">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-green-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">{t.title}</h2>
              <p className="text-gray-400">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Bouton actualiser */}
            <button
              onClick={loadVolunteers}
              disabled={loading}
              className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors disabled:opacity-50"
              title={t.refresh}
            >
              <RefreshCw className={`w-5 h-5 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Bouton export */}
            <div className="relative">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                {t.export}
              </button>
              
              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg py-2 min-w-40 z-10">
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-400" />
                    {t.exportExcel}
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <File className="w-4 h-4 text-blue-400" />
                    {t.exportCSV}
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-red-400" />
                    {t.exportPDF}
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="p-6 border-b border-gray-600/30">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            {/* Filtres */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">{t.filters.all}</option>
                <option value="with_shifts">{t.filters.with_shifts}</option>
                <option value="without_shifts">{t.filters.without_shifts}</option>
                <option value="quota_completed">{t.filters.quota_completed}</option>
              </select>
            </div>
          </div>
          
          {/* Statistiques */}
          <div className="mt-4 text-gray-400 text-sm">
            {formatText(t.totalVolunteers, { 
              count: filteredAndSortedVolunteers.length,
              s: filteredAndSortedVolunteers.length > 1 ? 's' : ''
            })}
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-green-400 animate-spin" />
                <span className="text-gray-300">{t.loading}</span>
              </div>
            </div>
          ) : filteredAndSortedVolunteers.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">{t.noResults}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-auto h-full">
              {/* Table */}
              <table className="w-full">
                <thead className="bg-gray-700/30 sticky top-0">
                  <tr>
                    <th 
                      className="text-left p-4 text-gray-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        {t.headers.name}
                        {sortBy === 'name' && (
                          <span className="text-green-400">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 text-gray-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        {t.headers.email}
                        {sortBy === 'email' && (
                          <span className="text-green-400">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="text-left p-4 text-gray-300">{t.headers.phone}</th>
                    <th 
                      className="text-left p-4 text-gray-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        {t.headers.registered}
                        {sortBy === 'created_at' && (
                          <span className="text-green-400">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 text-gray-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('hours')}
                    >
                      <div className="flex items-center gap-2">
                        {t.headers.hours}
                        {sortBy === 'hours' && (
                          <span className="text-green-400">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="text-left p-4 text-gray-300">{t.headers.shifts}</th>
                    <th className="text-left p-4 text-gray-300">{t.headers.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVolunteers.map((volunteer, index) => (
                    <tr 
                      key={volunteer.id} 
                      className={`border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-800/20' : ''
                      }`}
                    >
                      {/* Nom */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-green-400" />
                          </div>
                          <span className="text-white font-medium">{volunteer.full_name}</span>
                        </div>
                      </td>
                      
                      {/* Email */}
                      <td className="p-4">
                        <span className="text-gray-300">{volunteer.email}</span>
                      </td>
                      
                      {/* Téléphone */}
                      <td className="p-4">
                        <span className="text-gray-300">
                          {volunteer.phone || t.noPhone}
                        </span>
                      </td>
                      
                      {/* Date d'inscription */}
                      <td className="p-4">
                        <span className="text-gray-300">{formatDate(volunteer.created_at)}</span>
                      </td>
                      
                      {/* 🎯 CORRECTION: Heures avec formatage correct */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            volunteer.volunteer_hours >= volunteer.required_hours 
                              ? 'text-green-400' 
                              : 'text-yellow-400'
                          }`}>
                            {formatText(t.hoursProgress, {
                              completed: volunteer.volunteer_hours,
                              required: volunteer.required_hours
                            })}
                          </span>
                          {volunteer.volunteer_hours >= volunteer.required_hours && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        {volunteer.volunteer_hours >= volunteer.required_hours && (
                          <div className="text-xs text-green-400 mt-1">
                            {t.quotaCompleted}
                          </div>
                        )}
                      </td>
                      
                      {/* Créneaux */}
                      <td className="p-4">
                        {volunteer.assigned_shifts.length > 0 ? (
                          <div>
                            <span className="text-white font-medium">
                              {formatText(t.shiftsCount, {
                                count: volunteer.assigned_shifts.length,
                                s: volunteer.assigned_shifts.length > 1 ? 's' : ''
                              })}
                            </span>
                            <div className="text-xs text-gray-400 mt-1 space-y-1">
                              {volunteer.assigned_shifts.slice(0, 2).map(shift => (
                                <div key={shift.id} className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  <span>{shift.title}</span>
                                </div>
                              ))}
                              {volunteer.assigned_shifts.length > 2 && (
                                <div className="text-green-400">
                                  +{volunteer.assigned_shifts.length - 2} autre{volunteer.assigned_shifts.length > 3 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">{t.noShifts}</span>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {volunteer.email && (
                            <button
                              onClick={() => handleContact(volunteer)}
                              className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                              title={t.contact}
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}
                          {volunteer.phone && (
                            <button
                              onClick={() => window.open(`tel:${volunteer.phone}`, '_blank')}
                              className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                              title={volunteer.phone}
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-600/30">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">
                {formatText(t.page, { current: currentPage, total: totalPages })}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.previous}
                </button>
                
                {/* Pages */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.next}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerAccountsModal;