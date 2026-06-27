import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdPerson, MdLogout, MdMenu, MdClose } from 'react-icons/md';
import authService from '../../services/auth.service';
import BrandLogo from '../shared/BrandLogo';

const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Problems', to: '/problems' },
    { label: 'Files', to: '/files', authRequired: true },
];

const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive ? 'bg-ink/[0.06] text-ink' : 'text-ink-soft hover:bg-ink/[0.04] hover:text-ink'
    }`;

function ProfileMenu({ onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-clay text-white transition hover:bg-clay-strong focus:outline-none"
                aria-label="Profile menu"
            >
                <MdPerson className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-canvas bg-emerald-500" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-paper shadow-xl shadow-ink/10">
                    <div className="border-b border-line px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Account</p>
                    </div>
                    <div className="p-1.5">
                        <NavLink
                            to="/profile"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-cream hover:text-ink"
                        >
                            <MdPerson className="h-4 w-4" /> My Profile
                        </NavLink>
                    </div>
                    <div className="border-t border-line p-1.5">
                        <button
                            onClick={() => { setOpen(false); onLogout(); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                            <MdLogout className="h-4 w-4" /> Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const navigate = useNavigate();

    useEffect(() => {
        authService.verifyAuth().then(() => setIsAuthenticated(authService.isAuthenticated()));
    }, []);

    const closeMobile = () => setMobileOpen(false);

    const handleLogout = async () => {
        try {
            await authService.logout();
            setIsAuthenticated(false);
            navigate('/');
            toast.success('Logged out successfully');
        } catch {
            toast.error('Logout failed');
        }
    };

    const visibleNavItems = navItems.filter((item) => !item.authRequired || isAuthenticated);

    return (
        <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-xl">
            <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <button onClick={() => navigate('/')} className="flex items-center text-ink outline-none">
                    <BrandLogo size={34} />
                </button>

                {/* Centered nav links */}
                <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
                    {visibleNavItems.map((item) => (
                        <NavLink key={item.label} to={item.to} className={linkClass}>
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="hidden md:block"><ProfileMenu onLogout={handleLogout} /></div>
                    ) : (
                        <NavLink
                            to="/login"
                            className="hidden items-center rounded-full bg-clay px-5 py-2 text-sm font-semibold text-white transition hover:bg-clay-strong md:inline-flex"
                        >
                            Sign in
                        </NavLink>
                    )}

                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-ink-soft transition hover:bg-ink/[0.06] hover:text-ink md:hidden"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <MdClose className="h-6 w-6" /> : <MdMenu className="h-6 w-6" />}
                    </button>
                </div>
            </nav>

            {mobileOpen && (
                <div className="border-t border-line bg-canvas px-4 py-3 md:hidden">
                    <div className="space-y-1">
                        {visibleNavItems.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.to}
                                onClick={closeMobile}
                                className={({ isActive }) =>
                                    `block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                                        isActive ? 'bg-ink/[0.06] text-ink' : 'text-ink-soft hover:bg-ink/[0.04]'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                    <div className="mt-2 border-t border-line pt-2">
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/profile" onClick={closeMobile} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-ink/[0.04]">
                                    My Profile
                                </NavLink>
                                <button onClick={() => { closeMobile(); handleLogout(); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <NavLink to="/login" onClick={closeMobile} className="block rounded-full bg-clay px-3 py-2.5 text-center text-sm font-semibold text-white">
                                Sign in
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
