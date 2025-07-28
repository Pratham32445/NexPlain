import { useState } from "react";
import { signIn } from "@repo/auth/client";

export function useLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string
        | null>("");
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleLogin = async () => {
        setError(null);
        setIsEmailLoading(true);
        const { error } = await signIn.email({
            email,
            password
        })
        if (error) {
            setError(error.message || "An unexpected error occured");
            setIsEmailLoading(false);
            return;
        }
    }

    const handleGoogleLogin = async () => {
        setError(null);
        setIsGoogleLoading(true);
        try {
            await signIn.social({
                provider: "google",
                callbackURL: "/"
            })
        } catch (error) {
            setError("Failed to sign in with Google. Please try again.");
            setIsGoogleLoading(false);
        }
    }

    const isAnyLoading = isGoogleLoading || isEmailLoading;

    return {
        email, setEmail, password,
        setPassword,
        error,
        isEmailLoading,
        isGoogleLoading,
        isAnyLoading,
        handleLogin,
        handleGoogleLogin,
    }
}