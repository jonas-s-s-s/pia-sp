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
            <p><strong>Project ID:</strong> {item.id}</p>
            <p><strong>Language Code:</strong> {item.languageCode}</p>
            <p><strong>Original File Prefix:</strong> {item.files.originalPrefix || "Null"}</p>
            <p><strong>Translated File Prefix:</strong> {item.files.translatedPrefix || "Null"}</p>
            <p><strong>State:</strong> {item.state}</p>
            <p><strong>Created At:</strong> {new Date(item.createdAt).toLocaleString()}</p>
            <p><strong>Customer ID:</strong> {item.customer.id || "Null"}</p>
            <p><strong>Customer Name:</strong> {item.customer.name || "Null"}</p>
            {item.translator.id && <p><strong>Translator ID:</strong> {item.translator.id}</p>}
            {item.translator.name && <p><strong>Translator Name:</strong> {item.translator.name}</p>}
            {item.feedback && <p className="bg-amber-200"><strong>Feedback:</strong> {item.feedback.text}</p>}
            {item.feedback &&
                <p className="bg-amber-200"><strong>Feedback Date:</strong> {item.feedback.createdAt.toLocaleString()}
                </p>}

            {ProjectActions && <ProjectActions deleteProjectItem={deleteProjectItem} item={item} lang={lang} setError={setError}/>}
        </li>
    );
}
