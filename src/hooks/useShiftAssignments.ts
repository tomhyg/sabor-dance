// src/hooks/useShiftAssignments.ts
import { useState, useEffect, useCallback } from 'react';
import { volunteerService, ShiftWithVolunteers, ShiftAssignmentStats } from '../services/volunteerService';

interface UseShiftAssignmentsReturn {
  // État
  shiftsWithAssignments: ShiftWithVolunteers[];
  shiftStats: Record<string, ShiftAssignmentStats>;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadShiftsWithAssignments: (eventId: string) => Promise<void>;
  getShiftAssignments: (shiftId: string) => any[];
  getAssignedVolunteerNames: (shiftId: string) => string[];
  getShiftUrgencyLevel: (shiftId: string) => {
    level: 'complete' | 'good' | 'medium' | 'urgent' | 'critical';
    color: string;
    label: string;
  };
  
  // Actions sur les bénévoles
  removeVolunteer: (signupId: string, shiftId: string) => Promise<void>;
  confirmVolunteer: (signupId: string, shiftId: string) => Promise<void>;
  checkInVolunteer: (signupId: string, shiftId: string) => Promise<void>;
  
  // Statistiques
  getUrgentShifts: () => ShiftWithVolunteers[];
  getCriticalShifts: () => ShiftWithVolunteers[];
  getCompletionRate: () => number;
}

