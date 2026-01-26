export type Lang = 'uz' | 'ru' | 'en';

export const LANG_LABELS: Record<
    Lang,
    {
        modules: Record<string, string>;
        actions: Record<string, string>;
    }
> = {
    uz: {
        modules: {
            management: 'Boshqaruv',
            users: 'Foydalanuvchilar',
            roles: 'Rollar',
        },
        actions: {
            read: 'Ko‘rish',
            create: 'Yaratish',
            update: 'Tahrirlash',
            delete: 'O‘chirish',
        },
    },
    ru: {
        modules: {
            management: 'Управление',
            users: 'Пользователи',
            roles: 'Роли',
        },
        actions: {
            read: 'Просмотр',
            create: 'Создать',
            update: 'Редактировать',
            delete: 'Удалить',
        },
    },
    en: {
        modules: {
            management: 'Management',
            users: 'Users',
            roles: 'Roles',
        },
        actions: {
            read: 'View',
            create: 'Create',
            update: 'Edit',
            delete: 'Delete',
        },
    },
};

// 👉 Faqat SHUNI yozasiz
export const RESOURCES = {
    management: ['users', 'roles'],
    users: ['read', 'create', 'update', 'delete'],
    roles: ['read', 'create'],
};
