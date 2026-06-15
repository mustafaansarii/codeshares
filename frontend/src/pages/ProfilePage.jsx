import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import Navbar from '../components/navbar/Navbar';

const PROVIDER_ICONS = {
    GOOGLE: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    ),
    GITHUB: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
    ),
};

function StatCard({ label, value, icon }) {
    return (
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <span className="text-2xl">{icon}</span>
            <span className="text-2xl font-bold text-slate-900">{value ?? '—'}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
        </div>
    );
}

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        authService.me()
            .then(setUser)
            .catch(() => {
                setError('Could not load profile. Please sign in again.');
                navigate('/login');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    const initials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    const provider = user?.provider?.toUpperCase();

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* ── Page body ── */}
            <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

                {loading && (
                    <div className="space-y-6 animate-pulse">
                        {/* Hero card skeleton */}
                        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5">
                            <div className="h-28 bg-slate-200" />
                            <div className="px-8 pb-8">
                                <div className="-mt-14 mb-4 flex items-end justify-between">
                                    <div className="h-24 w-24 rounded-2xl border-4 border-white bg-slate-300 shadow-lg" />
                                    <div className="h-8 w-36 rounded-full bg-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-7 w-48 rounded-lg bg-slate-200" />
                                    <div className="h-4 w-64 rounded-lg bg-slate-100" />
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <div className="h-6 w-16 rounded-full bg-slate-200" />
                                    <div className="h-6 w-20 rounded-full bg-slate-200" />
                                    <div className="h-6 w-28 rounded-full bg-slate-200" />
                                </div>
                            </div>
                        </div>

                        {/* Stats skeleton */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                                    <div className="h-7 w-12 rounded-lg bg-slate-200" />
                                    <div className="h-3 w-20 rounded bg-slate-100" />
                                </div>
                            ))}
                        </div>

                        {/* Account details skeleton */}
                        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                            <div className="mb-6 h-3 w-32 rounded bg-slate-200" />
                            <div className="divide-y divide-slate-100">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex justify-between py-4">
                                        <div className="h-4 w-28 rounded bg-slate-200" />
                                        <div className="h-4 w-36 rounded bg-slate-100" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-600">
                        {error}
                    </div>
                )}

                {!loading && user && (
                    <div className="space-y-6">

                        {/* ── Hero card ── */}
                        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5">
                            {/* Background gradient strip */}
                            <div className="h-28 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500" />

                            <div className="px-8 pb-8">
                                {/* Avatar */}
                                <div className="-mt-14 mb-4 flex items-end justify-between">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-teal-400 to-cyan-500 text-3xl font-bold text-white shadow-lg">
                                        {initials}
                                    </div>

                                    {/* Provider badge */}
                                    {provider && PROVIDER_ICONS[provider] && (
                                        <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                                            {PROVIDER_ICONS[provider]}
                                            {provider.charAt(0) + provider.slice(1).toLowerCase()} account
                                        </span>
                                    )}
                                </div>

                                {/* Name & email */}
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-slate-900">{user.fullName}</h1>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                </div>

                                {/* Badges row */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {user.roles?.map(role => (
                                        <span key={role} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 ring-1 ring-teal-200">
                                            {role}
                                        </span>
                                    ))}
                                    {user.verified && (
                                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Verified
                                        </span>
                                    )}
                                    {joinedDate && (
                                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                                            Joined {joinedDate}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Stats row ── */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <StatCard label="Problems Solved" value={user.problemsSolved ?? 0} icon="🎯" />
                            <StatCard label="Submissions" value={user.submissions ?? 0} icon="📤" />
                            <StatCard label="Streak" value={`${user.streak ?? 0}d`} icon="🔥" />
                            <StatCard label="Rank" value={user.rank ?? '—'} icon="🏆" />
                        </div>

                        {/* ── Account details card ── */}
                        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">Account Details</h2>
                            <dl className="divide-y divide-slate-100">
                                {[
                                    { label: 'Full Name', value: user.fullName },
                                    { label: 'Email', value: user.email },
                                    { label: 'Sign-in Provider', value: provider ? (provider.charAt(0) + provider.slice(1).toLowerCase()) : 'Unknown' },
                                    { label: 'Account Status', value: user.verified ? 'Verified' : 'Unverified' },
                                    { label: 'Member Since', value: joinedDate },
                                    { label: 'Role', value: user.roles?.join(', ') ?? 'USER' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between gap-4 py-4">
                                        <dt className="text-sm font-medium text-slate-500">{label}</dt>
                                        <dd className="text-right text-sm font-semibold text-slate-900">{value ?? '—'}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
