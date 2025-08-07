import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  index,
} from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ===== USERS & AUTH =====
export const users = sqliteTable('users', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatar: text('avatar'),
  timezone: text('timezone').default('UTC'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  token: text('token').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ===== PROJECTS & TASKS =====
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').default('#3b82f6'),
  icon: text('icon').default('Folder'),
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  position: integer('position').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const taskLists = sqliteTable('task_lists', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  projectId: text('project_id').references(() => projects.id).notNull(),
  name: text('name').notNull(),
  position: integer('position').default(0),
  color: text('color').default('#64748b'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').references(() => users.id).notNull(),
  projectId: text('project_id').references(() => projects.id),
  listId: text('list_id').references(() => taskLists.id),
  parentTaskId: text('parent_task_id').references(() => tasks.id),
  
  // Basic Info
  title: text('title').notNull(),
  description: text('description'),
  notes: text('notes'),
  
  // Status & Priority
  status: text('status').default('todo'), // todo, doing, review, done
  priority: text('priority').default('normal'), // urgent, high, normal, low
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  
  // Dates & Time
  dueDate: integer('due_date', { mode: 'timestamp' }),
  startDate: integer('start_date', { mode: 'timestamp' }),
  estimatedDuration: integer('estimated_duration'), // minutes
  actualDuration: integer('actual_duration'), // minutes
  
  // Organization
  position: integer('position').default(0),
  tags: text('tags'), // JSON array of tags
  
  // Recurring
  isRecurring: integer('is_recurring', { mode: 'boolean' }).default(false),
  recurringPatternId: text('recurring_pattern_id').references(() => recurringPatterns.id),
  
  // AI & Automation
  aiGenerated: integer('ai_generated', { mode: 'boolean' }).default(false),
  aiSuggestions: text('ai_suggestions'), // JSON
  vendzzmLinkedData: text('vendzz_linked_data'), // JSON with Vendzz integration data
  
  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('tasks_user_id_idx').on(table.userId),
  statusIdx: index('tasks_status_idx').on(table.status),
  dueDateIdx: index('tasks_due_date_idx').on(table.dueDate),
  projectIdIdx: index('tasks_project_id_idx').on(table.projectId),
}));

// ===== RECURRING PATTERNS =====
export const recurringPatterns = sqliteTable('recurring_patterns', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').references(() => users.id).notNull(),
  
  // Pattern Configuration
  patternType: text('pattern_type').notNull(), // daily, weekly, monthly, yearly, custom
  frequency: integer('frequency').default(1), // every X days/weeks/months
  
  // Time Configuration
  specificTime: text('specific_time'), // HH:MM format
  specificDays: text('specific_days'), // JSON array of weekdays [0-6] or month days
  
  // Advanced Patterns
  weekOfMonth: integer('week_of_month'), // 1st, 2nd, 3rd, 4th, last (-1)
  dayOfWeek: integer('day_of_week'), // 0-6 (Sunday=0)
  monthDay: integer('month_day'), // 1-31 or -1 for last day
  
  // Boundaries
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }), // null = forever
  maxOccurrences: integer('max_occurrences'), // null = unlimited
  currentOccurrences: integer('current_occurrences').default(0),
  
  // Exceptions & Rules
  exceptions: text('exceptions'), // JSON array of dates to skip
  workdaysOnly: integer('workdays_only', { mode: 'boolean' }).default(false),
  skipHolidays: integer('skip_holidays', { mode: 'boolean' }).default(false),
  holidayRule: text('holiday_rule'), // postpone, advance, skip
  
  // Status
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastTriggered: integer('last_triggered', { mode: 'timestamp' }),
  nextOccurrence: integer('next_occurrence', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ===== REMINDERS =====
export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  taskId: text('task_id').references(() => tasks.id).notNull(),
  
  // Reminder Configuration
  reminderType: text('reminder_type').notNull(), // before, at, after
  offsetMinutes: integer('offset_minutes').default(0), // minutes before/after due date
  reminderTime: integer('reminder_time', { mode: 'timestamp' }), // specific time if not relative
  
  // Delivery
  method: text('method').default('push'), // push, email, sms
  message: text('message'),
  isSent: integer('is_sent', { mode: 'boolean' }).default(false),
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  
  // Recurring Reminders
  isRecurring: integer('is_recurring', { mode: 'boolean' }).default(false),
  recurringFrequency: integer('recurring_frequency'), // minutes between recurring reminders
  maxRecurringCount: integer('max_recurring_count'),
  currentRecurringCount: integer('current_recurring_count').default(0),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ===== EMAIL SYSTEM =====
export const emailAccounts = sqliteTable('email_accounts', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').references(() => users.id).notNull(),
  
  // Account Info
  email: text('email').notNull(),
  provider: text('provider').notNull(), // gmail, outlook, yahoo, imap, pop3
  displayName: text('display_name'),
  
  // Connection Settings
  imapHost: text('imap_host'),
  imapPort: integer('imap_port'),
  imapSecure: integer('imap_secure', { mode: 'boolean' }).default(true),
  smtpHost: text('smtp_host'),
  smtpPort: integer('smtp_port'),
  smtpSecure: integer('smtp_secure', { mode: 'boolean' }).default(true),
  
  // Credentials (encrypted)
  encryptedPassword: text('encrypted_password'),
  accessToken: text('access_token'), // for OAuth accounts
  refreshToken: text('refresh_token'),
  
  // Status
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastSync: integer('last_sync', { mode: 'timestamp' }),
  syncErrors: text('sync_errors'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const emailMessages = sqliteTable('email_messages', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  accountId: text('account_id').references(() => emailAccounts.id).notNull(),
  
  // Email Data
  messageId: text('message_id').notNull(), // original email message-id
  subject: text('subject'),
  fromAddress: text('from_address'),
  fromName: text('from_name'),
  toAddresses: text('to_addresses'), // JSON array
  ccAddresses: text('cc_addresses'), // JSON array
  bccAddresses: text('bcc_addresses'), // JSON array
  
  // Content
  bodyText: text('body_text'),
  bodyHtml: text('body_html'),
  attachments: text('attachments'), // JSON array
  
  // Metadata
  emailDate: integer('email_date', { mode: 'timestamp' }),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  isImportant: integer('is_important', { mode: 'boolean' }).default(false),
  isFlagged: integer('is_flagged', { mode: 'boolean' }).default(false),
  
  // AI Classification
  aiPriority: text('ai_priority'), // urgent, high, normal, low
  aiCategory: text('ai_category'), // client, supplier, internal, newsletter, spam
  aiSentiment: text('ai_sentiment'), // positive, neutral, negative, urgent
  aiRequiresAction: integer('ai_requires_action', { mode: 'boolean' }).default(false),
  aiExtractedData: text('ai_extracted_data'), // JSON with extracted data
  aiSummary: text('ai_summary'),
  
  // Task Integration
  autoCreatedTaskId: text('auto_created_task_id').references(() => tasks.id),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  accountIdIdx: index('email_messages_account_id_idx').on(table.accountId),
  emailDateIdx: index('email_messages_date_idx').on(table.emailDate),
  isReadIdx: index('email_messages_read_idx').on(table.isRead),
  aiPriorityIdx: index('email_messages_priority_idx').on(table.aiPriority),
}));

// ===== AI & AUTOMATION =====
export const aiSuggestions = sqliteTable('ai_suggestions', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').references(() => users.id).notNull(),
  
  // Suggestion Data
  type: text('type').notNull(), // task_creation, email_response, optimization, automation
  title: text('title').notNull(),
  description: text('description'),
  suggestedData: text('suggested_data'), // JSON
  confidence: real('confidence'), // 0.0 - 1.0
  
  // Context
  sourceType: text('source_type'), // email, task, pattern, vendzz_data
  sourceId: text('source_id'),
  contextData: text('context_data'), // JSON
  
  // Status
  status: text('status').default('pending'), // pending, accepted, rejected, implemented
  userFeedback: text('user_feedback'),
  implementedAt: integer('implemented_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const automationRules = sqliteTable('automation_rules', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').references(() => users.id).notNull(),
  
  // Rule Definition
  name: text('name').notNull(),
  description: text('description'),
  triggerType: text('trigger_type').notNull(), // email_received, task_completed, vendzz_event, time_based
  triggerConditions: text('trigger_conditions'), // JSON
  
  // Actions
  actionType: text('action_type').notNull(), // create_task, send_email, update_task, vendzz_action
  actionData: text('action_data'), // JSON
  
  // Status & Stats
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  triggerCount: integer('trigger_count').default(0),
  lastTriggered: integer('last_triggered', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ===== VENDZZ INTEGRATION =====
export const vendzzmSync = sqliteTable('vendzz_sync', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').references(() => users.id).notNull(),
  
  // Sync Configuration
  vendzzmUserId: text('vendzz_user_id'),
  vendzzmApiKey: text('vendzz_api_key'), // encrypted
  syncEnabled: integer('sync_enabled', { mode: 'boolean' }).default(false),
  
  // Sync Status
  lastSync: integer('last_sync', { mode: 'timestamp' }),
  syncErrors: text('sync_errors'),
  syncedEntities: text('synced_entities'), // JSON with last sync info per entity type
  
  // Webhook Configuration
  webhookSecret: text('webhook_secret'),
  webhookUrl: text('webhook_url'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const vendzzmEvents = sqliteTable('vendzz_events', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').references(() => users.id).notNull(),
  
  // Event Data
  eventType: text('event_type').notNull(), // quiz_created, campaign_sent, lead_captured, etc
  eventData: text('event_data'), // JSON
  vendzzmEntityId: text('vendzz_entity_id'),
  vendzzmEntityType: text('vendzz_entity_type'),
  
  // Processing
  processed: integer('processed', { mode: 'boolean' }).default(false),
  processedAt: integer('processed_at', { mode: 'timestamp' }),
  createdTaskId: text('created_task_id').references(() => tasks.id),
  automationRuleId: text('automation_rule_id').references(() => automationRules.id),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ===== ANALYTICS & TRACKING =====
export const userAnalytics = sqliteTable('user_analytics', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').references(() => users.id).notNull(),
  
  // Daily Metrics
  date: text('date').notNull(), // YYYY-MM-DD
  tasksCreated: integer('tasks_created').default(0),
  tasksCompleted: integer('tasks_completed').default(0),
  emailsProcessed: integer('emails_processed').default(0),
  timeSpent: integer('time_spent').default(0), // minutes
  productivityScore: real('productivity_score'), // 0.0 - 1.0
  
  // AI Usage
  aiSuggestionsReceived: integer('ai_suggestions_received').default(0),
  aiSuggestionsAccepted: integer('ai_suggestions_accepted').default(0),
  automationTriggered: integer('automation_triggered').default(0),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  userDateIdx: index('analytics_user_date_idx').on(table.userId, table.date),
}));

// ===== ZOD SCHEMAS =====
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRecurringPatternSchema = createInsertSchema(recurringPatterns).omit({ id: true, createdAt: true, updatedAt: true, currentOccurrences: true, lastTriggered: true, nextOccurrence: true });
export const insertEmailAccountSchema = createInsertSchema(emailAccounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmailMessageSchema = createInsertSchema(emailMessages).omit({ id: true, createdAt: true, updatedAt: true });

// ===== TYPES =====
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type RecurringPattern = typeof recurringPatterns.$inferSelect;
export type InsertRecurringPattern = z.infer<typeof insertRecurringPatternSchema>;
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertEmailAccount = z.infer<typeof insertEmailAccountSchema>;
export type EmailMessage = typeof emailMessages.$inferSelect;
export type InsertEmailMessage = z.infer<typeof insertEmailMessageSchema>;