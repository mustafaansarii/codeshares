import { useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function AuthLayout({ badge, title, description, features = [], breadcrumb, children }) {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen w-full bg-canvas">

            {/* ── Left brand panel ── */}
            <div className="relative hidden w-1/2 flex-col overflow-hidden bg-cream lg:flex">
                <div className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-clay/10 blur-3xl" />
                <span className="pointer-events-none absolute -bottom-6 -left-2 select-none font-display text-[10rem] font-semibold leading-none tracking-tighter text-ink/[0.04]">
                    {'</>'}
                </span>

                <header className="relative z-10 shrink-0 border-b border-line">
                    <div className="flex h-16 items-center px-10">
                        <button onClick={() => navigate('/')} className="flex items-center text-ink outline-none">
                            <BrandLogo size={34} />
                        </button>
                    </div>
                </header>

                <div className="relative z-10 flex flex-col gap-6 px-10 pb-12 pt-10">
                    {breadcrumb && (
                        <div className="flex items-center gap-2 pl-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                            <button onClick={() => navigate('/')} className="text-ink-muted transition-colors hover:text-ink">Home</button>
                            <span className="text-ink-muted/50">/</span>
                            <span className="text-clay">{breadcrumb}</span>
                        </div>
                    )}

                    {badge && (
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-clay/25 bg-clay-soft px-3.5 py-1 text-xs font-semibold text-clay-strong">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay opacity-50" />
                                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-clay" />
                            </span>
                            {badge}
                        </div>
                    )}

                    {title && (
                        <h1 className="font-display text-4xl font-semibold leading-[1.12] tracking-tight text-ink xl:text-5xl">
                            {title}
                        </h1>
                    )}

                    <div className="h-0.5 w-10 rounded-full bg-clay/60" />

                    {description && (
                        <p className="max-w-sm text-sm leading-relaxed text-ink-soft">{description}</p>
                    )}

                    {features.length > 0 && (
                        <ul className="space-y-3 pt-1">
                            {features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-ink-soft">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-clay-soft ring-1 ring-clay/20">
                                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-clay">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    {feat}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="hidden w-px shrink-0 bg-line lg:block" />

            {/* ── Right form panel ── */}
            <div className="flex flex-1 flex-col">
                <header className="shrink-0 border-b border-line bg-canvas lg:hidden">
                    <div className="flex h-16 items-center justify-between px-4">
                        <button onClick={() => navigate('/')} className="flex items-center text-ink outline-none">
                            <BrandLogo size={30} />
                        </button>
                        {breadcrumb && (
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest">
                                <button onClick={() => navigate('/')} className="text-ink-muted transition-colors hover:text-ink">Home</button>
                                <span className="text-ink-muted/50">/</span>
                                <span className="text-clay">{breadcrumb}</span>
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex flex-1 items-center justify-center px-6 py-12">
                    {children}
                </div>
            </div>
        </div>
    );
}
