// src/services/notificationScheduler.ts - VERSION CORRIGÉE
import { supabase } from '../lib/supabase';
import { EmailService } from './emailService';

export class NotificationScheduler {
  private emailService: EmailService;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  constructor() {
    this.emailService = new EmailService();
    console.log('🕐 NotificationScheduler initialized');
  }

  // 🚀 Start scheduler
  start() {
    if (this.isRunning) {
      console.log('⚠️ Scheduler already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting notification scheduler');

    // Check every hour
    const hourlyCheck = setInterval(() => {
      this.checkHourlyNotifications();
    }, 60 * 60 * 1000); // 1 hour

    // Check daily at 9 AM
    const dailyCheck = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 9 && now.getMinutes() < 5) {
        this.checkDailyNotifications();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Check immediate notifications every 5 minutes
    const immediateCheck = setInterval(() => {
      this.checkImmediateNotifications();
    }, 5 * 60 * 1000); // 5 minutes

    this.intervals.set('hourly', hourlyCheck);
    this.intervals.set('daily', dailyCheck);
    this.intervals.set('immediate', immediateCheck);

    console.log('✅ Scheduler started successfully');
  }

  // ⏰ Hourly checks (imminent shifts)
  private async checkHourlyNotifications() {
    console.log('🔔 Checking hourly notifications...');
    
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Get shifts starting in 1h or 15min
      const { data: upcomingShifts } = await supabase
        .from('volunteer_shifts')
        .select(`
          *,
          volunteer_signups (
            volunteer_id,
            status,
            users (full_name, email)
          )
        `)
        .eq('status', 'live')
        .gte('shift_date', now.toISOString().split('T')[0])
        .lte('shift_date', oneHourFromNow.toISOString().split('T')[0]);

      if (upcomingShifts) {
        for (const shift of upcomingShifts) {
          const shiftDateTime = new Date(`${shift.shift_date}T${shift.start_time}`);
          const timeDiff = shiftDateTime.getTime() - now.getTime();
          const hoursUntil = timeDiff / (1000 * 60 * 60);
          const minutesUntil = timeDiff / (1000 * 60);

          // 1h reminder
          if (hoursUntil <= 1 && hoursUntil > 0.75) {
            await this.sendShiftReminders(shift, Math.round(hoursUntil));
          }

          // 15min reminder
          if (minutesUntil <= 15 && minutesUntil > 10) {
            await this.sendShiftReminders(shift, Math.round(minutesUntil / 60));
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in hourly check:', error);
    }
  }

  // 📅 Daily checks (general reminders)
  private async checkDailyNotifications() {
    console.log('🔔 Checking daily notifications...');
    
    try {
      const tasks = [
        this.checkVolunteerReminders(),
        this.checkTeamReminders(),
        this.checkOrganizerAlerts(),
        this.checkDeadlineReminders()
      ];

      await Promise.all(tasks);
      console.log('✅ Daily checks completed');
    } catch (error) {
      console.error('❌ Error in daily check:', error);
    }
  }

  // 🔄 Immediate checks (critical events)
  private async checkImmediateNotifications() {
    console.log('🔔 Checking immediate notifications...');
    
    try {
      // Check critical shifts (without volunteers)
      await this.checkCriticalShifts();
      
      // Check teams pending too long
      await this.checkPendingTeams();
      
    } catch (error) {
      console.error('❌ Error in immediate check:', error);
    }
  }

  // 🙋‍♀️ Volunteer reminders
  private async checkVolunteerReminders() {
    console.log('🙋‍♀️ Checking volunteer reminders...');
    
    // Get volunteers and their signups
    const { data: volunteers } = await supabase
      .from('users')
      .select(`
        *,
        volunteer_signups (
          *,
          volunteer_shifts (*)
        )
      `)
      .eq('role', 'volunteer');

    if (!volunteers) return;

    // 🎯 CORRECTION: Supprimer .raw() et utiliser une requête simple
    const { data: availableShifts } = await supabase
      .from('volunteer_shifts')
      .select('*')
      .eq('status', 'live')
      .gte('shift_date', new Date().toISOString().split('T')[0]);

    if (!availableShifts) return;

    // 🎯 CORRECTION: Filtrer côté client
    const filteredShifts = availableShifts.filter(shift => 
      shift.current_volunteers < shift.max_volunteers
    );

    for (const volunteer of volunteers) {
      const signups = volunteer.volunteer_signups || [];
      const completedHours = this.calculateCompletedHours(signups);
      const requiredHours = await this.getRequiredHours();
      
      // Calculate days until event
      const daysUntilEvent = this.calculateDaysUntilEvent();
      
      // 🎯 CORRECTION: Ajouter await
      const shouldSendReminder = await this.shouldSendVolunteerReminder(
        completedHours,
        requiredHours,
        daysUntilEvent,
        volunteer.email
      );

      if (shouldSendReminder) {
        await this.emailService.sendTemplatedEmail({
          type: 'volunteer_signup_reminder',
          data: {
            userName: volunteer.full_name,
            hoursCompleted: completedHours,
            hoursRequired: requiredHours,
            availableShifts: filteredShifts.slice(0, 5),
            daysUntilEvent
          }
        }, volunteer.email);

        // Record email sent to avoid spam
        await this.recordEmailSent(volunteer.id, 'volunteer_signup_reminder');
      }
    }
  }

  // 💃 Team reminders
  private async checkTeamReminders() {
    console.log('💃 Checking team reminders...');
    
    const { data: teams } = await supabase
      .from('performance_teams')
      .select(`
        *,
        users (full_name, email)
      `)
      .in('status', ['draft', 'submitted']);

    if (!teams) return;

    for (const team of teams) {
      const missingElements = this.checkMissingTeamElements(team);
      const daysUntilDeadline = this.calculateDaysUntilDeadline(team);
      
      // 🎯 CORRECTION: Ajouter await
      if (missingElements.length > 0) {
        const shouldSendReminder = await this.shouldSendTeamReminder(
          daysUntilDeadline,
          missingElements.length,
          team.director_email
        );

        if (shouldSendReminder) {
          await this.emailService.sendTemplatedEmail({
            type: 'team_deadline_reminder',
            data: {
              directorName: team.users?.full_name || team.director_name,
              teamName: team.team_name,
              daysUntilDeadline,
              missingElements
            }
          }, team.users?.email || team.director_email);

          await this.recordEmailSent(team.id, 'team_deadline_reminder');
        }
      }
    }
  }

  // 👔 Organizer alerts
  private async checkOrganizerAlerts() {
    console.log('👔 Checking organizer alerts...');
    
    const { data: organizers } = await supabase
      .from('users')
      .select('*')
      .in('role', ['organizer', 'admin']);

    if (!organizers) return;

    // Get critical shifts
    const { data: criticalShifts } = await supabase
      .from('volunteer_shifts')
      .select('*')
      .eq('status', 'live')
      .eq('current_volunteers', 0)
      .gte('shift_date', new Date().toISOString().split('T')[0]);

    // Get pending teams
    const { data: pendingTeams } = await supabase
      .from('performance_teams')
      .select('*')
      .eq('status', 'submitted');

    if (!criticalShifts || !pendingTeams) return;

    // Calculate statistics
    const stats = await this.calculateOrganizerStats();

    // Send alerts if necessary
    if (criticalShifts.length > 0 || pendingTeams.length > 5) {
      for (const organizer of organizers) {
        // 🎯 CORRECTION: Ajouter await
        const shouldSendAlert = await this.shouldSendOrganizerAlert(
          criticalShifts.length,
          pendingTeams.length,
          organizer.email
        );

        if (shouldSendAlert) {
          await this.emailService.sendTemplatedEmail({
            type: 'organizer_alert',
            data: {
              organizerName: organizer.full_name,
              criticalShifts,
              pendingTeams,
              stats
            }
          }, organizer.email);

          await this.recordEmailSent(organizer.id, 'organizer_alert');
        }
      }
    }
  }

  // 📅 Deadline reminders
  private async checkDeadlineReminders() {
    console.log('📅 Checking deadline reminders...');
    
    // Get events with their deadlines
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'live');

    if (!events) return;

    for (const event of events) {
      if (event.team_submission_deadline) {
        const deadline = new Date(event.team_submission_deadline);
        const now = new Date();
        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Reminders at 7 days, 3 days, 1 day
        if ([7, 3, 1].includes(daysUntilDeadline)) {
          await this.sendDeadlineReminders(event, daysUntilDeadline);
        }
      }
    }
  }

  // 🚨 Check critical shifts
  private async checkCriticalShifts() {
    const { data: criticalShifts } = await supabase
      .from('volunteer_shifts')
      .select('*')
      .eq('status', 'live')
      .eq('current_volunteers', 0)
      .gte('shift_date', new Date().toISOString().split('T')[0]);

    if (criticalShifts && criticalShifts.length > 0) {
      console.log(`🚨 ${criticalShifts.length} critical shifts detected`);
      
      // Notify organizers if more than 3 critical shifts
      if (criticalShifts.length >= 3) {
        await this.notifyOrganizersOfCriticalShifts(criticalShifts);
      }
    }
  }

  // 📋 Check pending teams
  private async checkPendingTeams() {
    const { data: pendingTeams } = await supabase
      .from('performance_teams')
      .select('*')
      .eq('status', 'submitted')
      .lt('submitted_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()); // More than 3 days

    if (pendingTeams && pendingTeams.length > 0) {
      console.log(`📋 ${pendingTeams.length} teams pending for >3 days`);
      await this.notifyOrganizersOfPendingTeams(pendingTeams);
    }
  }

  // 📧 Send shift reminders
  private async sendShiftReminders(shift: any, hoursUntil: number) {
    console.log(`📧 Sending reminders for shift ${shift.title} in ${hoursUntil}h`);
    
    const signups = shift.volunteer_signups || [];
    const validSignups = signups.filter((signup: any) => 
      signup.status === 'signed_up' && signup.users?.email
    );

    for (const signup of validSignups) {
      try {
        await this.emailService.sendTemplatedEmail({
          type: 'volunteer_shift_reminder',
          data: {
            userName: signup.users.full_name,
            shift,
            hoursUntilShift: hoursUntil,
            emergencyContact: shift.emergency_contact_name || 'BSF Organization',
            meetingLocation: shift.meeting_location || 'Main Hall'
          }
        }, signup.users.email);

        // Mark reminder as sent
        await supabase
          .from('volunteer_signups')
          .update({ 
            reminder_sent: true, 
            reminder_sent_at: new Date().toISOString() 
          })
          .eq('id', signup.id);

      } catch (error) {
        console.error(`❌ Error sending reminder to ${signup.users.email}:`, error);
      }
    }
  }

  // 📅 Send deadline reminders
  private async sendDeadlineReminders(event: any, daysUntil: number) {
    console.log(`📅 Sending deadline reminders in ${daysUntil} days`);
    
    // Get incomplete teams
    const { data: incompleteTeams } = await supabase
      .from('performance_teams')
      .select(`
        *,
        users (full_name, email)
      `)
      .eq('event_id', event.id)
      .eq('status', 'draft');

    if (!incompleteTeams) return;

    for (const team of incompleteTeams) {
      const missingElements = this.checkMissingTeamElements(team);
      
      if (missingElements.length > 0) {
        await this.emailService.sendTemplatedEmail({
          type: 'team_deadline_reminder',
          data: {
            directorName: team.users?.full_name || team.director_name,
            teamName: team.team_name,
            daysUntilDeadline: daysUntil,
            missingElements
          }
        }, team.users?.email || team.director_email);
      }
    }
  }

  // 🔧 Utility functions
  // 🎯 CORRECTION: Même logique que notificationService pour cohérence
  private calculateCompletedHours(signups: any[]): number {
    return signups
      .filter(s => ['signed_up', 'confirmed', 'checked_in'].includes(s.status) && s.volunteer_shifts)
      .reduce((total, signup) => {
        const shift = signup.volunteer_shifts;
        const start = new Date(`2000-01-01T${shift.start_time}`);
        const end = new Date(`2000-01-01T${shift.end_time}`);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);
  }

  private async getRequiredHours(): Promise<number> {
    const { data: event } = await supabase
      .from('events')
      .select('required_volunteer_hours')
      .eq('status', 'live')
      .single();
    
    return event?.required_volunteer_hours || 9;
  }

  private calculateDaysUntilEvent(): number {
    // TODO: Calculate from events table
    const eventDate = new Date('2025-03-15'); // To be replaced with real date
    const now = new Date();
    return Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateDaysUntilDeadline(team: any): number {
    // TODO: Calculate from event deadline
    const deadline = new Date('2025-02-15'); // To be replaced with real deadline
    const now = new Date();
    return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  // 🎯 CORRECTION: Typer explicitement le tableau
  private checkMissingTeamElements(team: any): string[] {
    const missing: string[] = [];
    if (!team.music_file_url) missing.push('Music file');
    if (!team.team_photo_url) missing.push('Team photo');
    if (!team.performance_video_url) missing.push('Performance video');
    if (!team.performers || team.performers.length === 0) missing.push('Member list');
    if (!team.song_title) missing.push('Song title');
    if (!team.song_artist) missing.push('Song artist');
    return missing;
  }

  private async calculateOrganizerStats(): Promise<any> {
    const { data: totalVolunteers } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('role', 'volunteer');

    const { data: signedUpVolunteers } = await supabase
      .from('volunteer_signups')
      .select('volunteer_id', { count: 'exact' })
      .eq('status', 'signed_up');

    const totalCount = totalVolunteers?.length || 0;
    const signedUpCount = signedUpVolunteers?.length || 0;

    return {
      totalVolunteers: totalCount,
      signedUpVolunteers: signedUpCount,
      volunteerProgress: totalCount > 0 ? Math.round((signedUpCount / totalCount) * 100) : 0
    };
  }

  // 📊 Email sending verification functions
  private async shouldSendVolunteerReminder(
    completedHours: number,
    requiredHours: number,
    daysUntilEvent: number,
    email: string
  ): Promise<boolean> {
    if (completedHours >= requiredHours) return false;
    
    // Check if email was sent recently
    const lastSent = await this.getLastEmailSent(email, 'volunteer_signup_reminder');
    if (lastSent && (Date.now() - lastSent.getTime()) < 24 * 60 * 60 * 1000) {
      return false; // No more than one email per day
    }
    
    // Sending logic based on remaining days
    if (daysUntilEvent <= 7) return true; // Urgent
    if (daysUntilEvent <= 14 && completedHours < requiredHours / 2) return true; // Half time
    if (daysUntilEvent <= 30 && completedHours === 0) return true; // No signup
    
    return false;
  }

  private async shouldSendTeamReminder(
    daysUntilDeadline: number,
    missingCount: number,
    email: string
  ): Promise<boolean> {
    const lastSent = await this.getLastEmailSent(email, 'team_deadline_reminder');
    if (lastSent && (Date.now() - lastSent.getTime()) < 24 * 60 * 60 * 1000) {
      return false;
    }
    
    // Sending logic based on urgency
    if (daysUntilDeadline <= 1) return true; // Very urgent
    if (daysUntilDeadline <= 3 && missingCount > 2) return true; // Urgent with many missing
    if (daysUntilDeadline <= 7 && missingCount > 0) return true; // Moderately urgent
    if (daysUntilDeadline <= 14 && missingCount > 3) return true; // Many missing elements
    
    return false;
  }

  private async shouldSendOrganizerAlert(
    criticalShiftsCount: number,
    pendingTeamsCount: number,
    email: string
  ): Promise<boolean> {
    const lastSent = await this.getLastEmailSent(email, 'organizer_alert');
    if (lastSent && (Date.now() - lastSent.getTime()) < 4 * 60 * 60 * 1000) {
      return false; // No more than one email every 4 hours
    }
    
    // Alert thresholds
    if (criticalShiftsCount >= 5) return true; // Many critical shifts
    if (pendingTeamsCount >= 10) return true; // Many pending teams
    if (criticalShiftsCount >= 2 && pendingTeamsCount >= 5) return true; // Combined situation
    
    return false;
  }

  // 📊 Organizer notification functions
  private async notifyOrganizersOfCriticalShifts(criticalShifts: any[]) {
    const { data: organizers } = await supabase
      .from('users')
      .select('*')
      .in('role', ['organizer', 'admin']);

    if (!organizers) return;

    for (const organizer of organizers) {
      const shouldNotify = await this.shouldSendOrganizerAlert(
        criticalShifts.length,
        0,
        organizer.email
      );

      if (shouldNotify) {
        await this.emailService.sendTemplatedEmail({
          type: 'organizer_alert',
          data: {
            organizerName: organizer.full_name,
            criticalShifts,
            pendingTeams: [],
            stats: await this.calculateOrganizerStats()
          }
        }, organizer.email);

        await this.recordEmailSent(organizer.id, 'organizer_alert');
      }
    }
  }

  private async notifyOrganizersOfPendingTeams(pendingTeams: any[]) {
    const { data: organizers } = await supabase
      .from('users')
      .select('*')
      .in('role', ['organizer', 'admin']);

    if (!organizers) return;

    for (const organizer of organizers) {
      const shouldNotify = await this.shouldSendOrganizerAlert(
        0,
        pendingTeams.length,
        organizer.email
      );

      if (shouldNotify) {
        await this.emailService.sendTemplatedEmail({
          type: 'organizer_alert',
          data: {
            organizerName: organizer.full_name,
            criticalShifts: [],
            pendingTeams,
            stats: await this.calculateOrganizerStats()
          }
        }, organizer.email);

        await this.recordEmailSent(organizer.id, 'organizer_alert');
      }
    }
  }

  // 📊 Email log management
  private async recordEmailSent(userId: string, emailType: string) {
    try {
      await supabase
        .from('email_notifications_log')
        .insert({
          user_id: userId,
          email_type: emailType,
          sent_at: new Date().toISOString(),
          status: 'sent'
        });
    } catch (error) {
      console.warn('Error recording email log:', error);
    }
  }

  private async getLastEmailSent(userEmail: string, emailType: string): Promise<Date | null> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (!user) return null;

      const { data: log } = await supabase
        .from('email_notifications_log')
        .select('sent_at')
        .eq('user_id', user.id)
        .eq('email_type', emailType)
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      return log ? new Date(log.sent_at) : null;
    } catch (error) {
      console.warn('Error getting last email:', error);
      return null;
    }
  }

  // 📈 Monitoring functions
  getStatus(): { isRunning: boolean; intervals: string[] } {
    return {
      isRunning: this.isRunning,
      intervals: Array.from(this.intervals.keys())
    };
  }

  async getStats(): Promise<any> {
    try {
      const { data: emailsSent } = await supabase
        .from('email_notifications_log')
        .select('email_type, sent_at')
        .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: criticalShifts } = await supabase
        .from('volunteer_shifts')
        .select('id')
        .eq('status', 'live')
        .eq('current_volunteers', 0);

      const { data: pendingTeams } = await supabase
        .from('performance_teams')
        .select('id')
        .eq('status', 'submitted');

      return {
        emailsSent24h: emailsSent?.length || 0,
        criticalShifts: criticalShifts?.length || 0,
        pendingTeams: pendingTeams?.length || 0,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }

  // 🧪 Test functions
  async testNotifications(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing notifications...');
      
      // Test email sending
      const testResult = await this.emailService.sendTestEmail(
        'volunteer',
        'test@example.com'
      );
      
      if (testResult.success) {
        return { success: true, message: 'Test successful' };
      } else {
        return { success: false, message: testResult.error || 'Test failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Test error' 
      };
    }
  }

  async forceCheck(type: 'hourly' | 'daily' | 'immediate'): Promise<void> {
    console.log(`🔄 Force check: ${type}`);
    
    switch (type) {
      case 'hourly':
        await this.checkHourlyNotifications();
        break;
      case 'daily':
        await this.checkDailyNotifications();
        break;
      case 'immediate':
        await this.checkImmediateNotifications();
        break;
    }
  }

  // 🛑 Stop scheduler
  stop() {
    console.log('🛑 Stopping scheduler');
    
    this.intervals.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`✅ Interval ${name} stopped`);
    });
    
    this.intervals.clear();
    this.isRunning = false;
    
    console.log('🔴 Scheduler stopped');
  }

  // 🔄 Restart scheduler
  restart() {
    console.log('🔄 Restarting scheduler');
    this.stop();
    setTimeout(() => this.start(), 1000);
  }
}