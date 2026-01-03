import React, { useState } from "react";
import { uploadTranslatedFile } from "../../lib_frontend/uploadFile.ts";
import AbstractFileUploader from "../AbstractFileUploader.tsx";

type FileUploaderProps = {
    lang: string;
    projectId: string;
};

export default function TranslatedFileUploader({ lang, projectId }: FileUploaderProps) {
    const [error, setError] = useState<string | null>(null);

    const handleUploadClick = async (file: File) => {
        setError(null);
        await uploadTranslatedFile(file, projectId);
    };

    const handleError = (err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
    };

    return (
        <div>
            <AbstractFileUploader
                title="Upload Translated File"
                lang={lang}
                onUploadClick={handleUploadClick}
                onError={handleError}
                footer={
                    <a
                        href={`/${lang}/translator/assigned-projects`}
                        className="select-none text-center border bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 px-3 py-1 rounded-lg"
                    >
                        Go Back
                    </a>
                }
            />
            {error && (
                <div className="mt-2 text-red-500 text-center">{`Error: ${error}`}</div>
            )}
        </div>
    );
}
