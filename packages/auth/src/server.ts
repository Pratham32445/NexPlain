import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "db/client"

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
        usePlural: true
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
        enabled: true
    },
    baseURL: "http://localhost:3000",
    appName: "flow.ai",
    trustedOrigins: ["http://localhost:3000"]
})

export type Auth = typeof auth;