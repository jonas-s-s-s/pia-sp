import React from "react";
import {actions} from "astro:actions";
import {ProjectView} from "../project_view/ProjectView.tsx";
import type {ProjectActionsProps} from "../project_view/ProjectViewTypes.ts";

type ProjectsViewProps = {
    lang: string;
};

export default function CustomerProjectsView({lang}: ProjectsViewProps) {
    const fetchProjects = async () => {
        return actions.customer.getMyProjects({});
    };

    return (
        <ProjectView
            lang={lang}
            title="My Projects"
            fetchProjects={fetchProjects}
            ProjectActions={CustomerProjectActions}
        />
    );
}


export const CustomerProjectActions: React.FC<ProjectActionsProps> = ({item, lang, setError, deleteProjectItem}) => {
    const handleDownload = async (type: "original" | "translated") => {
        const {error, data} = await actions.translator.downloadFile({projectId: item.projectId, type});
        if (error) {
            setError(error.message || "Error " + error.code);
        } else {
            window.open(data, "_blank");
        }
    };

    async function handleDeleteProject(projectId: string) {
        const {error, data} = await actions.customer.deleteMyProject({projectId});
        if (error) {
            setError(error.message || "Error " + error.code);
            return;
        }

        deleteProjectItem(projectId);
    }

    // if (item.state !== "ASSIGNED")
    //     return null;

    return (
        <div className="mt-3 flex gap-2 flex-col">
            <button
                onClick={() => handleDownload("original")}
                className="border bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 px-3 py-1 rounded-lg"
            >
                Download Original
            </button>
            <button
                onClick={() => handleDownload("translated")}
                className="border bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 px-3 py-1 rounded-lg"
            >
                Download Translated
            </button>

            <button
                onClick={() => handleDeleteProject(item.projectId)}
                className="border bg-red-100 hover:bg-red-200 active:bg-red-300 px-3 py-1 rounded-lg"
            >
                Delete Project
            </button>

        </div>
    );
};
