import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // ສ້າງ User Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'ທ່ານ ສົມໄຊ ວິໄລສັກ (Admin)',
      role: 'ADMIN',
    },
  });

  // ສ້າງ User ພະນັກງານການເງິນ
  const financeStaff = await prisma.user.upsert({
    where: { username: 'finance' },
    update: {},
    create: {
      username: 'finance',
      password: hashedPassword,
      fullName: 'ນາງ ບຸນມີ ທຳມະວົງ (ການເງິນ)',
      role: 'FINANCE_STAFF',
    },
  });

  console.log('🌱 Seed User Database ສຳເລັດແລ້ວ:');
  console.log({ admin, financeStaff });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });