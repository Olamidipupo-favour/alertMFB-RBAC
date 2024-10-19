export class UserEntity {
  id: string;

  firstName?: string;

  lastName?: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  roles?: string[];
}

export class RoleEntity {
  name: string;
  permissions: string;
}

export interface IcommonReturn {
  message: string;
  data?: Object | Array<Object>;
  error?: Object;
  meta?: Object;
}

export interface IUser {
 userId: string,
 roles: Array<Object>
}