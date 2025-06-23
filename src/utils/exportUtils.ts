// exportUtils.ts - Multi-format export utilities (CSV, PDF, XLSX) - Version complète BSF 2025
import { PerformanceTeam } from '../types/PerformanceTeam';

// Types pour les volunteers
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
  organizer_in_charge?: string;
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

interface Volunteer {
  id: string;
  full_name: string;
  phone?: string;
  email: string;
}

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

// ================================
// BASE UTILITIES
// ================================

/**
 * Converts array of objects to CSV
 */
const arrayToCSV = (data: any[], headers?: string[]): string => {
  if (!data || data.length === 0) return '';

  const keys = headers || Object.keys(data[0]);
  const csvHeaders = keys.join(',');
  
  const csvRows = data.map(row => 
    keys.map(key => {
      const value = row[key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Downloads a file
 */
const downloadFile = (content: string | Blob, filename: string, mimeType: string): void => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates basic Excel file (XML)
 */
const generateXLSX = (data: any[], sheetName: string): Blob => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  
  const xmlContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="${sheetName}">
  <Table>
   <Row>
    ${headers.map(header => `<Cell><Data ss:Type="String">${header}</Data></Cell>`).join('')}
   </Row>
   ${data.map(row => `<Row>
    ${headers.map(header => {
      const value = row[header];
      const cellValue = value === null || value === undefined ? '' : String(value);
      const dataType = typeof value === 'number' ? 'Number' : 'String';
      return `<Cell><Data ss:Type="${dataType}">${cellValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>`;
    }).join('')}
   </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`;

  return new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
};

/**
 * Generates basic PDF (HTML to PDF simulation)
 */
const generatePDF = (data: any[], title: string): Blob => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
        }
        h1 { 
            color: #333; 
            border-bottom: 2px solid #e74c3c; 
            padding-bottom: 10px;
        }
        .meta {
            color: #666;
            font-size: 10px;
            margin-bottom: 20px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left;
            font-size: 11px;
        }
        th { 
            background-color: #f8f9fa; 
            font-weight: bold;
        }
        tr:nth-child(even) { 
            background-color: #f9f9f9; 
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 10px;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="meta">
        Generated on ${new Date().toLocaleDateString('en-US')} at ${new Date().toLocaleTimeString('en-US')} | 
        Total: ${data.length} record(s)
    </div>
    
    <table>
        <thead>
            <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.map(row => `
                <tr>
                    ${headers.map(header => {
                      const value = row[header];
                      const cellValue = value === null || value === undefined ? '' : String(value);
                      return `<td>${cellValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
                    }).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        Document generated by Sabor Dance Platform | Boston Salsa Festival 2025
    </div>
</body>
</html>`;

  return new Blob([htmlContent], { type: 'text/html' });
};

// ================================
// SPECIALIZED EXPORT FUNCTIONS
// ================================

/**
 * Export volunteer shifts with enhanced data
 */
export const exportVolunteerShifts = (
  shifts: VolunteerShift[], 
  signups: VolunteerSignup[] = [], 
  volunteers: Volunteer[] = [],
  format: ExportFormat = 'csv'
): void => {
  const enrichedShifts = shifts.map(shift => ({
    'ID': shift.id,
    'Title': shift.title,
    'Description': shift.description,
    'Date': new Date(shift.shift_date).toLocaleDateString('en-US'),
    'Start Time': shift.start_time,
    'End Time': shift.end_time,
    'Duration (h)': calculateHours(shift.start_time, shift.end_time),
    'Max Spots': shift.max_volunteers,
    'Filled Spots': shift.current_volunteers,
    'Available Spots': shift.max_volunteers - shift.current_volunteers,
    'Role Type': shift.role_type,
    'Status': getStatusLabel(shift.status),
    'Check-in Required': shift.check_in_required ? 'Yes' : 'No',
    'Organizer in Charge': shift.organizer_in_charge || 'Not Assigned',
    'Fill Rate (%)': Math.round((shift.current_volunteers / shift.max_volunteers) * 100),
    'Urgent': (shift.current_volunteers / shift.max_volunteers) < 0.5 ? 'Yes' : 'No'
  }));

  const baseFilename = `volunteer_shifts_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      const csv = arrayToCSV(enrichedShifts);
      downloadFile(csv, `${baseFilename}.csv`, 'text/csv;charset=utf-8;');
      break;
      
    case 'xlsx':
      const xlsx = generateXLSX(enrichedShifts, 'Volunteer Shifts');
      downloadFile(xlsx, `${baseFilename}.xlsx`, 'application/vnd.ms-excel');
      break;
      
    case 'pdf':
      const pdf = generatePDF(enrichedShifts, 'Volunteer Shifts - BSF 2025');
      downloadFile(pdf, `${baseFilename}.html`, 'text/html');
      break;
  }
};

/**
 * Export volunteer signups with enhanced data
 */
export const exportVolunteerSignups = (
  signups: VolunteerSignup[], 
  shifts: VolunteerShift[] = [],
  volunteers: Volunteer[] = [],
  format: ExportFormat = 'csv'
): void => {
  const enrichedSignups = signups.map(signup => {
    const shift = shifts.find(s => s.id === signup.shift_id);
    const volunteer = volunteers.find(v => v.id === signup.volunteer_id);
    
    return {
      'Signup ID': signup.id,
      'Shift ID': signup.shift_id,
      'Volunteer Name': volunteer?.full_name || `Volunteer ${signup.volunteer_id}`,
      'Volunteer Email': volunteer?.email || 'Not Available',
      'Phone': volunteer?.phone || 'Not Available',
      'Shift Title': shift?.title || 'Unknown Shift',
      'Shift Date': shift ? new Date(shift.shift_date).toLocaleDateString('en-US') : 'N/A',
      'Time': shift ? `${shift.start_time} - ${shift.end_time}` : 'N/A',
      'Duration (h)': shift ? calculateHours(shift.start_time, shift.end_time) : 'N/A',
      'Role Type': shift?.role_type || 'N/A',
      'Organizer in Charge': shift?.organizer_in_charge || 'Not Assigned',
      'Status': getStatusLabel(signup.status),
      'Signup Date': new Date(signup.signed_up_at).toLocaleDateString('en-US'),
      'Reminder Sent': signup.reminder_sent ? 'Yes' : 'No',
      'Check-in': signup.checked_in_at ? new Date(signup.checked_in_at).toLocaleDateString('en-US') : 'No',
      'QR Code': signup.qr_code || 'N/A'
    };
  });

  const baseFilename = `volunteer_signups_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      const csv = arrayToCSV(enrichedSignups);
      downloadFile(csv, `${baseFilename}.csv`, 'text/csv;charset=utf-8;');
      break;
      
    case 'xlsx':
      const xlsx = generateXLSX(enrichedSignups, 'Volunteer Signups');
      downloadFile(xlsx, `${baseFilename}.xlsx`, 'application/vnd.ms-excel');
      break;
      
    case 'pdf':
      const pdf = generatePDF(enrichedSignups, 'Volunteer Signups - BSF 2025');
      downloadFile(pdf, `${baseFilename}.html`, 'text/html');
      break;
  }
};

/**
 * Export performance teams with full data including tech rehearsal ratings
 */
export const exportPerformanceTeams = (
  teams: PerformanceTeam[], 
  format: ExportFormat = 'csv',
  includeRatings: boolean = true
): void => {
  const enrichedTeams = teams.map(team => {
    const baseData = {
      'ID': team.id,
      'Event ID': team.event_id,
      'Team Name': team.team_name,
      'Director Name': team.director_name,
      'Director Email': team.director_email,
      'Director Phone': team.director_phone || 'N/A',
      'Studio Name': team.studio_name || 'N/A',
      'City': team.city,
      'State/Province': team.state || 'Not Specified',
      'Country': team.country || 'Not Specified',
      'Status': getStatusLabel(team.status),
      'Song Title': team.song_title || 'N/A',
      'Song Artist': team.song_artist || 'N/A',
      'Music File': team.music_file_url ? 'Yes' : 'No',
      'Music File Name': team.music_file_name || 'N/A',
      'Performance Video': team.performance_video_url ? 'Yes' : 'No',
      'Video URL': team.performance_video_url || 'N/A',
      'Team Photo': team.team_photo_url ? 'Yes' : 'No',
      'Group Size': team.group_size,
      'Dance Styles': (team.dance_styles || []).join(', '),
      'Performance Level': team.performance_level || 'Not Specified',
      'Performance Order': team.performance_order || 'Not Set',
      'Performance Duration': team.performance_duration || 'N/A',
      'Backup Team': team.backup_team ? 'Yes' : 'No',
      'Instagram': team.instagram || 'N/A',
      'Website': team.website_url || 'N/A',
      'Organizer Notes': team.organizer_notes || 'None',
      'Rejection Reason': team.rejection_reason || 'N/A',
      'Can Edit Until': team.can_edit_until ? new Date(team.can_edit_until).toLocaleDateString('en-US') : 'N/A',
      'Created By': team.created_by || 'N/A',
      'Created At': team.created_at ? new Date(team.created_at).toLocaleDateString('en-US') : 'N/A',
      'Updated At': team.updated_at ? new Date(team.updated_at).toLocaleDateString('en-US') : 'N/A',
      'Submitted At': team.submitted_at ? new Date(team.submitted_at).toLocaleDateString('en-US') : 'N/A',
      'Approved At': team.approved_at ? new Date(team.approved_at).toLocaleDateString('en-US') : 'N/A',
      'Rejected At': team.rejected_at ? new Date(team.rejected_at).toLocaleDateString('en-US') : 'N/A',
      'Completed At': team.completed_at ? new Date(team.completed_at).toLocaleDateString('en-US') : 'N/A'
    };

    // Add legacy scoring data if available
    if (team.scoring) {
      Object.assign(baseData, {
        'Legacy Technical Score': team.scoring.technical_score || 'N/A',
        'Legacy Wow Factor': team.scoring.wow_factor || team.scoring.wow_factor_score || 'N/A',
        'Legacy Size Score': team.scoring.size_score || team.scoring.group_size_score || 'N/A',
        'Legacy Variety Bonus': team.scoring.variety_bonus || team.scoring.style_variety_bonus || 'N/A',
        'Legacy Total Score': team.scoring.total_score || 'N/A'
      });
    }

    // Add tech rehearsal ratings if requested and available
    if (includeRatings && team.tech_rehearsal_rating) {
      const rating = team.tech_rehearsal_rating;
      const avgRating = calculateAverageRating(rating);
      
      Object.assign(baseData, {
        'Rating 1 Label': rating.rating_1_label || 'N/A',
        'Rating 1 Score': rating.rating_1 || 0,
        'Rating 2 Label': rating.rating_2_label || 'N/A',
        'Rating 2 Score': rating.rating_2 || 0,
        'Rating 3 Label': rating.rating_3_label || 'N/A',
        'Rating 3 Score': rating.rating_3 || 0,
        'Average Rating': avgRating.toFixed(2),
        'Rating Comments': rating.comments || 'None',
        'Rated By': rating.rated_by || 'N/A',
        'Rated At': rating.rated_at ? new Date(rating.rated_at).toLocaleDateString('en-US') : 'N/A',
        'Rating Updated By': rating.updated_by || 'N/A',
        'Rating Updated At': rating.updated_at ? new Date(rating.updated_at).toLocaleDateString('en-US') : 'N/A'
      });
    }

    return baseData;
  });

  const baseFilename = `performance_teams_${includeRatings ? 'with_ratings_' : ''}${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      const csv = arrayToCSV(enrichedTeams);
      downloadFile(csv, `${baseFilename}.csv`, 'text/csv;charset=utf-8;');
      break;
      
    case 'xlsx':
      const xlsx = generateXLSX(enrichedTeams, 'Performance Teams');
      downloadFile(xlsx, `${baseFilename}.xlsx`, 'application/vnd.ms-excel');
      break;
      
    case 'pdf':
      const pdf = generatePDF(enrichedTeams, `Performance Teams - BSF 2025${includeRatings ? ' (with Ratings)' : ''}`);
      downloadFile(pdf, `${baseFilename}.html`, 'text/html');
      break;
  }
};

/**
 * Export complete dashboard report with advanced metrics
 */
export const exportDashboardReport = (
  shifts: VolunteerShift[],
  signups: VolunteerSignup[],
  teams: PerformanceTeam[],
  volunteers: Volunteer[] = [],
  eventName: string = 'BSF 2025',
  format: ExportFormat = 'csv'
): void => {
  // Enhanced metrics calculations
  const totalShifts = shifts.length;
  const liveShifts = shifts.filter(s => s.status === 'live').length;
  const criticalShifts = shifts.filter(s => 
    s.status === 'live' && (s.current_volunteers / s.max_volunteers) < 0.5
  ).length;
  const totalSignups = signups.length;
  const checkedInSignups = signups.filter(s => s.status === 'checked_in').length;
  
  const totalTeams = teams.length;
  const approvedTeams = teams.filter(t => t.status === 'approved').length;
  const pendingTeams = teams.filter(t => t.status === 'submitted').length;
  const completedTeams = teams.filter(t => t.status === 'completed').length;
  
  // Tech rehearsal ratings stats
  const ratedTeams = teams.filter(t => t.tech_rehearsal_rating);
  const avgRatings = ratedTeams.map(t => calculateAverageRating(t.tech_rehearsal_rating!));
  const overallAvgRating = avgRatings.length > 0 ? 
    avgRatings.reduce((sum, rating) => sum + rating, 0) / avgRatings.length : 0;
  
  // Media completion stats
  const teamsWithMusic = teams.filter(t => t.music_file_url).length;
  const teamsWithVideo = teams.filter(t => t.performance_video_url).length;
  const teamsWithPhoto = teams.filter(t => t.team_photo_url).length;
  
  // Report data
  const reportData = [
    {
      'Category': 'EVENT',
      'Metric': 'Name',
      'Value': eventName,
      'Details': `Report generated on ${new Date().toLocaleDateString('en-US')}`
    },
    {
      'Category': 'VOLUNTEERS',
      'Metric': 'Total Shifts',
      'Value': totalShifts,
      'Details': `${liveShifts} active, ${criticalShifts} critical`
    },
    {
      'Category': 'VOLUNTEERS',
      'Metric': 'Total Signups',
      'Value': totalSignups,
      'Details': `${checkedInSignups} checked in (${Math.round(checkedInSignups/totalSignups*100)}%)`
    },
    {
      'Category': 'TEAMS',
      'Metric': 'Total Teams',
      'Value': totalTeams,
      'Details': `${approvedTeams} approved, ${pendingTeams} pending, ${completedTeams} completed`
    },
    {
      'Category': 'TEAMS',
      'Metric': 'Total Participants',
      'Value': teams.reduce((sum, team) => sum + team.group_size, 0),
      'Details': 'Total dancers across all teams'
    },
    {
      'Category': 'MEDIA',
      'Metric': 'Music Files',
      'Value': teamsWithMusic,
      'Details': `${Math.round(teamsWithMusic/totalTeams*100)}% completion`
    },
    {
      'Category': 'MEDIA',
      'Metric': 'Performance Videos',
      'Value': teamsWithVideo,
      'Details': `${Math.round(teamsWithVideo/totalTeams*100)}% completion`
    },
    {
      'Category': 'MEDIA',
      'Metric': 'Team Photos',
      'Value': teamsWithPhoto,
      'Details': `${Math.round(teamsWithPhoto/totalTeams*100)}% completion`
    },
    {
      'Category': 'RATINGS',
      'Metric': 'Teams Rated',
      'Value': ratedTeams.length,
      'Details': `${Math.round(ratedTeams.length/totalTeams*100)}% of teams rated`
    },
    {
      'Category': 'RATINGS',
      'Metric': 'Average Rating',
      'Value': overallAvgRating.toFixed(2),
      'Details': 'Overall average across all rated teams'
    }
  ];

  const baseFilename = `dashboard_report_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      const csv = arrayToCSV(reportData);
      downloadFile(csv, `${baseFilename}.csv`, 'text/csv;charset=utf-8;');
      break;
      
    case 'xlsx':
      const xlsx = generateXLSX(reportData, 'Dashboard Report');
      downloadFile(xlsx, `${baseFilename}.xlsx`, 'application/vnd.ms-excel');
      break;
      
    case 'pdf':
      const pdf = generatePDF(reportData, `Dashboard Report - ${eventName}`);
      downloadFile(pdf, `${baseFilename}.html`, 'text/html');
      break;
  }
};

/**
 * Export teams for emcee/DJ booth (show night playback view)
 */
export const exportShowNightPlaybook = (
  teams: PerformanceTeam[],
  format: ExportFormat = 'csv'
): void => {
  // Filter only approved teams with performance order
  const showTeams = teams
    .filter(team => team.status === 'approved' && team.performance_order)
    .sort((a, b) => (a.performance_order || 0) - (b.performance_order || 0))
    .map(team => ({
      'Performance Order': team.performance_order,
      'Team Name': team.team_name,
      'Song Title': team.song_title || 'N/A',
      'Song Artist': team.song_artist || 'N/A',
      'Music File': team.music_file_url || 'N/A',
      'Duration': team.performance_duration || 'N/A',
      'Group Size': team.group_size,
      'Dance Styles': (team.dance_styles || []).join(', '),
      'Director': team.director_name,
      'Tech Notes': team.organizer_notes || 'None',
      'City': team.city,
      'Studio': team.studio_name || 'N/A'
    }));

  const baseFilename = `show_night_playbook_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      const csv = arrayToCSV(showTeams);
      downloadFile(csv, `${baseFilename}.csv`, 'text/csv;charset=utf-8;');
      break;
      
    case 'xlsx':
      const xlsx = generateXLSX(showTeams, 'Show Night Playbook');
      downloadFile(xlsx, `${baseFilename}.xlsx`, 'application/vnd.ms-excel');
      break;
      
    case 'pdf':
      const pdf = generatePDF(showTeams, 'Show Night Playbook - BSF 2025');
      downloadFile(pdf, `${baseFilename}.html`, 'text/html');
      break;
  }
};

/**
 * Quick export with automatic type detection
 */
export const quickExport = (
  type: 'volunteers' | 'teams' | 'dashboard' | 'show-night',
  data: {
    shifts?: VolunteerShift[];
    signups?: VolunteerSignup[];
    teams?: PerformanceTeam[];
    volunteers?: Volunteer[];
    eventName?: string;
    includeRatings?: boolean;
  },
  format: ExportFormat = 'csv'
): void => {
  switch (type) {
    case 'volunteers':
      if (data.shifts) {
        exportVolunteerShifts(data.shifts, data.signups, data.volunteers, format);
      }
      break;
    case 'teams':
      if (data.teams) {
        exportPerformanceTeams(data.teams, format, data.includeRatings);
      }
      break;
    case 'dashboard':
      if (data.shifts && data.signups && data.teams) {
        exportDashboardReport(
          data.shifts, 
          data.signups, 
          data.teams, 
          data.volunteers,
          data.eventName, 
          format
        );
      }
      break;
    case 'show-night':
      if (data.teams) {
        exportShowNightPlaybook(data.teams, format);
      }
      break;
  }
};

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Calculates duration in hours between two times
 */
const calculateHours = (startTime: string, endTime: string): number => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60) * 10) / 10;
};

/**
 * Returns English label for a status
 */
const getStatusLabel = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'draft': 'Draft',
    'unpublished': 'Unpublished',
    'submitted': 'Submitted',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'completed': 'Completed',
    'live': 'Live',
    'full': 'Full',
    'cancelled': 'Cancelled',
    'signed_up': 'Signed Up',
    'confirmed': 'Confirmed',
    'checked_in': 'Checked In',
    'no_show': 'No Show'
  };
  return statusMap[status] || status;
};

