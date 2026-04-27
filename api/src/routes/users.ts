import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { authMiddleware, adminGuard, AuthRequest } from '../utils/jwt';
import { Role, Department } from '@prisma/client';

const router = Router();

// Get all users (Employee & Admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        initials: true,
        role: true,
        department: true,
        jobTitle: true,
        bio: true,
        avatarGradient: true,
        skills: true,
        socialLinks: true,
        funFact: true,
        joinedAt: true,
        isActive: true,
      },
      orderBy: { firstName: 'asc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Create new user (Admin only)
router.post('/', authMiddleware, adminGuard, async (req: AuthRequest, res) => {
  try {
    const { email, password, firstName, lastName, department, jobTitle, role } = req.body;
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
    
    // Assign a default gradient based on department
    const gradientMap: Record<string, string> = {
      DESIGN: 'linear-gradient(135deg, #3B6FE8, #7C5CBF)',
      STRATEGY: 'linear-gradient(135deg, #2DAE7F, #3B6FE8)',
      VIDEO: 'linear-gradient(135deg, #F0A500, #E85D4A)',
      OPS: 'linear-gradient(135deg, #2DAE7F, #F0A500)',
    };
    const avatarGradient = gradientMap[department] || gradientMap['DESIGN'];

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        initials,
        role: role as Role || Role.EMPLOYEE,
        department: department as Department,
        jobTitle,
        avatarGradient,
        joinedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Update user profile (Employee can update their own, Admin can update anyone's)
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { bio, skills, socialLinks, funFact } = req.body;
    
    // Check permissions
    if (req.user?.userId !== id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        bio,
        skills,
        socialLinks,
        funFact
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        initials: true,
        role: true,
        department: true,
        jobTitle: true,
        bio: true,
        avatarGradient: true,
        skills: true,
        socialLinks: true,
        funFact: true,
        joinedAt: true,
        isActive: true,
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authMiddleware, adminGuard, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-deletion
    if (id === req.user?.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete related records in a transaction to respect foreign key constraints
    await prisma.$transaction([
      prisma.scheduleEntry.deleteMany({ where: { userId: id } }),
      prisma.timeEntry.deleteMany({ where: { userId: id } }),
      prisma.leaveRequest.deleteMany({ where: { userId: id } }),
      prisma.leaderboardPoint.deleteMany({ where: { userId: id } }),
      prisma.challengeEntry.deleteMany({ where: { userId: id } }),
      prisma.announcement.deleteMany({ where: { authorId: id } }),
      prisma.user.delete({ where: { id } })
    ]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router;
