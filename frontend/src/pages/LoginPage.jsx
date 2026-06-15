import AuthLayout from '../components/shared/AuthLayout';
import AuthLoginPage from '../components/AuthComp/LoginPage';

export default function LoginPage() {
    return (
        <AuthLayout
            breadcrumb="Sign In"
            badge="Secure OAuth login"
            title={<>Sign in to <span className="italic text-teal-400">CodeShares</span></>}
            description="Use your Google or GitHub account to sign in instantly. No password required — secure and fast."
            features={[
                'One-click login with Google or GitHub',
                'No passwords to remember or reset',
                'Your account is secured by OAuth 2.0',
            ]}
        >
            <AuthLoginPage />
        </AuthLayout>
    );
}