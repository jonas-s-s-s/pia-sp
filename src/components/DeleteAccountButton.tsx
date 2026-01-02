import { useState } from 'react';
import YesNoDialog from './dialogs/YesNoDialog.tsx';
import { deleteUser } from "../lib_frontend/auth-client.ts";

interface DeleteAccountButtonProps {
    lang: string;
}

export default function DeleteAccountButton({ lang }: DeleteAccountButtonProps) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleYes = () => {
        setDialogOpen(false);

        // Turns out that with the current configuration we don't need user's password to delete the account
        deleteUser("", {
            onRequest: () => {
            },
            onSuccess: () => {
                window.location.href = `/${lang}/`;
            },
            onError: (ctx) => {
                alert(ctx?.error?.message ?? "Failed to delete account");
            }
         }).then(r => {});
    };

    const handleNo = () => {
        setDialogOpen(false);
    };

    return (
        <>
            <button
                className="w-1/6 mt-6 px-5 py-2 bg-zinc-600 text-white font-semibold rounded-lg shadow hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
                onClick={() => setDialogOpen(true)}
            >
                Delete Account
            </button>

            <YesNoDialog
                open={dialogOpen}
                title="Delete Account"
                text="Are you sure you want to permanently delete your account? This action cannot be undone."
                yesText="Delete"
                noText="Cancel"
                onYes={handleYes}
                onNo={handleNo}
                onClose={handleNo}
                enabled = {true}
            />
        </>
    );
}
