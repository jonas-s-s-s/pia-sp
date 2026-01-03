import React, {useEffect, useState} from "react";
import {actions} from "astro:actions";

type LanguageViewProps = {
    lang: string;
};

export default function LanguageView(props: LanguageViewProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<string[]>([]);

    // Fetch the array of translator's languages every time the component is mounted
    useEffect(() => {
        // https://stackoverflow.com/a/53572588/5419246
        const fetchLanguages = async () => {
            setLoading(true);

            const {error, data} = await actions.translator.viewMyLanguages({});
            if (error) {
                setError(error.message || "Unknown error");
            } else if (data) {
                setItems(data);
            }

            setLoading(false);
        };

        fetchLanguages();
    }, []);

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm min-w-1/3">
            <div>
                <h2 className="text-lg font-semibold mb-4">My Languages</h2>
                {items.length === 0 ? (
                    <p>No languages found.</p>
                ) : (
                    <ul className="list-disc list-inside">
                        {items.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}