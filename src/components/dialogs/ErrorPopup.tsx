import { createRoot } from 'react-dom/client';
import { useState, useEffect } from "react";
import { createPortal } from 'react-dom';

interface ErrorPopupProps {
    message: string;
    delay?: number;          // optional, defaults to 2000
    fadeDuration?: number;   // optional, defaults to 2000
    onClose: () => void;     // required callback
}

function ErrorPopup({ message, delay = 2000, fadeDuration = 2000, onClose }: ErrorPopupProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (!visible) {
            const timeout = setTimeout(onClose, fadeDuration);
            return () => clearTimeout(timeout);
        }
    }, [visible, fadeDuration, onClose]);

    return createPortal(
        <>
            <style>
                {`
                .error-popup {
                    position: fixed;
                    bottom: 16px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #dc2626;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 1rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    opacity: 1;
                    width: auto;
                    display: inline-block;
                    box-sizing: border-box;
                    transition: opacity ${fadeDuration}ms ease-in-out;
                    max-width: 600px;
                    white-space: normal;
                }

                .error-popup.hide {
                    opacity: 0;
                }

                .error-text {
                    text-align: center;
                }

                @media (max-width: 1024px) {
                    .error-popup { max-width: 500px; }
                }

                @media (max-width: 768px) {
                    .error-popup {
                        width: 80%;
                        max-width: 80%;
                        max-inline-size: calc(100vw - 32px);
                    }
                }

                @media (max-width: 480px) {
                    .error-popup {
                        width: 95%;
                        max-width: 95%;
                        max-inline-size: calc(100vw - 32px);
                    }
                }
                `}
            </style>
            <div className={`error-popup ${visible ? "show" : "hide"}`}>
                <p className="error-text">{message}</p>
            </div>
        </>,
        document.body
    );
}

/**
 * Displays an error popup directly under the HTML body
 */
export function displayError(message: string, delay = 2000, fadeDuration = 2000) {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const handleClose = () => {
        root.unmount();
        container.remove();
    };

    root.render(
        <ErrorPopup
            message={message}
            delay={delay}
            fadeDuration={fadeDuration}
            onClose={handleClose}
        />
    );
}
