// src/services/initNotifications.ts - COMPLETE SYSTEM INITIALIZATION - VERSION CORRIGÉE
import { NotificationScheduler } from './notificationScheduler';
import { EmailService } from './emailService';

// Global scheduler instance
let globalScheduler: NotificationScheduler | null = null;

// Default configuration
const DEFAULT_CONFIG = {
  enableScheduler: true,
  enableEmails: true,
  schedulerInterval: {
    hourly: 60 * 60 * 1000,       // 1 hour
    daily: 24 * 60 * 60 * 1000,   // 1 day
    immediate: 5 * 60 * 1000      // 5 minutes
  },
  emailLimits: {
    maxPerDay: 50,
    maxPerHour: 10,
    cooldownBetweenSame: 24 * 60 * 60 * 1000 // 24h between identical emails
  }
};

// 🎯 CORRECTION: Renommer l'interface pour éviter le conflit
interface NotificationInitConfig {
  enableScheduler?: boolean;
  enableEmails?: boolean;
  schedulerInterval?: {
    hourly?: number;
    daily?: number;
    immediate?: number;
  };
  emailLimits?: {
    maxPerDay?: number;
    maxPerHour?: number;
    cooldownBetweenSame?: number;
  };
}

export const initNotificationSystem = (config: NotificationInitConfig = {}) => {
  // Merge with default configuration
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    schedulerInterval: {
      ...DEFAULT_CONFIG.schedulerInterval,
      ...config.schedulerInterval
    },
    emailLimits: {
      ...DEFAULT_CONFIG.emailLimits,
      ...config.emailLimits
    }
  };

  console.log('🔔 Initializing notification system...');
  console.log('⚙️ Configuration:', finalConfig);

  // Check environment variables
  const missingEnvVars = checkEnvironmentVariables();
  if (missingEnvVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingEnvVars);
    
    if (finalConfig.enableEmails) {
      console.warn('📧 Disabling emails due to missing variables');
      finalConfig.enableEmails = false;
    }
  }

  // Initialize email service
  let emailService: EmailService | null = null;
  if (finalConfig.enableEmails) {
    try {
      emailService = new EmailService();
      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Error initializing email service:', error);
      finalConfig.enableEmails = false;
    }
  }

  // Initialize scheduler
  if (finalConfig.enableScheduler) {
    try {
      if (globalScheduler) {
        console.log('🔄 Stopping existing scheduler');
        globalScheduler.stop();
      }

      globalScheduler = new NotificationScheduler();
      globalScheduler.start();
      
      console.log('✅ Scheduler initialized and started');
    } catch (error) {
      console.error('❌ Error initializing scheduler:', error);
      globalScheduler = null;
    }
  }

  // Create necessary tables if they don't exist
  initializeDatabaseTables().catch(error => {
    console.error('❌ Error initializing tables:', error);
  });

  console.log('🚀 Notification system initialized successfully');

  // Return control interface
  return {
    // Status
    isRunning: () => globalScheduler?.getStatus().isRunning || false,
    
    // Scheduler control
    start: () => {
      if (globalScheduler && !globalScheduler.getStatus().isRunning) {
        globalScheduler.start();
        console.log('▶️ Scheduler started');
      }
    },
    
    stop: () => {
      if (globalScheduler) {
        globalScheduler.stop();
        console.log('⏹️ Scheduler stopped');
      }
    },
    
    restart: () => {
      if (globalScheduler) {
        globalScheduler.restart();
        console.log('🔄 Scheduler restarted');
      }
    },
    
    // Statistics
    getStats: () => globalScheduler?.getStats(),
    
    // Tests
    testNotifications: () => globalScheduler?.testNotifications(),
    
    testEmail: (type: 'volunteer' | 'team_director' | 'organizer', email: string) => {
      if (!emailService) {
        return Promise.resolve({ success: false, error: 'Email service not available' });
      }
      return emailService.sendTestEmail(type, email);
    },
    
    // Manual checks
    forceCheck: (type: 'hourly' | 'daily' | 'immediate') => {
      if (globalScheduler) {
        return globalScheduler.forceCheck(type);
      }
      return Promise.resolve();
    },
    
    // Configuration
    getConfig: () => finalConfig,
    
    // Cleanup
    cleanup: () => {
      if (globalScheduler) {
        globalScheduler.stop();
        globalScheduler = null;
      }
      console.log('🧹 Notification system cleaned up');
    }
  };
};

