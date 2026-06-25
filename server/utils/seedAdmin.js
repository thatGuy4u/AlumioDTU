import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function seedAdmin() {
  try {
    const existing = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (existing) { console.log('Admin already exists:', existing.email); process.exit(0); }

    const hashedPw = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminDTU@2025', 12);
    const admin = await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME || 'DTU Admin',
        email: process.env.ADMIN_EMAIL || 'admin@dtu.ac.in',
        password: hashedPw,
        role: 'admin',
        isEmailVerified: true,
        isProfileComplete: true,
        isVerified: true,
      },
    });
    console.log('✅ Admin created:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}
seedAdmin();
