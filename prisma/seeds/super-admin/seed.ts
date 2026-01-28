import {PrismaClient} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const superAdminRole = await prisma.role.upsert({
        where: {code: 'super_admin'},
        update: {},
        create: {
            code: 'super_admin',
        },
    });

    const passwordHash = await bcrypt.hash('SuperAdmin123!', 10);

    await prisma.user.upsert({
        where: {username: 'superadmin'},
        update: {},
        create: {
            username: 'superadmin',
            password: passwordHash,
            roleId: superAdminRole.id,
            isActive: true,
        },
    });
    console.log('✅ SUPER_ADMIN seeded');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
