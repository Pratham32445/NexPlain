import {betterAuth} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import db from "db/client";

export const auth = betterAuth({    
    database : prismaAdapter(db,{
        provider: "postgresql",
        usePlural: true
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    user: {
        deleteUser: {
            enabled: true,
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    baseURL: "http://localhost:3000",
    appName: "OpenCut",
    trustedOrigins: ["http://localhost:3000"],
});
