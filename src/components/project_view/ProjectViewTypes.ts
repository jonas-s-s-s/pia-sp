import React from "react";
import type {ProjectDTO} from "../../../dto/project/ProjectDTO.ts";
import type {projectState} from "../../db/schema/project-schema.ts";

export type ProjectItem = ProjectDTO;

export type ProjectActionsProps = {
    item: ProjectItem;
    lang: string;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    deleteProjectItem: (projectId: string) => void;
};

export type ProjectState = projectState;

export const PROJECT_STATES: string[] = [
    "CREATED",
    "ASSIGNED",
    "COMPLETED",
    "APPROVED",
    "CLOSED",
];
