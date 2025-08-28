export type UserRoles = "admin" | "editor" | "reader";

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRoles;
    isActive: boolean;
    emailVerified: boolean;
    twoFactorAuthentication: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export type PartialUser = Partial<User>;

export interface UserCredentials {
    token: string;
    refreshToken?: string;
}
