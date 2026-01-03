import React, {useEffect, useState} from "react";
import {actions} from "astro:actions";

type ProjectsViewProps = {
    lang: string;
};

type projectItem = {
    projectId: string;
    languageCode: string;
    originalFilePrefix: string | null;
    translatedFilePrefix: string | null;
    state: "CREATED" | "ASSIGNED" | "COMPLETED" | "APPROVED" | "CLOSED";
    createdAt: Date;
    customerId: string | null;
    customerName: string | null;
};

export default function ProjectsView(props: ProjectsViewProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<projectItem[]>([]);

    const handleDownloadOriginal = async (projectId: string) => {
        const {error, data} = await actions.translator.downloadFile({projectId: projectId, type: "original"});
        if (error) {
            setError(error.message || "Error " + error.code);
            return;
        }
        window.open(data, '_blank');
    };

    const handleDownloadTranslated = async (projectId: string) => {
        const {error, data} = await actions.translator.downloadFile({projectId: projectId, type: "translated"});
        if (error) {
            setError(error.message || "Error " + error.code);
            return;
        }
        window.open(data, '_blank');
    };

    // Fetch the array of translator's projects on component mount
    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);

            const {error, data} = await actions.translator.getMyAssignedProjects({});
            if (error) {
                setError(error.message || "Error " + error.code);
            } else if (data) {
                setItems(data);
            }

            setLoading(false);
        };

        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div
                className="flex justify-center max-w-sm mx-auto mt-10 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm min-w-1/3">
                <div
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm min-w-1/2">
            <div>
                <h2 className="text-lg font-semibold mb-4">My Projects</h2>
                {items.length === 0 ? (
                    <p>No projects found.</p>
                ) : (
                    <ul className="list-none space-y-4">
                        {items.map((item, index) => (
                            <li
                                key={index}
                                className="bg-sky-100 p-3 rounded-lg shadow-sm"
                            >
                                <p><strong>Project ID:</strong> {item.projectId}</p>
                                <p><strong>Language Code:</strong> {item.languageCode}</p>
                                <p><strong>Original File Prefix:</strong> {item.originalFilePrefix || "Null"}</p>
                                <p><strong>Translated File Prefix:</strong> {item.translatedFilePrefix || "Null"}</p>
                                <p><strong>State:</strong> {item.state}</p>
                                <p><strong>Created At:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                <p><strong>Customer ID:</strong> {item.customerId || "Null"}</p>
                                <p><strong>Customer Name:</strong> {item.customerName || "Null"}</p>

                                {/* Buttons */}
                                <div className="mt-3 flex gap-2 flex-col">
                                    <button
                                        onClick={() => handleDownloadOriginal(item.projectId)}
                                        className="border bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 px-3 py-1 rounded-lg"
                                    >
                                        Download Original
                                    </button>
                                    <button
                                        onClick={() => handleDownloadTranslated(item.projectId)}
                                        className="border bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 px-3 py-1 rounded-lg"
                                    >
                                        Download Translated
                                    </button>
                                    <a
                                        href={`/${props.lang}/translator/upload-translated?projectId=${item.projectId}`}
                                        className="select-none text-center border bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 px-3 py-1 rounded-lg"
                                    >
                                        Upload Translated
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {error && (
                <div className="text-center mt-5 text-red-500">{error}</div>
            )}
        </div>
    );
}