// Check required environment variables
const checkEnvironmentVariables = (): string[] => {
  // 🎯 CORRECTION: Vérifier si process.env existe (environnement browser vs Node.js)
  if (typeof process === 'undefined' || !process.env) {
    console.warn('⚠️ Environment variables not accessible');
    return [];
  }

  const required = [
    'RESEND_API_KEY',
    'FROM_EMAIL',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.table(missing.map(varName => ({
      'Variable': varName,
      'Status': '❌ Missing',
      'Required for': getEnvVarDescription(varName)
    })));
  }

  return missing;
};

// Environment variable descriptions
const getEnvVarDescription = (varName: string): string => {
  const descriptions: Record<string, string> = {
    'RESEND_API_KEY': 'Email sending',
    'FROM_EMAIL': 'Sender address',
    'NEXT_PUBLIC_SITE_URL': 'Links in emails',
    'NEXT_PUBLIC_SUPABASE_URL': 'Database',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'DB authentication'
  };
  
  return descriptions[varName] || 'Unknown';
};

// Initialize database tables
const initializeDatabaseTables = async () => {
  try {
    const { supabase } = await import('../lib/supabase');
    
    // 🎯 CORRECTION: Vérifier si les RPC existent avant de les appeler
    try {
      const { error: emailLogsError } = await supabase.rpc('create_email_logs_table_if_not_exists');
      if (emailLogsError && !emailLogsError.message.includes('already exists')) {
        console.warn('⚠️ Unable to create email_logs table:', emailLogsError);
      }
    } catch (error) {
      console.warn('⚠️ RPC create_email_logs_table_if_not_exists not available:', error);
    }
    
    try {
      const { error: notificationLogsError } = await supabase.rpc('create_notification_logs_table_if_not_exists');
      if (notificationLogsError && !notificationLogsError.message.includes('already exists')) {
        console.warn('⚠️ Unable to create email_notifications_log table:', notificationLogsError);
      }
    } catch (error) {
      console.warn('⚠️ RPC create_notification_logs_table_if_not_exists not available:', error);
    }
    
    console.log('✅ Database tables verified');
  } catch (error) {
    console.warn('⚠️ Error checking tables:', error);
  }
};

// Function to stop the system on application shutdown
export const shutdownNotificationSystem = () => {
  if (globalScheduler) {
    console.log('🛑 Stopping notification system...');
    globalScheduler.stop();
    globalScheduler = null;
    console.log('✅ Notification system stopped');
  }
};

// Function to get scheduler instance (for debug)
export const getSchedulerInstance = () => globalScheduler;

// System diagnostic function
export const diagnoseNotificationSystem = async () => {
  console.log('🔍 Diagnosing notification system...');
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: typeof process !== 'undefined' ? process.env.NODE_ENV : 'unknown',
      hasResendKey: typeof process !== 'undefined' ? !!process.env.RESEND_API_KEY : false,
      hasFromEmail: typeof process !== 'undefined' ? !!process.env.FROM_EMAIL : false,
      hasSiteUrl: typeof process !== 'undefined' ? !!process.env.NEXT_PUBLIC_SITE_URL : false,
      hasSupabaseUrl: typeof process !== 'undefined' ? !!process.env.NEXT_PUBLIC_SUPABASE_URL : false,
      hasSupabaseKey: typeof process !== 'undefined' ? !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : false
    },
    scheduler: {
      isRunning: globalScheduler?.getStatus().isRunning || false,
      intervals: globalScheduler?.getStatus().intervals || []
    },
    database: {
      connected: false,
      tablesExist: false
    },
    email: {
      serviceAvailable: false,
      testEmailSent: false
    }
  };

  // Test database connection
  try {
    const { supabase } = await import('../lib/supabase');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    diagnosis.database.connected = !error;
    
    // 🎯 CORRECTION: Vérifier si RPC existe
    try {
      const { data: tables } = await supabase.rpc('get_notification_tables');
      diagnosis.database.tablesExist = !!tables;
    } catch (error) {
      console.warn('⚠️ RPC get_notification_tables not available:', error);
    }
  } catch (error) {
    console.warn('❌ Database test error:', error);
  }

  // Test email service
  try {
    const emailService = new EmailService();
    const testResult = await emailService.sendTestEmail('volunteer', 'test@example.com');
    diagnosis.email.serviceAvailable = true;
    diagnosis.email.testEmailSent = testResult.success;
  } catch (error) {
    console.warn('❌ Email test error:', error);
  }

  // Test scheduler statistics
  if (globalScheduler) {
    try {
      const stats = await globalScheduler.getStats();
      diagnosis.scheduler = { ...diagnosis.scheduler, ...stats };
    } catch (error) {
      console.warn('❌ Error getting scheduler stats:', error);
    }
  }

  console.log('📊 Diagnosis complete:', diagnosis);
  return diagnosis;
};

