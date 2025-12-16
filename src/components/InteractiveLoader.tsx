"use client";

import { useEffect, useState } from "react";

interface Props {
    progress: number;
}

export default function InteractiveLoader({ progress }: Props) {
    const [messageIndex, setMessageIndex] = useState(0);

    // The "Psychology of Waiting"
    // Users hate staring at a spinning circle. It feels broken.
    // Instead, we tell them EXACTLY what we are doing ("Simulating...", "Optimizing...").
    // This makes the 3-second wait feel like "Work is being done" rather than "Lag".
    const messages = [
        "Initializing analysis...",
        "Processing usage patterns...",
        "Running tariff simulations...",
        "Calculating estimates...",
        "Finalizing report..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto text-center py-20 animate-in fade-in duration-200">
            <div className="mb-8 relative flex items-center justify-center">
                {/* Technical Spinner */}
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-2 border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-2 border-t-transparent border-r-blue-400/50 border-b-transparent border-l-transparent rounded-full animate-spin duration-700 reverse"></div>
                </div>
            </div>

            <div className="mb-6 space-y-2">
                <h2 className="text-xl font-medium text-slate-200 tracking-wider font-mono">
                    PROCESSING DATA
                </h2>
            </div>

            <div className="max-w-md mx-auto mt-8">
                {/* Progress Bar Container */}
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-4 relative">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300 ease-out"
                        style={{ width: `${Math.max(5, progress)}%` }}
                    />
                </div>

                {/* Cycling Text */}
                <div className="h-6 overflow-hidden relative">
                    <p className="text-slate-500 text-xs font-mono uppercase tracking-widest animate-pulse">
                        {messages[messageIndex]}
                    </p>
                </div>
            </div>
        </div>
    );
}
