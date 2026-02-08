import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

export interface PresetOption {
    label: string;
    val: number;
}

export interface RoomBasedCardProps {
    id: string; // 'led_lights', 'fans', etc
    icon: React.ReactNode;
    title: string;
    values: any;
    onFieldChange?: (key: string, value: string | number) => void;
    onBatchChange?: (updates: Record<string, unknown>) => void;
    alert?: {
        type: "warning" | "info" | "error";
        message: string;
    };
    count?: number;
    presets?: PresetOption[];
    quantityConfig?: {
        key: string;
        label: string;
        min: number;
        max: number;
        defaultValue: number;
    };
    fields?: Array<{
        label: string;
        key: string;
        options: { value: string; label: string }[];
    }>;
}

interface Room {
    id: string;
    name: string;
    hours: number;
}

const DEFAULT_PRESETS: PresetOption[] = [
    { label: 'Evening (5h)', val: 5 },
    { label: 'Morn + Eve (7h)', val: 7 },
    { label: 'All Day (12h)', val: 12 }
];

export function RoomBasedCard({
    id,
    icon,
    title,
    values,
    onFieldChange,
    onBatchChange,
    alert,
    count = 1,
    presets = DEFAULT_PRESETS,
    quantityConfig,
    fields
}: RoomBasedCardProps) {

    // --- STATE ---
    const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
    const [rooms, setRooms] = useState<Room[]>([
        { id: '1', name: 'Living Room', hours: 5 },
        { id: '2', name: 'Kitchen', hours: 3 },
        { id: '3', name: 'Bedroom 1', hours: 2 },
    ]);

    const hoursKey = `${id}_hours`;
    const currentHours = values[hoursKey] || 0;

    // --- LOGIC ---

    const updateHours = (val: number) => {
        if (onBatchChange) {
            onBatchChange({ [hoursKey]: val });
        } else if (onFieldChange) {
            onFieldChange(hoursKey, val);
        }
    };

    const handlePreset = (val: number) => {
        updateHours(val);
    };

    // Recalculate total when rooms change
    useEffect(() => {
        if (mode === 'advanced') {
            const total = rooms.reduce((acc, room) => acc + room.hours, 0);
            updateHours(total);
        }
    }, [rooms, mode]);

    const addRoom = () => {
        const newId = (Math.max(...rooms.map(r => parseInt(r.id))) + 1).toString();
        setRooms([...rooms, { id: newId, name: `Room ${rooms.length + 1}`, hours: 2 }]);
    };

    const removeRoom = (roomId: string) => {
        setRooms(rooms.filter(r => r.id !== roomId));
    };

    const updateRoom = (roomId: string, field: keyof Room, val: any) => {
        setRooms(rooms.map(r => {
            if (r.id === roomId) {
                return { ...r, [field]: val };
            }
            return r;
        }));
    };

    return (
        <div className="p-6 bg-[#1a202c] border border-[#4a5568] rounded-xl mb-6 shadow-sm">
            <h4 className="text-lg font-medium text-[#e2e8f0] mb-6 flex items-center gap-3">
                <span className="p-2 bg-slate-800 rounded-lg text-blue-400 border border-slate-700">
                    {icon}
                </span>
                <span>{title}</span>
                {count > 1 && <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded ml-2">{count} units</span>}
            </h4>

            {/* Additional Fields (excluding quantity fields with "num_") */}
            {fields && fields.length > 0 && (
                <div className="mb-6 space-y-4">
                    {fields.filter(field => !field.key.includes('num_')).map((field) => (
                        <div key={field.key}>
                            <label className="text-[#e2e8f0] mb-2 block text-sm">{field.label}</label>
                            <select
                                value={values[field.key] || field.options[0]?.value}
                                onChange={(e) => onFieldChange?.(field.key, e.target.value)}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-md py-2 px-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none"
                            >
                                {field.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}

            {mode === 'simple' ? (
                // --- SIMPLE MODE ---
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="mb-6">
                        <label className="text-[#e2e8f0] font-medium mb-4 block">Average Daily Usage (Hours)</label>

                        {/* Quick Presets */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                            {presets.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => handlePreset(preset.val)}
                                    className={`
                                        relative group p-3 rounded-xl border text-left transition-all duration-200
                                        ${currentHours === preset.val
                                            ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            : 'bg-[#1e293b] border-[#334155] hover:border-slate-400 hover:bg-slate-800'
                                        }
                                    `}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-sm font-medium ${currentHours === preset.val ? 'text-blue-300' : 'text-slate-200'}`}>
                                            {preset.label.split('(')[0]}
                                        </span>
                                        <span className={`text-xs ${currentHours === preset.val ? 'text-blue-200/70' : 'text-slate-500'}`}>
                                            {preset.label.match(/\((.*?)\)/)?.[1] || `${preset.val}h`}
                                        </span>
                                    </div>
                                    {currentHours === preset.val && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Hours & Minutes Input */}
                        <div className="mb-4">
                            <label className="text-slate-400 text-sm font-medium mb-2 block">Daily Usage</label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="24"
                                            value={Math.floor(currentHours || 0) || ''}
                                            onChange={(e) => {
                                                const newH = parseFloat(e.target.value) || 0;
                                                const currentM = Math.round(((currentHours || 0) % 1) * 60);
                                                updateHours(newH + (currentM / 60));
                                            }}
                                            className="w-full bg-[#1e293b] border border-[#334155] rounded-md py-2 px-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">hrs</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={Math.round(((currentHours || 0) % 1) * 60) || ''}
                                            onChange={(e) => {
                                                const newM = parseFloat(e.target.value) || 0;
                                                const currentH = Math.floor(currentHours || 0);
                                                updateHours(currentH + (newM / 60));
                                            }}
                                            className="w-full bg-[#1e293b] border border-[#334155] rounded-md py-2 px-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">min</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Total: {currentHours?.toFixed(2)} hours/day
                            </p>
                        </div>
                    </div>

                    {count > 1 && (
                        <button
                            onClick={() => setMode('advanced')}
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                            Advanced: Split by rooms <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
            ) : (
                // --- ADVANCED MODE ---
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[#e2e8f0] font-medium">Room-wise Breakdown</label>
                        <span className="text-blue-400 font-bold bg-blue-900/20 px-3 py-1 rounded-full text-sm border border-blue-500/30">Total: {currentHours}h</span>
                    </div>

                    <div className="space-y-3 mb-6">
                        {rooms.map((room) => (
                            <div key={room.id} className="flex gap-3 items-center">
                                <input
                                    type="text"
                                    value={room.name}
                                    onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                                    className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Room Name"
                                />
                                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded px-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="24"
                                        value={room.hours}
                                        onChange={(e) => updateRoom(room.id, 'hours', parseFloat(e.target.value) || 0)}
                                        className="bg-transparent text-white w-12 py-2 text-center text-sm outline-none"
                                    />
                                    <span className="text-slate-500 text-xs pr-1">h</span>
                                </div>
                                <button
                                    onClick={() => removeRoom(room.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            onClick={addRoom}
                            className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
                        >
                            <Plus className="w-3 h-3" /> Add Room
                        </button>
                        <button
                            onClick={() => setMode('simple')}
                            className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to simple mode
                        </button>
                    </div>
                </div>
            )}

            {alert && (
                <div className={`mt-6 p-4 rounded-lg border-l-4 flex items-start gap-3 ${alert.type === "warning" ? "bg-orange-900/20 border-orange-500 text-orange-200" :
                    alert.type === "error" ? "bg-red-900/20 border-red-500 text-red-200" :
                        "bg-blue-900/20 border-blue-500 text-blue-200"
                    }`}>
                    <div className="shrink-0 mt-0.5">
                        {alert.type === 'error' && <AlertCircle className="w-5 h-5" />}
                        {alert.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                        {alert.type === 'info' && <Info className="w-5 h-5" />}
                    </div>
                    <p className="text-sm leading-relaxed">
                        {alert.message}
                    </p>
                </div>
            )}
        </div>
    );
}
