// src/services/volunteerScheduleService.ts
import { supabase } from '../lib/supabase';

// Types locaux pour éviter les imports manquants
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ScheduleExportData {
  day: string;
  timeSlot: string;
  taskName: string;
  restrictions: string;
  hours: number;
  assignedVolunteers: string[];
}

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
  restrictions?: string;
}

interface VolunteerSignup {
  id: string;
  shift_id: string;
  volunteer_id: string;
  status: 'signed_up' | 'confirmed' | 'checked_in' | 'no_show' | 'cancelled';
  signed_up_at: string;
  reminder_sent: boolean;
  checked_in_at?: string;
  volunteer?: {
    full_name: string;
    email: string;
  };
}

export const volunteerScheduleService = {
  /**
   * Génère le planning de bénévoles pour export/impression (méthode alternative)
   */
  async generateVolunteerSchedule(
    eventId: string = 'a9d1c983-1456-4007-9aec-b297dd095ff7'
  ): Promise<ServiceResponse<ScheduleExportData[]>> {
    try {
      console.log('🗓️ Generating volunteer schedule...');

      // 1. Get shifts
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('volunteer_shifts')
        .select('*')
        .eq('event_id', eventId)
        .in('status', ['live', 'full'])
        .order('shift_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (shiftsError) {
        console.error('❌ Error fetching shifts:', shiftsError);
        return { success: false, message: shiftsError.message };
      }

      if (!shiftsData || shiftsData.length === 0) {
        return { success: false, message: 'No shifts found' };
      }

      // 2. Get signups for all shifts
      const shiftIds = shiftsData.map(shift => shift.id);
      const { data: signupsData, error: signupsError } = await supabase
        .from('volunteer_signups')
        .select('id, shift_id, volunteer_id, status')
        .in('shift_id', shiftIds)
        .in('status', ['signed_up', 'confirmed', 'checked_in']);

      if (signupsError) {
        console.error('❌ Error fetching signups:', signupsError);
        return { success: false, message: signupsError.message };
      }

      // 3. Get volunteer information
      const volunteerIds = signupsData?.map(signup => signup.volunteer_id) || [];
      const { data: volunteersData, error: volunteersError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', volunteerIds);

      if (volunteersError) {
        console.error('❌ Error fetching volunteers:', volunteersError);
        return { success: false, message: volunteersError.message };
      }

      // 4. Transform data into schedule format
      const scheduleData: ScheduleExportData[] = shiftsData.map(shift => {
        // Calculate hours
        const startTime = new Date(`2000-01-01T${shift.start_time}`);
        const endTime = new Date(`2000-01-01T${shift.end_time}`);
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

        // Find signups for this shift
        const shiftSignups = signupsData?.filter(signup => signup.shift_id === shift.id) || [];
        
        // Get names of assigned volunteers
        const assignedVolunteers = shiftSignups.map(signup => {
          const volunteer = volunteersData?.find(v => v.id === signup.volunteer_id);
          return volunteer?.full_name || 'Unknown name';
        });

        // Format day
        const dayName = this.formatDayName(shift.shift_date);
        
        // Format time slot
        const timeSlot = `${shift.start_time.substring(0, 5)} - ${shift.end_time.substring(0, 5)}`;

        return {
          day: dayName,
          timeSlot,
          taskName: shift.title,
          restrictions: shift.restrictions || '',
          hours: Math.round(hours * 100) / 100, // Round to 2 decimals
          assignedVolunteers
        };
      });

      // Group by day
      const groupedByDay = this.groupByDay(scheduleData);

      console.log('✅ Schedule generated successfully');
      return { success: true, data: groupedByDay };

    } catch (error) {
      console.error('❌ Error generating schedule:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Exports the schedule in the specified format
   */
  async exportVolunteerSchedule(
    eventId: string = 'a9d1c983-1456-4007-9aec-b297dd095ff7',
    format: 'csv' | 'xlsx' | 'pdf' = 'csv'
  ): Promise<ServiceResponse<string>> {
    try {
      const scheduleResult = await this.generateVolunteerSchedule(eventId);
      
      if (!scheduleResult.success || !scheduleResult.data) {
        return { success: false, message: scheduleResult.message };
      }

      const scheduleData = scheduleResult.data;
      
      switch (format) {
        case 'csv':
          return this.exportToCSV(scheduleData);
        case 'xlsx':
          return this.exportToXLSX(scheduleData);
        case 'pdf':
          return this.exportToPDF(scheduleData);
        default:
          return { success: false, message: 'Unsupported format' };
      }

    } catch (error) {
      console.error('❌ Schedule export error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Export error' 
      };
    }
  },

  /**
   * Formats the day name in English
   */
  formatDayName(dateString: string): string {
    const date = new Date(dateString);
    const dayNames = {
      0: 'SUNDAY',
      1: 'MONDAY', 
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY'
    };
    
    return dayNames[date.getDay() as keyof typeof dayNames] || 'UNKNOWN DAY';
  },

  /**
   * Groups data by day
   */
  groupByDay(scheduleData: ScheduleExportData[]): ScheduleExportData[] {
    const dayOrder = ['THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY'];
    
    return scheduleData.sort((a, b) => {
      const dayA = dayOrder.indexOf(a.day);
      const dayB = dayOrder.indexOf(b.day);
      
      if (dayA !== dayB) {
        return dayA - dayB;
      }
      
      // If same day, sort by time
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  },

  /**
   * Export to CSV format
   */
  async exportToCSV(scheduleData: ScheduleExportData[]): Promise<ServiceResponse<string>> {
    try {
      const headers = ['Day', 'Time slot', 'Task', 'Restricted', 'Hours', 'Assigned Volunteers'];
      const csvContent = [
        headers.join(','),
        ...scheduleData.map(row => [
          row.day,
          row.timeSlot,
          `"${row.taskName}"`,
          `"${row.restrictions}"`,
          row.hours,
          `"${row.assignedVolunteers.join(' ')}"` // Join names with spaces
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `volunteer_schedule_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { 
        success: true, 
        data: 'volunteer_schedule.csv',
        message: 'Schedule exported to CSV successfully' 
      };

    } catch (error) {
      console.error('❌ CSV export error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'CSV export error' 
      };
    }
  },

  /**
   * Export to XLSX (Excel) format
   */
  async exportToXLSX(scheduleData: ScheduleExportData[]): Promise<ServiceResponse<string>> {
    try {
      // Generate XML content for Excel
      const xmlContent = this.generateExcelXML(scheduleData);
      
      // Create and download file
      const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `volunteer_schedule_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { 
        success: true, 
        data: 'volunteer_schedule.xlsx',
        message: 'Schedule exported to Excel successfully' 
      };

    } catch (error) {
      console.error('❌ XLSX export error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'XLSX export error' 
      };
    }
  },

  /**
   * Export to PDF format
   */
  async exportToPDF(scheduleData: ScheduleExportData[]): Promise<ServiceResponse<string>> {
    try {
      const htmlContent = this.generatePrintableHTML(scheduleData);
      
      // Create blob with correct MIME type
      const blob = new Blob([htmlContent], { 
        type: 'text/html;charset=utf-8' 
      });
      
      // Create object URL
      const url = URL.createObjectURL(blob);
      
      // Open in new tab with error handling
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        // Fallback: if popup blocked, download instead
        const link = document.createElement('a');
        link.href = url;
        link.download = `volunteer_schedule_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return { 
          success: true, 
          data: 'volunteer_schedule.html',
          message: 'Schedule downloaded (popup blocked)' 
        };
      }
      
      // Clean up the URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 3000); // Increased delay to 3 seconds

      return { 
        success: true, 
        data: 'volunteer_schedule.html',
        message: 'Schedule opened in new tab for printing' 
      };

    } catch (error) {
      console.error('❌ PDF export error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'PDF export error' 
      };
    }
  },

  /**
   * Generates XML for Excel
   */
  generateExcelXML(scheduleData: ScheduleExportData[]): string {
    const headers = ['Day', 'Time slot', 'Task', 'Restricted', 'Hours', 'Assigned Volunteers'];
    
    return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Volunteer Schedule">
  <Table>
   <Row>
    ${headers.map(header => `<Cell><Data ss:Type="String">${header}</Data></Cell>`).join('')}
   </Row>
   ${scheduleData.map(row => `<Row>
    <Cell><Data ss:Type="String">${row.day}</Data></Cell>
    <Cell><Data ss:Type="String">${row.timeSlot}</Data></Cell>
    <Cell><Data ss:Type="String">${row.taskName}</Data></Cell>
    <Cell><Data ss:Type="String">${row.restrictions}</Data></Cell>
    <Cell><Data ss:Type="Number">${row.hours}</Data></Cell>
    <Cell><Data ss:Type="String">${row.assignedVolunteers.join(' ')}</Data></Cell>
   </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`;
  },

  /**
   * Generates HTML for printing
   */
  generatePrintableHTML(scheduleData: ScheduleExportData[]): string {
    let currentDay = '';
    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Volunteer Schedule - BSF 2025</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            font-size: 12px;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .day-section { 
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .day-title { 
            font-size: 18px; 
            font-weight: bold; 
            background-color: #f0f0f0;
            padding: 8px;
            margin-bottom: 10px;
            border-left: 4px solid #333;
        }
        .shift-row { 
            display: flex;
            padding: 6px 0;
            border-bottom: 1px solid #eee;
            align-items: center;
        }
        .time-slot { 
            width: 140px;
            font-weight: bold;
            color: #333;
        }
        .task-name { 
            flex: 1;
            margin: 0 15px;
        }
        .restrictions { 
            width: 150px;
            font-style: italic;
            color: #666;
            font-size: 10px;
        }
        .hours { 
            width: 50px;
            text-align: center;
            font-weight: bold;
        }
        .volunteers { 
            width: 200px;
            font-size: 11px;
            color: #444;
        }
        .available { 
            color: #007bff;
            font-style: italic;
        }
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
        }
        .print-button:hover {
            background: #0056b3;
        }
        @media print {
            body { margin: 10px; font-size: 11px; }
            .day-section { page-break-inside: avoid; }
            .print-button { display: none; }
            .header { margin-bottom: 20px; }
        }
    </style>
    <script>
        function printSchedule() {
            window.print();
        }
        
        // Auto-focus for better user experience
        window.onload = function() {
            document.body.focus();
        };
        
        // Keyboard shortcut for printing
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                printSchedule();
            }
        });
    </script>
</head>
<body>
    <button class="print-button" onclick="printSchedule()">🖨️ Print Schedule</button>
    
    <div class="header">
        <h1>VOLUNTEER SCHEDULE</h1>
        <h2>Boston Salsa Festival 2025</h2>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p><small>Press Ctrl+P to print or use the print button</small></p>
    </div>
`;

    // Group by day for display
    const groupedData = scheduleData.reduce((acc, item) => {
      if (!acc[item.day]) {
        acc[item.day] = [];
      }
      acc[item.day].push(item);
      return acc;
    }, {} as Record<string, ScheduleExportData[]>);

    // Generate HTML for each day
    Object.entries(groupedData).forEach(([day, shifts]) => {
      htmlContent += `
    <div class="day-section">
        <div class="day-title">${day}</div>
`;
      
      shifts.forEach(shift => {
        const volunteersText = shift.assignedVolunteers.length > 0 
          ? shift.assignedVolunteers.join(', ')
          : '<span class="available">Available for 1 person</span>';
          
        htmlContent += `
        <div class="shift-row">
            <div class="time-slot">${shift.timeSlot}</div>
            <div class="task-name">${shift.taskName}</div>
            <div class="restrictions">${shift.restrictions}</div>
            <div class="hours">${shift.hours}h</div>
            <div class="volunteers">${volunteersText}</div>
        </div>
`;
      });
      
      htmlContent += `    </div>
`;
    });

    htmlContent += `
    <div style="margin-top: 30px; font-size: 10px; color: #666;">
        <p><strong>Note:</strong> Blue spaces are available for 1 person. You can only sign up for one slot per row.</p>
        <p>Please consider when your rehearsals and show times are. If you are performing you cannot also work the show room door.</p>
    </div>
</body>
</html>`;

    return htmlContent;
  }
};

export default volunteerScheduleService;