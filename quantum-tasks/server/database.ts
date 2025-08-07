import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../shared/schema.js';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

// Database connection
const sqlite = new Database('./quantum-tasks.db');
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('cache_size = 10000');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('temp_store = MEMORY');

export const db = drizzle(sqlite, { schema });

// Initialize database tables
export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing Quantum Tasks database...');
    
    // Create all tables
    const createTablesSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        avatar TEXT,
        timezone TEXT DEFAULT 'UTC',
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- Sessions table
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        token TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      );

      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#3b82f6',
        icon TEXT DEFAULT 'Folder',
        is_archived INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- Task lists table
      CREATE TABLE IF NOT EXISTS task_lists (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        project_id TEXT NOT NULL REFERENCES projects(id),
        name TEXT NOT NULL,
        position INTEGER DEFAULT 0,
        color TEXT DEFAULT '#64748b',
        created_at INTEGER DEFAULT (unixepoch())
      );

      -- Tasks table (main)
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        project_id TEXT REFERENCES projects(id),
        list_id TEXT REFERENCES task_lists(id),
        parent_task_id TEXT REFERENCES tasks(id),
        title TEXT NOT NULL,
        description TEXT,
        notes TEXT,
        status TEXT DEFAULT 'todo',
        priority TEXT DEFAULT 'normal',
        is_completed INTEGER DEFAULT 0,
        completed_at INTEGER,
        due_date INTEGER,
        start_date INTEGER,
        estimated_duration INTEGER,
        actual_duration INTEGER,
        position INTEGER DEFAULT 0,
        tags TEXT,
        is_recurring INTEGER DEFAULT 0,
        recurring_pattern_id TEXT REFERENCES recurring_patterns(id),
        ai_generated INTEGER DEFAULT 0,
        ai_suggestions TEXT,
        vendzz_linked_data TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- Recurring patterns table
      CREATE TABLE IF NOT EXISTS recurring_patterns (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        pattern_type TEXT NOT NULL,
        frequency INTEGER DEFAULT 1,
        specific_time TEXT,
        specific_days TEXT,
        week_of_month INTEGER,
        day_of_week INTEGER,
        month_day INTEGER,
        start_date INTEGER NOT NULL,
        end_date INTEGER,
        max_occurrences INTEGER,
        current_occurrences INTEGER DEFAULT 0,
        exceptions TEXT,
        workdays_only INTEGER DEFAULT 0,
        skip_holidays INTEGER DEFAULT 0,
        holiday_rule TEXT,
        is_active INTEGER DEFAULT 1,
        last_triggered INTEGER,
        next_occurrence INTEGER,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- Reminders table
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        task_id TEXT NOT NULL REFERENCES tasks(id),
        reminder_type TEXT NOT NULL,
        offset_minutes INTEGER DEFAULT 0,
        reminder_time INTEGER,
        method TEXT DEFAULT 'push',
        message TEXT,
        is_sent INTEGER DEFAULT 0,
        sent_at INTEGER,
        is_recurring INTEGER DEFAULT 0,
        recurring_frequency INTEGER,
        max_recurring_count INTEGER,
        current_recurring_count INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch())
      );

      -- Email accounts table
      CREATE TABLE IF NOT EXISTS email_accounts (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        email TEXT NOT NULL,
        provider TEXT NOT NULL,
        display_name TEXT,
        imap_host TEXT,
        imap_port INTEGER,
        imap_secure INTEGER DEFAULT 1,
        smtp_host TEXT,
        smtp_port INTEGER,
        smtp_secure INTEGER DEFAULT 1,
        encrypted_password TEXT,
        access_token TEXT,
        refresh_token TEXT,
        is_active INTEGER DEFAULT 1,
        last_sync INTEGER,
        sync_errors TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- Email messages table
      CREATE TABLE IF NOT EXISTS email_messages (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        account_id TEXT NOT NULL REFERENCES email_accounts(id),
        message_id TEXT NOT NULL,
        subject TEXT,
        from_address TEXT,
        from_name TEXT,
        to_addresses TEXT,
        cc_addresses TEXT,
        bcc_addresses TEXT,
        body_text TEXT,
        body_html TEXT,
        attachments TEXT,
        email_date INTEGER,
        is_read INTEGER DEFAULT 0,
        is_important INTEGER DEFAULT 0,
        is_flagged INTEGER DEFAULT 0,
        ai_priority TEXT,
        ai_category TEXT,
        ai_sentiment TEXT,
        ai_requires_action INTEGER DEFAULT 0,
        ai_extracted_data TEXT,
        ai_summary TEXT,
        auto_created_task_id TEXT REFERENCES tasks(id),
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- AI suggestions table
      CREATE TABLE IF NOT EXISTS ai_suggestions (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        suggested_data TEXT,
        confidence REAL,
        source_type TEXT,
        source_id TEXT,
        context_data TEXT,
        status TEXT DEFAULT 'pending',
        user_feedback TEXT,
        implemented_at INTEGER,
        created_at INTEGER DEFAULT (unixepoch())
      );

      -- Automation rules table
      CREATE TABLE IF NOT EXISTS automation_rules (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        trigger_type TEXT NOT NULL,
        trigger_conditions TEXT,
        action_type TEXT NOT NULL,
        action_data TEXT,
        is_active INTEGER DEFAULT 1,
        trigger_count INTEGER DEFAULT 0,
        last_triggered INTEGER,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- Vendzz sync table
      CREATE TABLE IF NOT EXISTS vendzz_sync (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        vendzz_user_id TEXT,
        vendzz_api_key TEXT,
        sync_enabled INTEGER DEFAULT 0,
        last_sync INTEGER,
        sync_errors TEXT,
        synced_entities TEXT,
        webhook_secret TEXT,
        webhook_url TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- Vendzz events table
      CREATE TABLE IF NOT EXISTS vendzz_events (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        event_type TEXT NOT NULL,
        event_data TEXT,
        vendzz_entity_id TEXT,
        vendzz_entity_type TEXT,
        processed INTEGER DEFAULT 0,
        processed_at INTEGER,
        created_task_id TEXT REFERENCES tasks(id),
        automation_rule_id TEXT REFERENCES automation_rules(id),
        created_at INTEGER DEFAULT (unixepoch())
      );

      -- User analytics table
      CREATE TABLE IF NOT EXISTS user_analytics (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        date TEXT NOT NULL,
        tasks_created INTEGER DEFAULT 0,
        tasks_completed INTEGER DEFAULT 0,
        emails_processed INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        productivity_score REAL,
        ai_suggestions_received INTEGER DEFAULT 0,
        ai_suggestions_accepted INTEGER DEFAULT 0,
        automation_triggered INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch())
      );
    `;

    sqlite.exec(createTablesSQL);

    // Create indexes for performance
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
      CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
      CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS email_messages_account_id_idx ON email_messages(account_id);
      CREATE INDEX IF NOT EXISTS email_messages_date_idx ON email_messages(email_date);
      CREATE INDEX IF NOT EXISTS email_messages_read_idx ON email_messages(is_read);
      CREATE INDEX IF NOT EXISTS email_messages_priority_idx ON email_messages(ai_priority);
      CREATE INDEX IF NOT EXISTS analytics_user_date_idx ON user_analytics(user_id, date);
    `;

    sqlite.exec(createIndexesSQL);

    console.log('✅ Quantum Tasks database initialized successfully');
    
    // Create default admin user
    await createDefaultUser();
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

async function createDefaultUser() {
  try {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'admin@quantumtasks.com')
    });

    if (!existingUser) {
      await db.insert(schema.users).values({
        email: 'admin@quantumtasks.com',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        timezone: 'UTC'
      });
      
      console.log('✅ Default admin user created: admin@quantumtasks.com / admin123');
    }
  } catch (error) {
    console.log('⚠️  Admin user already exists or error creating:', error.message);
  }
}

// Close database connection gracefully
process.on('SIGINT', () => {
  sqlite.close();
  process.exit(0);
});

export { sqlite };