export const useShiftAssignments = (currentUser: any): UseShiftAssignmentsReturn => {
  const [shiftsWithAssignments, setShiftsWithAssignments] = useState<ShiftWithVolunteers[]>([]);
  const [shiftStats, setShiftStats] = useState<Record<string, ShiftAssignmentStats>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les shifts avec leurs affectations
  const loadShiftsWithAssignments = useCallback(async (eventId: string) => {
    if (!currentUser?.id || (currentUser.role !== 'organizer' && currentUser.role !== 'admin')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error: shiftsError } = await volunteerService.getShiftsWithAssignments(eventId);
      
      if (shiftsError) {
        throw new Error(shiftsError.message || 'Erreur lors du chargement des affectations');
      }

      setShiftsWithAssignments(data || []);

      // Charger les statistiques pour chaque shift
      if (data) {
        const statsPromises = data.map(async (shift) => {
          const { data: stats } = await volunteerService.getShiftAssignmentStats(shift.id);
          return { shiftId: shift.id, stats };
        });

        const allStats = await Promise.all(statsPromises);
        const statsMap: Record<string, ShiftAssignmentStats> = {};
        
        allStats.forEach(({ shiftId, stats }) => {
          if (stats) {
            statsMap[shiftId] = stats;
          }
        });

        setShiftStats(statsMap);
      }

    } catch (err: any) {
      console.error('Erreur chargement affectations:', err);
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Obtenir les affectations pour un shift
  const getShiftAssignments = useCallback((shiftId: string) => {
    const shift = shiftsWithAssignments.find(s => s.id === shiftId);
    return shift?.volunteer_signups?.filter(signup => signup.status !== 'cancelled') || [];
  }, [shiftsWithAssignments]);

  // Obtenir les noms des bénévoles assignés
  const getAssignedVolunteerNames = useCallback((shiftId: string): string[] => {
    const assignments = getShiftAssignments(shiftId);
    return assignments.map(assignment => assignment.volunteer?.full_name || 'Nom inconnu');
  }, [getShiftAssignments]);

  // Calculer le niveau d'urgence d'un shift
  const getShiftUrgencyLevel = useCallback((shiftId: string) => {
    const stats = shiftStats[shiftId];
    if (!stats) {
      return { level: 'medium' as const, color: 'bg-gray-500/20 text-gray-300', label: 'Inconnu' };
    }

    const fillRate = stats.fill_percentage / 100;
    
    if (fillRate >= 1) return { level: 'complete' as const, color: 'bg-green-500/20 text-green-300', label: 'Complet' };
    if (fillRate >= 0.75) return { level: 'good' as const, color: 'bg-lime-500/20 text-lime-300', label: 'Bien rempli' };
    if (fillRate >= 0.5) return { level: 'medium' as const, color: 'bg-yellow-500/20 text-yellow-300', label: 'À surveiller' };
    if (fillRate >= 0.25) return { level: 'urgent' as const, color: 'bg-orange-500/20 text-orange-300', label: 'Urgent' };
    return { level: 'critical' as const, color: 'bg-red-500/20 text-red-300', label: 'Critique' };
  }, [shiftStats]);

  // Actions sur les bénévoles
  const removeVolunteer = useCallback(async (signupId: string, shiftId: string) => {
    try {
      const { error } = await volunteerService.removeVolunteerFromShift(signupId, currentUser?.id);
      
      if (error) {
        throw new Error(error.message || 'Erreur lors de la suppression');
      }

      // Mettre à jour l'état local
      setShiftsWithAssignments(shifts => 
        shifts.map(shift => {
          if (shift.id === shiftId) {
            return {
              ...shift,
              volunteer_signups: shift.volunteer_signups?.map(signup =>
                signup.id === signupId 
                  ? { ...signup, status: 'cancelled' as const }
                  : signup
              )
            };
          }
          return shift;
        })
      );

      // Recharger les stats
      const { data: newStats } = await volunteerService.getShiftAssignmentStats(shiftId);
      if (newStats) {
        setShiftStats(prev => ({ ...prev, [shiftId]: newStats }));
      }

    } catch (err: any) {
      console.error('Erreur suppression bénévole:', err);
      throw err;
    }
  }, [currentUser]);

  const confirmVolunteer = useCallback(async (signupId: string, shiftId: string) => {
    try {
      const { error } = await volunteerService.confirmVolunteer(signupId, currentUser?.id);
      
      if (error) {
        throw new Error(error.message || 'Erreur lors de la confirmation');
      }

      // Mettre à jour l'état local
      setShiftsWithAssignments(shifts => 
        shifts.map(shift => {
          if (shift.id === shiftId) {
            return {
              ...shift,
              volunteer_signups: shift.volunteer_signups?.map(signup =>
                signup.id === signupId 
                  ? { ...signup, status: 'confirmed' as const }
                  : signup
              )
            };
          }
          return shift;
        })
      );

    } catch (err: any) {
      console.error('Erreur confirmation bénévole:', err);
      throw err;
    }
  }, [currentUser]);

  const checkInVolunteer = useCallback(async (signupId: string, shiftId: string) => {
    try {
      const { error } = await volunteerService.checkIn(signupId, currentUser?.id, 'manual');
      
      if (error) {
        throw new Error(error.message || 'Erreur lors du check-in');
      }

      // Mettre à jour l'état local
      setShiftsWithAssignments(shifts => 
        shifts.map(shift => {
          if (shift.id === shiftId) {
            return {
              ...shift,
              volunteer_signups: shift.volunteer_signups?.map(signup =>
                signup.id === signupId 
                  ? { 
                      ...signup, 
                      status: 'checked_in' as const,
                      checked_in_at: new Date().toISOString()
                    }
                  : signup
              )
            };
          }
          return shift;
        })
      );

      // Recharger les stats
      const { data: newStats } = await volunteerService.getShiftAssignmentStats(shiftId);
      if (newStats) {
        setShiftStats(prev => ({ ...prev, [shiftId]: newStats }));
      }

    } catch (err: any) {
      console.error('Erreur check-in bénévole:', err);
      throw err;
    }
  }, [currentUser]);

  // Statistiques globales
  const getUrgentShifts = useCallback(() => {
    return shiftsWithAssignments.filter(shift => {
      const urgency = getShiftUrgencyLevel(shift.id);
      return urgency.level === 'urgent';
    });
  }, [shiftsWithAssignments, getShiftUrgencyLevel]);

  const getCriticalShifts = useCallback(() => {
    return shiftsWithAssignments.filter(shift => {
      const urgency = getShiftUrgencyLevel(shift.id);
      return urgency.level === 'critical';
    });
  }, [shiftsWithAssignments, getShiftUrgencyLevel]);

  const getCompletionRate = useCallback(() => {
    if (shiftsWithAssignments.length === 0) return 0;
    
    const totalSpots = shiftsWithAssignments.reduce((sum, shift) => sum + shift.max_volunteers, 0);
    const filledSpots = shiftsWithAssignments.reduce((sum, shift) => {
      const assignments = getShiftAssignments(shift.id);
      return sum + assignments.length;
    }, 0);
    
    return Math.round((filledSpots / totalSpots) * 100);
  }, [shiftsWithAssignments, getShiftAssignments]);

  return {
    // État
    shiftsWithAssignments,
    shiftStats,
    loading,
    error,
    
    // Actions
    loadShiftsWithAssignments,
    getShiftAssignments,
    getAssignedVolunteerNames,
    getShiftUrgencyLevel,
    
    // Actions sur les bénévoles
    removeVolunteer,
    confirmVolunteer,
    checkInVolunteer,
    
    // Statistiques
    getUrgentShifts,
    getCriticalShifts,
    getCompletionRate
  };
};
