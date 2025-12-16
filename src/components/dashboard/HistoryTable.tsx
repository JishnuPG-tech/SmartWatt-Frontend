import { Download } from 'lucide-react';
import { useState } from 'react';

interface Props {
    history: any[];
    onSelect?: (entry: any) => void;
    selectedId?: string | number; // Use date or index if no ID
}

export default function HistoryTable({ history, onSelect, selectedId }: Props) {
    // The "Anti-Clutter" Filter
    // Sometimes users click "Save" multiple times in a row.
    // We don't want 5 identical copies of the same report.
    // So, we check: Is this entry EXACTLY the same as the last one?
    // If yes, we skip it. Keeps the history clean!
    const uniqueHistory = history.filter((entry, index) => {
        if (index === 0) return true;
        const prev = history[index - 1];
        const isDuplicate =
            entry.kwh === prev.kwh &&
            entry.bill === prev.bill &&
            entry.mode === prev.mode;
        return !isDuplicate;
    });

    // Sort by date desc
    const sortedHistory = [...uniqueHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const downloadCSV = () => {
        const headers = ["Date", "Units (kWh)", "Bill (INR)", "Mode"];
        const rows = sortedHistory.map(entry => [
            new Date(entry.date).toLocaleDateString(),
            entry.kwh,
            entry.bill,
            entry.mode
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "smartwatt_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (history.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500 bg-[#1a202c] rounded-2xl border border-slate-700">
                No history available yet.
            </div>
        );
    }

    return (
        <div className="bg-[#1a202c] border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h3 className="font-semibold text-slate-200">History Log</h3>
                <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Download size={14} /> Export CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700 text-slate-400 text-sm bg-slate-900/30">
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Mode</th>
                            <th className="p-4 font-medium text-right">Units (kWh)</th>
                            <th className="p-4 font-medium text-right">Bill (₹)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {sortedHistory.map((entry, i) => {
                            const isSelected = selectedId === entry.date;
                            return (
                                <tr
                                    key={i}
                                    onClick={() => onSelect && onSelect(entry)}
                                    className={`transition-all text-sm cursor-pointer group
                                        ${isSelected
                                            ? 'bg-blue-900/40 text-blue-100 border-l-4 border-blue-500'
                                            : 'hover:bg-slate-700/30 text-slate-300 border-l-4 border-transparent'
                                        }`}
                                >
                                    <td className="p-4 whitespace-nowrap">
                                        {new Date(entry.date).toLocaleDateString()}
                                        <span className={`text-xs block ${isSelected ? 'text-blue-300' : 'text-slate-500'}`}>
                                            {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs border capitalize ${isSelected
                                            ? 'bg-blue-600 text-white border-blue-500'
                                            : 'bg-blue-900/30 text-blue-400 border-blue-800/50'
                                            }`}>
                                            {entry.mode}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono">{Math.round(entry.kwh)}</td>
                                    <td className={`p-4 text-right font-mono font-medium ${isSelected ? 'text-green-300' : 'text-green-400'}`}>₹{Math.round(entry.bill)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
