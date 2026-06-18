import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MdArrowForward, MdPlayArrow, MdBolt } from 'react-icons/md';

const MotionDiv = motion.div;

const CODE_LINES = [
    { t: 'def two_sum(nums, target):', c: 'text-slate-300' },
    { t: '    seen = {}', c: 'text-slate-300' },
    { t: '    for i, n in enumerate(nums):', c: 'text-slate-300' },
    { t: '        if target - n in seen:', c: 'text-slate-300' },
    { t: '            return [seen[target - n], i]', c: 'text-teal-300' },
    { t: '        seen[n] = i', c: 'text-slate-300' },
];

const LANGS = ['Python', 'Java', 'C++', 'C', 'Node.js'];

export default function Hero() {
    return (
        <section className="relative overflow-hidden">
            {/* glow backdrop */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-teal-500/20 blur-[120px]" />
                <div className="absolute bottom-0 right-1/5 h-96 w-96 rounded-full bg-violet-500/20 blur-[120px]" />
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
                        backgroundSize: '44px 44px',
                    }}
                />
            </div>

            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28 lg:px-8">
                {/* ── Left ── */}
                <MotionDiv
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-300">
                        <MdBolt className="h-3.5 w-3.5" /> Real-time collaborative code editor
                    </span>

                    <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Practice. Run.<br />
                        <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                            Collaborate live.
                        </span>
                    </h1>

                    <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
                        Solve curated DSA problems, run code in five languages, and edit files together in
                        real time — with live cursors, shareable links, and instant execution.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link
                            to="/problems"
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:shadow-[0_0_28px_-4px_rgba(45,212,191,0.7)]"
                        >
                            Start solving <MdArrowForward className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            <MdPlayArrow className="h-4 w-4 text-teal-300" /> Try the editor
                        </Link>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Runs</span>
                        {LANGS.map((l) => (
                            <span key={l} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">
                                {l}
                            </span>
                        ))}
                    </div>
                </MotionDiv>

                {/* ── Right: code window ── */}
                <MotionDiv
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="relative"
                >
                    <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-teal-500/20 to-violet-500/20 blur-2xl" />
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/50 backdrop-blur-xl">
                        {/* window bar */}
                        <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
                            <span className="h-3 w-3 rounded-full bg-red-400/80" />
                            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                            <span className="ml-3 font-mono text-xs text-slate-400">two_sum.py</span>
                            <span className="ml-auto flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                                ✓ 12/12 passed
                            </span>
                        </div>

                        {/* code */}
                        <div className="relative px-5 py-4 font-mono text-[13px] leading-6">
                            {CODE_LINES.map((line, i) => (
                                <MotionDiv
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.12 }}
                                    className="flex"
                                >
                                    <span className="mr-4 w-4 select-none text-right text-slate-600">{i + 1}</span>
                                    <span className={line.c}>{line.t || ' '}</span>
                                </MotionDiv>
                            ))}

                            {/* remote collaborator cursor */}
                            <MotionDiv
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.3 }}
                                className="pointer-events-none absolute left-[10.5rem] top-[5.7rem]"
                            >
                                <span className="block h-5 w-0.5 animate-pulse bg-violet-400" />
                                <span className="mt-0.5 rounded bg-violet-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">Alice</span>
                            </MotionDiv>
                        </div>

                        {/* presence / run bar */}
                        <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-5 py-3">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-500 text-[10px] font-bold text-white ring-2 ring-slate-900">A</span>
                                    <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-500 text-[10px] font-bold text-slate-900 ring-2 ring-slate-900">Y</span>
                                </div>
                                <span className="text-xs text-slate-400">2 editing live</span>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950">
                                <MdPlayArrow className="h-3.5 w-3.5" /> Run
                            </span>
                        </div>
                    </div>
                </MotionDiv>
            </div>
        </section>
    );
}
