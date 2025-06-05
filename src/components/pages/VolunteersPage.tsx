import React, { useState, useEffect } from 'react';
import { Users, Copy, Plus, CheckCircle, Calendar, Clock, X, QrCode, Scan, Check, AlertCircle, UserCheck, Bell, BellRing } from 'lucide-react';

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
  volunteerShifts: VolunteerShift[];
  setVolunteerShifts: React.Dispatch<React.SetStateAction<VolunteerShift[]>>;
  volunteerSignups: VolunteerSignup[];
  setVolunteerSignups: React.Dispatch<React.SetStateAction<VolunteerSignup[]>>;
  events: DanceEvent[];
  setEvents: React.Dispatch<React.SetStateAction<DanceEvent[]>>;
}

const VolunteersPage: React.FC<VolunteersPageProps> = ({
  t,
  currentUser,
  volunteerShifts,
  setVolunteerShifts,
  volunteerSignups,
  setVolunteerSignups,
  events,
  setEvents
}) => {
  const [showCreateShift, setShowCreateShift] = useState(false);
  const [showDuplicateEvent, setShowDuplicateEvent] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showMyQR, setShowMyQR] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scanResult, setScanResult] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [qrInput, setQrInput] = useState('');
  const [userVolunteerHours, setUserVolunteerHours] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const requiredHours = 8;
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
            
            // Rappel 1h avant
            if (currentHour === shiftHour - 1) {
              upcomingNotifications.push({
                id: `reminder-${shift.id}`,
                type: 'reminder',
                title: '⏰ Rappel : Créneau dans 1h',
                message: `${shift.title} commence à ${shift.start_time}`,
                time: new Date().toLocaleTimeString(),
                shift: shift,
                read: false
              });
            }
            
            // Rappel 30min avant
            if (currentHour === shiftHour && new Date().getMinutes() >= 30) {
              upcomingNotifications.push({
                id: `urgent-${shift.id}`,
                type: 'urgent',
                title: '🚨 Urgent : Créneau dans 30min',
                message: `N'oubliez pas votre QR Code pour ${shift.title}`,
                time: new Date().toLocaleTimeString(),
                shift: shift,
                read: false
              });
            }
          }
        });

        // Ajouter notifications générales
        upcomingNotifications.push({
          id: 'welcome',
          type: 'info',
          title: '🎭 Bienvenue au Boston Salsa Festival !',
          message: 'Merci d\'être bénévole. Consultez vos créneaux ci-dessous.',
          time: '08:00',
          read: false
        });

        if (userVolunteerHours >= requiredHours) {
          upcomingNotifications.push({
            id: 'completed',
            type: 'success',
            title: '✅ Heures bénévoles complétées !',
            message: 'Félicitations ! Vous avez terminé vos 8h requises.',
            time: new Date().toLocaleTimeString(),
            read: false
          });
        }

        setNotifications(upcomingNotifications);
        setUnreadCount(upcomingNotifications.filter(n => !n.read).length);
      };

      generateNotifications();
    }
  }, [currentUser, volunteerSignups, volunteerShifts, userVolunteerHours]);

  // Marquer notification comme lue
  const markNotificationRead = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Marquer toutes comme lues
  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };
  const generateQRCode = (userId: string) => {
    return `SABOR_VOL_${userId}_${Date.now()}`;
  };

  // Vérifier et traiter un scan QR
  const handleQRScan = () => {
    if (!qrInput.trim()) {
      setScanResult({type: 'error', message: 'Veuillez saisir un code QR'});
      return;
    }

    // Extraire l'ID utilisateur du QR code
    const qrMatch = qrInput.match(/SABOR_VOL_([^_]+)_/);
    if (!qrMatch) {
      setScanResult({type: 'error', message: 'Code QR invalide'});
      return;
    }

    const scannedUserId = qrMatch[1];
    
    // Trouver le bénévole dans les inscriptions
    const volunteerSignup = volunteerSignups.find(signup => 
      signup.volunteer_id === scannedUserId && 
      signup.status !== 'cancelled'
    );

    if (!volunteerSignup) {
      setScanResult({type: 'error', message: 'Bénévole non trouvé ou non inscrit'});
      return;
    }

    if (volunteerSignup.status === 'checked_in') {
      setScanResult({type: 'error', message: 'Bénévole déjà pointé'});
      return;
    }

    // Marquer comme présent
    setVolunteerSignups(signups =>
      signups.map(signup =>
        signup.id === volunteerSignup.id
          ? { ...signup, status: 'checked_in' as const, checked_in_at: new Date().toISOString() }
          : signup
      )
    );

    setScanResult({type: 'success', message: `Bénévole pointé avec succès !`});
    setQrInput('');
  };

  // Copier QR code
  const copyQRCode = (qrCode: string) => {
    navigator.clipboard.writeText(qrCode);
    // Feedback visuel qu'on pourrait ajouter
  };

  const handleCreateShift = () => {
    const shift: VolunteerShift = {
      id: Date.now().toString(),
      ...newShift,
      current_volunteers: 0,
      status: 'draft'
    };
    setVolunteerShifts([...volunteerShifts, shift]);
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
  };

  const signUpForShift = (shiftId: string) => {
    const shift = volunteerShifts.find(s => s.id === shiftId);
    if (shift && shift.current_volunteers < shift.max_volunteers) {
      const signup: VolunteerSignup = {
        id: Date.now().toString(),
        shift_id: shiftId,
        volunteer_id: currentUser?.id || '1',
        status: 'signed_up',
        signed_up_at: new Date().toISOString(),
        reminder_sent: false
      };
      
      setVolunteerSignups([...volunteerSignups, signup]);
      
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
  };

  const calculateShiftDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const changeShiftStatus = (shiftId: string, newStatus: 'draft' | 'live' | 'full' | 'cancelled') => {
    setVolunteerShifts(shifts =>
      shifts.map(shift =>
        shift.id === shiftId ? { ...shift, status: newStatus } : shift
      )
    );
  };

  const duplicateFromEvent = (eventId: string) => {
    const sourceEvent = events.find((e: DanceEvent) => e.id === eventId);
    if (sourceEvent) {
      const newEvent: DanceEvent = {
        ...sourceEvent,
        id: Date.now().toString(),
        name: `${sourceEvent.name} (Copie)`
      };
      setEvents([...events, newEvent]);
      setShowDuplicateEvent(false);
    }
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
                Gestion des Bénévoles
              </h1>
              <p className="text-xl text-green-100 max-w-2xl">
                Organisez et gérez vos équipes bénévoles avec simplicité et efficacité
              </p>
            </div>
            
            {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2"
                >
                  <Scan size={18} />
                  Scanner QR
                </button>
                <button
                  onClick={() => setShowDuplicateEvent(true)}
                  className="group bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                >
                  <Copy size={18} />
                  {t.duplicateEvent}
                </button>
                <button
                  onClick={() => setShowCreateShift(true)}
                  className="group bg-gradient-to-r from-lime-500 to-green-500 text-white px-8 py-4 rounded-xl font-bold hover:from-lime-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2"
                >
                  <Plus size={20} />
                  {t.createSlot}
                </button>
              </div>
            )}

        {/* Modal Centre de Notifications */}
        {showNotifications && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <BellRing className="w-8 h-8 text-orange-400" />
                  Centre de Notifications
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                      {unreadCount} non lues
                    </span>
                  )}
                </h2>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-orange-400 hover:text-orange-300 text-sm font-semibold"
                    >
                      Tout marquer lu
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
                    <p className="text-gray-400">Aucune notification pour le moment</p>
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

              {/* Actions rapides */}
              <div className="mt-8 border-t border-gray-600/30 pt-6">
                <h4 className="text-white font-semibold mb-4">Raccourcis utiles</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setShowMyQR(true);
                    }}
                    className="bg-purple-500/20 text-purple-300 p-3 rounded-xl hover:bg-purple-500/30 transition-colors flex items-center gap-2"
                  >
                    <QrCode size={16} />
                    Mon QR Code
                  </button>
                  <button className="bg-blue-500/20 text-blue-300 p-3 rounded-xl hover:bg-blue-500/30 transition-colors flex items-center gap-2">
                    <Calendar size={16} />
                    Planning
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
                  Mon Progression Bénévolat
                </h2>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-300 text-lg">Heures complétées</span>
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
                      <span className="font-bold text-lg">Félicitations ! Vos heures bénévoles sont complétées !</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* QR Code personnel */}
              <div className="ml-8 flex flex-col gap-3">
                {/* Notifications pour bénévoles */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 relative"
                  >
                    <Bell size={20} />
                    Notifications
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
                  Mon QR Code
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des créneaux */}
        <div className="grid gap-6">
          {volunteerShifts.map(shift => {
            const checkedInCount = volunteerSignups.filter(signup => 
              signup.shift_id === shift.id && signup.status === 'checked_in'
            ).length;
            
            return (
              <div key={shift.id} className="group bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-white group-hover:text-green-100 transition-colors">{shift.title}</h3>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        shift.status === 'draft' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                        shift.status === 'live' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        shift.status === 'full' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {shift.status.toUpperCase()}
                      </span>
                      {shift.check_in_required && (
                        <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          Check-in requis
                        </span>
                      )}
                      {/* Indicateur check-in temps réel */}
                      {shift.check_in_required && (
                        <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <UserCheck size={12} />
                          {checkedInCount}/{shift.current_volunteers} présents
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">{shift.description}</p>
                    
                    <div className="flex flex-wrap gap-6 text-gray-400">
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
                        <span className="font-medium">{shift.current_volunteers}/{shift.max_volunteers} bénévoles</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-8 flex flex-col gap-3">
                    {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => changeShiftStatus(shift.id, shift.status === 'draft' ? 'live' : 'draft')}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                            shift.status === 'draft' 
                              ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-green-500/25' 
                              : 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg hover:shadow-gray-500/25'
                          }`}
                        >
                          {shift.status === 'draft' ? t.publish : t.draft}
                        </button>
                      </div>
                    )}
                    
                    {shift.status === 'full' ? (
                      <div className="bg-gray-600/30 text-gray-400 px-6 py-3 rounded-xl font-bold text-center border border-gray-500/30">
                        {t.full}
                      </div>
                    ) : shift.status === 'live' ? (
                      <button
                        onClick={() => signUpForShift(shift.id)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                      >
                        {t.signUp}
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-300">{t.progress}</span>
                    <span className="text-sm text-gray-400">
                      {Math.round((shift.current_volunteers / shift.max_volunteers) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600/50 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-lime-500 to-green-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${(shift.current_volunteers / shift.max_volunteers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal de création de créneau */}
        {showCreateShift && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">Créer un créneau</h2>
                <button onClick={() => setShowCreateShift(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Titre</label>
                  <input
                    type="text"
                    value={newShift.title}
                    onChange={(e) => setNewShift({...newShift, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Ex: Accueil et enregistrement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newShift.description}
                    onChange={(e) => setNewShift({...newShift, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 h-24 transition-all duration-200"
                    placeholder="Décrivez les tâches du bénévole..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={newShift.shift_date}
                      onChange={(e) => setNewShift({...newShift, shift_date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Nb bénévoles</label>
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
                    <label className="block text-sm font-bold text-gray-300 mb-2">Heure début</label>
                    <input
                      type="time"
                      value={newShift.start_time}
                      onChange={(e) => setNewShift({...newShift, start_time: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Heure fin</label>
                    <input
                      type="time"
                      value={newShift.end_time}
                      onChange={(e) => setNewShift({...newShift, end_time: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newShift.check_in_required}
                    onChange={(e) => setNewShift({...newShift, check_in_required: e.target.checked})}
                    className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <label className="text-gray-300 font-medium">Check-in requis le jour J</label>
                </div>

                <button
                  onClick={handleCreateShift}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                >
                  Créer le créneau
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de duplication d'événement */}
        {showDuplicateEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Dupliquer un événement</h2>
                <button onClick={() => setShowDuplicateEvent(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300">Sélectionnez un événement à dupliquer :</p>
                {events.map(event => (
                  <button
                    key={event.id}
                    onClick={() => duplicateFromEvent(event.id)}
                    className="w-full p-4 text-left bg-gray-700/30 border border-gray-600/30 rounded-xl hover:bg-gray-600/30 hover:border-green-500/30 transition-all duration-300 text-white"
                  >
                    <div className="font-semibold">{event.name}</div>
                    <div className="text-sm text-gray-400">{event.location} • {event.start_date}</div>
                  </button>
                ))}
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
                  Scanner QR Code
                </h2>
                <button onClick={() => setShowQRScanner(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                  <X size={24} />
                </button>
              </div>

              {/* Zone de scan simulée */}
              <div className="mb-6">
                <div className="relative bg-gray-700/30 border-2 border-dashed border-gray-500 rounded-xl h-48 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">Scanner simulé</p>
                    <p className="text-gray-500 text-sm">Collez le code QR ci-dessous</p>
                  </div>
                  
                  {/* Animation scanner */}
                  <div className="absolute inset-4 border border-blue-500/50 rounded-lg">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                  </div>
                </div>

                {/* Input pour code QR */}
                <div className="space-y-4">
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="Collez le code QR ici (ex: SABOR_VOL_1_...)"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  
                  <button
                    onClick={handleQRScan}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    Valider Scan
                  </button>
                </div>

                {/* Résultat du scan */}
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

              {/* QR codes de test */}
              <div className="border-t border-gray-600/30 pt-6">
                <h4 className="text-white font-semibold mb-3">Codes QR de test:</h4>
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
                  Mon QR Code
                </h2>
                <button onClick={() => setShowMyQR(false)} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200">
                  <X size={24} />
                </button>
              </div>

              <div className="text-center">
                {/* QR Code simulé */}
                <div className="bg-white rounded-xl p-8 mb-6 mx-auto w-fit">
                  <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* Pattern QR simulé */}
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

                {/* Informations bénévole */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{currentUser.full_name || 'Bénévole'}</h3>
                  <p className="text-gray-400">{currentUser.email || 'Email'}</p>
                </div>

                {/* Code QR texte */}
                <div className="bg-gray-700/30 rounded-xl p-4 mb-6">
                  <p className="text-gray-400 text-sm mb-2">Code QR:</p>
                  <p className="font-mono text-white text-sm break-all">
                    {generateQRCode(currentUser.id || '1')}
                  </p>
                  <button
                    onClick={() => copyQRCode(generateQRCode(currentUser.id || '1'))}
                    className="mt-3 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Copy size={16} />
                    Copier
                  </button>
                </div>

                {/* Instructions */}
                <div className="text-gray-400 text-sm text-left space-y-2">
                  <p>• Présentez ce QR code à l'organisateur</p>
                  <p>• Utilisable pour tous vos créneaux</p>
                  <p>• Permet de valider votre présence</p>
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