// Configure notifications for development mode
export const setupDevelopmentNotifications = () => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'development') {
    console.warn('⚠️ Development mode not detected, ignoring');
    return;
  }

  console.log('🛠️ Configuring development notifications...');
  
  // Development-adapted configuration
  const devConfig: NotificationInitConfig = {
    enableScheduler: true,
    enableEmails: false, // Disable emails by default in dev
    schedulerInterval: {
      hourly: 5 * 60 * 1000,     // 5 minutes instead of 1 hour
      daily: 10 * 60 * 1000,     // 10 minutes instead of 1 day
      immediate: 1 * 60 * 1000   // 1 minute instead of 5
    },
    emailLimits: {
      maxPerDay: 5,
      maxPerHour: 2,
      cooldownBetweenSame: 5 * 60 * 1000 // 5 minutes instead of 24h
    }
  };

  return initNotificationSystem(devConfig);
};

// Configure notifications for production mode
export const setupProductionNotifications = () => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ Production mode not detected, ignoring');
    return;
  }

  console.log('🚀 Configuring production notifications...');
  
  // Production-optimized configuration
  const prodConfig: NotificationInitConfig = {
    enableScheduler: true,
    enableEmails: true,
    schedulerInterval: {
      hourly: 60 * 60 * 1000,    // 1 hour
      daily: 24 * 60 * 60 * 1000, // 1 day
      immediate: 5 * 60 * 1000    // 5 minutes
    },
    emailLimits: {
      maxPerDay: 100,
      maxPerHour: 20,
      cooldownBetweenSame: 24 * 60 * 60 * 1000 // 24h
    }
  };

  return initNotificationSystem(prodConfig);
};

// Auto-initialization based on environment
export const autoInitNotifications = () => {
  console.log('🔄 Auto-initializing notifications...');
  
  if (typeof process !== 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      return setupDevelopmentNotifications();
    } else if (process.env.NODE_ENV === 'production') {
      return setupProductionNotifications();
    }
  }
  
  return initNotificationSystem();
};

// Performance monitoring function
export const monitorNotificationPerformance = () => {
  if (!globalScheduler) {
    console.warn('⚠️ Scheduler not initialized, monitoring impossible');
    return;
  }

  const startTime = Date.now();
  let checksCount = 0;
  let errorsCount = 0;

  const monitor = setInterval(async () => {
    try {
      checksCount++;
      const stats = await globalScheduler!.getStats();
      
      const uptime = Date.now() - startTime;
      const performance = {
        uptime: Math.floor(uptime / 1000),
        checksCount,
        errorsCount,
        successRate: ((checksCount - errorsCount) / checksCount * 100).toFixed(1),
        ...stats
      };

      console.log('📊 Notification performance:', performance);
      
      // Alert if too many errors
      if (errorsCount / checksCount > 0.1) {
        console.warn('⚠️ High error rate in notifications');
      }
      
    } catch (error) {
      errorsCount++;
      console.error('❌ Error monitoring notifications:', error);
    }
  }, 60 * 1000); // Every minute

  // Stop monitoring after 1 hour
  setTimeout(() => {
    clearInterval(monitor);
    console.log('🛑 Notification monitoring stopped');
  }, 60 * 60 * 1000);

  return () => clearInterval(monitor);
};

// 🎯 CORRECTION: Exporter l'interface directement
export type { NotificationInitConfig };
export { DEFAULT_CONFIG as defaultNotificationConfig };