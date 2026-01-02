import React, { useState } from "react";
import { actions } from "astro:actions";

export const roleNames = ["Customer", "Translator"];

type SignUpRoleFormProps = {
    onSuccess: () => void;
    onError: (error: string) => void;
};

export default function SignUpRoleForm({ onSuccess, onError }: SignUpRoleFormProps) {
    const [selectedRole, setSelectedRole] = useState<string>("Customer");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedRole)
            return onError("Please select a role");

        setLoading(true);

        try {
            const { error } = await actions.userRole.setMyRole({ role: selectedRole });
            setLoading(false);

            if (error) {
                onError("Failed to set role");
            } else {
                onSuccess();
            }
        } catch (err) {
            setLoading(false);
            onError("Unexpected error");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <h1 className="text-lg">Choose your role</h1>
            <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
                {roleNames.map((role) => (
                    <option key={role} value={role}>
                        {role}
                    </option>
                ))}
            </select>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? "Setting role..." : "Set Role"}
            </button>
        </form>
    );
}
