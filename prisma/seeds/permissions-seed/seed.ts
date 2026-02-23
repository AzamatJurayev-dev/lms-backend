import { PrismaClient } from '@prisma/client';
import { LANG_LABELS, RESOURCES } from './permissions.config';

const prisma = new PrismaClient();

async function upsertTranslations(
  permissionId: number,
  names: Record<string, string>,
) {
  for (const [lang, name] of Object.entries(names)) {
    await prisma.permissionTranslation.upsert({
      where: {
        permissionId_lang: { permissionId, lang },
      },
      update: { name },
      create: { permissionId, lang, name },
    });
  }
}

async function main() {
  for (const [module, actions] of Object.entries(RESOURCES)) {
    const parent = await prisma.permission.upsert({
      where: { code: module },
      update: {},
      create: { code: module },
    });

    const moduleNames = Object.fromEntries(
      Object.entries(LANG_LABELS).map(([lang, labels]) => [
        lang,
        labels.modules[module] ?? module,
      ]),
    );

    await upsertTranslations(parent.id, moduleNames);

    for (const action of actions) {
      const code = `${module}.${action}`;

      const permission = await prisma.permission.upsert({
        where: { code },
        update: {},
        create: {
          code,
          parentId: parent.id,
        },
      });

      const actionNames = Object.fromEntries(
        Object.entries(LANG_LABELS).map(([lang, labels]) => [
          lang,
          `${labels.modules[module] ?? module} ${labels.actions[action] ?? action}`,
        ]),
      );

      await upsertTranslations(permission.id, actionNames);
    }
  }
}

main()
  .then(() => console.log('✅ Dynamic permissions seeded'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