/**
 * Calculate average rating from tech rehearsal rating
 */
const calculateAverageRating = (rating: PerformanceTeam['tech_rehearsal_rating']): number => {
  if (!rating) return 0;
  
  const { rating_1, rating_2, rating_3 } = rating;
  const validRatings = [rating_1, rating_2, rating_3].filter(r => r > 0);
  
  if (validRatings.length === 0) return 0;
  return validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;
};

/**
 * Generates simple QR code (URL encode)
 */
export const generateQRCodeData = (data: any): string => {
  return btoa(JSON.stringify(data));
};

/**
 * Decodes QR code
 */
export const decodeQRCodeData = (qrData: string): any => {
  try {
    return JSON.parse(atob(qrData));
  } catch (e) {
    console.error('QR decode error:', e);
    return null;
  }
};

// ================================
// INTERFACE FUNCTIONS
// ================================

/**
 * Opens export format selection modal
 */
export const showExportModal = (
  type: 'volunteers' | 'teams' | 'dashboard' | 'show-night',
  data: {
    shifts?: VolunteerShift[];
    signups?: VolunteerSignup[];
    teams?: PerformanceTeam[];
    volunteers?: Volunteer[];
    eventName?: string;
    includeRatings?: boolean;
  },
  onExport?: (format: ExportFormat) => void
): void => {
  // This function could be implemented to open a format selection modal
  // For now, we use the default format
  quickExport(type, data, 'xlsx');
};

