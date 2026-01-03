import React, {useEffect, useState} from "react";
import {actions} from "astro:actions";
import AbstractFileUploader from "../AbstractFileUploader.tsx";
import {isIso6391} from "../../lib_frontend/iso-639-1.ts";
import {uploadOriginalFile} from "../../lib_frontend/uploadFile.ts";

type ProjectCreatorProps = {
    lang: string;
};

type project = {
    projectId: string;
    languageCode: string;
    originalFilePrefix: string | null;
    translatedFilePrefix: string | null;
    state: "CREATED" | "ASSIGNED" | "COMPLETED" | "APPROVED" | "CLOSED";
    createdAt: Date;
    customerId: string | null;
    customerName: string | null;
    feedbackText: string | null;
    feedbackCreatedAt: Date | null;
};

export default function ProjectCreator(props: ProjectCreatorProps) {
    const [error, setError] = useState<string | null>(null);
    const [languageCode, setLanguageCode] = useState("");
    const [projectCreated, setProjectCreated] = useState<boolean>(false);


    async function handleOnUploadClick(file: File) {
        // 1) Verify input

        if (!isIso6391(languageCode.trim())) {
            throw new Error("Invalid language code");
        }

        // 2) Verify file size
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
        if (file.size > MAX_FILE_SIZE) {
            throw new Error("File is too big. Only max 5 MB allowed.");
        }

        // 3) Create a new project
        const {
            data: projectData,
            error: createError
        } = await actions.customer.createProject({languageCode: languageCode.trim()});
        if (createError) {
            throw createError;
        }

        // 4) Upload the file
        try {
            await uploadOriginalFile(file, projectData.id);
        } catch (e) {
            throw e;
        }

        setError(null);
        setProjectCreated(true);
    }

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm min-w-1/2">
            {projectCreated ?
                (
                    <div className="flex justify-center flex-col items-center">
                        <h2 className="text-lg font-semibold mb-4">Project has been successfully created</h2>
                        <a
                            href={`/${props.lang}/`}
                            className="select-none text-center border bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 px-3 py-1 rounded-lg"
                        >
                            Go Back
                        </a>
                    </div>
                )
                :
                (
                    <>
                        <h2 className="text-lg font-semibold mb-4">Create a new project by uploading a file</h2>

                        <input
                            type="text"
                            value={languageCode}
                            onChange={(e) => setLanguageCode(e.target.value)}
                            placeholder="Language code"
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />

                        <AbstractFileUploader
                            title="Upload Project File"
                            lang={props.lang}
                            onUploadClick={(file: File) => handleOnUploadClick(file)}
                            onError={(err: unknown) => setError(err instanceof Error ? err.message : String(err))}
                        />
                    </>
                )

            }

            {error && (
                <div className="text-center mt-5 text-red-500">{error}</div>
            )}
        </div>
    );
}
