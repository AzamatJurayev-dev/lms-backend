import { CertificateTemplateType, PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const BASE_URL = process.env.APP_BASE_URL;

  if (!BASE_URL) {
    throw new Error('APP_BASE_URL is not defined in .env');
  }

  console.log('🌱 Seeding certificate templates...');

  await prisma.certificateTemplate.upsert({
    where: { type: CertificateTemplateType.CLASSIC },
    update: {},
    create: {
      name: 'Classic Certificate',
      type: CertificateTemplateType.CLASSIC,
      imageUrl: `${BASE_URL}/templates/template1.png`,
      width: 1200,
      height: 850,
    },
  });

  await prisma.certificateTemplate.upsert({
    where: { type: CertificateTemplateType.MODERN },
    update: {},
    create: {
      name: 'Modern Certificate',
      type: CertificateTemplateType.MODERN,
      imageUrl: `${BASE_URL}/templates/template2.png`,
      width: 1200,
      height: 850,
    },
  });

  console.log('✅ Templates seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
