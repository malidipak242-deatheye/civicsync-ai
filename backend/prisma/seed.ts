import { PrismaClient, Role, Priority, ComplaintStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Departments ---
  const deptSanitation = await prisma.department.upsert({
    where: { name: 'Sanitation & Garbage' },
    update: {},
    create: { name: 'Sanitation & Garbage', description: 'Handles garbage collection and disposal.' },
  });
  const deptRoads = await prisma.department.upsert({
    where: { name: 'Roads & Transport' },
    update: {},
    create: { name: 'Roads & Transport', description: 'Handles pothole repairs, road damage and traffic.' },
  });
  const deptElec = await prisma.department.upsert({
    where: { name: 'Electrical & Street Lights' },
    update: {},
    create: { name: 'Electrical & Street Lights', description: 'Manages public lighting and electrical faults.' },
  });

  console.log('✅ Departments created.');

  // --- Wards ---
  const ward1 = await prisma.ward.upsert({ where: { id: 'ward-1' }, update: {}, create: { id: 'ward-1', name: 'Ward 1 - Amalner East' } });
  const ward2 = await prisma.ward.upsert({ where: { id: 'ward-2' }, update: {}, create: { id: 'ward-2', name: 'Ward 2 - Amalner West' } });

  console.log('✅ Wards created.');

  // --- Users ---
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@amalner.gov.in' },
    update: {},
    create: { email: 'admin@amalner.gov.in', name: 'Amalner Admin', passwordHash: hash, role: Role.SUPER_ADMIN },
  });

  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@example.com' },
    update: {},
    create: { email: 'citizen@example.com', name: 'Rahul Deshmukh', passwordHash: hash, role: Role.CITIZEN, phone: '9876543210' },
  });

  const worker = await prisma.user.upsert({
    where: { email: 'worker@amalner.gov.in' },
    update: {},
    create: {
      email: 'worker@amalner.gov.in', name: 'Suresh Patil', passwordHash: hash, role: Role.WORKER,
      departmentId: deptRoads.id,
    },
  });

  console.log('✅ Users created.');

  // --- Complaints ---
  await prisma.complaint.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'complaint-1',
        title: 'Large Pothole near Market Road',
        description: 'A very large pothole has formed near the main market. Many vehicles have been damaged.',
        category: 'Pothole',
        priority: Priority.HIGH,
        status: ComplaintStatus.IN_PROGRESS,
        latitude: 21.0425,
        longitude: 75.0592,
        address: 'Market Road, Amalner',
        citizenId: citizen.id,
        workerId: worker.id,
        departmentId: deptRoads.id,
        wardId: ward1.id,
        aiCategory: 'Pothole',
        aiPriority: Priority.HIGH,
        aiConfidence: 0.96,
        aiSummary: 'Large pothole detected on main market road posing risk to vehicles.',
      },
      {
        id: 'complaint-2',
        title: 'Garbage overflow near bus stand',
        description: 'The garbage bin near the bus stand is overflowing since 3 days.',
        category: 'Garbage',
        priority: Priority.MEDIUM,
        status: ComplaintStatus.SUBMITTED,
        latitude: 21.044,
        longitude: 75.061,
        address: 'Bus Stand, Amalner',
        citizenId: citizen.id,
        departmentId: deptSanitation.id,
        wardId: ward2.id,
        aiCategory: 'Garbage',
        aiPriority: Priority.MEDIUM,
        aiConfidence: 0.89,
        aiSummary: 'Overflowing garbage detected near public bus stand.',
      },
      {
        id: 'complaint-3',
        title: 'Street light not working on Station Road',
        description: '3 streetlights have been off for over a week, making the area unsafe at night.',
        category: 'Street Light',
        priority: Priority.LOW,
        status: ComplaintStatus.RESOLVED,
        latitude: 21.041,
        longitude: 75.058,
        address: 'Station Road, Amalner',
        citizenId: citizen.id,
        departmentId: deptElec.id,
        wardId: ward1.id,
        resolvedAt: new Date(),
        aiCategory: 'Street Light',
        aiPriority: Priority.LOW,
        aiConfidence: 0.92,
        aiSummary: 'Non-functional street lights detected on station road.',
      },
    ],
  });

  console.log('✅ Complaints seeded.');
  console.log('\n🎉 Seeding complete! Login credentials:');
  console.log('   Admin:   admin@amalner.gov.in / password123');
  console.log('   Citizen: citizen@example.com  / password123');
  console.log('   Worker:  worker@amalner.gov.in / password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
