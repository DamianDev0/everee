export enum Roles {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export const RoleLabels: Record<Roles, string> = {
  [Roles.ADMIN]: 'Administrator',
  [Roles.CUSTOMER]: 'Customer',
};
