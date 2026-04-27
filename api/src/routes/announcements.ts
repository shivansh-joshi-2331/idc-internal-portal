import { Router } from 'express';
import prisma from '../prisma';
import { authMiddleware, adminGuard, AuthRequest } from '../utils/jwt';
import { Priority } from '@prisma/client';

const router = Router();

// Get all announcements
router.get('/', authMiddleware, async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, initials: true, avatarGradient: true }
        }
      }
    });
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

// Create new announcement (Admin only)
router.post('/', authMiddleware, adminGuard, async (req: AuthRequest, res) => {
  try {
    const { title, body, priority } = req.body;
    
    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        priority: priority as Priority || 'NORMAL',
        authorId: req.user!.userId,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, initials: true, avatarGradient: true }
        }
      }
    });

    // Create a broadcast notification
    await prisma.notification.create({
      data: {
        title: 'New Announcement',
        body: title,
        type: 'ANNOUNCEMENT',
        userId: null // null means global broadcast per schema comments
      }
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Error creating announcement' });
  }
});

export default router;
