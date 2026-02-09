export const mappedUsers = (items: any) => {
  return items.map(({ user, ...items }) => ({
    ...user,
    full_name: [user.firstName, user.lastName, user.middleName]
      .filter(Boolean)
      .join(' '),
    ...items,
  }));
};
