import { PrismaClient, Role, Department } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial users...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('Admin123', 10);
  const employeePassword = await bcrypt.hash('Employee123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@idc.agency' },
    update: {},
    create: {
      email: 'admin@idc.agency',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      initials: 'AD',
      role: Role.ADMIN,
      department: Department.OPS,
      jobTitle: 'Operations Director',
      bio: 'System Administrator.',
      avatarGradient: 'linear-gradient(135deg, #925FF0, #C084FC)',
      skills: ['Management', 'Admin'],
      joinedAt: new Date(),
      isActive: true,
    },
  });

  // Create Employee
  const employee = await prisma.user.upsert({
    where: { email: 'employee@idc.agency' },
    update: {},
    create: {
      email: 'employee@idc.agency',
      passwordHash: employeePassword,
      firstName: 'Jamie',
      lastName: 'Designer',
      initials: 'JD',
      role: Role.EMPLOYEE,
      department: Department.DESIGN,
      jobTitle: 'UI Designer',
      bio: 'Creates beautiful interfaces.',
      avatarGradient: 'linear-gradient(135deg, #FECB02, #FDE047)',
      skills: ['Figma', 'UI/UX'],
      joinedAt: new Date(),
      isActive: true,
    },
  });

  console.log('Seeding finished.');
  console.log('Admin:', admin.email, 'password: Admin123');
  console.log('Employee:', employee.email, 'password: Employee123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
