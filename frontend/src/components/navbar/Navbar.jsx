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
        isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
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
                className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-900 transition hover:shadow-[0_0_18px_-2px_rgba(45,212,191,0.7)] focus:outline-none"
                aria-label="Profile menu"
            >
                <MdPerson className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-emerald-400" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
                    <div className="border-b border-white/10 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Account</p>
                    </div>
                    <div className="p-1.5">
                        <NavLink
                            to="/profile"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                        >
                            <MdPerson className="h-4 w-4" /> My Profile
                        </NavLink>
                    </div>
                    <div className="border-t border-white/10 p-1.5">
                        <button
                            onClick={() => { setOpen(false); onLogout(); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10"
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
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <button onClick={() => navigate('/')} className="flex items-center text-white outline-none">
                    <BrandLogo size={30} />
                </button>

                <div className="ml-8 hidden items-center gap-1 md:flex">
                    {visibleNavItems.map((item) => (
                        <NavLink key={item.label} to={item.to} className={linkClass}>
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="hidden md:block"><ProfileMenu onLogout={handleLogout} /></div>
                    ) : (
                        <NavLink
                            to="/login"
                            className="hidden items-center rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:shadow-[0_0_20px_-2px_rgba(45,212,191,0.6)] md:inline-flex"
                        >
                            Sign in
                        </NavLink>
                    )}

                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white md:hidden"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <MdClose className="h-6 w-6" /> : <MdMenu className="h-6 w-6" />}
                    </button>
                </div>
            </nav>

            {mobileOpen && (
                <div className="border-t border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur-xl md:hidden">
                    <div className="space-y-1">
                        {visibleNavItems.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.to}
                                onClick={closeMobile}
                                className={({ isActive }) =>
                                    `block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                                        isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                    <div className="mt-2 border-t border-white/10 pt-2">
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/profile" onClick={closeMobile} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5">
                                    My Profile
                                </NavLink>
                                <button onClick={() => { closeMobile(); handleLogout(); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-400 hover:bg-red-500/10">
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <NavLink to="/login" onClick={closeMobile} className="block rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 px-3 py-2.5 text-center text-sm font-semibold text-slate-950">
                                Sign in
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
