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
