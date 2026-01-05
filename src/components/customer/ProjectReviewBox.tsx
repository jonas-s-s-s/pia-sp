import React, {useState} from "react";
import {actions} from "astro:actions";
import {ProjectView} from "../project_view/ProjectView.tsx";
import type {ProjectActionsProps} from "../project_view/ProjectViewTypes.ts";
import {downloadFileFromServer} from "../../lib_frontend/downloadFile.ts";

type ProjectsViewProps = {
    lang: string;
};

export default function ProjectReviewBox({lang}: ProjectsViewProps) {
    const fetchProjects = async () => {
        return actions.customer.getMyCompletedProjects({});
    };

    return (
        <ProjectView
            lang={lang}
            title="Completed Projects"
            fetchProjects={fetchProjects}
            ProjectActions={CompletedProjectActions}
        />
    );
}


export const CompletedProjectActions: React.FC<ProjectActionsProps> = ({item, lang, setError, deleteProjectItem}) => {
    const [reviewText, setReviewText] = useState<string>("");


    const handleDownload = async (type: "original" | "translated") => {
        await downloadFileFromServer(item.projectId, type, (err: string) => {setError(err);});
    };

    async function handleAddFeedBack(text: string, projectId: string) {
        if (!text.trim()) {
            setError("Error: no feedback provided");
            return;
        }

        const {error, data} = await actions.customer.setProjectFeedback({projectId, text: text.trim()});
        if (error) {
            setError(error.message || "Error " + error.code);
        } else {
            window.location.reload();
        }
    }

    async function handleApprove(projectId: string) {
        const {error, data} = await actions.customer.approveProject({projectId});
        if (error) {
            setError(error.message || "Error " + error.code);
        } else {
            window.location.reload();
        }
    }

    async function handleReject(projectId: string) {
        const {error, data} = await actions.customer.rejectProject({projectId});
        if (error) {
            setError(error.message || "Error " + error.code);
        } else {
            window.location.reload();
        }
    }

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


            <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 rounded-lg border bg-white border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

            <button
                onClick={() => handleAddFeedBack(reviewText, item.projectId)}
                className="border bg-amber-100 hover:bg-amber-200 active:bg-amber-300 px-3 py-1 rounded-lg"
            >
                Add Feedback
            </button>

            <button
                onClick={() => handleApprove(item.projectId)}
                className="mt-2 border bg-green-100 hover:bg-green-200 active:bg-green-300 px-3 py-1 rounded-lg"
            >
                Approve
            </button>

            <button
                onClick={() => handleReject(item.projectId)}
                className="border bg-red-100 hover:bg-red-200 active:bg-red-300 px-3 py-1 rounded-lg"
            >
                Reject
            </button>
        </div>
    );
};
