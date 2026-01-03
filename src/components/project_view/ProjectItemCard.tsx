import React from "react";
import type {ProjectItem, ProjectActionsProps} from "./ProjectViewTypes";

type ProjectItemCardProps = {
    item: ProjectItem;
    lang: string;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    ProjectActions?: React.ComponentType<ProjectActionsProps>;
    deleteProjectItem: (projectId: string) => void;
};

/**
 * This is a "card" displayed inside the ProjectList, it contains info about a project and can
 * have "ProjectAction" attached to it, which can be used to, for example, display buttons or
 * any other controls
 */
export function ProjectItemCard({item, lang, setError, ProjectActions, deleteProjectItem}: ProjectItemCardProps) {
    return (
        <li className="bg-sky-100 p-3 rounded-lg shadow-sm">
            <p><strong>Project ID:</strong> {item.projectId}</p>
            <p><strong>Language Code:</strong> {item.languageCode}</p>
            <p><strong>Original File Prefix:</strong> {item.originalFilePrefix || "Null"}</p>
            <p><strong>Translated File Prefix:</strong> {item.translatedFilePrefix || "Null"}</p>
            <p><strong>State:</strong> {item.state}</p>
            <p><strong>Created At:</strong> {new Date(item.createdAt).toLocaleString()}</p>
            <p><strong>Customer ID:</strong> {item.customerId || "Null"}</p>
            <p><strong>Customer Name:</strong> {item.customerName || "Null"}</p>
            {item.translatorId && <p><strong>Translator ID:</strong> {item.translatorId}</p>}
            {item.translatorName && <p><strong>Translator Name:</strong> {item.translatorName}</p>}
            {item.feedbackText && <p className="bg-amber-200"><strong>Feedback:</strong> {item.feedbackText}</p>}
            {item.feedbackCreatedAt &&
                <p className="bg-amber-200"><strong>Feedback Date:</strong> {item.feedbackCreatedAt.toLocaleString()}
                </p>}

            {ProjectActions && <ProjectActions deleteProjectItem={deleteProjectItem} item={item} lang={lang} setError={setError}/>}
        </li>
    );
}
