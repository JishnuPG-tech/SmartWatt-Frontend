'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { loadTraining } from '@/lib/loadTraining';
import ModeSelection from '@/components/ModeSelection';
import HouseholdInfo from '@/components/HouseholdInfo';
import ApplianceSelection from '@/components/ApplianceSelection';
import UsageDetails from '@/components/UsageDetails';
import ResultsReport from '@/components/ResultsReport';
import { LogOut, ArrowLeft } from 'lucide-react';

export default function Home() {
    const router = useRouter();
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
                    console.error("❌ Error loading training data:", loadError);
                    // Do NOT create new record if error occurred - prevent wipe
                    setLoading(false);
                    return;
                }

                let currentData = savedData;

                // If no data exists (and no error), create a new record immediately
                if (!currentData) {
                    console.log("⚠️ No existing record found. Creating new training record...");
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
                        console.error("❌ Failed to create/upsert initial record:", JSON.stringify(createError, null, 2));
                    } else {
                        console.log("✅ New training record created:", newRecord.id);
                        currentData = newRecord;
                    }
                } else {
                    console.log("✅ Existing training record found:", currentData.id);
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

    const handleBack = () => {
        if (step === 1) {
            setData(prev => ({ ...prev, mode: null }));
        } else {
            prevStep();
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#0e1117] flex items-center justify-center text-slate-400">Loading...</div>;
    }

    // Mode Selection
    if (!data.mode) {
        return (
            <div className="relative">
                <button
                    onClick={handleLogout}
                    className="fixed top-6 right-6 p-3 bg-slate-800/80 hover:bg-red-900/50 text-slate-300 hover:text-red-400 rounded-full transition-all z-50 backdrop-blur-sm border border-slate-700 shadow-lg group"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
                <ModeSelection onSelect={(mode) => setData(prev => ({ ...prev, mode }))} />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-[#0e1117]">
            {/* Persistent Back Button */}
            <button
                onClick={handleBack}
                className="fixed top-6 left-6 p-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full transition-all z-50 backdrop-blur-sm border border-slate-700 shadow-lg group"
                title="Go Back"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="fixed top-6 right-6 p-3 bg-slate-800/80 hover:bg-red-900/50 text-slate-300 hover:text-red-400 rounded-full transition-all z-50 backdrop-blur-sm border border-slate-700 shadow-lg group"
                title="Logout"
            >
                <LogOut size={20} />
            </button>

            {/* Step 1: Household Info */}
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