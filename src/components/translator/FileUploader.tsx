import React, { useState } from "react";
import {uploadTranslatedFile} from "../../lib_frontend/uploadTranslatedFile.ts";

type FileUploaderProps = {
    lang: string;
    projectId: string;
};

export default function FileUploader(props: FileUploaderProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFile(e.target.files?.[0] || null);
        setStatus("");
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setStatus("Uploading...");

        try {
            await uploadTranslatedFile(selectedFile, props.projectId);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setStatus(`Error: ${message}`);
        }

        setStatus("Upload complete.")
    };

    return (
        <div className="max-w-sm mx-auto mt-6 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Upload Translated File</h2>

            <div className="flex flex-col gap-4">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="border border-zinc-200 rounded-lg px-3 py-2"
                />
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile}
                    className={`border px-3 py-2 rounded-lg ${
                        selectedFile
                            ? "bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300"
                            : "bg-zinc-50 cursor-not-allowed"
                    }`}
                >
                    Upload File
                </button>

                <a
                    href={`/${props.lang}/translator/assigned-projects`}
                    className="select-none text-center border bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 px-3 py-1 rounded-lg"
                >
                    Go Back
                </a>

                {status && (
                    <div
                        className={`whitespace-pre-wrap ${
                            status.startsWith("Error") ? "text-red-500" : "text-green-600"
                        }`}
                    >
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
