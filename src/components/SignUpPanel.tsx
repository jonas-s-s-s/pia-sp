import React, {useState} from "react";
import {signUp} from "../lib_frontend/auth-client";
import SignUpForm from "./SignUpForm.tsx";
import SignUpRoleForm from "./SignUpRoleForm.tsx";
import {showOkDialog} from "./dialogs/OkDialog.tsx";

type SignUpPanelProps = {
    lang: string;
};

export default function SignUpPanel(props: SignUpPanelProps) {
    const [error, setError] = useState<string | null>(null);
    const [signupSuccess, setSignupSuccess] = useState(false);

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm min-w-1/3">
            {!signupSuccess ? (
                <SignUpForm onError={setError} onSuccess={() => {
                    setSignupSuccess(true);
                    setError(null);
                }}/>
            ) : (
                <SignUpRoleForm onSuccess={() => {
                    showOkDialog({
                        title: "Role Set",
                        text: "You can now sign in",
                        buttonText: "Ok",
                        onClick: () => {
                            window.location.href = `/${props.lang}/my-profile/`;
                        },
                        onClose: () => {
                            window.location.href = `/${props.lang}/my-profile/`;
                        }
                    });
                }} onError={setError}/>
            )
            }

            {error && (
                <p className="mt-3 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
