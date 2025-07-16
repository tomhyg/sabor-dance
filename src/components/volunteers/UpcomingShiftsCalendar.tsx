import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, MapPin, User, CalendarDays } from 'lucide-react';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
};

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

interface UpcomingShiftsCalendarProps {
  currentUser: any;
  volunteerShifts: VolunteerShift[];
  volunteerSignups: VolunteerSignup[];
  onShiftClick?: (shift: VolunteerShift) => void;
}

// View types
type ViewMode = 'day' | 'fourDays' | 'week' | 'month';

const UpcomingShiftsCalendar: React.FC<UpcomingShiftsCalendarProps> = ({
  currentUser,
  volunteerShifts,
  volunteerSignups = [],
  onShiftClick
}) => {
  
  // All text in English
  const txt = {
    myShiftsPlanning: 'My Volunteer Planning',
    myUpcomingShifts: 'My Upcoming Shifts',
    viewDay: 'Day',
    viewFourDays: '4 Days',
    viewWeek: 'Week',
    viewMonth: 'Month',
    navigationPrevious: 'Previous',
    navigationNext: 'Next',
    navigationToday: 'Today',
    currentMode: 'Current mode',
    hour: 'Hour',
    today: 'Today',
    myShifts: 'My shifts',
    confirmedShifts: 'Confirmed shifts',
    checkedInShifts: 'Completed shifts',
    totalHours: 'Total hours',
    nextShift: 'Next shift',
    noUpcomingShifts: 'No upcoming shifts',
    noShiftsMessage: 'You have no scheduled shifts at the moment.',
    volunteerStatus: 'My status',
    signedUp: 'Signed Up',
    confirmed: 'Confirmed',
    checkedIn: 'Checked In',
    cancelled: 'Cancelled',
    roleType: 'Role',
    checkInRequired: 'Check-in required',
    shiftDetails: 'Shift details',
    close: 'Close',
    volunteers: 'Volunteers',
    time: 'Time',
    date: 'Date',
    status: 'Status',
    shiftCompletedHours: 'scheduled hours',
    registrationDesk: 'Registration',
    techSupport: 'Tech Support',
    security: 'Security',
    artistPickup: 'Artist Pickup',
    cleanup: 'Cleanup',
    photography: 'Photography',
    setup: 'Setup',
    general: 'General'
  };
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('fourDays');
  const [fourDaysStartIndex, setFourDaysStartIndex] = useState(0);
  const [showShiftDetails, setShowShiftDetails] = useState<VolunteerShift | null>(null);

  // Filter only shifts the user is signed up for
  const getMyShifts = (): VolunteerShift[] => {
    if (!currentUser?.id) return [];
    
    const mySignups = volunteerSignups.filter(signup => 
      signup.volunteer_id === currentUser.id && 
      signup.status !== 'cancelled'
    );

    return volunteerShifts.filter(shift => 
      mySignups.some(signup => signup.shift_id === shift.id)
    );
  };

  const myShifts = getMyShifts();

  // Get user's signup for a shift
  const getUserSignupForShift = (shiftId: string): VolunteerSignup | undefined => {
    if (!currentUser?.id) return undefined;
    return volunteerSignups.find(signup => 
      signup.shift_id === shiftId && 
      signup.volunteer_id === currentUser.id &&
      signup.status !== 'cancelled'
    );
  };

  // Calendar configuration
  const hoursRange = Array.from({ length: 18 }, (_, i) => i + 6);
  
  // Function to get days to display based on mode
  const getDisplayDays = () => {
    const today = new Date();
    const week = getWeekDates(currentWeek);
    
    switch (viewMode) {
      case 'day':
        return [currentWeek];
      case 'fourDays':
        return week.slice(fourDaysStartIndex, fourDaysStartIndex + 4);
      case 'week':
        return week;
      case 'month':
        return getMonthDates(currentWeek);
      default:
        return week;
    }
  };

  // Days of the week in English
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  
  // Calculate week dates
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

  // Calculate month dates
  const getMonthDates = (date: Date): Date[] => {
    const month: Date[] = [];
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      month.push(new Date(year, monthIndex, day));
    }
    return month;
  };

  // Get dates to display
  const displayDates = getDisplayDays();
  const weekDates = getWeekDates(currentWeek);

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(currentWeek);
    if (viewMode === 'day') {
      newDate.setDate(currentWeek.getDate() - 1);
    } else if (viewMode === 'fourDays') {
      if (fourDaysStartIndex > 0) {
        setFourDaysStartIndex(prev => Math.max(0, prev - 1));
        return;
      } else {
        newDate.setDate(currentWeek.getDate() - 7);
        setFourDaysStartIndex(3);
      }
    } else if (viewMode === 'month') {
      newDate.setMonth(currentWeek.getMonth() - 1);
    } else {
      newDate.setDate(currentWeek.getDate() - 7);
    }
    setCurrentWeek(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentWeek);
    if (viewMode === 'day') {
      newDate.setDate(currentWeek.getDate() + 1);
    } else if (viewMode === 'fourDays') {
      if (fourDaysStartIndex < 3) {
        setFourDaysStartIndex(prev => Math.min(3, prev + 1));
        return;
      } else {
        newDate.setDate(currentWeek.getDate() + 7);
        setFourDaysStartIndex(0);
      }
    } else if (viewMode === 'month') {
      newDate.setMonth(currentWeek.getMonth() + 1);
    } else {
      newDate.setDate(currentWeek.getDate() + 7);
    }
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
    if (viewMode === 'fourDays') {
      setFourDaysStartIndex(0);
    }
  };

  // Format dates in English
  const formatPeriodRange = (): string => {
    if (viewMode === 'day') {
      return currentWeek.toLocaleDateString('en-US', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } else if (viewMode === 'month') {
      return currentWeek.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else {
      const start = displayDates[0];
      const end = displayDates[displayDates.length - 1];
      const startStr = start.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
      const endStr = end.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  // Get shifts for a slot
  const getMyShiftsForSlot = (date: Date, hour: number) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const shiftsForDate = myShifts.filter(shift => {
      if (shift.shift_date !== dateStr) return false;
      
      const startHour = parseInt(shift.start_time.split(':')[0]);
      const endHour = parseInt(shift.end_time.split(':')[0]);
      const endMinute = parseInt(shift.end_time.split(':')[1]);
      
      return (startHour === hour) || (startHour < hour && (endHour > hour || (endHour === hour && endMinute > 0)));
    });

    return shiftsForDate;
  };

  // Calculate shift height
  const getShiftHeight = (shift: VolunteerShift) => {
    const [startHour, startMinute] = shift.start_time.split(':').map(Number);
    const [endHour, endMinute] = shift.end_time.split(':').map(Number);
    
    const durationInMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    return (durationInMinutes / 60) * 64;
  };

  // Calculate shift vertical position
  const getShiftTop = (shift: VolunteerShift) => {
    const [startHour, startMinute] = shift.start_time.split(':').map(Number);
    return (startMinute * 64) / 60;
  };

  // Get color based on signup status
  const getMyShiftColor = (shift: VolunteerShift) => {
    const signup = getUserSignupForShift(shift.id);
    if (!signup) return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
    
    switch (signup.status) {
      case 'signed_up':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-blue-300 text-white shadow-xl shadow-blue-500/40';
      case 'confirmed':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 border-2 border-green-300 text-white shadow-xl shadow-green-500/40';
      case 'checked_in':
        return 'bg-gradient-to-r from-purple-500 to-violet-600 border-2 border-purple-300 text-white shadow-xl shadow-purple-500/40';
      case 'no_show':
        return 'bg-gradient-to-r from-red-500 to-rose-600 border-2 border-red-300 text-white shadow-xl shadow-red-500/40';
      default:
        return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
    }
  };

  // Get translated status (English only)
  const getStatusLabel = (shift: VolunteerShift): string => {
    const signup = getUserSignupForShift(shift.id);
    if (!signup) return '';
    
    switch (signup.status) {
      case 'signed_up':
        return txt.signedUp;
      case 'confirmed':
        return txt.confirmed;
      case 'checked_in':
        return txt.checkedIn;
      case 'no_show':
        return txt.cancelled;
      default:
        return signup.status;
    }
  };

  // Get English role label
  const getRoleLabel = (roleType: string): string => {
    const roleMap: { [key: string]: string } = {
      'registration': txt.registrationDesk,
      'tech_support': txt.techSupport,
      'security': txt.security,
      'artist_pickup': txt.artistPickup,
      'cleanup': txt.cleanup,
      'photography': txt.photography,
      'setup': txt.setup,
      'general': txt.general
    };
    
    return roleMap[roleType] || roleType;
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalShifts = myShifts.length;
    const confirmedShifts = myShifts.filter(shift => {
      const signup = getUserSignupForShift(shift.id);
      return signup?.status === 'confirmed' || signup?.status === 'checked_in';
    }).length;
    
    const checkedInShifts = myShifts.filter(shift => {
      const signup = getUserSignupForShift(shift.id);
      return signup?.status === 'checked_in';
    }).length;
    
    const totalHours = myShifts.reduce((total, shift) => {
      const start = new Date(`${shift.shift_date}T${shift.start_time}`);
      const end = new Date(`${shift.shift_date}T${shift.end_time}`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
    
    return {
      totalShifts,
      confirmedShifts,
      checkedInShifts,
      totalHours
    };
  };

  const stats = calculateStats();

  // Get next shift
  const getNextShift = () => {
    const now = new Date();
    const upcomingShifts = myShifts
      .filter(shift => {
        const shiftDate = new Date(`${shift.shift_date}T${shift.start_time}`);
        return shiftDate > now;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.shift_date}T${a.start_time}`);
        const dateB = new Date(`${b.shift_date}T${b.start_time}`);
        return dateA.getTime() - dateB.getTime();
      });
    
    return upcomingShifts[0] || null;
  };

  const nextShift = getNextShift();

  // Handle shift clicks
  const handleShiftClick = (shift: VolunteerShift) => {
    if (onShiftClick) {
      onShiftClick(shift);
    } else {
      setShowShiftDetails(shift);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // If no signed up shifts, show a message
  if (myShifts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-8 text-center">
        <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">{txt.noUpcomingShifts}</h2>
        <p className="text-gray-400">{txt.noShiftsMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-3xl p-6">
      
      {/* Header with navigation and display modes */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-8 h-8 text-green-400" />
          <h2 className="text-2xl font-bold text-white">{txt.myUpcomingShifts}</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Display mode selector */}
          <div className="flex items-center gap-2 bg-gray-700/30 rounded-xl p-1">
            <button
              onClick={() => {
                setViewMode('day');
                setFourDaysStartIndex(0);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'day' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              {txt.viewDay}
            </button>
            <button
              onClick={() => {
                setViewMode('fourDays');
                setFourDaysStartIndex(0);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'fourDays' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              {txt.viewFourDays}
            </button>
            <button
              onClick={() => {
                setViewMode('week');
                setFourDaysStartIndex(0);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'week' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              {txt.viewWeek}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
              title={txt.navigationPrevious}
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors font-semibold"
            >
              {txt.navigationToday}
            </button>
            
            <button
              onClick={goToNext}
              className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
              title={txt.navigationNext}
            >
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-medium">{txt.myShifts}</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalShifts}</p>
        </div>
        
        <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">{txt.confirmedShifts}</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.confirmedShifts}</p>
        </div>
        
        <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-medium">{txt.checkedInShifts}</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.checkedInShifts}</p>
        </div>
        
        <div className="bg-orange-500/20 border border-orange-500/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <span className="text-orange-300 font-medium">{txt.totalHours}</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalHours.toFixed(1)}h</p>
        </div>
      </div>

      {/* Next shift */}
      {nextShift && (
        <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/40 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-bold">{txt.nextShift}</span>
          </div>
          <div className="text-white">
            <p className="font-bold text-lg">{nextShift.title}</p>
            <p className="text-gray-300">
              {new Date(nextShift.shift_date).toLocaleDateString()} - {nextShift.start_time} to {nextShift.end_time}
            </p>
            <p className="text-sm text-gray-400">{getRoleLabel(nextShift.role_type)}</p>
          </div>
        </div>
      )}

      {/* Displayed period */}
      <div className="text-center mb-6">
        <h3 className="text-xl text-white font-semibold">
          {formatPeriodRange()}
        </h3>
        <p className="text-gray-400 text-sm mt-2">
          {txt.currentMode}: {
            viewMode === 'day' ? txt.viewDay : 
            viewMode === 'fourDays' ? txt.viewFourDays : 
            viewMode === 'month' ? txt.viewMonth :
            txt.viewWeek
          }
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-blue-300 rounded shadow-lg"></div>
          <span className="text-blue-300 font-semibold">{txt.signedUp}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 border-2 border-green-300 rounded shadow-lg"></div>
          <span className="text-green-300 font-semibold">{txt.confirmed}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-violet-600 border-2 border-purple-300 rounded shadow-lg"></div>
          <span className="text-purple-300 font-semibold">{txt.checkedIn}</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          
          {/* Days header */}
          <div className={`grid gap-px mb-2`} style={{ gridTemplateColumns: `80px repeat(${displayDates.length}, 1fr)` }}>
            <div className="p-3 text-center text-gray-400 font-semibold">{txt.hour}</div>
            {displayDates.map((date, index) => {
              const dayIndex = viewMode === 'week' ? index : weekDates.findIndex(d => d.toDateString() === date.toDateString());
              return (
                <div key={index} className="p-3 text-center">
                  <div className="text-white font-semibold">
                    {viewMode === 'day' ? txt.today : (daysOfWeek[dayIndex] || daysOfWeek[index])}
                  </div>
                  <div className={`text-sm ${isToday(date) ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
                    {formatDate(date)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="relative">
            {hoursRange.map(hour => (
              <div key={hour} className="relative">
                <div className={`grid gap-px mb-px`} style={{ gridTemplateColumns: `80px repeat(${displayDates.length}, 1fr)` }}>
                  
                  {/* Hour column */}
                  <div className="h-16 bg-gray-700/30 flex items-center justify-center text-gray-400 font-medium">
                    <span className="text-lg">{hour}:00</span>
                  </div>
                  
                  {/* Day columns */}
                  {displayDates.map((date, dayIndex) => {
                    const shiftsInSlot = getMyShiftsForSlot(date, hour);
                    const isCurrentHour = new Date().getHours() === hour && isToday(date);
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`h-16 bg-gray-700/20 border border-gray-600/20 relative ${
                          isCurrentHour ? 'bg-green-500/10 border-green-500/30' : ''
                        }`}
                      >
                        
                        {/* Shifts in this slot */}
                        {shiftsInSlot.map(shift => {
                          const isMainSlot = parseInt(shift.start_time.split(':')[0]) === hour;
                          if (!isMainSlot) return null;
                          
                          return (
                            <div
                              key={shift.id}
                              className={`absolute rounded-lg border-2 p-2 text-xs cursor-pointer z-30 group ${getMyShiftColor(shift)}`}
                              style={{
                                top: `${getShiftTop(shift)}px`,
                                height: `${getShiftHeight(shift)}px`,
                                minHeight: '48px',
                                left: '4px',
                                right: '4px',
                                width: 'calc(100% - 8px)'
                              }}
                              onClick={() => handleShiftClick(shift)}
                            >
                              <div className="font-semibold truncate">{shift.title}</div>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock size={10} />
                                <span className="text-xs">{shift.start_time.slice(0, 5)}-{shift.end_time.slice(0, 5)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User size={10} />
                                <span className="text-xs">{getStatusLabel(shift)}</span>
                              </div>
                              
                              {/* Check-in required indicator */}
                              {shift.check_in_required && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                  <CheckCircle className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shift details modal */}
      {showShiftDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{txt.shiftDetails}</h3>
              <button onClick={() => setShowShiftDetails(null)} className="text-gray-400 hover:text-white">
                <Calendar size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white">{showShiftDetails.title}</h4>
                <p className="text-gray-400">{showShiftDetails.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-blue-400" />
                    <span className="text-gray-300">{txt.time}</span>
                  </div>
                  <p className="text-white font-semibold">
                    {showShiftDetails.start_time.slice(0, 5)} - {showShiftDetails.end_time.slice(0, 5)}
                  </p>
                </div>

                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-green-400" />
                    <span className="text-gray-300">{txt.date}</span>
                  </div>
                  <p className="text-white font-semibold">
                    {new Date(showShiftDetails.shift_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-purple-400" />
                  <span className="text-gray-300">{txt.status}</span>
                </div>
                <p className="text-white font-semibold">
                  {getStatusLabel(showShiftDetails)}
                </p>
              </div>

              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-orange-400" />
                  <span className="text-gray-300">{txt.roleType}</span>
                </div>
                <p className="text-white font-semibold">
                  {getRoleLabel(showShiftDetails.role_type)}
                </p>
              </div>

              {showShiftDetails.check_in_required && (
                <div className="bg-orange-500/20 border border-orange-500/40 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-orange-400" />
                    <span className="text-orange-300 font-medium">{txt.checkInRequired}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowShiftDetails(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {txt.close}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UpcomingShiftsCalendar;