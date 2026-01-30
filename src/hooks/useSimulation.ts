import { useState } from 'react';
import { toast } from 'sonner';
import { simulateSavings, calculateBill } from '@/lib/api';

export function useSimulation(household: any, details: any, billDetails: any) {
    const [optimization, setOptimization] = useState<any>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const runSimulation = async () => {
        if (!billDetails) {
            console.warn("Bill details missing, cannot simulate.");
            return;
        }

        setIsSimulating(true);
        const toastId = toast.loading("Analyzing consumption patterns...");

        try {
            // Context: Pass Monthly Average Units (not Bi-Monthly) for better AI Context
            const monthlyUnits = household.kwh / 2;
            const simRes = await simulateSavings(details, monthlyUnits);

            if (simRes.status === 'success' && simRes.insights) {
                let totalSavedKwh = 0;
                const savingsBreakdown: string[] = [];

                if (simRes.insights.length === 0) {
                    toast.dismiss(toastId);
                    toast.info("Your usage is already highly optimized!");
                    setIsSimulating(false);
                    return;
                }

                simRes.insights.forEach((insight: any) => {
                    totalSavedKwh += insight.saved_kwh;
                    savingsBreakdown.push(`${insight.title} (Save ${Math.round(insight.saved_kwh)} kWh)`);
                });

                // Calculate New Bill
                // Our Bill is Bi-Monthly. So we save 2 * Monthly Savings.
                const biMonthlySavings = totalSavedKwh * 2;

                const optimizedKwh = Math.max(50, household.kwh - biMonthlySavings);
                const optimizedBill = await calculateBill(optimizedKwh);

                setOptimization({
                    originalKwh: household.kwh,
                    newKwh: optimizedKwh,
                    originalBill: billDetails.total,
                    newBill: optimizedBill.total,
                    savedAmount: billDetails.total - optimizedBill.total,
                    breakdown: savingsBreakdown
                });
                toast.success("Optimization Complete!");
            } else {
                toast.error("No optimization insights found.");
            }
        } catch (err) {
            console.error("Simulation failed:", err);
            toast.error("Could not generate AI insights.");
        } finally {
            setIsSimulating(false);
            toast.dismiss(toastId);
        }
    };

    return { optimization, runSimulation, isSimulating };
}
