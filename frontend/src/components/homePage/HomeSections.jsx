import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    MdArrowForward, MdBolt, MdGroups, MdShare, MdViewList, MdTerminal, MdLock, MdExpandMore,
} from 'react-icons/md';

const MotionDiv = motion.div;

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.07 } }),
};
const viewport = { once: true, amount: 0.2 };

const LANGS = ['Python', 'Java', 'C++', 'C', 'Node.js'];

const STATS = [
    { value: '5', label: 'languages, ready to run' },
    { value: '0', label: 'setup — code in the browser' },
    { value: '∞', label: 'live collaborators per file' },
    { value: '1-click', label: 'shareable links' },
];

const FEATURES = [
    { icon: MdTerminal, title: 'Run in 5 languages', desc: 'Execute Python, Java, C, C++ and Node.js instantly — with your own stdin and live stdout/stderr.' },
    { icon: MdGroups, title: 'Real-time collaboration', desc: 'Edit the same file together with live cursors and presence. Conflict-free, powered by CRDTs.' },
    { icon: MdShare, title: 'Share with anyone', desc: 'Generate a link in one click. Grant view or edit access per person, or make a file public.' },
    { icon: MdViewList, title: 'Curated DSA sheets', desc: 'Practice problems organized by topic and difficulty, with sample tests and full submissions.' },
    { icon: MdBolt, title: 'Instant execution', desc: 'Sandboxed runs with enforced time and memory limits — see results in milliseconds.' },
    { icon: MdLock, title: 'You control access', desc: 'Private by default. Public, view-only, or full edit — revoke anyone, anytime.' },
];

const STEPS = [
    { n: '01', title: 'Pick a problem or create a file', desc: 'Browse curated DSA sheets, or spin up a fresh file in any supported language.' },
    { n: '02', title: 'Code together, live', desc: 'Invite teammates with a link and edit in real time — every keystroke syncs with live cursors.' },
    { n: '03', title: 'Run, submit & share', desc: 'Run with custom input, submit against all test cases, and share your solution instantly.' },
];

const FAQS = [
    { q: 'Is CodeShare free to use?', a: 'Yes. Practice problems, create files, run code, and collaborate in real time — completely free.' },
    { q: 'Which languages can I run?', a: 'Python, Java, C, C++, and Node.js — each compiled and executed in an isolated sandbox with time and memory limits.' },
    { q: 'How does real-time collaboration work?', a: 'Open a file and share the link. Anyone with edit access joins the same live session — you see each other’s cursors and edits instantly, with no conflicts.' },
    { q: 'Can I control who sees my code?', a: 'Absolutely. Files are private by default. You can make them public (view-only), or share with specific people as viewer or editor, and revoke access anytime.' },
    { q: 'Can I run code with my own input?', a: 'Yes. The editor has a custom stdin panel — type any input your program reads and see the exact stdout, stderr, and exit code.' },
    { q: 'How do I sign in?', a: 'Sign in instantly with Google or GitHub — secure OAuth, no passwords to remember.' },
];

function FaqItem({ item, isOpen, onToggle }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-teal-400/30">
            <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="text-sm font-semibold text-white sm:text-base">{item.q}</span>
                <MdExpandMore className={`h-5 w-5 shrink-0 text-teal-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid overflow-hidden px-5 transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="text-sm leading-relaxed text-slate-400">{item.a}</p>
                </div>
            </div>
        </div>
    );
}

export default function HomeSections() {
    const [open, setOpen] = useState(0);

    return (
        <div className="bg-slate-950 text-white">
            {/* ── language strip ── */}
            <section className="border-y border-white/10">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Write and run in your language
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                        {LANGS.map((l) => (
                            <span key={l} className="font-mono text-lg font-bold tracking-tight text-slate-400">{l}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── stats ── */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {STATS.map((s, i) => (
                        <MotionDiv key={s.label} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                            <p className="bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">{s.value}</p>
                            <p className="mt-2 text-sm text-slate-400">{s.label}</p>
                        </MotionDiv>
                    ))}
                </div>
            </section>

            {/* ── features ── */}
            <section className="border-t border-white/10">
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to code together</h2>
                        <p className="mt-4 text-base text-slate-400">From solo practice to live pair-programming — one fast, browser-based workspace.</p>
                    </div>
                    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((f, i) => (
                            <MotionDiv key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-teal-400/30 hover:bg-white/[0.05]">
                                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300 transition group-hover:bg-teal-400/20">
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
                            </MotionDiv>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── collaboration highlight ── */}
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 px-6 py-14 sm:px-12 lg:py-20">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
                    <div className="relative grid items-center gap-10 lg:grid-cols-2">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-300">
                                <MdGroups className="h-3.5 w-3.5" /> Live collaboration
                            </span>
                            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                                Pair-program from anywhere, in real time
                            </h2>
                            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400">
                                Share a link and code on the same file together. Every keystroke syncs instantly with
                                live cursors and presence — perfect for interviews, mentoring, and reviews.
                            </p>
                            <Link to="/files" className="mt-8 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:shadow-[0_0_24px_-4px_rgba(45,212,191,0.6)]">
                                Open a collaborative file <MdArrowForward className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 font-mono text-[13px] leading-7 text-slate-300 shadow-xl">
                            <p><span className="text-slate-600">1</span>  <span className="text-violet-300">function</span> <span className="text-teal-300">merge</span>(a, b) {'{'}</p>
                            <p><span className="text-slate-600">2</span>    <span className="text-violet-300">return</span> [...a, ...b].sort()</p>
                            <p className="relative"><span className="text-slate-600">3</span>  {'}'}<span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-teal-400 align-middle" /><span className="ml-1 rounded bg-teal-500 px-1.5 text-[10px] text-slate-950">You</span></p>
                            <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                <span className="grid h-5 w-5 place-items-center rounded-full bg-violet-500 text-[9px] font-bold text-white">A</span>
                                Alice joined · editing line 2
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── how it works ── */}
            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From problem to solution in 3 steps</h2>
                </div>
                <div className="mt-14 grid gap-8 md:grid-cols-3">
                    {STEPS.map((s, i) => (
                        <MotionDiv key={s.n} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
                            <span className="bg-gradient-to-br from-teal-300/40 to-cyan-400/20 bg-clip-text font-mono text-5xl font-extrabold text-transparent">{s.n}</span>
                            <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
                        </MotionDiv>
                    ))}
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="border-t border-white/10">
                <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
                        <p className="mt-4 text-base text-slate-400">Everything you need to know to get started.</p>
                    </div>
                    <div className="mt-12 space-y-3">
                        {FAQS.map((item, i) => (
                            <FaqItem key={item.q} item={item} isOpen={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── final CTA ── */}
            <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-500/10 via-slate-900 to-violet-500/10 px-6 py-16 text-center">
                    <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[60%] -translate-x-1/2 rounded-full bg-teal-400/15 blur-3xl" />
                    <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">Ready to write some code?</h2>
                    <p className="relative mx-auto mt-4 max-w-xl text-base text-slate-400">
                        Jump into a problem or start a collaborative file — no setup, no install, just code.
                    </p>
                    <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                        <Link to="/problems" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:shadow-[0_0_28px_-4px_rgba(45,212,191,0.7)]">
                            Start solving <MdArrowForward className="h-4 w-4" />
                        </Link>
                        <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                            Sign in with Google / GitHub
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
