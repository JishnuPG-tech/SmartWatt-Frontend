'use client';

// This is the "Orchestrator" of the application.
// Think of it like a Wizard Manager. It keeps track of:
// 1. Where you are (Step 1, 2, 3...)
// 2. What you've told us (Data State)
// 3. Who you are (User Session)

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { loadTraining } from '@/lib/loadTraining';
import { Skeleton } from "@/components/ui/Skeleton";
import { LogOut, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamic Imports (The "Lazy Loaders")
// We don't want to download the entire app at once. That's slow.
// Instead, we only load the component ("chunk") when you actually reach that step.
const ModeSelection = dynamic(() => import('@/components/ModeSelection'), {
    loading: () => <div className="p-8"><Skeleton className="h-64 w-full" /></div>
});
const HouseholdInfo = dynamic(() => import('@/components/HouseholdInfo'), {
    loading: () => <div className="p-8"><Skeleton className="h-64 w-full" /></div>
});
const ApplianceSelection = dynamic(() => import('@/components/ApplianceSelection'), {
    loading: () => <div className="p-8"><Skeleton className="h-64 w-full" /></div>
});
const UsageDetails = dynamic(() => import('@/components/UsageDetails'), {
    loading: () => <div className="p-8"><Skeleton className="h-64 w-full" /></div>
});
const ResultsReport = dynamic(() => import('@/components/ResultsReport'), {
    loading: () => <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
    </div>
});

function SmartWattApp() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isNewAssessment = searchParams.get('new') === 'true';
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState<string | null>(null);
    const [trainingId, setTrainingId] = useState<string | null>(null);
    const [data, setData] = useState({
        mode: null as 'quick' | 'detailed' | null,
        household: {
            num_people: 4,
            season: 'Monsoon (June - September)',
            house_type: 'Apartment',
            kwh: 300,
            estimated_bill: 0
        },
        appliances: [] as string[],
        details: {} as any
    });

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setUserId(session.user.id);

                // Load saved data
                const { data: savedData, error: loadError } = await loadTraining(session.user.id);

                if (loadError) {
                    console.error("Error loading training data:", loadError);
                    // Do NOT create new record if error occurred - prevent wipe
                    setLoading(false);
                    return;
                }

                let currentData = savedData;

                // If no data exists (and no error), create a new record immediately
                // This is "Optimistic Creation". We assume you want to start right away.
                if (!currentData) {
                    const { data: newRecord, error: createError } = await supabase
                        .from("smartwatt_training")
                        .upsert({
                            user_id: session.user.id,
                            num_people: 4,
                            bi_monthly_kwh: 300,
                            selected_appliances: [],
                            appliance_usage: {},
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'user_id' })
                        .select()
                        .single();

                    if (createError) {
                        console.error("Failed to create/upsert initial record:", JSON.stringify(createError, null, 2));
                    } else {
                        currentData = newRecord;
                        toast.success("Welcome! New training session started.");
                    }
                } else {
                    // CHECK FOR REDIRECT: If user has history, go to dashboard
                    // BUT skip if user explicitly requested a new assessment
                    if (currentData.appliance_usage?.history?.length > 0 && !isNewAssessment) {
                        toast.info("Redirecting to Dashboard...");
                        router.push('/dashboard');
                        return; // Stop execution here
                    }

                    toast.info("Welcome back! Resuming your session.");
                }

                if (currentData) {
                    setTrainingId(currentData.id); // Store the ID for updates
                    setData(prev => ({
                        ...prev,
                        household: {
                            num_people: currentData.num_people ?? 4,
                            season: currentData.season ?? 'Monsoon (June - September)',
                            house_type: currentData.house_type ?? 'Apartment',
                            kwh: currentData.bi_monthly_kwh ?? 300,
                            estimated_bill: currentData.estimated_bill ?? 0
                        },
                        appliances: Array.isArray(currentData.selected_appliances) ? currentData.selected_appliances : [],
                        details: currentData.appliance_usage ?? {}
                    }));
                }
                setLoading(false);
            }
        };
        checkSession();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.message("Logged out successfully");
        router.push('/login');
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => {
        if (step === 4 && data.mode === 'quick') {
            setStep(2);
        } else {
            setStep(s => s - 1);
        }
    };

    const reset = () => {
        setStep(1);
        setData({
            mode: null,
            household: { num_people: 4, season: 'Monsoon (June - September)', house_type: 'Apartment', kwh: 300, estimated_bill: 0 },
            appliances: [],
            details: {}
        });
    };

    const [usageSubStep, setUsageSubStep] = useState(1);

    const handleBack = () => {
        if (step === 3 && usageSubStep > 1) {
            setUsageSubStep(s => s - 1);
        } else if (step === 1) {
            setData(prev => ({ ...prev, mode: null }));
        } else {
            prevStep();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0e1117] flex items-center justify-center p-4">
                <div className="w-full max-w-4xl space-y-8">
                    <Skeleton className="h-12 w-3/4 mx-auto" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // Mode Selection
    if (!data.mode) {
        return (
            <div className="relative">
                <button
                    onClick={handleLogout}
                    className="fixed top-6 right-6 p-3 w-auto bg-slate-800/80 hover:bg-red-900/50 text-slate-300 hover:text-red-400 rounded-full transition-all z-50 backdrop-blur-sm border border-slate-700 shadow-lg group"
                    style={{ width: 'auto' }}
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
                <div>
                    <ModeSelection onSelect={(mode) => setData(prev => ({ ...prev, mode }))} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            {/* Persistent Back Button */}
            <button
                onClick={handleBack}
                className="fixed top-6 left-6 p-3 w-auto bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full transition-all z-50 backdrop-blur-sm border border-slate-700 shadow-lg group"
                style={{ width: 'auto' }}
                title="Go Back"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Dashboard & Logout */}
            <div className="fixed top-6 right-6 flex items-center gap-3 z-50">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full transition-all backdrop-blur-sm border border-slate-700 shadow-lg text-sm font-medium"
                >
                    <LayoutDashboard size={16} />
                    Dashboard
                </button>
                <button
                    onClick={handleLogout}
                    className="p-3 bg-slate-800/80 hover:bg-red-900/50 text-slate-300 hover:text-red-400 rounded-full transition-all backdrop-blur-sm border border-slate-700 shadow-lg aspect-square flex items-center justify-center"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Step 1: Household Info (The Basics) */}
            {/* We capture who you are and where you live before asking about ACs. */}
            {step === 1 && (
                <HouseholdInfo
                    data={data.household}
                    onUpdate={(h) => setData(prev => ({ ...prev, household: h }))}
                    onNext={nextStep}
                    onBack={handleBack}
                    mode={data.mode}
                    trainingId={trainingId!}
                />
            )}

            {/* Step 2: Appliance Selection */}
            {step === 2 && (
                <ApplianceSelection
                    selected={data.appliances}
                    details={data.details}
                    onUpdate={(a) => setData(prev => ({ ...prev, appliances: a }))}
                    onDetailsUpdate={(d) => setData(prev => ({ ...prev, details: { ...prev.details, ...d } }))}
                    onNext={() => {
                        if (data.mode === 'quick') {
                            setStep(4);
                        } else {
                            nextStep();
                        }
                    }}
                    onBack={prevStep}
                    mode={data.mode}
                    trainingId={trainingId!}
                />
            )}

            {/* Step 3: Usage Details (Detailed Mode Only) */}
            {step === 3 && (
                <UsageDetails
                    selected={data.appliances}
                    details={data.details}
                    onUpdate={(d) => setData(prev => ({ ...prev, details: d }))}
                    onNext={nextStep}
                    onBack={prevStep}
                    mode={data.mode}
                    trainingId={trainingId!}
                    subStep={usageSubStep}
                    setSubStep={setUsageSubStep}
                />
            )}

            {/* Step 4: Results */}
            {step === 4 && (
                <ResultsReport
                    household={data.household}
                    appliances={data.appliances}
                    details={data.details}
                    onRestart={reset}
                    trainingId={trainingId!}
                />
            )}
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0e1117] flex items-center justify-center">
                <Skeleton className="h-12 w-48" />
            </div>
        }>
            <SmartWattApp />
        </Suspense>
    );
}