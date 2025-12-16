'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Redirect to login with success flag
            router.push('/login?registered=true');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0e1117] p-4">
            <div className="w-full max-w-md bg-[#1a202c] border border-slate-700 rounded-2xl p-8 shadow-2xl shadow-blue-900/20">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 mb-2">SMARTWATT</h1>
                    <p className="text-slate-400">Create your account</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-6">
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

                    <div>
                        <label className="block text-[#e2e8f0] text-sm font-medium mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-400 text-sm mb-4">Already have an account?</p>
                    <Link
                        href="/login"
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
