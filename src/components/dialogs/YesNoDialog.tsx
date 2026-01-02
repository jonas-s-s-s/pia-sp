import {BaseDialog} from './BaseDialog'
import {type ReactNode, useEffect} from "react";

interface YesNoDialogProps {
    open: boolean
    title: string
    text: string
    yesText?: string
    noText?: string
    children?: ReactNode // main content
    enabled?: boolean
    onYes?: () => void
    onNo?: () => void
    onClose?: () => void
}

export default function YesNoDialog({
                                        open,
                                        title,
                                        text,
                                        yesText = 'Yes',
                                        noText = 'No',
                                        onYes,
                                        onNo,
                                        children,
                                        onClose,
                                        enabled
                                    }: YesNoDialogProps) {

    // Make enter press the "Yes" button
    useEffect(() => {
        if (!open) return

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Enter') {
                onYes?.()
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
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={onYes}
                        disabled={!enabled}
                        className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                        {yesText}
                    </button>
                    <button
                        type="button"
                        onClick={onNo}
                        disabled={!enabled}
                        className="rounded-md bg-gray-300 px-6 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
                    >
                        {noText}
                    </button>
                </div>
            }
        >
            <p className="text-sm text-gray-700 ">
                {text}
            </p>
            {children}
        </BaseDialog>
    )
}
