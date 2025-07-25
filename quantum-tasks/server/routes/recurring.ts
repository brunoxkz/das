import { Router } from 'express';
import { db } from '../database.js';
import { recurringPatterns, tasks, reminders, insertRecurringPatternSchema } from '../../shared/schema.js';
import { eq, and, desc, lt, lte } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../auth.js';
import { z } from 'zod';
import { addDays, addWeeks, addMonths, addYears, format, isWeekend, parseISO, startOfDay } from 'date-fns';

const router = Router();

// ======================
// RECURRING PATTERNS ROUTES
// ======================

// Get all recurring patterns
router.get('/patterns', authenticate, async (req: AuthRequest, res) => {
  try {
    const patterns = await db.query.recurringPatterns.findMany({
      where: eq(recurringPatterns.userId, req.user.id),
      orderBy: [desc(recurringPatterns.createdAt)]
    });

    res.json(patterns);
  } catch (error) {
    console.error('Get recurring patterns error:', error);
    res.status(500).json({ error: 'Failed to fetch recurring patterns' });
  }
});

// Create recurring pattern
router.post('/patterns', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedData = insertRecurringPatternSchema.parse({
      ...req.body,
      userId: req.user.id,
      specificDays: req.body.specificDays ? JSON.stringify(req.body.specificDays) : null,
      exceptions: req.body.exceptions ? JSON.stringify(req.body.exceptions) : null
    });

    // Calculate first occurrence
    const nextOccurrence = calculateNextOccurrence(validatedData);

    const [newPattern] = await db.insert(recurringPatterns)
      .values({
        ...validatedData,
        nextOccurrence: nextOccurrence?.getTime()
      })
      .returning();

    res.status(201).json(newPattern);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Create recurring pattern error:', error);
    res.status(500).json({ error: 'Failed to create recurring pattern' });
  }
});

// Update recurring pattern
router.put('/patterns/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const updateSchema = z.object({
      patternType: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']).optional(),
      frequency: z.number().min(1).optional(),
      specificTime: z.string().optional(),
      specificDays: z.array(z.number()).optional(),
      weekOfMonth: z.number().optional(),
      dayOfWeek: z.number().optional(),
      monthDay: z.number().optional(),
      endDate: z.number().optional(),
      maxOccurrences: z.number().optional(),
      exceptions: z.array(z.string()).optional(),
      workdaysOnly: z.boolean().optional(),
      skipHolidays: z.boolean().optional(),
      holidayRule: z.enum(['postpone', 'advance', 'skip']).optional(),
      isActive: z.boolean().optional()
    });

    const validatedData = updateSchema.parse(req.body);

    // Handle JSON fields
    const updateData: any = { ...validatedData };
    if (validatedData.specificDays) {
      updateData.specificDays = JSON.stringify(validatedData.specificDays);
    }
    if (validatedData.exceptions) {
      updateData.exceptions = JSON.stringify(validatedData.exceptions);
    }

    // Recalculate next occurrence if pattern changed
    if (validatedData.patternType || validatedData.frequency || validatedData.specificTime || validatedData.specificDays) {
      const currentPattern = await db.query.recurringPatterns.findFirst({
        where: and(
          eq(recurringPatterns.id, req.params.id),
          eq(recurringPatterns.userId, req.user.id)
        )
      });

      if (currentPattern) {
        const updatedPattern = { ...currentPattern, ...updateData };
        const nextOccurrence = calculateNextOccurrence(updatedPattern);
        updateData.nextOccurrence = nextOccurrence?.getTime();
      }
    }

    updateData.updatedAt = new Date().getTime();

    const [updatedPattern] = await db.update(recurringPatterns)
      .set(updateData)
      .where(and(
        eq(recurringPatterns.id, req.params.id),
        eq(recurringPatterns.userId, req.user.id)
      ))
      .returning();

    if (!updatedPattern) {
      return res.status(404).json({ error: 'Recurring pattern not found' });
    }

    res.json(updatedPattern);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Update recurring pattern error:', error);
    res.status(500).json({ error: 'Failed to update recurring pattern' });
  }
});

// Delete recurring pattern
router.delete('/patterns/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const deletedPattern = await db.delete(recurringPatterns)
      .where(and(
        eq(recurringPatterns.id, req.params.id),
        eq(recurringPatterns.userId, req.user.id)
      ))
      .returning();

    if (deletedPattern.length === 0) {
      return res.status(404).json({ error: 'Recurring pattern not found' });
    }

    res.json({ message: 'Recurring pattern deleted successfully' });
  } catch (error) {
    console.error('Delete recurring pattern error:', error);
    res.status(500).json({ error: 'Failed to delete recurring pattern' });
  }
});

// ======================
// TASK GENERATION FROM PATTERNS
// ======================

