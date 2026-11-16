
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { Role } from '../generated/prisma/enums';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL manquante');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const email = 'admin-test@example.com';

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('Compte ADMIN de test déjà existant');
      return;
    }

    // Mot de passe aléatoire pour le test local
    const password = randomBytes(24).toString('hex');
    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name: 'Admin Test',
        email,
        passwordHash,
        role: Role.ADMIN,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log('Compte créé :', admin);
    console.log('Mot de passe temporaire :', password);
    console.log('Conserve ce mot de passe en privé.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
