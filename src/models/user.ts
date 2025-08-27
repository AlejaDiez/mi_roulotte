export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
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
