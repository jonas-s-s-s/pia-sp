import React, {useState} from "react";
import {actions} from "astro:actions";
import {ProjectView} from "../project_view/ProjectView.tsx";
import type {ProjectActionsProps, ProjectState} from "../project_view/ProjectViewTypes.ts";
import {PROJECT_STATES} from "../project_view/ProjectViewTypes.ts";
import {showOkDialog} from "../dialogs/OkDialog.tsx";

type AdminProjectViewProps = {
    lang: string;
};

const EMAIL_DESTINATIONS: string[] = [
    "Customer",
    "Translator",
];

export default function AdminProjectView({lang}: AdminProjectViewProps) {
    const [filteredState, setFilteredState] = useState<ProjectState | null>(null);

    const fetchProjects = async () => {
        if (filteredState) {
            return actions.administrator.getAllProjectsByState({
                state: filteredState,
            });
        }

        return actions.administrator.getAllProjectsWithFeedback({});
    };

    return (
        <div className="flex w-full flex-col gap-4">
            {/* Filter dropdown */}
            <div className="mt-3 flex justify-center items-center gap-2">
                <label className="text-sm font-medium">Filter by state:</label>
                <select
                    value={filteredState ?? ""}
                    onChange={(e) =>
                        setFilteredState(
                            e.target.value === ""
                                ? null
                                : (e.target.value as ProjectState)
                        )
                    }
                    className="px-3 py-2 rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2"
                >
                    <option value="">All states with feedback</option>
                    {PROJECT_STATES.map((state) => (
                        <option key={state} value={state}>
                            {state}
                        </option>
                    ))}
                </select>
            </div>

            <ProjectView
                lang={lang}
                title="Completed Projects"
                fetchProjects={fetchProjects}
                ProjectActions={AdminProjectActions}
            />
        </div>
    );
}

export const AdminProjectActions: React.FC<ProjectActionsProps> = ({item, lang, setError, deleteProjectItem}) => {
    const [responseText, setResponseText] = useState<string>("");
    const [sendingEmail, setSendingEmail] = useState<boolean>(false);
    const [destination, setDestination] = useState<string>(EMAIL_DESTINATIONS[0]);

    async function handleSendRespone(text: string, projectId: string, destinationUser?: string | null) {
        if (!text.trim()) {
            setError("Error: no response provided");
            return;
        }

        if (!destinationUser) {
            setError("Error: no destination user provided");
            return;
        }

        setSendingEmail(true);
        const {error, data} = await actions.administrator.reactToFeedback({
            projectId,
            message: text.trim(),
            destinationUserID: destinationUser
        });

        if (error) {
            setSendingEmail(false);
            setError(error.message || "Error " + error.code);
            return;
        }

        showOkDialog({title: "Email Sent", text: "Email sent successfully"});
        setResponseText("");
        setSendingEmail(false);
    }

    async function handleMarkAsClosed(projectId: string) {
        const {error, data} = await actions.administrator.closeProject({projectId});
        if (error) {
            setError(error.message || "Error " + error.code);
        } else {
            window.location.reload();
        }
    }

    return (
        <div className="mt-3 flex gap-2 flex-col">

            {(item.feedback && item.state !== "CLOSED") &&
                <>

                    {sendingEmail ? (
                        <div
                            className="bg-white border border-zinc-300 rounded-lg w-full flex justify-center mx-auto p-6 min-w-1/3">
                            <div
                                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder=""
                                className="w-full px-3 py-2 rounded-lg border bg-white border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-400"/>

                            <div className="flex flex-row justify-center items-center gap-2">
                                <label className="text-sm font-medium">Send to:</label>
                                <select
                                    value={destination ?? ""}
                                    onChange={(e) =>
                                        setDestination(e.target.value)
                                    }
                                    className="px-3 py-2 flex-1 rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-2"
                                >
                                    {EMAIL_DESTINATIONS.map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            <button
                                onClick={() => handleSendRespone(
                                    responseText,
                                    item.id,
                                    destination === EMAIL_DESTINATIONS[0] ? item.customer.id : item.translator.id
                                )}
                                className="border bg-amber-100 hover:bg-amber-200 active:bg-amber-300 px-3 py-1 rounded-lg"
                            >
                                Send Response
                            </button>

                        </>
                    )}
                </>
            }

            {item.state == "APPROVED" &&
                <button
                    onClick={() => handleMarkAsClosed(item.id)}
                    className="border bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 px-3 py-1 rounded-lg"
                >
                    Mark as Closed
                </button>

            }


        </div>
    );
};
