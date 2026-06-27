import OAuthButtons from './OAuthButtons';

export default function AuthLoginPage() {
    return (
        <div className="w-full max-w-sm">
            <h2 className="mb-1 font-display text-2xl font-semibold text-ink">Welcome back</h2>
            <p className="mb-8 text-sm text-ink-soft">
                Sign in with your Google or GitHub account to continue.
            </p>

            <OAuthButtons />
        </div>
    );
}
