import AuthLayout from '../components/shared/AuthLayout';
import SignupForm from '../components/AuthComp/SignupForm';

export default function SignupPage() {
    return (
        <AuthLayout
            breadcrumb="Sign Up"
            badge="Free to join"
            title={<>Build your <span className="italic text-teal-400">career profile</span></>}
            description="It takes less than two minutes. Share a few details and we'll start matching you with roles that fit your skills and goals."
            features={[
                'Build a single, polished professional profile',
                'Let curated companies discover you directly',
                'Control your visibility and communication preferences',
            ]}
        >
            <SignupForm />
        </AuthLayout>
    );
}