// Process recurring patterns and create tasks
router.post('/process', authenticate, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    
    // Get all active patterns that are due
    const duePatterns = await db.query.recurringPatterns.findMany({
      where: and(
        eq(recurringPatterns.userId, req.user.id),
        eq(recurringPatterns.isActive, true),
        lte(recurringPatterns.nextOccurrence, now.getTime())
      )
    });

    const results = [];

    for (const pattern of duePatterns) {
      try {
        // Check if we've reached max occurrences
        if (pattern.maxOccurrences && pattern.currentOccurrences >= pattern.maxOccurrences) {
          // Deactivate pattern
          await db.update(recurringPatterns)
            .set({ isActive: false })
            .where(eq(recurringPatterns.id, pattern.id));
          continue;
        }

        // Check if we've reached end date
        if (pattern.endDate && now.getTime() > pattern.endDate) {
          // Deactivate pattern
          await db.update(recurringPatterns)
            .set({ isActive: false })
            .where(eq(recurringPatterns.id, pattern.id));
          continue;
        }

        // Create task from pattern
        const taskTitle = generateTaskTitle(pattern);
        const dueDateTime = calculateTaskDueDate(pattern);

        const [newTask] = await db.insert(tasks).values({
          userId: req.user.id,
          title: taskTitle,
          description: `Auto-generated from recurring pattern: ${pattern.patternType}`,
          status: 'todo',
          priority: 'normal',
          dueDate: dueDateTime,
          isRecurring: true,
          recurringPatternId: pattern.id,
          aiGenerated: false
        }).returning();

        // Calculate next occurrence
        const nextOccurrence = calculateNextOccurrence(pattern, new Date(pattern.nextOccurrence));
        
        // Update pattern
        await db.update(recurringPatterns)
          .set({
            currentOccurrences: pattern.currentOccurrences + 1,
            lastTriggered: now.getTime(),
            nextOccurrence: nextOccurrence?.getTime(),
            updatedAt: now.getTime()
          })
          .where(eq(recurringPatterns.id, pattern.id));

        results.push({
          patternId: pattern.id,
          taskId: newTask.id,
          title: taskTitle,
          dueDate: dueDateTime,
          nextOccurrence: nextOccurrence?.getTime()
        });

      } catch (error) {
        console.error(`Error processing pattern ${pattern.id}:`, error);
        results.push({
          patternId: pattern.id,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Recurring patterns processed',
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('Process recurring patterns error:', error);
    res.status(500).json({ error: 'Failed to process recurring patterns' });
  }
});

// ======================
// REMINDERS ROUTES
// ======================

// Get reminders for task
router.get('/reminders/task/:taskId', authenticate, async (req: AuthRequest, res) => {
  try {
    // Verify task belongs to user
    const task = await db.query.tasks.findFirst({
      where: and(
        eq(tasks.id, req.params.taskId),
        eq(tasks.userId, req.user.id)
      )
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const taskReminders = await db.query.reminders.findMany({
      where: eq(reminders.taskId, req.params.taskId),
      orderBy: [desc(reminders.createdAt)]
    });

    res.json(taskReminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Create reminder
router.post('/reminders', authenticate, async (req: AuthRequest, res) => {
  try {
    const reminderSchema = z.object({
      taskId: z.string(),
      reminderType: z.enum(['before', 'at', 'after']),
      offsetMinutes: z.number().default(0),
      reminderTime: z.number().optional(),
      method: z.enum(['push', 'email', 'sms']).default('push'),
      message: z.string().optional(),
      isRecurring: z.boolean().default(false),
      recurringFrequency: z.number().optional(),
      maxRecurringCount: z.number().optional()
    });

    const validatedData = reminderSchema.parse(req.body);

    // Verify task belongs to user
    const task = await db.query.tasks.findFirst({
      where: and(
        eq(tasks.id, validatedData.taskId),
        eq(tasks.userId, req.user.id)
      )
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [newReminder] = await db.insert(reminders)
      .values(validatedData)
      .returning();

    res.status(201).json(newReminder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// ======================
// UTILITY FUNCTIONS
// ======================

function calculateNextOccurrence(pattern: any, fromDate?: Date): Date | null {
  const startDate = fromDate || new Date(pattern.startDate);
  const now = new Date();
  let nextDate = new Date(Math.max(startDate.getTime(), now.getTime()));

  // Apply specific time if provided
  if (pattern.specificTime) {
    const [hours, minutes] = pattern.specificTime.split(':').map(Number);
    nextDate.setHours(hours, minutes, 0, 0);
  }

  switch (pattern.patternType) {
    case 'daily':
      nextDate = addDays(nextDate, pattern.frequency || 1);
      break;
      
    case 'weekly':
      if (pattern.specificDays) {
        const specificDays = JSON.parse(pattern.specificDays);
        nextDate = findNextWeeklyOccurrence(nextDate, specificDays, pattern.frequency || 1);
      } else {
        nextDate = addWeeks(nextDate, pattern.frequency || 1);
      }
      break;
      
    case 'monthly':
      if (pattern.weekOfMonth && pattern.dayOfWeek !== undefined) {
        // Nth weekday of month (e.g., 3rd Friday)
        nextDate = findNthWeekdayOfMonth(nextDate, pattern.weekOfMonth, pattern.dayOfWeek, pattern.frequency || 1);
      } else if (pattern.monthDay) {
        // Specific day of month
        nextDate = findMonthlyByDate(nextDate, pattern.monthDay, pattern.frequency || 1);
      } else {
        nextDate = addMonths(nextDate, pattern.frequency || 1);
      }
      break;
      
    case 'yearly':
      nextDate = addYears(nextDate, pattern.frequency || 1);
      break;
      
    default:
      return null;
  }

  // Apply workdays only filter
  if (pattern.workdaysOnly) {
    while (isWeekend(nextDate)) {
      nextDate = addDays(nextDate, 1);
    }
  }

  // Apply holiday rules
  if (pattern.skipHolidays && isHoliday(nextDate)) {
    switch (pattern.holidayRule) {
      case 'advance':
        while (isHoliday(nextDate) || (pattern.workdaysOnly && isWeekend(nextDate))) {
          nextDate = addDays(nextDate, -1);
        }
        break;
      case 'postpone':
        while (isHoliday(nextDate) || (pattern.workdaysOnly && isWeekend(nextDate))) {
          nextDate = addDays(nextDate, 1);
        }
        break;
      case 'skip':
        // Find next occurrence that's not a holiday
        let attempts = 0;
        while ((isHoliday(nextDate) || (pattern.workdaysOnly && isWeekend(nextDate))) && attempts < 365) {
          nextDate = calculateNextOccurrence(pattern, nextDate);
          attempts++;
        }
        break;
    }
  }

  // Check exceptions
  if (pattern.exceptions) {
    const exceptions = JSON.parse(pattern.exceptions);
    const dateString = format(nextDate, 'yyyy-MM-dd');
    if (exceptions.includes(dateString)) {
      // Skip this date and find next occurrence
      return calculateNextOccurrence(pattern, nextDate);
    }
  }

  return nextDate;
}

function findNextWeeklyOccurrence(fromDate: Date, specificDays: number[], frequency: number): Date {
  const currentDay = fromDate.getDay();
  let nextDate = new Date(fromDate);
  
  // Find next occurrence within current week
  for (const day of specificDays.sort()) {
    if (day > currentDay) {
      nextDate.setDate(fromDate.getDate() + (day - currentDay));
      return nextDate;
    }
  }
  
  // No occurrence in current week, go to next week cycle
  const daysToAdd = (7 * frequency) - currentDay + specificDays[0];
  nextDate.setDate(fromDate.getDate() + daysToAdd);
  return nextDate;
}

function findNthWeekdayOfMonth(fromDate: Date, weekOfMonth: number, dayOfWeek: number, frequency: number): Date {
  let targetDate = new Date(fromDate);
  targetDate = addMonths(targetDate, frequency);
  
  // Go to first day of target month
  targetDate.setDate(1);
  
  // Find first occurrence of desired weekday
  while (targetDate.getDay() !== dayOfWeek) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  
  // Add weeks to get to the Nth occurrence
  if (weekOfMonth === -1) {
    // Last occurrence of weekday in month
    let lastOccurrence = new Date(targetDate);
    while (lastOccurrence.getMonth() === targetDate.getMonth()) {
      targetDate = new Date(lastOccurrence);
      lastOccurrence.setDate(lastOccurrence.getDate() + 7);
    }
  } else {
    targetDate.setDate(targetDate.getDate() + (7 * (weekOfMonth - 1)));
  }
  
  return targetDate;
}

function findMonthlyByDate(fromDate: Date, monthDay: number, frequency: number): Date {
  let targetDate = new Date(fromDate);
  targetDate = addMonths(targetDate, frequency);
  
  if (monthDay === -1) {
    // Last day of month
    targetDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
  } else {
    targetDate.setDate(monthDay);
  }
  
  return targetDate;
}

function isHoliday(date: Date): boolean {
  // Simple holiday detection - can be extended with more comprehensive holiday data
  const month = date.getMonth();
  const day = date.getDate();
  
  // Basic US holidays
  const holidays = [
    [0, 1],   // New Year's Day
    [6, 4],   // Independence Day
    [11, 25], // Christmas Day
  ];
  
  return holidays.some(([m, d]) => m === month && d === day);
}

function generateTaskTitle(pattern: any): string {
  const timeStr = pattern.specificTime ? ` at ${pattern.specificTime}` : '';
  const frequency = pattern.frequency > 1 ? `every ${pattern.frequency} ` : '';
  
  switch (pattern.patternType) {
    case 'daily':
      return `Daily Task${timeStr}`;
    case 'weekly':
      return `${frequency}Weekly Task${timeStr}`;
    case 'monthly':
      return `${frequency}Monthly Task${timeStr}`;
    case 'yearly':
      return `${frequency}Yearly Task${timeStr}`;
    default:
      return `Recurring Task${timeStr}`;
  }
}

function calculateTaskDueDate(pattern: any): number {
  const now = new Date();
  
  if (pattern.specificTime) {
    const [hours, minutes] = pattern.specificTime.split(':').map(Number);
    now.setHours(hours, minutes, 0, 0);
  }
  
  return now.getTime();
}

export default router;