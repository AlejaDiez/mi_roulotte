import bcryptjs from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";

export const generateToken = async (
    payload: Record<string, any>,
    key: string,
    expiresIn: number
): Promise<string> => {
    const now = Math.floor(Date.now() / 1000);
    const secret = new TextEncoder().encode(key);

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(now + expiresIn)
        .sign(secret);
};

export const validateToken = async (
    token: string,
    key: string
): Promise<Record<string, any> | null> => {
    const secret = new TextEncoder().encode(key);

    try {
        return (await jwtVerify(token, secret)).payload;
    } catch {
        return null;
    }
};

export const generateHash = (length: number = 6): string => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
};

export const hash = async (data: string): Promise<string> => {
    return await bcryptjs.hash(data, 12);
};

export const compareHash = async (
    data: string,
    encrypted: string
): Promise<boolean> => {
    return await bcryptjs.compare(data, encrypted);
};
