import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const generateToken = (
    payload: Record<string, any>,
    key: string,
    expiresIn?: number
) =>
    jwt.sign(payload, key, {
        expiresIn
    });

export const validateToken = (
    token: string,
    key: string
): Record<string, any> | null => {
    try {
        return jwt.verify(token, key) as Record<string, any>;
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

export const hash = async (data: string) => await bcrypt.hash(data, 10);

export const compareHash = async (data: string, encrypted: string) =>
    await bcrypt.compare(data, encrypted);
