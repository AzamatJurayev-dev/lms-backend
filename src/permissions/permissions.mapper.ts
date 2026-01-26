export function mapPermissionTree(
    permissions: any[],
    checkedIds: Set<number>,
    lang: string,
) {
    return permissions.map((p) => {
        const translation =
            p.translations.find((t) => t.lang === lang) ??
            p.translations[0];

        return {
            id: p.id,
            code: p.code,
            name: translation?.name ?? p.code,
            is_checked: false, // doim false
            children: mapPermissionTree(p.children, checkedIds, lang),
        };
    });
}
