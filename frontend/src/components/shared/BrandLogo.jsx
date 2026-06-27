// CodeShare wordmark: the brand code-mark + the name in the editorial serif.
// "Code" inherits currentColor; "Share" is the clay accent.
export default function BrandLogo({ className = '', showText = true, size = 32 }) {
    return (
        <span className={`inline-flex items-center gap-1.5 ${className}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                fill="none"
                width={size}
                height={size}
                className="shrink-0"
            >
                <path
                    d="M40 18H28C22 18 18 22 18 28V36C18 42 22 46 28 46H40"
                    stroke="#D97757"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    d="M46 24L34 32L46 40"
                    stroke="#D97757"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            {showText && (
                <span className="font-display text-[1.3rem] font-semibold leading-none tracking-tight">
                    Code<span className="text-[#d97757]">Share</span>
                </span>
            )}
        </span>
    );
}
