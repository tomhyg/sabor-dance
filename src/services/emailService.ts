// src/services/emailService.ts
import { supabase } from '../lib/supabase';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailTemplate {
  type: 'volunteer_signup_reminder' | 'volunteer_shift_reminder' | 'team_deadline_reminder' | 'organizer_alert';
  data: any;
}

export class EmailService {
  private readonly apiKey: string;
  private readonly fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY!;
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@bostonsalsafest.com';
  }

  // 📧 Envoyer un email via Resend
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 Envoi email vers:', emailData.to);
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          from: emailData.from || this.fromEmail,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Erreur envoi email:', error);
        return { success: false, error };
      }

      const result = await response.json();
      console.log('✅ Email envoyé avec succès:', result.id);
      
      // Sauvegarder en base pour tracking
      await this.saveEmailLog(emailData, result.id);
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur EmailService:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 📧 Envoyer avec template
  async sendTemplatedEmail(template: EmailTemplate, userEmail: string): Promise<{ success: boolean; error?: string }> {
    const emailContent = this.generateEmailContent(template);
    
    if (!emailContent) {
      return { success: false, error: 'Template non trouvé' };
    }

    return this.sendEmail({
      to: userEmail,
      subject: emailContent.subject,
      html: emailContent.html
    });
  }

  // 🎨 Générer le contenu des emails
  private generateEmailContent(template: EmailTemplate): { subject: string; html: string } | null {
    switch (template.type) {
      case 'volunteer_signup_reminder':
        return this.generateVolunteerSignupReminder(template.data);
      
      case 'volunteer_shift_reminder':
        return this.generateVolunteerShiftReminder(template.data);
      
      case 'team_deadline_reminder':
        return this.generateTeamDeadlineReminder(template.data);
      
      case 'organizer_alert':
        return this.generateOrganizerAlert(template.data);
      
      default:
        return null;
    }
  }

  // 🙋‍♀️ Template bénévole - Rappel inscription
  private generateVolunteerSignupReminder(data: {
    userName: string;
    hoursCompleted: number;
    hoursRequired: number;
    availableShifts: any[];
    daysUntilEvent: number;
  }): { subject: string; html: string } {
    const progressPercent = Math.round((data.hoursCompleted / data.hoursRequired) * 100);
    
    return {
      subject: `Rappel : Complète tes heures bénévoles (${data.hoursCompleted}/${data.hoursRequired}h)`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rappel Bénévolat</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
            .progress-section { margin: 30px 0; }
            .progress-text { font-size: 18px; color: #374151; margin-bottom: 15px; }
            .progress-bar { background: #e5e7eb; border-radius: 10px; height: 24px; position: relative; overflow: hidden; }
            .progress-fill { background: linear-gradient(90deg, #10b981, #059669); height: 100%; border-radius: 10px; transition: width 0.3s ease; }
            .progress-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 14px; font-weight: 600; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
            .shifts-section { margin: 30px 0; }
            .shifts-title { font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
            .shift-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 15px 0; }
            .shift-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 10px; }
            .shift-details { font-size: 14px; color: #6b7280; line-height: 1.5; }
            .shift-details div { margin-bottom: 5px; }
            .btn { background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; display: inline-block; margin: 30px 0; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
            .btn:hover { transform: translateY(-2px); }
            .countdown { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
            .countdown-text { font-size: 16px; font-weight: 600; color: #92400e; }
            .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
            .footer a { color: #8B5CF6; text-decoration: none; }
            .emoji { font-size: 20px; margin: 0 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1><span class="emoji">💃</span> Boston Salsa Festival <span class="emoji">🕺</span></h1>
              <p>Rappel Bénévolat</p>
            </div>
            
            <div class="content">
              <div class="greeting">Salut ${data.userName} ! 👋</div>
              
              <div class="progress-section">
                <div class="progress-text">Tu as complété <strong>${data.hoursCompleted}h</strong> sur les <strong>${data.hoursRequired}h</strong> requises pour le festival.</div>
                
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${progressPercent}%"></div>
                  <div class="progress-label">${progressPercent}%</div>
                </div>
              </div>
              
              <div class="countdown">
                <div class="countdown-text">
                  <span class="emoji">⏰</span> Il reste <strong>${data.daysUntilEvent} jours</strong> avant l'événement !
                </div>
              </div>
              
              <div class="shifts-section">
                <div class="shifts-title">Créneaux disponibles pour toi :</div>
                
                ${data.availableShifts.slice(0, 3).map(shift => `
                  <div class="shift-card">
                    <div class="shift-title">${shift.title}</div>
                    <div class="shift-details">
                      <div><span class="emoji">📅</span> ${new Date(shift.shift_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                      <div><span class="emoji">⏰</span> ${shift.start_time} - ${shift.end_time}</div>
                      <div><span class="emoji">👥</span> ${shift.current_volunteers}/${shift.max_volunteers} bénévoles inscrits</div>
                      <div><span class="emoji">🎯</span> ${shift.role_type}</div>
                    </div>
                  </div>
                `).join('')}
                
                ${data.availableShifts.length > 3 ? `
                  <div style="text-align: center; margin-top: 15px; color: #6b7280;">
                    ... et ${data.availableShifts.length - 3} autres créneaux disponibles
                  </div>
                ` : ''}
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bostonsalsafest.com'}/volunteers" class="btn">
                  Voir tous les créneaux
                </a>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 16px;">
                Merci pour ton aide précieuse ! <span class="emoji">🙏</span>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Boston Salsa Festival 2025</strong></p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bostonsalsafest.com'}/volunteers">Mon planning</a> | <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bostonsalsafest.com'}/unsubscribe">Se désabonner</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // 🙋‍♀️ Template bénévole - Rappel créneau
  private generateVolunteerShiftReminder(data: {
    userName: string;
    shift: any;
    hoursUntilShift: number;
    emergencyContact: string;
    meetingLocation: string;
  }): { subject: string; html: string } {
    const isUrgent = data.hoursUntilShift <= 1;
    const isToday = data.hoursUntilShift <= 24;
    
    return {
      subject: isUrgent 
        ? `🚨 Ton créneau commence dans ${data.hoursUntilShift}h !`
        : `Rappel : Ton créneau ${isToday ? 'aujourd\'hui' : 'demain'} - ${data.shift.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rappel Créneau</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: ${isUrgent ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #8B5CF6, #A855F7)'}; color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
            .urgency-badge { background: ${isUrgent ? '#ef4444' : '#f59e0b'}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
            .shift-details { background: #f8fafc; border-left: 4px solid ${isUrgent ? '#ef4444' : '#8B5CF6'}; padding: 25px; margin: 25px 0; border-radius: 0 8px 8px 0; }
            .shift-title { font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 15px; }
            .detail-row { display: flex; align-items: center; margin-bottom: 10px; font-size: 16px; }
            .detail-label { font-weight: 600; color: #374151; min-width: 80px; }
            .detail-value { color: #1f2937; }
            .emergency { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }
            .emergency h4 { margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #dc2626; }
            .emergency-contact { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 5px; }
            .emergency-note { font-size: 14px; color: #6b7280; }
            .btn { background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; display: inline-block; margin: 30px 0; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
            .btn:hover { transform: translateY(-2px); }
            .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
            .footer a { color: #8B5CF6; text-decoration: none; }
            .emoji { font-size: 20px; margin: 0 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isUrgent ? '🚨' : '📅'} Boston Salsa Festival</h1>
              <p>${isUrgent ? 'Créneau Imminent' : 'Rappel Créneau'}</p>
            </div>
            
            <div class="content">
              <div class="greeting">Salut ${data.userName} ! 👋</div>
              
              ${isUrgent ? `
                <div class="urgency-badge">
                  🚨 Créneau dans ${data.hoursUntilShift}h !
                </div>
              ` : ''}
              
              <p style="font-size: 18px; color: #374151; margin-bottom: 25px;">
                ${isUrgent 
                  ? `Ton créneau commence dans <strong>${data.hoursUntilShift}h</strong> !`
                  : `Rappel pour ton créneau ${isToday ? 'd\'aujourd\'hui' : 'de demain'} :`
                }
              </p>
              
              <div class="shift-details">
                <div class="shift-title">🎯 ${data.shift.title}</div>
                
                <div class="detail-row">
                  <span class="detail-label">📅 Date :</span>
                  <span class="detail-value">${new Date(data.shift.shift_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">⏰ Heure :</span>
                  <span class="detail-value">${data.shift.start_time} - ${data.shift.end_time}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📍 Lieu :</span>
                  <span class="detail-value">${data.meetingLocation}</span>
                </div>
                
                ${data.shift.description ? `
                  <div class="detail-row">
                    <span class="detail-label">📝 Description :</span>
                    <span class="detail-value">${data.shift.description}</span>
                  </div>
                ` : ''}
              </div>
              
              <div class="emergency">
                <h4>📞 Contact d'urgence</h4>
                <div class="emergency-contact">${data.emergencyContact}</div>
                <div class="emergency-note">En cas de problème, retard ou question, contacte immédiatement cette personne.</div>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bostonsalsafest.com'}/volunteers" class="btn">
                  Voir mon planning complet
                </a>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 16px;">
                Merci pour ton engagement ! <span class="emoji">🙏</span>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Boston Salsa Festival 2025</strong></p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bostonsalsafest.com'}/volunteers">Mon planning</a> | <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bostonsalsafest.com'}/contact">Contact</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // 💃 Template Team Director - Rappel deadline
  private generateTeamDeadlineReminder(data: {
    directorName: string;
    teamName: string;
    daysUntilDeadline: number;
    missingElements: string[];
  }): { subject: string; html: string } {
    const isUrgent = data.daysUntilDeadline <= 3;
    
    return {
      subject: isUrgent 
        ? `🚨 Deadline dans ${data.daysUntilDeadline} jours - ${data.teamName}`
        : `Rappel soumission équipe - ${data.teamName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rappel Équipe</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: ${isUrgent ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #8B5CF6, #A855F7)'}; color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
            .urgency-badge { background: ${isUrgent ? '#ef4444' : '#f59e0b'}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
            .team-name { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .team-name h3 { margin: 0; font-size: 20px; color: #1f2937; }
            .missing-title { font-size: 18px; font-weight: 600; color: #1f2937; margin: 30px 0 15px 0; }
            .missing-item { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 10px 0; display: flex; align-items: center; }
            .missing-icon { font-size: 20px; margin-right: 15px; }
            .missing-text { font-size: 16px; color: #1f2937; font-weight: 500; }
            .btn { background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; display: inline-block; margin: 30px 0; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
            .btn:hover { transform: translateY(-2px); }
            .help-section { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 25px 0; }
            .help-title { font-size: 16px; font-weight: 600; color: #0369a1; margin-bottom: 10px; }
            .help-text { font-size: 14px; color: #0c4a6e; }
            .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
            .footer a { color: #8B5CF6; text-decoration: none; }
            .emoji { font-size: 20px; margin: 0 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1><span class="emoji">💃</span> Boston Salsa Festival <span class="emoji">🕺</span></h1>
              <p>${isUrgent ? 'Deadline Urgente' : 'Rappel Équipe'}</p>
            </div>
            
            <div class="content">
              <div class="greeting">Salut ${data.directorName} ! 👋</div>
              
              ${isUrgent ? `
                <div class="urgency-badge">
                  🚨 Plus que ${data.daysUntilDeadline} jour${data.daysUntilDeadline > 1 ? 's' : ''} !
                </div>
              ` : ''}
              
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
                ${isUrgent 
                  ? `Il reste seulement <strong>${data.daysUntilDeadline} jour${data.daysUntilDeadline > 1 ? 's' : ''}</strong> pour soumettre ton équipe !`
                  : `N'oublie pas de finaliser la soumission de ton équipe.`
                }
              </p>
              
              <div class="team-name">
                <h3>🎭 ${data.teamName}</h3>
              </div>
              
              <div class="missing-title">Éléments manquants :</div>
              
              ${data.missingElements.map(element => {
                let icon = '❌';
                if (element.toLowerCase().includes('musique')) icon = '🎵';
                else if (element.toLowerCase().includes('photo')) icon = '📸';
                else if (element.toLowerCase().includes('vidéo')) icon = '🎥';
                else if (element.toLowerCase().includes('membre')) icon = '👥';
                
                return `
                  <div class="missing-item">
                    <div class="missing-icon">${icon}</div>
                    <div class="missing-text">${element}</div>
                  </div>
                `;
              }).join('')}
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bostonsalsafest.com'}/teams" class="btn">
                  Compléter mon équipe
                </a>
              </div>
              
              <div class="help-section">
                <div class="help-title">💡 Besoin d'aide ?</div>
                <div class="help-text">
                  Si tu rencontres des difficultés pour compléter ta soumission, n'hésite pas à contacter l'équipe d'organisation. Nous sommes là pour t'aider !
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Boston Salsa Festival 2025</strong></p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bostonsalsafest.com'}/teams">Mes équipes</a> | <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bostonsalsafest.com'}/contact">Contact support</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // 👔 Template Organisateur - Alerte
  private generateOrganizerAlert(data: {
    organizerName: string;
    criticalShifts: any[];
    pendingTeams: any[];
    stats: any;
  }): { subject: string; html: string } {
    return {
      subject: `🚨 Alerte : ${data.criticalShifts.length} créneaux critiques`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Alerte Organisateur</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
            .alert-summary { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }
            .alert-title { font-size: 18px; font-weight: 600; color: #dc2626; margin-bottom: 15px; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 30px 0; }
            .stat { text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; }
            .stat-number { font-size: 32px; font-weight: 700; color: #1f2937; }
            .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
            .shift-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 15px 0; }
            .shift-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 10px; }
            .shift-details { font-size: 14px; color: #6b7280; line-height: 1.5; }
            .shift-status { display: inline-block; background: #fef2f2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-top: 10px; }
            .btn { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; display: inline-block; margin: 30px 0; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
            .btn:hover { transform: translateY(-2px); }
            .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
            .footer a { color: #8B5CF6; text-decoration: none; }
            .emoji { font-size: 20px; margin: 0 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Boston Salsa Festival</h1>
              <p>Alerte Organisateur</p>
            </div>
            
            <div class="content">
              <div class="greeting">Salut ${data.organizerName} ! 👋</div>
              
              <div class="alert-summary">
                <div class="alert-title">🚨 Attention requise</div>
                <p>Voici les alertes importantes qui nécessitent ton attention immédiate :</p>
              </div>
              
              <div class="stats">
                <div class="stat">
                  <div class="stat-number">${data.criticalShifts.length}</div>
                  <div class="stat-label">Créneaux critiques</div>
                </div>
                <div class="stat">
                  <div class="stat-number">${data.pendingTeams.length}</div>
                  <div class="stat-label">Équipes en attente</div>
                </div>
                <div class="stat">
                  <div class="stat-number">${data.stats.volunteerProgress}%</div>
                  <div class="stat-label">Bénévoles confirmés</div>
                </div>
              </div>
              
              <h3 style="color: #1f2937; margin-top: 30px;">Créneaux nécessitant attention :</h3>
              
              ${data.criticalShifts.slice(0, 5).map(shift => `
                <div class="shift-card">
                  <div class="shift-title">${shift.title}</div>
                  <div class="shift-details">
                    <div><strong>Date :</strong> ${new Date(shift.shift_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    <div><strong>Heure :</strong> ${shift.start_time} - ${shift.end_time}</div>
                    <div><strong>Bénévoles :</strong> ${shift.current_volunteers}/${shift.max_volunteers}</div>
                    <div><strong>Rôle :</strong> ${shift.role_type}</div>
                  </div>
                  <div class="shift-status">
                    ${shift.current_volunteers === 0 ? 'AUCUN BÉNÉVOLE' : 'SOUS-EFFECTIF'}
                  </div>
                </div>
              `).join('')}
              
              ${data.criticalShifts.length > 5 ? `
                <div style="text-align: center; margin-top: 15px; color: #6b7280;">
                  ... et ${data.criticalShifts.length - 5} autres créneaux nécessitant attention
                </div>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bostonsalsafest.com'}/dashboard" class="btn">
                  Voir le dashboard complet
                </a>
              </div>
              
              <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #0369a1; margin: 0 0 10px 0;">💡 Actions recommandées</h4>
                <ul style="color: #0c4a6e; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li>Contacter les bénévoles pour les créneaux critiques</li>
                  <li>Envoyer des rappels ciblés</li>
                  <li>Réajuster les créneaux si nécessaire</li>
                  <li>Approuver les équipes en attente</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Boston Salsa Festival 2025</strong></p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bostonsalsafest.com'}/dashboard">Dashboard</a> | <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bostonsalsafest.com'}/volunteers">Gestion bénévoles</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // 📊 Sauvegarder le log des emails
  private async saveEmailLog(emailData: EmailData, emailId: string) {
    try {
      await supabase
        .from('email_logs')
        .insert({
          email_id: emailId,
          to_email: emailData.to,
          subject: emailData.subject,
          sent_at: new Date().toISOString(),
          status: 'sent'
        });
    } catch (error) {
      console.warn('Erreur sauvegarde log email:', error);
    }
  }

  // 🧪 Envoyer un email de test
  async sendTestEmail(type: 'volunteer' | 'team_director' | 'organizer', testEmail: string) {
    const testData = {
      volunteer: {
        type: 'volunteer_signup_reminder' as const,
        data: {
          userName: 'Test Volunteer',
          hoursCompleted: 3,
          hoursRequired: 9,
          availableShifts: [
            { title: 'Accueil', shift_date: '2025-03-15', start_time: '09:00', end_time: '12:00', current_volunteers: 2, max_volunteers: 5, role_type: 'Accueil' },
            { title: 'Technique', shift_date: '2025-03-16', start_time: '14:00', end_time: '18:00', current_volunteers: 0, max_volunteers: 3, role_type: 'Technique' }
          ],
          daysUntilEvent: 15
        }
      },
      team_director: {
        type: 'team_deadline_reminder' as const,
        data: {
          directorName: 'Test Director',
          teamName: 'Test Salsa Team',
          daysUntilDeadline: 7,
          missingElements: ['Fichier musical', 'Photo d\'équipe', 'Vidéo de performance']
        }
      },
      organizer: {
        type: 'organizer_alert' as const,
        data: {
          organizerName: 'Test Organizer',
          criticalShifts: [
            { title: 'Sécurité', shift_date: '2025-03-15', start_time: '20:00', end_time: '02:00', current_volunteers: 0, max_volunteers: 4, role_type: 'Sécurité' },
            { title: 'Nettoyage', shift_date: '2025-03-16', start_time: '02:00', end_time: '06:00', current_volunteers: 1, max_volunteers: 6, role_type: 'Nettoyage' }
          ],
          pendingTeams: [
            { team_name: 'Miami Salsa Stars' },
            { team_name: 'Boston Bachata Crew' }
          ],
          stats: { volunteerProgress: 65 }
        }
      }
    };

    return this.sendTemplatedEmail(testData[type], testEmail);
  }
}
