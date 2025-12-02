import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Load environment variables from .env.local
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      active: true,
      locale: 'en',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample grading policies
  const standardGradingPolicy = await prisma.gradingPolicy.upsert({
    where: { id: 'standard-letter-grades' },
    update: {},
    create: {
      id: 'standard-letter-grades',
      name: 'Standard Letter Grades',
      type: 'LETTER',
      scale: [
        { letter: 'A', minValue: 90, maxValue: 100, gpaValue: 4.0 },
        { letter: 'B', minValue: 80, maxValue: 89, gpaValue: 3.0 },
        { letter: 'C', minValue: 70, maxValue: 79, gpaValue: 2.0 },
        { letter: 'D', minValue: 60, maxValue: 69, gpaValue: 1.0 },
        { letter: 'F', minValue: 0, maxValue: 59, gpaValue: 0.0 },
      ],
    },
  });

  console.log('✅ Created grading policy:', standardGradingPolicy.name);

  const plusMinusGradingPolicy = await prisma.gradingPolicy.upsert({
    where: { id: 'plus-minus-grades' },
    update: {},
    create: {
      id: 'plus-minus-grades',
      name: 'Plus/Minus Letter Grades',
      type: 'LETTER',
      scale: [
        { letter: 'A+', minValue: 97, maxValue: 100, gpaValue: 4.0 },
        { letter: 'A', minValue: 93, maxValue: 96, gpaValue: 4.0 },
        { letter: 'A-', minValue: 90, maxValue: 92, gpaValue: 3.7 },
        { letter: 'B+', minValue: 87, maxValue: 89, gpaValue: 3.3 },
        { letter: 'B', minValue: 83, maxValue: 86, gpaValue: 3.0 },
        { letter: 'B-', minValue: 80, maxValue: 82, gpaValue: 2.7 },
        { letter: 'C+', minValue: 77, maxValue: 79, gpaValue: 2.3 },
        { letter: 'C', minValue: 73, maxValue: 76, gpaValue: 2.0 },
        { letter: 'C-', minValue: 70, maxValue: 72, gpaValue: 1.7 },
        { letter: 'D+', minValue: 67, maxValue: 69, gpaValue: 1.3 },
        { letter: 'D', minValue: 63, maxValue: 66, gpaValue: 1.0 },
        { letter: 'D-', minValue: 60, maxValue: 62, gpaValue: 0.7 },
        { letter: 'F', minValue: 0, maxValue: 59, gpaValue: 0.0 },
      ],
    },
  });

  console.log('✅ Created grading policy:', plusMinusGradingPolicy.name);

  const numericGradingPolicy = await prisma.gradingPolicy.upsert({
    where: { id: 'numeric-0-100' },
    update: {},
    create: {
      id: 'numeric-0-100',
      name: 'Numeric (0-100)',
      type: 'NUMERIC',
      scale: [
        { letter: '100', minValue: 100, maxValue: 100, gpaValue: 4.0 },
        { letter: '90', minValue: 90, maxValue: 99, gpaValue: 3.6 },
        { letter: '80', minValue: 80, maxValue: 89, gpaValue: 3.2 },
        { letter: '70', minValue: 70, maxValue: 79, gpaValue: 2.8 },
        { letter: '60', minValue: 60, maxValue: 69, gpaValue: 2.0 },
        { letter: '0', minValue: 0, maxValue: 59, gpaValue: 0.0 },
      ],
    },
  });

  console.log('✅ Created grading policy:', numericGradingPolicy.name);

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📝 Default credentials:');
  console.log('   Email: admin@school.com');
  console.log('   Password: admin123');
  console.log('\n⚠️  Please change the admin password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
