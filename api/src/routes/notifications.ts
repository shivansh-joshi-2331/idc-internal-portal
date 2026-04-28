import { Router } from 'express';
import prisma from '../prisma';
import { authMiddleware, AuthRequest } from '../utils/jwt';

const router = Router();

// Get notifications for current user (including broadcasts)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    // In our schema, userId: null means broadcast.
    // However, tracking `isRead` for broadcasts requires a join table.
    // Since we don't have that, we'll just return broadcasts and user-specific notifications.
    // For a real production app, we'd need a UserReadNotification table or individual rows.
    
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId },
          { userId: null }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // limit to recent 20
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ message: 'Not found' });
    
    // If it's a specific user's notification, check ownership
    if (notification.userId && notification.userId !== req.user!.userId) {
       return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

export default router;
