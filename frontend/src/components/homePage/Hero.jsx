import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MdArrowForward, MdPlayArrow, MdBolt } from 'react-icons/md';

const MotionDiv = motion.div;

const CODE_LINES = [
    [{ t: 'def ', c: 'text-clay' }, { t: 'two_sum', c: 'text-ink' }, { t: '(nums, target):', c: 'text-ink-soft' }],
    [{ t: '    seen = {}', c: 'text-ink-soft' }],
    [{ t: '    for ', c: 'text-clay' }, { t: 'i, n ', c: 'text-ink' }, { t: 'in enumerate(nums):', c: 'text-ink-soft' }],
    [{ t: '        if ', c: 'text-clay' }, { t: 'target - n in seen:', c: 'text-ink-soft' }],
    [{ t: '            return ', c: 'text-clay' }, { t: '[seen[target - n], i]', c: 'text-ink' }],
    [{ t: '        seen[n] = i', c: 'text-ink-soft' }],
];

const LANGS = ['Python', 'Java', 'C++', 'C', 'Node.js'];

export default function Hero() {
    return (
        <section className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-clay/10 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-amber-200/30 blur-[120px]" />
            </div>

            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28 lg:px-8">
                {/* ── Left ── */}
                <MotionDiv initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-clay/30 bg-clay-soft px-3 py-1 text-xs font-semibold text-clay-strong">
                        <MdBolt className="h-3.5 w-3.5" /> Real-time collaborative code editor
                    </span>

                    <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
                        Practice. Run.<br />
                        <span className="text-clay">Collaborate live.</span>
                    </h1>

                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
                        Solve curated DSA problems, run code in five languages, and edit files together in
                        real time — with live cursors, shareable links, and instant execution.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link
                            to="/problems"
                            className="inline-flex items-center gap-2 rounded-xl bg-clay px-6 py-3 text-sm font-semibold text-white transition hover:bg-clay-strong"
                        >
                            Start solving <MdArrowForward className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-cream"
                        >
                            <MdPlayArrow className="h-4 w-4 text-clay" /> Try the editor
                        </Link>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">Runs</span>
                        {LANGS.map((l) => (
                            <span key={l} className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-xs text-ink-soft">
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
                    <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-xl shadow-ink/[0.06]">
                        {/* window bar */}
                        <div className="flex items-center gap-2 border-b border-line bg-cream px-4 py-3">
                            <span className="h-3 w-3 rounded-full bg-clay/70" />
                            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                            <span className="ml-3 font-mono text-xs text-ink-muted">two_sum.py</span>
                            <span className="ml-auto flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                ✓ 12/12 passed
                            </span>
                        </div>

                        {/* code */}
                        <div className="relative px-5 py-4 font-mono text-[13px] leading-6">
                            {CODE_LINES.map((spans, i) => (
                                <MotionDiv
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.12 }}
                                    className="flex"
                                >
                                    <span className="mr-4 w-4 select-none text-right text-ink-muted/50">{i + 1}</span>
                                    <span className="whitespace-pre">{spans.map((s, j) => <span key={j} className={s.c}>{s.t}</span>)}</span>
                                </MotionDiv>
                            ))}

                            {/* remote collaborator cursor */}
                            <MotionDiv
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
                                className="pointer-events-none absolute left-[10.5rem] top-[5.7rem]"
                            >
                                <span className="block h-5 w-0.5 animate-pulse bg-violet-500" />
                                <span className="mt-0.5 rounded bg-violet-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">Alice</span>
                            </MotionDiv>
                        </div>

                        {/* presence / run bar */}
                        <div className="flex items-center justify-between border-t border-line bg-cream px-5 py-3">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-500 text-[10px] font-bold text-white ring-2 ring-paper">A</span>
                                    <span className="grid h-6 w-6 place-items-center rounded-full bg-clay text-[10px] font-bold text-white ring-2 ring-paper">Y</span>
                                </div>
                                <span className="text-xs text-ink-muted">2 editing live</span>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-clay px-3 py-1.5 text-xs font-semibold text-white">
                                <MdPlayArrow className="h-3.5 w-3.5" /> Run
                            </span>
                        </div>
                    </div>
                </MotionDiv>
            </div>
        </section>
    );
}
