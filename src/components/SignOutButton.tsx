import { useState } from 'react';
import { signOut } from "../lib_frontend/auth-client.ts";

interface SignOutButtonProps {
    lang: string;
}

export default function SignOutButton({ lang }: SignOutButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleSignOut = () => {
        if (loading) return;

        setLoading(true);

        signOut({
            onSuccess: () => {
                window.location.href = `/${lang}/`;
            },
            onError: (ctx) => {
                alert(ctx?.error?.message ?? "Failed to sign out");
                setLoading(false);
            }
        });
    };

    return (
        <button
            className="w-1/6 mt-6 px-5 py-2 bg-zinc-600 text-white font-semibold rounded-lg shadow hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
            onClick={handleSignOut}
            disabled={loading}
        >
            {loading ? "Signing out…" : "Sign Out"}
        </button>
    );
}
