import { Router } from 'express';
import prisma from '../prisma';
import { authMiddleware, adminGuard, AuthRequest } from '../utils/jwt';

const router = Router();

// ==========================================
// 1. Core Schedule API
// ==========================================

// Get schedule entries (Filterable by month, user, or whole team)
// e.g. GET /api/schedule?year=2026&month=4
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { year, month, userId } = req.query;
    
    // Default to current month if not provided
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month as string) - 1 : new Date().getMonth(); // 0-indexed

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate,
      }
    };

    if (userId) {
      whereClause.userId = userId;
    }

    const entries = await prisma.scheduleEntry.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, firstName: true, initials: true, avatarGradient: true, department: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(entries);
  } catch (error) {
    console.error('Schedule GET Error:', error);
    res.status(500).json({ message: 'Error fetching schedule' });
  }
});

// Admin: Upsert a single schedule entry (e.g., overriding a remote day to an in-office day)
router.post('/entry', authMiddleware, adminGuard, async (req: AuthRequest, res) => {
  try {
    const { userId, date, type, startTime, endTime, notes } = req.body;

    const entryDate = new Date(date);

    const entry = await prisma.scheduleEntry.upsert({
      where: {
        userId_date: {
          userId,
          date: entryDate,
        }
      },
      update: { type, startTime, endTime, notes },
      create: { userId, date: entryDate, type, startTime, endTime, notes }
    });

    res.status(200).json(entry);
  } catch (error) {
    console.error('Schedule POST Error:', error);
    res.status(500).json({ message: 'Error updating schedule entry' });
  }
});

// ==========================================
// 2. Leave Requests (PTO / Sick)
// ==========================================

// Admin: Get all pending leave requests
router.get('/leave/pending', authMiddleware, adminGuard, async (req: AuthRequest, res) => {
  try {
    const requests = await prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, initials: true, avatarGradient: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending leaves:', error);
    res.status(500).json({ message: 'Error fetching pending leave requests' });
  }
});

// Employee: Submit a leave request
router.post('/leave', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const userId = req.user!.userId;

    const request = await prisma.leaveRequest.create({
      data: {
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING'
      }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Notify all admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          userId: a.id,
          title: 'New Leave Request',
          body: `${user?.firstName} requested leave from ${new Date(startDate).toLocaleDateString()}.`,
          type: 'LEAVE_REQUEST'
        }))
      });
    }

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting leave request' });
  }
});

// Admin: Review and Approve/Reject Leave Request
router.put('/leave/:id', authMiddleware, adminGuard, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // 'APPROVED' | 'REJECTED'

    const request = await prisma.leaveRequest.update({
      where: { id },
      data: { status }
    });

    // If approved, automatically overwrite the schedule for those days to 'LEAVE'
    if (status === 'APPROVED') {
      let currentDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      const overwritePromises = [];

      while (currentDate <= endDate) {
        // Skip weekends
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          overwritePromises.push(
            prisma.scheduleEntry.upsert({
              where: {
                userId_date: {
                  userId: request.userId,
                  date: currentDate,
                }
              },
              update: { type: 'LEAVE', notes: 'Approved PTO' },
              create: { userId: request.userId, date: currentDate, type: 'LEAVE', notes: 'Approved PTO' }
            })
          );
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      await Promise.all(overwritePromises);
    }

    // Notify the employee
    await prisma.notification.create({
      data: {
        userId: request.userId,
        title: `Leave Request ${status}`,
        body: `Your leave request from ${new Date(request.startDate).toLocaleDateString()} was ${status.toLowerCase()}.`,
        type: 'LEAVE_REQUEST'
      }
    });

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating leave request' });
  }
});

export default router;
