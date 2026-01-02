import React, {useState} from "react";
import SignUpRoleForm from "./SignUpRoleForm.tsx";

type RoleChangerProps = {
    lang: string;
};

export default function RoleChanger(props: RoleChangerProps) {
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm min-w-1/3">

            <SignUpRoleForm onSuccess={() => {
                window.location.href = `/${props.lang}/my-profile/`;
            }} onError={setError}/>

            {error && (
                <p className="mt-3 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
