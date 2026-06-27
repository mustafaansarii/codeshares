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
    { icon: MdBolt, title: 'Instant execution', desc: 'Sandboxed runs with enforced time limits — see results in milliseconds.' },
    { icon: MdLock, title: 'You control access', desc: 'Private by default. Public, view-only, or full edit — revoke anyone, anytime.' },
];

const STEPS = [
    { n: '01', title: 'Pick a problem or create a file', desc: 'Browse curated DSA sheets, or spin up a fresh file in any supported language.' },
    { n: '02', title: 'Code together, live', desc: 'Invite teammates with a link and edit in real time — every keystroke syncs with live cursors.' },
    { n: '03', title: 'Run, submit & share', desc: 'Run with custom input, submit against all test cases, and share your solution instantly.' },
];

const FAQS = [
    { q: 'Is CodeShare free to use?', a: 'Yes. Practice problems, create files, run code, and collaborate in real time — completely free.' },
    { q: 'Which languages can I run?', a: 'Python, Java, C, C++, and Node.js — each compiled and executed in an isolated sandbox with time limits.' },
    { q: 'How does real-time collaboration work?', a: 'Open a file and share the link. Anyone with edit access joins the same live session — you see each other’s cursors and edits instantly, with no conflicts.' },
    { q: 'Can I control who sees my code?', a: 'Absolutely. Files are private by default. You can make them public (view-only), or share with specific people as viewer or editor, and revoke access anytime.' },
    { q: 'Can I run code with my own input?', a: 'Yes. The editor has a custom stdin panel — type any input your program reads and see the exact stdout, stderr, and exit code.' },
    { q: 'How do I sign in?', a: 'Sign in instantly with Google or GitHub — secure OAuth, no passwords to remember.' },
];

function FaqItem({ item, isOpen, onToggle }) {
    return (
        <div className="rounded-2xl border border-line bg-paper transition hover:border-clay/40">
            <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="text-base font-semibold text-ink">{item.q}</span>
                <MdExpandMore className={`h-5 w-5 shrink-0 text-clay transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid overflow-hidden px-5 transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="text-sm leading-relaxed text-ink-soft">{item.a}</p>
                </div>
            </div>
        </div>
    );
}

export default function HomeSections() {
    const [open, setOpen] = useState(0);

    return (
        <div className="bg-canvas text-ink">
            {/* ── language strip ── */}
            <section className="border-y border-line bg-cream/50">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-muted">
                        Write and run in your language
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                        {LANGS.map((l) => (
                            <span key={l} className="font-mono text-lg font-bold tracking-tight text-ink-soft">{l}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── stats ── */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {STATS.map((s, i) => (
                        <MotionDiv key={s.label} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                            className="rounded-2xl border border-line bg-paper p-6 text-center">
                            <p className="font-display text-5xl font-semibold tracking-tight text-clay">{s.value}</p>
                            <p className="mt-2 text-sm text-ink-soft">{s.label}</p>
                        </MotionDiv>
                    ))}
                </div>
            </section>

            {/* ── features ── */}
            <section className="border-t border-line">
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="font-display text-4xl font-semibold tracking-tight text-ink">Everything you need to code together</h2>
                        <p className="mt-4 text-lg text-ink-soft">From solo practice to live pair-programming — one fast, browser-based workspace.</p>
                    </div>
                    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((f, i) => (
                            <MotionDiv key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                                className="group rounded-2xl border border-line bg-paper p-6 transition hover:-translate-y-1 hover:border-clay/40 hover:shadow-lg hover:shadow-ink/[0.04]">
                                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-clay-soft text-clay-strong transition group-hover:bg-clay group-hover:text-white">
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
                            </MotionDiv>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── collaboration highlight ── */}
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[2rem] border border-line bg-cream px-6 py-14 sm:px-12 lg:py-20">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-clay/10 blur-3xl" />
                    <div className="relative grid items-center gap-10 lg:grid-cols-2">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-clay/30 bg-paper px-3 py-1 text-xs font-semibold text-clay-strong">
                                <MdGroups className="h-3.5 w-3.5" /> Live collaboration
                            </span>
                            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink">
                                Pair-program from anywhere, in real time
                            </h2>
                            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
                                Share a link and code on the same file together. Every keystroke syncs instantly with
                                live cursors and presence — perfect for interviews, mentoring, and reviews.
                            </p>
                            <Link to="/files" className="mt-8 inline-flex items-center gap-1.5 rounded-xl bg-clay px-6 py-3 text-sm font-semibold text-white transition hover:bg-clay-strong">
                                Open a collaborative file <MdArrowForward className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="rounded-2xl border border-line bg-paper p-5 font-mono text-[13px] leading-7 text-ink-soft shadow-lg shadow-ink/[0.04]">
                            <p><span className="text-ink-muted/50">1</span>  <span className="text-clay">function</span> <span className="text-ink">merge</span>(a, b) {'{'}</p>
                            <p><span className="text-ink-muted/50">2</span>    <span className="text-clay">return</span> [...a, ...b].sort()</p>
                            <p className="relative"><span className="text-ink-muted/50">3</span>  {'}'}<span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-clay align-middle" /><span className="ml-1 rounded bg-clay px-1.5 text-[10px] text-white">You</span></p>
                            <p className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
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
                    <h2 className="font-display text-4xl font-semibold tracking-tight text-ink">From problem to solution in 3 steps</h2>
                </div>
                <div className="mt-14 grid gap-8 md:grid-cols-3">
                    {STEPS.map((s, i) => (
                        <MotionDiv key={s.n} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                            className="rounded-2xl border border-line bg-paper p-7">
                            <span className="font-display text-5xl font-semibold text-clay/30">{s.n}</span>
                            <h3 className="mt-3 text-xl font-semibold text-ink">{s.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
                        </MotionDiv>
                    ))}
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="border-t border-line">
                <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="font-display text-4xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
                        <p className="mt-4 text-lg text-ink-soft">Everything you need to know to get started.</p>
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
                <div className="relative overflow-hidden rounded-[2rem] border border-clay/20 bg-clay-soft px-6 py-16 text-center">
                    <h2 className="font-display text-4xl font-semibold tracking-tight text-ink">Ready to write some code?</h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
                        Jump into a problem or start a collaborative file — no setup, no install, just code.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link to="/problems" className="inline-flex items-center gap-2 rounded-xl bg-clay px-6 py-3 text-sm font-semibold text-white transition hover:bg-clay-strong">
                            Start solving <MdArrowForward className="h-4 w-4" />
                        </Link>
                        <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-cream">
                            Sign in with Google / GitHub
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
