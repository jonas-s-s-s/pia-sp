import React from "react";

export type ProjectItem = {
    projectId: string;
    languageCode: string;
    originalFilePrefix: string | null;
    translatedFilePrefix: string | null;
    state: "CREATED" | "ASSIGNED" | "COMPLETED" | "APPROVED" | "CLOSED";
    createdAt: Date;
    customerId: string | null;
    customerName: string | null;
    feedbackText: string | null;
    feedbackCreatedAt: Date | null;
};

export type ProjectActionsProps = {
    item: ProjectItem;
    lang: string;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
};
