import React, {useEffect, useState} from "react";
import type {ProjectItem, ProjectActionsProps} from "./ProjectViewTypes";
import {ProjectList} from "./ProjectList";
import {LoadingSpinner} from "../LoadingSpinner";

type ProjectViewProps = {
    lang: string;
    title?: string;
    fetchProjects: () => Promise<{
        error?: { message?: string; code?: string } | null;
        data?: ProjectItem[];
    }>;
    ProjectActions?: React.ComponentType<ProjectActionsProps>;
};

/**
 * A universal control which displays a list of projects
 * This has been abstracted and fragmented into multiple components, so it can be reused
 * It accepts a function for obtaining projectItems and projectActions which is what's attached to each project item card
 */
export function ProjectView({lang, title = "Projects", fetchProjects, ProjectActions}: ProjectViewProps) {
    const [items, setItems] = useState<ProjectItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const deleteProjectItem = (projectId: string) => {
        setItems(prev =>
            prev.filter(item => item.projectId !== projectId)
        );
    };
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const result = await fetchProjects();

            if (result.error) {
                setError(result.error.message || "Error " + result.error.code);
            } else if (result.data) {
                setItems(result.data);
            }

            setLoading(false);
        };
        fetchData();
    }, [fetchProjects]);

    if (loading)
        return <LoadingSpinner/>;

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm min-w-1/2">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            {items.length === 0 ? (
                <p>No projects found.</p>
            ) : (
                <ProjectList deleteProjectItem={deleteProjectItem} items={items} lang={lang} setError={setError} ProjectActions={ProjectActions}/>
            )}
            {error && <div className="text-center mt-5 text-red-500">{error}</div>}
        </div>
    );
}
