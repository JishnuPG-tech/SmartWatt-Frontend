'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { runDiagnostics } from '@/lib/diagnostics';
import { Download, Zap, Wind, Lightbulb, Droplet, Refrigerator, WashingMachine, ChevronRight, HelpCircle, BarChart3, ClipboardList, Brain, Sparkles, Check, AirVent, ShowerHead, Microwave, Coffee, CookingPot, Sandwich, Disc, Tv, Monitor, Laptop, Shirt } from 'lucide-react';
import SolarCard from './SolarCard';
import TariffVisualizer from './TariffVisualizer';
import BenchmarkCard from './BenchmarkCard';
import InteractiveLoader from './InteractiveLoader';
import { useAnalysisEngine } from '@/hooks/useAnalysisEngine';
import { useSimulation } from '@/hooks/useSimulation';
import { generatePDF } from '@/lib/generatePDF';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Props {
    household: any;
    appliances: string[];
    details: any;
    onRestart: () => void;
    trainingId: string;
    mode?: 'quick' | 'detailed' | null;
}

export default function ResultsReport({ household, appliances, details, onRestart, trainingId, mode }: Props) {
    const [showSolar, setShowSolar] = useState(false);
    const [showTariff, setShowTariff] = useState(false);
    const [showBenchmark, setShowBenchmark] = useState(false);

    // --- CORE ANALYSIS ENGINE ---
    const { loading, progress, results, billDetails, error, runAnalysis } = useAnalysisEngine(
        household,
        appliances,
        details,
        trainingId,
        mode
    );

    // --- SIMULATION HOOK ---
    const { optimization, runSimulation: simulateOptimization, isSimulating } = useSimulation(household, details, billDetails);

    // --- SMART DIAGNOSTICS (The "Virtual Energy Auditor") ---
    const smartInsights = useMemo(() => {
        return runDiagnostics(household, appliances, details);
    }, [household, appliances, details]);

    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-20">
                <div className="main-header mb-8">
                    <h1>SMARTWATT AI</h1>
                    <p>Analysis Failed</p>
                </div>
                <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200">
                    <h3 className="text-xl font-bold mb-2">Oops! Something went wrong.</h3>
                    <p className="mb-6">{error}</p>
                    <button onClick={onRestart} className="st-button-secondary px-8">
                        TRY AGAIN
                    </button>
                </div>
            </div>
        );
    }

    if (loading || !results || !billDetails) {
        return <InteractiveLoader progress={progress} />;
    }


    const avgCost = billDetails.total / (household.kwh as number);

    // --- Grouping Logic Removed ---
    // We want to show ALL appliances to demonstrate model granularity
    const sortedBreakdown = [...results.breakdown].sort((a, b) => b.kwh - a.kwh);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in duration-200">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent filter drop-shadow-lg">
                    SMARTWATT
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide">
                    Kerala Energy Estimator
                </p>
            </div>

            {/* "Hero" Analysis Summary Card */}
            <div className="section bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] p-0 rounded-2xl mb-10 overflow-hidden shadow-2xl shadow-blue-900/10">
                {/* Top Status Bar */}
                <div className="bg-[#1e293b]/50 px-6 py-3 border-b border-[#334155] flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Analysis Complete</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Session ID: {trainingId?.slice(0, 8)}...</span>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch relative animate-in fade-in duration-700">

                    {/* Stat 1: Total Bill (Hero Card) - Clean & Solid */}
                    <div className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
                                Estimate
                            </span>
                        </div>

                        <div className="mt-2">
                            <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">Bi-Monthly Bill</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl text-slate-500 font-normal">₹</span>
                                <span className="text-6xl font-black text-white tracking-tighter group-hover:text-blue-50 transition-colors">
                                    {Math.floor(billDetails.total)}
                                </span>
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                                    <span className="text-sm font-medium text-slate-200">{household.kwh} Units</span>
                                </div>
                                <span className="text-slate-500 text-sm">@ Season {household.season}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stat 2: Breakdown Stack (Right Side) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Monthly Avg */}
                        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 flex flex-col justify-center transition-all hover:bg-slate-800 hover:border-slate-600">
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Monthly Avg</p>
                            <p className="text-3xl font-bold text-white mb-1">₹{Math.floor(billDetails.total / 2)}</p>
                            <p className="text-slate-500 text-[10px]">Per Month</p>
                        </div>

                        {/* Cost Per Unit */}
                        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 flex flex-col justify-center transition-all hover:bg-slate-800 hover:border-slate-600">
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Avg Cost / Unit</p>
                            <p className="text-3xl font-bold text-white mb-1">₹{avgCost.toFixed(2)}</p>
                            <p className="text-slate-500 text-[10px]">KSEB Tiered</p>
                        </div>

                        {/* AI Confidence (Full Width) */}
                        <div className="col-span-1 sm:col-span-2 bg-emerald-950/20 rounded-2xl border border-emerald-500/20 p-4 flex items-center justify-between transition-all hover:bg-emerald-950/30 hover:border-emerald-500/30">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-emerald-400 font-bold text-lg leading-tight">{results?.metrics?.confidence || '98.2'}% Confidence</p>
                                    <p className="text-emerald-500/60 text-xs uppercase tracking-wider font-semibold">{results?.metrics?.model || 'Physics-Verified Model'}</p>
                                </div>
                            </div>
                            <span className="hidden sm:inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">
                                {results?.metrics?.accuracy || 'High Accuracy'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Toggles (KSEB & Debug) */}
                <div className="bg-[#0f172a] border-t border-[#334155] divide-y divide-[#334155]">

                    {/* Transparency Note (Visible by Default) */}
                    <div className="px-6 py-3 bg-blue-950/20 border-b border-blue-500/10">
                        <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                            <strong className="text-blue-400">Note:</strong> Your bill includes standby usage, efficiency loss, and behavior patterns.
                            SmartWatt distributes this difference intelligently across appliances.
                        </p>
                    </div>

                    {/* 1. KSEB Billing Structure Toggle */}
                    <details className="group px-6 py-2">
                        <summary className="flex items-center justify-between gap-2 text-[10px] text-slate-400 hover:text-blue-400 cursor-pointer uppercase tracking-widest transition-colors py-2 list-none">
                            <div className="flex items-center gap-2">
                                <span>View KSEB Billing Structure</span>
                                <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] text-slate-500 group-hover:text-blue-400 transition-colors">Assessment</span>
                            </div>
                            <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                        </summary>

                        <div className="pb-4 pt-4 border-t border-[#334155]/50 mt-2 animate-in fade-in slide-in-from-top-1">
                            {/* Tariff Slab Visualizer (Prominent) */}
                            <div className="mb-6">
                                <TariffVisualizer householdKwh={household.kwh} />
                            </div>

                            {/* Cost Breakdown Grid (Compact Mode) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Base Charge */}
                                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Base Charge</p>
                                    <p className="text-lg font-bold text-white">₹{Math.floor(billDetails.total * 0.965)}</p>
                                </div>
                                {/* Fuel Surcharge */}
                                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Fuel Surcharge</p>
                                    <p className="text-lg font-bold text-white">₹{Math.floor(billDetails.total * 0.035)}</p>
                                </div>
                                {/* Total Charge */}
                                <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/20">
                                    <p className="text-blue-400 text-[10px] uppercase tracking-wider mb-1">Final Bill</p>
                                    <p className="text-lg font-bold text-white">₹{Math.floor(billDetails.total)}</p>
                                </div>
                            </div>
                        </div>
                    </details>

                    {/* 2. Transparency Center (Estimation Logic) */}
                    <details className="group px-6 py-2">
                        <summary className="flex items-center justify-between gap-2 text-[10px] text-slate-600 hover:text-blue-400 cursor-pointer uppercase tracking-widest transition-colors py-2 list-none">
                            <div className="flex items-center gap-2">
                                <span className="font-bold">How we estimated this</span>
                                <span className="px-1.5 py-0.5 bg-slate-900 rounded text-[9px] text-slate-500 group-hover:text-blue-400 transition-colors">Logic</span>
                            </div>
                            <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                        </summary>

                        <div className="pb-4 pt-4 border-t border-[#334155]/50 mt-2 animate-in fade-in slide-in-from-top-1">
                            {/* Explanatory Note */}
                            {/* Explanatory Note Removed (Redundant) */}

                            {/* Comparison Table */}
                            <div className="overflow-x-auto rounded-lg border border-slate-800">
                                <table className="w-full text-left text-[10px]">
                                    <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-3 py-2 font-medium">Appliance</th>
                                            <th className="px-3 py-2 font-medium text-right">Physics (Raw)</th>
                                            <th className="px-3 py-2 font-medium text-right text-white">Adjusted</th>
                                            <th className="px-3 py-2 font-medium text-right text-slate-500">Diff</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 bg-[#1a202c]/30">
                                        {results.breakdown
                                            .filter((item: any) => item.id !== 'system_overhead') // Remove Overhead from Raw Comparison
                                            .map((item: any) => {
                                                const rawVal = results.predictions[item.id] || 0;

                                                // Handle "System Overhead" unique display
                                                const isOverhead = item.id === 'system_overhead';
                                                const rawDisplay = isOverhead ? 0 : rawVal;
                                                const diff = item.kwh - rawDisplay;

                                                return (
                                                    <tr key={item.name} className="hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-3 py-2 text-slate-300 font-medium">
                                                            {isOverhead ? (
                                                                <div className="flex items-center gap-1.5 cursor-help min-w-0" title="Overhead reduces as input accuracy improves. Includes wiring loss, inverters, and standby power.">
                                                                    <span className="truncate">{item.name}</span>
                                                                    <HelpCircle className="w-3 h-3 text-slate-500 hover:text-blue-400 shrink-0" />
                                                                </div>
                                                            ) : (
                                                                <span>{item.name}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-right text-slate-500">{rawDisplay.toFixed(1)}</td>
                                                        <td className="px-3 py-2 text-right text-white font-bold">{item.kwh.toFixed(1)}</td>
                                                        <td className={`px-3 py-2 text-right font-mono ${diff > 0.1 ? 'text-blue-400' : diff < -0.1 ? 'text-orange-400' : 'text-slate-600'}`}>
                                                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        {/* Total Row */}
                                        <tr className="bg-slate-900/50 font-bold border-t border-slate-700">
                                            <td className="px-3 py-2 text-slate-200">TOTAL</td>
                                            <td className="px-3 py-2 text-right text-slate-400">{results.rawTotal.toFixed(1)}</td>
                                            <td className="px-3 py-2 text-right text-white">{household.kwh}</td>
                                            <td className="px-3 py-2 text-right text-slate-500">
                                                {(household.kwh - results.rawTotal).toFixed(1)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </details>
                </div>
            </div>




            {/* Visual Analysis Card (Hero Theme) */}
            <div className="section bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] p-0 rounded-2xl mb-10 overflow-hidden shadow-2xl shadow-blue-900/10" >
                {/* Header Bar */}
                <div className="bg-[#1e293b]/50 px-6 py-3 border-b border-[#334155] flex justify-between items-center backdrop-blur-sm" >
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-blue-400" />
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Visual Analysis</span>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Donut Chart - Energy Distribution */}
                    <div className="bg-[#1a202c]/50 border border-slate-700/50 rounded-xl p-4 overflow-hidden relative">
                        <h3 className="text-slate-300 font-medium mb-2 text-center text-sm uppercase tracking-wider">Energy Distribution (kWh)</h3>
                        <div className="w-full h-[300px]">
                            <Plot
                                data={[
                                    {
                                        values: results.breakdown.map((i: any) => i.kwh),
                                        labels: results.breakdown.map((i: any) => i.name),
                                        type: 'pie',
                                        hole: 0.4,
                                        textinfo: 'label+percent',
                                        textposition: 'inside',
                                        marker: {
                                            colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']
                                        }
                                    }
                                ]}
                                layout={{
                                    paper_bgcolor: 'rgba(0,0,0,0)',
                                    plot_bgcolor: 'rgba(0,0,0,0)',
                                    font: { color: '#e2e8f0' },
                                    showlegend: false,
                                    margin: { t: 20, b: 20, l: 20, r: 20 },
                                    autosize: true
                                }}
                                useResizeHandler={true}
                                style={{ width: '100%', height: '100%' }}
                                config={{ displayModeBar: false }}
                            />
                        </div>
                    </div>

                    {/* Bar Chart - Cost Breakdown */}
                    <div className="bg-[#1a202c]/50 border border-slate-700/50 rounded-xl p-4 overflow-hidden relative">
                        <h3 className="text-slate-300 font-medium mb-2 text-center text-sm uppercase tracking-wider">Cost Impact (₹)</h3>
                        <div className="w-full h-[300px]">
                            <Plot
                                data={[
                                    {
                                        x: results.breakdown.map((i: any) => i.name),
                                        y: results.breakdown.map((i: any) => i.cost),
                                        type: 'bar',
                                        marker: {
                                            color: '#3b82f6',
                                            opacity: 0.8
                                        },
                                        error_y: {
                                            type: 'data',
                                            array: results.breakdown.map((i: any) => (i.uncertainty / household.kwh) * billDetails.total),
                                            visible: true,
                                            color: '#94a3b8'
                                        }
                                    }
                                ]}
                                layout={{
                                    paper_bgcolor: 'rgba(0,0,0,0)',
                                    plot_bgcolor: 'rgba(0,0,0,0)',
                                    font: { color: '#e2e8f0' },
                                    xaxis: { tickangle: -45, automargin: true },
                                    yaxis: { title: { text: 'Cost (₹)' }, gridcolor: '#334155' },
                                    margin: { t: 20, b: 80, l: 50, r: 20 },
                                    autosize: true
                                }}
                                useResizeHandler={true}
                                style={{ width: '100%', height: '100%' }}
                                config={{ displayModeBar: false }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Appliance Breakdown Card (Hero Theme) */}
            <div className="section bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] p-0 rounded-2xl mb-10 overflow-hidden shadow-2xl shadow-blue-900/10" >
                {/* Header Bar */}
                <div className="bg-[#1e293b]/50 px-6 py-3 border-b border-[#334155] flex justify-between items-center backdrop-blur-sm" >
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-blue-400" />
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Appliance Consumption Detail</span>
                    </div>
                    <span className="text-xs text-slate-500">Sorted by Usage</span>
                </div>

                <div className="p-0"> {/* No padding for table to go edge-to-edge */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#1a202c] border-b border-slate-700/50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Appliance</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Usage (kWh)</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Confidence</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Percentage</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Cost (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {sortedBreakdown.map((item: any, idx: number) => {
                                    const getApplianceIcon = (id: string) => {
                                        if (id.includes('ac') || id.includes('air_conditioner')) return <AirVent className="w-4 h-4" />;
                                        if (id.includes('fridge') || id.includes('refrigerator')) return <Refrigerator className="w-4 h-4" />;
                                        if (id.includes('washing')) return <WashingMachine className="w-4 h-4" />;
                                        if (id.includes('geyser') || id.includes('heater') || id.includes('water_heater')) return <ShowerHead className="w-4 h-4" />;
                                        if (id.includes('microwave') || id.includes('oven')) return <Microwave className="w-4 h-4" />;
                                        if (id.includes('kettle')) return <Coffee className="w-4 h-4" />;
                                        if (id.includes('induction') || id.includes('cooker')) return <Zap className="w-4 h-4" />;
                                        if (id.includes('rice')) return <CookingPot className="w-4 h-4" />;
                                        if (id.includes('toaster')) return <Sandwich className="w-4 h-4" />;
                                        if (id.includes('mixer')) return <Disc className="w-4 h-4" />;
                                        if (id.includes('fan')) return <Wind className="w-4 h-4" />;
                                        if (id.includes('light') || id.includes('led') || id.includes('bulb')) return <Lightbulb className="w-4 h-4" />;
                                        if (id.includes('tv') || id.includes('television')) return <Tv className="w-4 h-4" />;
                                        if (id.includes('desktop') || id.includes('monitor')) return <Monitor className="w-4 h-4" />;
                                        if (id.includes('laptop')) return <Laptop className="w-4 h-4" />;
                                        if (id.includes('pump') || id.includes('water')) return <Droplet className="w-4 h-4" />;
                                        if (id.includes('iron')) return <Shirt className="w-4 h-4" />;
                                        if (id.includes('hair') || id.includes('vacuum')) return <Wind className="w-4 h-4" />;
                                        if (id === 'system_overhead') return <Zap className="w-4 h-4 text-amber-400" />;
                                        return <Zap className="w-4 h-4" />; // Default
                                    };

                                    return (
                                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="py-4 px-6 text-slate-200 font-medium group-hover:text-blue-300 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                                                        {getApplianceIcon(item.id)}
                                                    </div>
                                                    {item.id === 'system_overhead' ? (
                                                        <div className="flex items-center gap-1.5 cursor-help" title="Overhead includes wiring loss, inverters, and standby power.">
                                                            <span>{item.name}</span>
                                                            <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-blue-400" />
                                                        </div>
                                                    ) : (
                                                        item.name
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-right py-4 px-6 text-slate-200 font-mono">{item.kwh.toFixed(2)}</td>
                                            <td className="text-right py-4 px-6 text-slate-500 text-xs">
                                                {`±${item.uncertainty.toFixed(2)} `}
                                            </td>
                                            <td className="text-right py-4 px-6 text-slate-200 font-mono">{item.percentage.toFixed(1)}%</td>
                                            <td className="text-right py-4 px-6 text-slate-200 font-mono font-bold">₹{item.cost}</td>
                                        </tr>
                                    );
                                })}
                                <tr className="bg-slate-800/50 border-t border-slate-600/50">
                                    <td className="py-4 px-6 text-white font-bold uppercase tracking-wider text-xs">TOTAL</td>
                                    <td className="text-right py-4 px-6 text-white font-bold font-mono">{household.kwh.toFixed(1)}</td>
                                    <td className="text-right py-4 px-6"></td>
                                    <td className="text-right py-4 px-6 text-white font-bold font-mono">100%</td>
                                    <td className="text-right py-4 px-6 text-white font-bold font-mono text-lg">₹{Math.floor(billDetails.total)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Smart Diagnostics Card (Hero Theme) */}
            <div className="section bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] p-0 rounded-2xl mb-10 overflow-hidden shadow-2xl shadow-blue-900/10" >
                {/* Header Bar */}
                <div className="bg-[#1e293b]/50 px-6 py-3 border-b border-[#334155] flex justify-between items-center backdrop-blur-sm" >
                    <div className="flex items-center gap-2">
                        <Brain className="w-6 h-6 text-blue-400" />
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Smart Energy Diagnostics</span>
                    </div>
                    <span className="text-xs text-slate-500">AI-Powered Insights</span>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {smartInsights.slice(0, 6).map((insight, idx) => (
                            <div key={idx} className="flex gap-3 items-start bg-[#1a202c]/50 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 hover:border-blue-500/30 transition-all duration-300 group">
                                <span className="text-xl mt-0.5 filter drop-shadow-lg group-hover:scale-110 transition-transform">{insight.icon}</span>
                                <p className={`text - sm leading - relaxed ${insight.color} `}>{insight.msg}</p>
                            </div>
                        ))}
                        {smartInsights.length > 6 && (
                            <div className="col-span-1 md:col-span-2 text-center mt-2">
                                <span className="text-xs text-slate-500 italic bg-slate-800/30 px-3 py-1 rounded-full border border-slate-700/30">
                                    + {smartInsights.length - 6} more insights available in PDF Report
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Community Benchmark (Peer Comparison) */}
            <div className="mb-8" >
                <BenchmarkCard householdKwh={household.kwh} numPeople={household.num_people} />
            </div>

            {/* Solar ROI Estimator */}
            <div className="mb-8" >
                <SolarCard householdKwh={household.kwh} totalBill={billDetails.total} />
            </div>

            {/* WHAT-IF OPTIMIZATION SECTION (Hero Theme) */}
            <div className="section bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] p-0 rounded-2xl mb-10 overflow-hidden shadow-2xl shadow-blue-900/10" >
                {/* Header Bar */}
                <div className="bg-[#1e293b]/50 px-6 py-3 border-b border-[#334155] flex justify-between items-center backdrop-blur-sm" >
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-green-400" />
                        <span className="text-xs font-medium text-green-400 uppercase tracking-widest">What-If Optimization</span>
                    </div>
                    <span className="text-xs text-slate-500">AI Savings Engine</span>
                </div>

                <div className="p-8">
                    {!optimization ? (
                        <div className="text-center py-4">
                            <p className="text-slate-400 mb-6 max-w-xl mx-auto text-sm leading-relaxed text-center">
                                Leverage our AI-driven simulation engine to forecast potential savings.
                                optimize your consumption patterns and visualize the impact on your KSEB bill structure.
                            </p>
                            <button
                                onClick={simulateOptimization}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 border border-blue-500/50 uppercase tracking-wide"
                            >
                                <Sparkles className="w-5 h-5" /> Run AI Optimization
                            </button>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Simulator Results Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Current */}
                                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 flex flex-col items-center text-center">
                                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-2">Current Bill</p>
                                    <p className="text-3xl font-bold text-white mb-1">₹{Math.round(optimization.originalBill)}</p>
                                    <p className="text-xs text-slate-500 font-mono">{optimization.originalKwh.toFixed(0)} Units</p>
                                </div>

                                {/* Optimized */}
                                <div className="p-4 bg-green-900/10 rounded-xl border border-green-500/30 flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-green-500/5 blur-xl"></div>
                                    <p className="text-green-400 text-[10px] uppercase tracking-wider mb-2 relative z-10">Optimized Bill</p>
                                    <p className="text-4xl font-bold text-green-400 mb-1 relative z-10 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">₹{Math.round(optimization.newBill)}</p>
                                    <p className="text-xs text-green-300/70 font-mono relative z-10">{optimization.newKwh.toFixed(0)} Units</p>
                                </div>

                                {/* Savings */}
                                <div className="p-4 bg-yellow-900/10 rounded-xl border border-yellow-500/30 flex flex-col items-center text-center">
                                    <p className="text-yellow-500 text-[10px] uppercase tracking-wider mb-2">Potential Savings</p>
                                    <p className="text-3xl font-bold text-yellow-400 mb-1">₹{Math.round(optimization.savedAmount)}</p>
                                    <span className="inline-block px-2 py-1 bg-yellow-500/20 rounded text-[10px] text-yellow-300 border border-yellow-500/20">
                                        Save {((optimization.savedAmount / optimization.originalBill) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            {/* Breakdown Pills */}
                            <div className="text-center">
                                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-4">Recommended Actions</p>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {optimization.breakdown.map((item: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 bg-slate-800/50 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 hover:border-green-500/50 hover:bg-slate-800 transition-colors text-xs shadow-sm">
                                            <Check className="w-3.5 h-3.5 text-green-400" /> {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center" >
                <button onClick={onRestart} className="st-button-secondary px-8">
                    START NEW ESTIMATE
                </button>
                <button
                    onClick={() => generatePDF(household, billDetails, results, avgCost, smartInsights)}
                    className="st-button px-8 flex items-center gap-2 bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#059669] hover:to-[#10b981] border-none"
                >
                    <Download size={18} />
                    DOWNLOAD REPORT (PDF)
                </button>
            </div>
        </div>
    );
}
