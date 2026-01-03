import React, {useEffect, useState} from "react";
import {actions} from "astro:actions";

type LanguageViewProps = {
    lang: string;
};

export default function LanguageView(props: LanguageViewProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<string[]>([]);
    const [newLanguage, setNewLanguage] = useState("");
    const [adding, setAdding] = useState(false);

    async function handleRemove(index: number) {
        const {error} = await actions.translator.removeMyLanguages({languages: [items[index]]});
        if (error) {
            setError(error.message || "Error " + error.code);
        }
        // Remove item from the array by filtering and returning a new instance
        setItems((prevItems) => prevItems.filter((_, i) => i !== index));
    }

    async function handleAddLanguage() {
        if (!newLanguage.trim())
            return;

        setAdding(true);
        setError(null);

        const {error} = await actions.translator.addMyLanguages({
            languages: [newLanguage.trim()],
        });

        if (error) {
            setError(error.message || "Error " + error.code);
        } else {
            setItems((prev) => [...prev, newLanguage.trim()]);
            setNewLanguage("");
        }

        setAdding(false);
    }


    // Fetch the array of translator's languages every time the component is mounted
    useEffect(() => {
        // https://stackoverflow.com/a/53572588/5419246
        const fetchLanguages = async () => {
            setLoading(true);

            const {error, data} = await actions.translator.viewMyLanguages({});
            if (error) {
                setError(error.message || "Error " + error.code);
            } else if (data) {
                setItems(data);
            }

            setLoading(false);
        };

        fetchLanguages();
    }, []);

    if (loading) {
        return (
            <div
                className="flex justify-center max-w-sm mx-auto mt-10 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm min-w-1/3">
                <div
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-sm mx-auto mt-10 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm min-w-1/3">
                <div className="text-center mt-10 text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-sm mx-auto mt-10 p-6 rounded-lg border border-zinc-200 bg-white shadow-sm min-w-1/2">
            <div>
                <h2 className="text-lg font-semibold mb-4">My Languages</h2>
                {items.length === 0 ? (
                    <p>No languages found.</p>
                ) : (
                    <ul className="list-none">
                        {items.map((item, index) => (
                            <div className="flex gap-3 flex-row" key={index + "_wrap"}>
                                <li className="flex-2/3" key={index}><p
                                    className="bg-sky-100 font-bold text-center mt-2 rounded-lg">{item}</p>
                                </li>
                                <button key={index + "_btn"}
                                        onClick={() => handleRemove(index)}
                                        className="cursor-pointer  bg-sky-100 hover:bg-sky-200 active:bg-sky-300 flex-1/3 text-center mt-2 rounded-lg">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </ul>
                )}
            </div>


            {/* Add language section */}
            <div className="mt-6 p-4 border border-zinc-200 rounded-lg bg-zinc-50">
                <h3 className="font-medium mb-2">Add a language</h3>

                <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Language name"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />

                <button
                    onClick={handleAddLanguage}
                    disabled={adding || !newLanguage.trim()}
                    className="w-full mt-3 py-2 rounded-lg bg-sky-200 font-medium
                     hover:bg-sky-300 active:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {"Add"}
                </button>
            </div>


        </div>
    );
}