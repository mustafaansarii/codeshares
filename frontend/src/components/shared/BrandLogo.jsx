export default function BrandLogo({ className = '', showText = true, size = 32 }) {
    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <span
                className="relative grid place-items-center rounded-xl bg-gradient-to-br from-teal-300 to-cyan-500 text-slate-950 shadow-[0_0_22px_-4px_rgba(45,212,191,0.7)]"
                style={{ height: size, width: size }}
            >
                <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none"
                    stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 8.5 5 12l3.5 3.5" />
                    <path d="M15.5 8.5 19 12l-3.5 3.5" />
                    <path d="M13.5 6.5 10.5 17.5" />
                </svg>
            </span>
            {showText && (
                <span className="text-[1.15rem] font-bold leading-none tracking-tight">
                    Code<span className="text-teal-400">Share</span>
                </span>
            )}
        </span>
    );
}