/**
 * Export teams missing critical information
 */
export const exportIncompleteTeams = (
  teams: PerformanceTeam[],
  format: ExportFormat = 'csv'
): void => {
  const incompleteTeams = teams.map(team => {
    const missing = [];
    if (!team.music_file_url) missing.push('Music File');
    if (!team.performance_video_url) missing.push('Performance Video');
    if (!team.team_photo_url) missing.push('Team Photo');
    if (!team.song_title) missing.push('Song Title');
    if (!team.song_artist) missing.push('Song Artist');
    
    return {
      'Team Name': team.team_name,
      'Director': team.director_name,
      'Email': team.director_email,
      'Status': getStatusLabel(team.status),
      'Missing Items': missing.join(', ') || 'Complete',
      'Missing Count': missing.length,
      'Can Edit Until': team.can_edit_until ? new Date(team.can_edit_until).toLocaleDateString('en-US') : 'N/A'
    };
  }).filter(team => team['Missing Count'] > 0);

  const baseFilename = `incomplete_teams_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      const csv = arrayToCSV(incompleteTeams);
      downloadFile(csv, `${baseFilename}.csv`, 'text/csv;charset=utf-8;');
      break;
      
    case 'xlsx':
      const xlsx = generateXLSX(incompleteTeams, 'Incomplete Teams');
      downloadFile(xlsx, `${baseFilename}.xlsx`, 'application/vnd.ms-excel');
      break;
      
    case 'pdf':
      const pdf = generatePDF(incompleteTeams, 'Incomplete Teams - BSF 2025');
      downloadFile(pdf, `${baseFilename}.html`, 'text/html');
      break;
  }
};