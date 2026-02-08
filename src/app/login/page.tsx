'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(
        searchParams.get('registered') === 'true'
            ? 'Registration successful! Please login.'
            : null
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else if (authData.user) {
            // Check for existing history
            try {
                const { data: userData } = await supabase
                    .from("smartwatt_training")
                    .select("appliance_usage") // Only need this field to check history
                    .eq("user_id", authData.user.id)
                    .maybeSingle();

                const hasHistory = userData?.appliance_usage?.history?.length > 0;

                if (hasHistory) {
                    router.push('/dashboard');
                } else {
                    router.push('/');
                }
            } catch (err) {
                // Fallback to home if check fails
                console.error("Redirect check failed", err);
                router.push('/');
            }
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0e1117] p-4">
            <div className="w-full max-w-md bg-[#1a202c] border border-slate-700 rounded-2xl p-8 shadow-2xl shadow-blue-900/20">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 mb-2">SMARTWATT</h1>
                    <p className="text-slate-400">Login to access your energy estimator</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm text-center">
                        {message}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-[#e2e8f0] text-sm font-medium mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-[#0e1117] border border-slate-600 rounded-lg p-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-[#e2e8f0] text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-[#0e1117] border border-slate-600 rounded-lg p-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-400 text-sm mb-4">Don&apos;t have an account?</p>
                    <Link
                        href="/register"
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
