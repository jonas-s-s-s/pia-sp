import React, { useState } from "react";

type AbstractFileUploaderProps = {
    lang: string;
    title: string;
    onUploadClick: (file: File) => Promise<void>;
    onError?: (error: unknown) => void; // Callback for errors
    footer?: React.ReactNode;
};

export default function AbstractFileUploader({
                                                 title,
                                                 onUploadClick,
                                                 onError,
                                                 footer,
                                             }: AbstractFileUploaderProps) {
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
            await onUploadClick(selectedFile);
            setStatus("Upload complete.");
        } catch (err: unknown) {
            onError?.(err);
            setStatus("");
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-6 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>

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

                {footer}

                {status && (
                    <div className="text-green-600 whitespace-pre-wrap">{status}</div>
                )}
            </div>
        </div>
    );
}
