import React, { useState } from "react";
import { signInEmail } from "../lib_frontend/auth-client";

type SignInPanelProps = {
    lang: string;
};

export default function SignInPanel(props: SignInPanelProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const { error } = await signInEmail(email, password, {
            onRequest: () => setLoading(true),
            onSuccess: () => {
                setLoading(false);
                window.location.href = `/${props.lang}/my-profile/`;
            },
            onError: (ctx) => {
                setLoading(false);
                setError(ctx?.error?.message ?? "Sign in failed");
            },
        });

        if (error) {
            setLoading(false);
            setError(error.message ?? "Sign in failed");
        }
    }

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm min-w-1/3">
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>

            {error && (
                <p className="mt-3 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
