import React, {useState} from "react";
import {signUp} from "../lib_frontend/auth-client.ts";

type SignUpFormProps = {
    onError: (error: any) => void;
    onSuccess: () => void;
};

export default function SignUpForm(props: SignUpFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const {error} = await signUp(email, password, name, {
            onRequest: () => setLoading(true),
            onSuccess: () => {
                setLoading(false);
                props.onSuccess();
            },
            onError: (ctx) => {
                setLoading(false);
                props.onError(ctx?.error?.message ?? "Sign up failed");
            },
        });

        if (error) {
            setLoading(false);
            props.onError(error.message ?? "Sign up failed");
        }
    }

    return (

        <form onSubmit={handleSubmit} className="space-y-3">
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />

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
                {loading ? "Signing up..." : "Sign Up"}
            </button>
        </form>
    );
}