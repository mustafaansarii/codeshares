import OAuthButtons from './OAuthButtons';

export default function AuthLoginPage() {
    return (
        <div className="w-full max-w-sm">
            <h2 className="mb-1 text-xl font-semibold text-slate-900 dark:text-white">Welcome back</h2>
            <p className="mb-8 text-xs text-slate-500 dark:text-slate-400">
                Sign in with your Google or GitHub account to continue.
            </p>

            <OAuthButtons />
        </div>
    );
}
