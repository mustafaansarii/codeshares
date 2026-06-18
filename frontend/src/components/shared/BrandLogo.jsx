// CodeShare wordmark: the brand code-mark + the name.
// "Code" inherits currentColor (adapts to dark/light); "Share" is the brand blue accent.
export default function BrandLogo({ className = '', showText = true, size = 32 }) {
    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
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
                    stroke="#2563EB"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    d="M46 24L34 32L46 40"
                    stroke="#2563EB"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            {showText && (
                <span className="text-[1.15rem] font-bold leading-none tracking-tight">
                    Code<span className="text-blue-600">Share</span>
                </span>
            )}
        </span>
    );
}
