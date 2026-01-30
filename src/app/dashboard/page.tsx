'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { getSafeSession } from '@/lib/authUtils';
import { loadTraining } from '@/lib/api';
import LatestAssessmentDetail from '@/components/dashboard/LatestAssessmentDetail';
import HistoryTable from '@/components/dashboard/HistoryTable';
import { LogOut, LayoutDashboard } from 'lucide-react';
import SystemActiveHeader from '@/components/SystemActiveHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';

// Lazy Load Charts to improve LCP
const UsageChart = dynamic(() => import('@/components/dashboard/UsageChart'), {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full rounded-2xl bg-slate-800/50" />
});

const ApplianceBarChart = dynamic(() => import('@/components/dashboard/ApplianceBarChart'), {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full rounded-2xl bg-slate-800/50" />
});

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [latest, setLatest] = useState<any>(null);
    const [fullRecord, setFullRecord] = useState<any>(null);

    const [previous, setPrevious] = useState<any>(null);

    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Initial Load Logic
    useEffect(() => {
        const checkSession = async () => {
            const { session } = await getSafeSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session.user);
            fetchData(session.user.id);
        };

        checkSession();
    }, [router]);

    const fetchData = async (userId: string) => {
        try {
            const { data, error } = await loadTraining(userId);
            if (data) {
                setFullRecord(data); // Store full record for details and breakdown
                if (data.appliance_usage?.history) {
                    const hist = data.appliance_usage.history;
                    // Deduplicate
                    const uniqueHist = hist.filter((entry: any, index: number) => {
                        if (index === 0) return true;
                        const prev = hist[index - 1];
                        return !(entry.kwh === prev.kwh && entry.bill === prev.bill && entry.mode === prev.mode);
                    });

                    setHistory(uniqueHist);

                    if (uniqueHist.length > 0) {
                        const mostRecent = uniqueHist[uniqueHist.length - 1];
                        setLatest(mostRecent);
                        setSelectedId(mostRecent.date); // Default select latest

                        if (uniqueHist.length > 1) {
                            setPrevious(uniqueHist[uniqueHist.length - 2]);
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Dashboard Load Error:", e);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleHistorySelect = (entry: any) => {
        setLatest(entry); // 'latest' now acts as 'selected'
        setSelectedId(entry.date);

        // Find previous for the selected entry to show correct trends
        const idx = history.findIndex(h => h.date === entry.date);
        if (idx > 0) {
            setPrevious(history[idx - 1]);
        } else {
            setPrevious(null);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see changes
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0e1117] p-8 flex flex-col gap-6">
                {/* Skeleton Loader */}
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-10 w-48 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Skeleton className="h-[400px] rounded-2xl w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[300px] rounded-2xl" />
                    <Skeleton className="h-[300px] rounded-2xl" />
                </div>
            </div>
        );
    }

    // Determine breakdown source: Selected entry's breakdown OR fallback to fullRecord (for initial load)
    // Note: older history entries might NOT have breakdown if not saved.
    const breakdown = latest?.breakdown ||
        latest?.final_breakdown?.ai_results ||
        latest?.final_breakdown ||
        fullRecord?.final_breakdown?.ai_results ||
        fullRecord?.final_breakdown;

    const handleHistoryDelete = async (entryToDelete: any) => {
        if (!fullRecord) return;

        try {
            const currentHistory = fullRecord.appliance_usage?.history || [];
            // Remove the entry matching the specific date timestamp
            const updatedHistory = currentHistory.filter((h: any) => h.date !== entryToDelete.date);

            // Build Updated Payload
            const updatedUsage = {
                ...fullRecord.appliance_usage,
                history: updatedHistory
            };

            // Optimistic UI Update
            setHistory(prev => prev.filter(h => h.date !== entryToDelete.date));

            // Save to DB
            const { error } = await supabase
                .from('smartwatt_training')
                .update({
                    appliance_usage: updatedUsage,
                    updated_at: new Date().toISOString()
                })
                .eq('id', fullRecord.id);

            if (error) throw error;

            // Update full record reference
            setFullRecord((prev: any) => ({ ...prev, appliance_usage: updatedUsage }));
            toast.success("History entry removed");

            // If we deleted the currently viewed item, switch to the newest available
            if (selectedId === entryToDelete.date) {
                if (updatedHistory.length > 0) {
                    const newest = updatedHistory[updatedHistory.length - 1];
                    handleHistorySelect(newest);
                } else {
                    setLatest(null);
                    setSelectedId(null);
                }
            }

        } catch (e) {
            console.error("Delete failed", e);
            toast.error("Failed to delete entry");
            // Revert would be nice here, but reloading is simpler for MVP
            fetchData(user.id);
        }
    };

    return (
        <div className="min-h-screen bg-[#0e1117] text-slate-200 p-4 md:p-8">
            {/* Header */}
            <header className="max-w-7xl mx-auto flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
                        <LayoutDashboard className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-white">SmartWatt Dashboard</h1>
                            <SystemActiveHeader />
                        </div>
                        <p className="text-slate-500 text-sm">Welcome back, {user?.email?.split('@')[0]}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-slate-800/80 hover:bg-red-900/50 text-slate-300 hover:text-red-400 rounded-full transition-all backdrop-blur-sm border border-slate-700 shadow-lg flex items-center justify-center group shrink-0"
                    style={{ width: '40px', height: '40px', padding: 0 }}
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </header>

            <main className="max-w-7xl mx-auto space-y-8">

                {/* Hero Section: Selected Assessment Details */}
                <section>
                    <LatestAssessmentDetail
                        latest={latest}
                        previous={previous}
                        fullRecord={fullRecord} // Still passes context like house info
                        onNavigate={() => router.push('/?new=true')}
                    />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Consumers Bar Chart */}
                    <div className="lg:col-span-1">
                        <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-4 ml-1">
                            Breakdown for {latest?.date ? new Date(latest.date).toLocaleDateString() : 'Current'}
                        </h3>
                        <ApplianceBarChart breakdown={breakdown} />
                    </div>

                    {/* Usage Trends Chart (Composed) */}
                    <div className="lg:col-span-1">
                        <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-4 ml-1">History Overview</h3>
                        <UsageChart history={history} />
                    </div>
                </div>

                {/* History Table */}
                <section>
                    <HistoryTable
                        history={history}
                        onSelect={handleHistorySelect}
                        onDelete={handleHistoryDelete}
                        selectedId={selectedId || undefined}
                    />
                </section>
            </main>
        </div>
    );
}
