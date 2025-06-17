// exportUtils.ts - Multi-format export utilities (CSV, PDF, XLSX)
import { PerformanceTeam } from '../types/PerformanceTeam';
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
  status: 'draft' | 'live' | 'full' | 'cancelled' | 'unpublished'; // 
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

// Dans exportUtils.ts, remplacez l'interface PerformanceTeam par celle-ci :
/*
interface PerformanceTeam {
  id: string;
  event_id?: string;  // Ajouté
  team_name: string;
  director_name: string;
  director_email: string;
  director_phone?: string | null;  // Modifié
  studio_name?: string | null;  // Modifié de string vers string | null
  city: string;
  state?: string | null;  // Modifié
  country: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  performance_video_url?: string | null;  // Modifié
  music_file_url?: string | null;  // Ajouté
  song_title?: string | null;  // Modifié
  song_artist?: string | null;  // Ajouté
  group_size: number;
  dance_styles: string[];
  performance_level?: 'beginner' | 'intermediate' | 'advanced' | 'pro' | null | undefined;
  performance_order?: number | null;  // Modifié
  scoring?: {
    group_size_score: number;
    wow_factor_score: number;
    technical_score: number;
    style_variety_bonus: number;
    total_score: number;
  } | null;  // Modifié
  organizer_notes?: string | null;  // Modifié
  rejection_reason?: string | null;  // Ajouté
  can_edit_until?: string | null;  // Modifié
  backup_team?: boolean | null;  // Modifié
  instagram?: string | null;  // Ajouté
  website_url?: string | null;  // Ajouté
  created_by?: string | null;  // Modifié
  created_at?: string | null;  // Ajouté
  updated_at?: string | null;  // Ajouté
  submitted_at?: string | null;  // Ajouté
  approved_at?: string | null;  // Ajouté
  rejected_at?: string | null;  // Ajouté
}
*/
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
        Document generated by Sabor Dance Platform | www.sabordance.com
    </div>
</body>
</html>`;

  return new Blob([htmlContent], { type: 'text/html' });
};

// ================================
// SPECIALIZED EXPORT FUNCTIONS
// ================================

/**
 * Export volunteer shifts
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
 * Export volunteer signups
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
 * Export performance teams
 */
export const exportPerformanceTeams = (
  teams: PerformanceTeam[], 
  format: ExportFormat = 'csv'
): void => {
  const enrichedTeams = teams.map(team => ({
    'ID': team.id,
    'Team Name': team.team_name,
    'Director': team.director_name,
    'Director Email': team.director_email,
    'Studio': team.studio_name,
    'City': team.city,
    'State/Province': team.state || 'Not Specified',
    'Country': team.country,
    'Status': getStatusLabel(team.status),
    'Song Title': team.song_title || 'N/A',
    'Video': team.performance_video_url ? 'Yes' : 'No',
    'Video URL': team.performance_video_url || 'N/A',
    'Group Size': team.group_size,
    'Dance Styles': team.dance_styles.join(', '),
    'Level': team.performance_level || 'Not Specified',
    'Performance Order': team.performance_order || 'Not Set',
    'Total Score': team.scoring?.total_score || 'Not Scored',
    'Technical Score': team.scoring?.technical_score || 'N/A',
    'Wow Score': team.scoring?.wow_factor_score || 'N/A',
    'Size Score': team.scoring?.group_size_score || 'N/A',
    'Variety Bonus': team.scoring?.style_variety_bonus || 'N/A',
    'Organizer Notes': team.organizer_notes || 'None',
    'Backup Team': team.backup_team ? 'Yes' : 'No',
    'Can Edit Until': team.can_edit_until ? new Date(team.can_edit_until).toLocaleDateString('en-US') : 'N/A',
    'Created By': team.created_by || 'N/A'
  }));

  const baseFilename = `performance_teams_${new Date().toISOString().split('T')[0]}`;
  
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
      const pdf = generatePDF(enrichedTeams, 'Performance Teams - BSF 2025');
      downloadFile(pdf, `${baseFilename}.html`, 'text/html');
      break;
  }
};

/**
 * Export complete dashboard report
 */
export const exportDashboardReport = (
  shifts: VolunteerShift[],
  signups: VolunteerSignup[],
  teams: PerformanceTeam[],
  volunteers: Volunteer[] = [],
  eventName: string = 'Event',
  format: ExportFormat = 'csv'
): void => {
  // Metrics calculations
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
      'Details': `${liveShifts} active`
    },
    {
      'Category': 'VOLUNTEERS',
      'Metric': 'Critical Shifts',
      'Value': criticalShifts,
      'Details': 'Less than 50% filled'
    },
    {
      'Category': 'VOLUNTEERS',
      'Metric': 'Total Signups',
      'Value': totalSignups,
      'Details': `${checkedInSignups} checked in`
    },
    {
      'Category': 'TEAMS',
      'Metric': 'Total Teams',
      'Value': totalTeams,
      'Details': `${approvedTeams} approved, ${pendingTeams} pending`
    },
    {
      'Category': 'TEAMS',
      'Metric': 'Participants',
      'Value': teams.reduce((sum, team) => sum + team.group_size, 0),
      'Details': 'Total dancers'
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
 * Quick export with automatic type detection
 */
export const quickExport = (
  type: 'volunteers' | 'teams' | 'dashboard',
  data: {
    shifts?: VolunteerShift[];
    signups?: VolunteerSignup[];
    teams?: PerformanceTeam[];
    volunteers?: Volunteer[];
    eventName?: string;
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
        exportPerformanceTeams(data.teams, format);
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
    'unpublished': 'Unpublished',
    'submitted': 'Submitted',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'live': 'Live',
    'full': 'Full',
    'cancelled': 'Cancelled',
    'signed_up': 'Signed Up',
    'confirmed': 'Confirmed',
    'checked_in': 'Checked In',
    'no_show': 'No Show',
    'draft': 'Draft'
  };
  return statusMap[status] || status;
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
  type: 'volunteers' | 'teams' | 'dashboard',
  data: {
    shifts?: VolunteerShift[];
    signups?: VolunteerSignup[];
    teams?: PerformanceTeam[];
    volunteers?: Volunteer[];
    eventName?: string;
  },
  onExport?: (format: ExportFormat) => void
): void => {
  // This function could be implemented to open a format selection modal
  // For now, we use the default format
  quickExport(type, data, 'xlsx');
};