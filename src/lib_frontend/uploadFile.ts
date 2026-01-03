import {actions} from "astro:actions";

export async function uploadTranslatedFile(file: File, projectId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    const {error} = await actions.translator.uploadTranslatedFile(formData);
    if (error) {
        throw new Error(error.message || 'Failed to upload translated file');
    }
}

export async function uploadOriginalFile(file: File, projectId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    const {error} = await actions.customer.uploadOriginalFile(formData);
    if (error) {
        throw new Error(error.message || 'Failed to upload original file');
    }
}