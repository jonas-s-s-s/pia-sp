import React from "react";
import {actions} from "astro:actions";
import {ProjectView} from "../project_view/ProjectView.tsx";
import type {ProjectActionsProps} from "../project_view/ProjectViewTypes.ts";

type ProjectsViewProps = {
    lang: string;
    projectType?: "ASSIGNED" | "OTHER";
};

export default function TranslatorProjectsView({lang, projectType}: ProjectsViewProps) {
    const fetchProjects = async () => {
        if (projectType === "OTHER") {
            return actions.translator.getAllMyNonAssignedProjects({});
        } else {
            return actions.translator.getMyAssignedProjects({});
        }
    };

    return (
        <ProjectView
            lang={lang}
            title="My Projects"
            fetchProjects={fetchProjects}
            ProjectActions={TranslatorProjectActions}
        />
    );
}


export const TranslatorProjectActions: React.FC<ProjectActionsProps> = ({item, lang, setError}) => {
    const handleDownload = async (type: "original" | "translated") => {
        const {error, data} = await actions.translator.downloadFile({projectId: item.projectId, type});
        if (error) setError(error.message || "Error " + error.code);
        else window.open(data, "_blank");
    };

    if (item.state !== "ASSIGNED")
        return null;

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
            <a
                href={`/${lang}/translator/upload-translated?projectId=${item.projectId}`}
                className="select-none text-center border bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 px-3 py-1 rounded-lg"
            >
                Upload Translated
            </a>
        </div>
    );
};
