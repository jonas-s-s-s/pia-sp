import {BaseDialog} from './BaseDialog'
import {useEffect, useState, type ReactNode} from "react";
import {createRoot} from "react-dom/client";

interface TextAreaDialogProps {
    open: boolean
    title: string
    initialText?: string
    placeholder?: string
    rows?: number
    yesText?: string
    noText?: string
    enabled?: boolean
    onYes?: (value: string) => void
    onNo?: () => void
    onClose?: () => void
    children?: ReactNode
}

export default function TextAreaDialog({
                                           open,
                                           title,
                                           initialText = '',
                                           placeholder = 'Enter your text here...',
                                           rows = 8,
                                           yesText = 'Save',
                                           noText = 'Cancel',
                                           enabled = true,
                                           onYes,
                                           onNo,
                                           onClose,
                                           children
                                       }: TextAreaDialogProps) {
    const [value, setValue] = useState(initialText)

    // Reset when reopened
    useEffect(() => {
        if (open) {
            setValue(initialText)
        }
    }, [open, initialText])

    // Make Enter + Ctrl/Meta trigger "Yes"
    useEffect(() => {
        if (!open) return

        function handleKeyDown(event: KeyboardEvent) {
            if ((event.key === 'Enter' && (event.ctrlKey || event.metaKey))) {
                onYes?.(value)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, value, onYes])

    return (
        <BaseDialog
            open={open}
            title={title}
            onClose={onClose}
            footer={
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => onYes?.(value)}
                        disabled={!enabled}
                        className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 "
                    >
                        {yesText}
                    </button>
                    <button
                        type="button"
                        onClick={onNo}
                        disabled={!enabled}
                        className="rounded-md bg-gray-300 px-6 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200 "
                    >
                        {noText}
                    </button>
                </div>
            }
        >
            <textarea
                className="w-75 md:w-100 resize-y rounded-md border border-gray-300 p-2 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                rows={rows}
                placeholder={placeholder}
                value={value}
                onChange={e => setValue(e.target.value)}
            />
            {children && <div className="mt-2">{children}</div>}
        </BaseDialog>
    )
}

interface ShowTextAreaDialogOptions {
    title: string;
    initialText?: string;
    placeholder?: string;
    rows?: number;
    yesText?: string;
    noText?: string;
    enabled?: boolean;
    children?: ReactNode;
}

export function showTextAreaDialog(options: ShowTextAreaDialogOptions): Promise<string | undefined> {
    return new Promise((resolve) => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);

        function cleanup() {
            root.unmount();
            container.remove();
        }

        function handleYes(value: string) {
            resolve(value);
            cleanup();
        }

        function handleNo() {
            resolve(undefined);
            cleanup();
        }

        root.render(
            <TextAreaDialog
                open={true}
                title={options.title}
                initialText={options.initialText}
                placeholder={options.placeholder}
                rows={options.rows}
                yesText={options.yesText}
                noText={options.noText}
                enabled={options.enabled}
                children={options.children}
                onYes={handleYes}
                onNo={handleNo}
                onClose={handleNo}
            />
        );
    });
}
