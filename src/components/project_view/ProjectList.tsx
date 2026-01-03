import React from "react";
import type {ProjectItem, ProjectActionsProps} from "./ProjectViewTypes";
import { ProjectItemCard } from "./ProjectItemCard";

type ProjectListProps = {
    items: ProjectItem[];
    lang: string;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    ProjectActions?: React.ComponentType<ProjectActionsProps>;
    deleteProjectItem: (projectId: string) => void;
};

/**
 * A list consisting of cards with info about each project
 * Pass project action with project related buttons or other controls
 */
export function ProjectList({ items, lang, setError, ProjectActions, deleteProjectItem }: ProjectListProps) {
    return (
        <ul className="list-none space-y-4">
            {items.map((item) => (
                <ProjectItemCard
                    key={item.projectId}
                    item={item}
                    lang={lang}
                    setError={setError}
                    ProjectActions={ProjectActions}
                    deleteProjectItem={deleteProjectItem}
                />
            ))}
        </ul>
    );
}
