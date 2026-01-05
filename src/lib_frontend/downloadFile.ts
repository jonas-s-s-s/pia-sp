import {actions} from "astro:actions";

export const downloadFileFromServer = async (projectId: string, type: "original" | "translated", setError: (msg: string) => void) => {
    try {
        const {data, error} = await actions.translator.downloadFile({projectId, type});
        if (error || !data)
            throw new Error(error?.message || "Download failed");

        const blob = new Blob([data.file instanceof Uint8Array ? data.file.slice().buffer : new Uint8Array(data.file).buffer]);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = data.fileName || "file";
        a.click();
        URL.revokeObjectURL(a.href);
    } catch (err: any) {
        setError(err.message || "Download error");
    }
};