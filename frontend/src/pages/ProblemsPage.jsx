import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/navbar/Navbar';

const API = '/codeshare/api/problems';

const DIFFICULTIES = ['ALL', 'EASY', 'MEDIUM', 'HARD'];

const DIFF_STYLE = {
    EASY:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    HARD:   'bg-red-50 text-red-600 ring-1 ring-red-200',
};

const PAGE_SIZES = [10, 20, 50];

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function ProblemsPage() {
    const navigate = useNavigate();

    // ── filter state ──────────────────────────────────────────────────────────
    const [keyword, setKeyword]     = useState('');
    const [sheetName, setSheetName] = useState('');
    const [difficulty, setDifficulty] = useState('ALL');
    const [page, setPage]           = useState(0);
    const [size, setSize]           = useState(20);

    // ── data state ────────────────────────────────────────────────────────────
    const [problems, setProblems]   = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading]     = useState(true);
    const [sheets, setSheets]       = useState([]);   // unique sheet names

    const debouncedKeyword = useDebounce(keyword);

    // ── fetch ─────────────────────────────────────────────────────────────────
    const fetchProblems = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (debouncedKeyword) params.set('keyword', debouncedKeyword);
        if (sheetName)        params.set('sheet_name', sheetName);
        params.set('page', page);
        params.set('size', size);

        axios.get(`${API}?${params}`)
            .then(({ data }) => {
                let items = data.data ?? [];
                // client-side difficulty filter (backend doesn't filter by difficulty yet)
                if (difficulty !== 'ALL') {
                    items = items.filter(p => p.difficulty === difficulty);
                }
                setProblems(items);
                setTotalPages(data.total_pages ?? 0);
                setTotalItems(data.total_items ?? 0);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [debouncedKeyword, sheetName, difficulty, page, size]);

    // fetch all sheets once for the dropdown
    useEffect(() => {
        axios.get(`${API}?size=1000`).then(({ data }) => {
            const names = [...new Set(
                (data.data ?? []).map(p => p.sheet_name).filter(Boolean)
            )].sort();
            setSheets(names);
        }).catch(() => {});
    }, []);

    useEffect(() => { fetchProblems(); }, [fetchProblems]);

    // reset to page 0 when filters change
    useEffect(() => { setPage(0); }, [debouncedKeyword, sheetName, difficulty, size]);

    // ── helpers ───────────────────────────────────────────────────────────────
    const totalDisplayed = difficulty === 'ALL' ? totalItems : problems.length;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

                {/* ── Page header ── */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Problem Sheet</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Browse, search and filter coding problems
                    </p>
                </div>

                {/* ── Filter bar ── */}
                <div className="mb-6 flex flex-wrap gap-3">

                    {/* Keyword search */}
                    <div className="relative flex-1 min-w-[220px]">
                        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            id="problems-search"
                            type="text"
                            placeholder="Search problems…"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 shadow-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                        />
                    </div>

                    {/* Sheet name dropdown */}
                    <select
                        id="problems-sheet-filter"
                        value={sheetName}
                        onChange={e => setSheetName(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                    >
                        <option value="">All Sheets</option>
                        {sheets.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    {/* Difficulty pills */}
                    <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
                        {DIFFICULTIES.map(d => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                                    difficulty === d
                                        ? d === 'ALL'
                                            ? 'bg-slate-900 text-white'
                                            : DIFF_STYLE[d] + ' shadow-sm scale-105'
                                        : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>

                    {/* Page size */}
                    <select
                        id="problems-page-size"
                        value={size}
                        onChange={e => setSize(Number(e.target.value))}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                    >
                        {PAGE_SIZES.map(s => (
                            <option key={s} value={s}>{s} / page</option>
                        ))}
                    </select>
                </div>

                {/* ── Count ── */}
                <div className="mb-3 text-xs text-slate-400">
                    {loading ? 'Loading…' : `${totalDisplayed} problem${totalDisplayed !== 1 ? 's' : ''} found`}
                </div>

                {/* ── Table ── */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {loading ? (
                        <SkeletonTable />
                    ) : problems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <svg className="mb-3 h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium">No problems found</p>
                            <p className="text-xs">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 w-12">#</th>
                                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Title</th>
                                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Sheet</th>
                                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {problems.map((p, i) => (
                                    <tr
                                        key={p.id}
                                        onClick={() => navigate(`/problems/${p.id}`)}
                                        className="group cursor-pointer transition-colors hover:bg-teal-50/50"
                                    >
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                            {page * size + i + 1}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                                                {p.title}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-500">
                                            {p.sheet_name
                                                ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">{p.sheet_name}</span>
                                                : <span className="text-slate-300">—</span>
                                            }
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${DIFF_STYLE[p.difficulty] ?? ''}`}>
                                                {p.difficulty}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            Page {page + 1} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function SkeletonTable() {
    return (
        <div className="animate-pulse divide-y divide-slate-50">
            <div className="flex gap-4 bg-slate-50 px-6 py-3.5">
                {[12, 48, 24, 20].map((w, i) => (
                    <div key={i} className={`h-3 w-${w} rounded bg-slate-200`} />
                ))}
            </div>
            {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="h-3 w-6 rounded bg-slate-100" />
                    <div className="h-4 w-56 rounded bg-slate-200" />
                    <div className="h-5 w-28 rounded-full bg-slate-100" />
                    <div className="h-5 w-16 rounded-full bg-slate-100" />
                </div>
            ))}
        </div>
    );
}
