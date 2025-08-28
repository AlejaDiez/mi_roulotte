import { sequence } from "astro:middleware";
import { auth } from "./auth";
import { error } from "./error";

export const onRequest = sequence(auth, error);
