import {createRoot} from 'react-dom/client';
import {BaseDialog} from './BaseDialog'
import {useEffect, type ReactElement} from "react";

interface OkDialogProps {
    open: boolean
    title: string
    text?: string | ReactElement
    buttonText?: string
    onClick?: () => void
    onClose?: () => void
    children?: ReactElement
}

export default function OkDialog({open, title, text, buttonText = 'OK', onClick, onClose, children}: OkDialogProps) {
    // This dialog can be closed by pressing the enter key
    useEffect(() => {
        if (!open) return

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Enter') {
                onClose?.()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, onClose])


    return (
        <BaseDialog
            open={open}
            title={title}
            onClose={onClose}
            footer={
                <button
                    type="button"
                    onClick={onClick}
                    className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 "
                >
                    {buttonText}
                </button>
            }
        >
            {children ? children :
                <p className="text-sm text-gray-700 ">
                    {text}
                </p>
            }
        </BaseDialog>
    )
}


interface ShowOkDialogOptions {
    title: string;
    text: string | React.ReactElement;
    buttonText?: string;
    onClick?: () => void;
    onClose?: () => void;
}

export function showOkDialog({title, text, buttonText, onClick, onClose}: ShowOkDialogOptions) {
    // 1. Create a container div
    const container = document.createElement("div");
    document.body.appendChild(container);

    // 2. Cleanup function to remove dialog
    function cleanup() {
        root.unmount();      // Unmount the React component
        container.remove();   // Remove the div from the body
    }

    // 3. Wrap callbacks to ensure cleanup happens
    function handleClick() {
        onClick?.();   // Call user-provided onClick
        cleanup();     // Close the dialog
    }

    function handleClose() {
        onClose?.();   // Call user-provided onClose
        cleanup();     // Close the dialog
    }

    // 4. Render the dialog into the container
    const root = createRoot(container);
    root.render(
        <OkDialog
            open={true}
            title={title}
            text={text}
            buttonText={buttonText}
            onClick={handleClick}
            onClose={handleClose}
        />
    );
}