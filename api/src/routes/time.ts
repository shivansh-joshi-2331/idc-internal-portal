import { Router } from 'express';
import prisma from '../prisma';
import { authMiddleware, AuthRequest } from '../utils/jwt';

const router = Router();

// Get time entries for a specific date (defaults to today)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { date, year, month, viewMode } = req.query;
    const userId = req.user!.userId;
    const userRole = req.user!.role; // Assuming token decodes role into req.user
    
    let startDate: Date;
    let nextDate: Date;

    if (date) {
      startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + 1);
    } else if (year && month) {
      const y = parseInt(year as string);
      const m = parseInt(month as string) - 1;
      startDate = new Date(y, m, 1);
      nextDate = new Date(y, m + 1, 1);
    } else {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + 1);
    }

    const whereClause: any = {
        startTime: {
          gte: startDate,
          lt: nextDate,
        }
    };

    // If it's team mode and the user is an admin, remove user restriction. Otherwise restrict to user.
    if (viewMode !== 'team' || userRole !== 'ADMIN') {
        whereClause.userId = userId;
    }

    const entries = await prisma.timeEntry.findMany({
      where: whereClause,
      orderBy: { startTime: 'asc' },
      include: {
          user: {
              select: { firstName: true, lastName: true, initials: true, avatarGradient: true }
          }
      }
    });

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time entries' });
  }
});

// Create a new time entry (Toggl style)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { taskName, startTime, endTime, notes } = req.body;
    const userId = req.user!.userId;

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    let duration = null;

    if (start && end) {
      duration = Math.round((end.getTime() - start.getTime()) / 60000); // duration in minutes
    }

    const entry = await prisma.timeEntry.create({
      data: {
        userId,
        date: start, // We store the date component for easy filtering
        taskName,
        startTime: start,
        endTime: end,
        duration,
        notes
      },
      include: {
        user: { select: { firstName: true, lastName: true } }
      }
    });

    // Create a notification for Admins
    await prisma.notification.create({
      data: {
        title: 'New Time Entry',
        body: `${entry.user.firstName} logged ${duration || 0}m for "${taskName}"`,
        type: 'CLOCK_IN',
        isRead: false
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Time Entry error:', error);
    res.status(500).json({ message: 'Error saving time entry' });
  }
});

// Delete an entry
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Ensure user owns the entry
    const entry = await prisma.timeEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.timeEntry.delete({ where: { id } });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting entry' });
  }
});

export default router;
