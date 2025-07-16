import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, X, UserCheck, AlertTriangle, QrCode, Star, TrendingUp, MapPin, Phone, MessageSquare } from 'lucide-react';

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

interface VolunteerDashboardProps {
  currentUser: any;
  volunteerShifts: VolunteerShift[];
  volunteerSignups: VolunteerSignup[];
  setVolunteerSignups: React.Dispatch<React.SetStateAction<VolunteerSignup[]>>;
  setVolunteerShifts: React.Dispatch<React.SetStateAction<VolunteerShift[]>>;
  onClose: () => void;
}

const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  currentUser,
  volunteerShifts,
  volunteerSignups,
  setVolunteerSignups,
  setVolunteerShifts,
  onClose
}) => {
  const [checkInFeedback, setCheckInFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const requiredHours = 9;

  // Get MY shifts
  const mySignups = volunteerSignups.filter(signup => 
    signup.volunteer_id === currentUser?.id && 
    signup.status !== 'cancelled'
  );

  const myShifts = volunteerShifts.filter(shift => 
    mySignups.some(signup => signup.shift_id === shift.id)
  ).map(shift => {
    const signup = mySignups.find(s => s.shift_id === shift.id);
    return { ...shift, signup };
  });

  // Calculate my hours
  const completedHours = myShifts.reduce((total, shift) => {
    const start = new Date(`2000-01-01T${shift.start_time}`);
    const end = new Date(`2000-01-01T${shift.end_time}`);
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  const remainingHours = Math.max(0, requiredHours - completedHours);
  const progressPercentage = Math.min((completedHours / requiredHours) * 100, 100);

  // Sort my shifts by date/time
  const sortedMyShifts = myShifts.sort((a, b) => {
    const dateA = new Date(`${a.shift_date}T${a.start_time}`);
    const dateB = new Date(`${b.shift_date}T${b.start_time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Separate past and future shifts
  const now = new Date();
  const upcomingShifts = sortedMyShifts.filter(shift => {
    const shiftDate = new Date(`${shift.shift_date}T${shift.start_time}`);
    return shiftDate > now;
  });

  const pastShifts = sortedMyShifts.filter(shift => {
    const shiftDate = new Date(`${shift.shift_date}T${shift.start_time}`);
    return shiftDate <= now;
  });

  // Next shift
  const nextShift = upcomingShifts[0];

  // Check-in function
  const handleCheckIn = (shiftId: string) => {
    const signup = mySignups.find(s => s.shift_id === shiftId);
    if (!signup) return;

    setVolunteerSignups(signups =>
      signups.map(s =>
        s.id === signup.id 
          ? { ...s, status: 'checked_in' as const, checked_in_at: new Date().toISOString() }
          : s
      )
    );

    setCheckInFeedback({
      type: 'success', 
      message: '✅ You are now checked in for this shift!'
    });
    
    setTimeout(() => setCheckInFeedback(null), 4000);
  };

  // Unsubscribe
  const handleUnsubscribe = (shiftId: string) => {
    const signup = mySignups.find(s => s.shift_id === shiftId);
    if (!signup) return;

    setVolunteerSignups(signups =>
      signups.map(s =>
        s.id === signup.id ? { ...s, status: 'cancelled' as const } : s
      )
    );

    setVolunteerShifts(shifts =>
      shifts.map(s =>
        s.id === shiftId 
          ? { 
              ...s, 
              current_volunteers: Math.max(0, s.current_volunteers - 1),
              status: s.current_volunteers - 1 < s.max_volunteers ? 'live' : s.status
            }
          : s
      )
    );

    setCheckInFeedback({
      type: 'success', 
      message: '✅ You have been unsubscribed from this shift'
    });
    
    setTimeout(() => setCheckInFeedback(null), 4000);
  };

  // Helper to know if we can check in
  const canCheckIn = (shift: any) => {
    const now = new Date();
    const shiftStart = new Date(`${shift.shift_date}T${shift.start_time}`);
    const shiftEnd = new Date(`${shift.shift_date}T${shift.end_time}`);
    
    // Can check in 30min before until end of shift
    const checkInWindow = new Date(shiftStart.getTime() - 30 * 60 * 1000);
    
    return now >= checkInWindow && now <= shiftEnd && shift.signup?.status !== 'checked_in';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/30 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="relative p-8 pb-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">My Volunteer Dashboard</h1>
              <p className="text-green-300 text-lg">{currentUser?.full_name}</p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          
          {/* Feedback */}
          {checkInFeedback && (
            <div className={`mb-6 p-4 rounded-xl border-2 ${
              checkInFeedback.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center gap-3">
                {checkInFeedback.type === 'success' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}
                <span className="font-semibold">{checkInFeedback.message}</span>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                My Progress
              </h2>
              <div className="text-right">
                <div className="text-3xl font-black text-white">{completedHours.toFixed(1)}h</div>
                <div className="text-green-400 font-semibold">/ {requiredHours}h</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-700/50 rounded-full h-6 mb-4">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-6 rounded-full transition-all duration-500 shadow-lg relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">
                {remainingHours > 0 ? `${remainingHours.toFixed(1)}h remaining` : 'Goal achieved! 🎉'}
              </span>
              <span className="text-green-400 font-bold">{Math.round(progressPercentage)}%</span>
            </div>

            {completedHours >= requiredHours && (
              <div className="mt-4 p-4 bg-green-500/20 border border-green-400/30 rounded-xl">
                <div className="flex items-center gap-3 text-green-300">
                  <Star className="w-6 h-6" />
                  <span className="font-bold text-lg">Congratulations! You've completed your volunteer hours! 🎊</span>
                </div>
              </div>
            )}
          </div>

          {/* Next shift */}
          {nextShift && (
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-3xl p-6 mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-400" />
                Next Shift
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-2xl font-bold text-blue-300 mb-2">{nextShift.title}</h4>
                  <p className="text-gray-300 mb-4">{nextShift.description}</p>
                  <div className="space-y-2 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-400" />
                      <span>{new Date(nextShift.shift_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-blue-400" />
                      <span>{nextShift.start_time} - {nextShift.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-blue-400" />
                      <span>Location: Main Hall (detailed info via email)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center items-center gap-4">
                  {canCheckIn(nextShift) ? (
                    <button
                      onClick={() => handleCheckIn(nextShift.id)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
                    >
                      ✋ I'm here!
                    </button>
                  ) : nextShift.signup?.status === 'checked_in' ? (
                    <div className="bg-green-500/20 text-green-300 px-8 py-4 rounded-2xl font-bold text-lg border border-green-500/30">
                      ✅ You're checked in
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-gray-600/30 text-gray-400 px-6 py-3 rounded-xl font-semibold border border-gray-500/30 mb-2">
                        Check-in available 30min before
                      </div>
                      <p className="text-gray-500 text-sm">Come back later to check in</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleUnsubscribe(nextShift.id)}
                    className="bg-red-500/20 text-red-300 px-6 py-2 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                  >
                    Unsubscribe
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* My shifts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Upcoming shifts */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Calendar className="w-7 h-7 text-orange-400" />
                Upcoming Shifts ({upcomingShifts.length})
              </h3>
              
              <div className="space-y-4">
                {upcomingShifts.length === 0 ? (
                  <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-6 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No upcoming shifts</p>
                    <p className="text-gray-500 text-sm">Sign up for more shifts!</p>
                  </div>
                ) : (
                  upcomingShifts.map(shift => (
                    <div key={shift.id} className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-white">{shift.title}</h4>
                          <p className="text-gray-400 text-sm">{shift.description}</p>
                        </div>
                        {shift.signup?.status === 'checked_in' && (
                          <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold">
                            ✅ Checked in
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{new Date(shift.shift_date).toLocaleDateString('en-US')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{shift.start_time} - {shift.end_time}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {canCheckIn(shift) && shift.signup?.status !== 'checked_in' && (
                          <button
                            onClick={() => handleCheckIn(shift.id)}
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                          >
                            I'm here
                          </button>
                        )}
                        <button
                          onClick={() => handleUnsubscribe(shift.id)}
                          className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Unsubscribe
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Past shifts */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CheckCircle className="w-7 h-7 text-green-400" />
                Completed Shifts ({pastShifts.length})
              </h3>
              
              <div className="space-y-4">
                {pastShifts.length === 0 ? (
                  <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No completed shifts</p>
                  </div>
                ) : (
                  pastShifts.map(shift => (
                    <div key={shift.id} className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-white">{shift.title}</h4>
                          <p className="text-gray-400 text-sm">{shift.description}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          shift.signup?.status === 'checked_in' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {shift.signup?.status === 'checked_in' ? '✅ Present' : '❌ Absent'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{new Date(shift.shift_date).toLocaleDateString('en-US')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{shift.start_time} - {shift.end_time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 text-center">
              <QrCode className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">My QR Code</h4>
              <p className="text-gray-400 text-sm mb-4">For quick check-in</p>
              <button className="bg-gray-500/20 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed font-semibold" disabled>
                Coming Soon
              </button>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
              <Phone className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Emergency Contact</h4>
              <p className="text-gray-400 text-sm mb-4">In case of issues</p>
              <button className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors font-semibold">
                +1 (617) 555-0123
              </button>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 text-center">
              <MessageSquare className="w-12 h-12 text-orange-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">WhatsApp Group</h4>
              <p className="text-gray-400 text-sm mb-4">BSF volunteers chat</p>
              <button className="bg-gray-500/20 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed font-semibold" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;