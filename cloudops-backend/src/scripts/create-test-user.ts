
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL manquante');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const email = 'test@example.com';

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('Utilisateur de test déjà existant');
      return;
    }

    const passwordHash = await bcrypt.hash(
      'MotDePasseDeTest123!',
      12,
    );

    const user = await prisma.user.create({
      data: {
        name: 'Utilisateur Test',
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log('Utilisateur créé :', user);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
