import { Link } from 'react-router-dom';
import BrandLogo from '../shared/BrandLogo';

export default function Footer() {
    const columns = [
        {
            heading: 'Product',
            items: [
                { name: 'Problems', url: '/problems' },
                { name: 'Files', url: '/files' },
                { name: 'Sign in', url: '/login' },
            ],
        },
        {
            heading: 'Platform',
            items: [
                { name: 'Real-time collaboration', url: '/files' },
                { name: 'Run code', url: '/problems' },
            ],
        },
        {
            heading: 'Account',
            items: [
                { name: 'My Profile', url: '/profile' },
                { name: 'Sign in', url: '/login' },
            ],
        },
    ];

    return (
        <footer className="border-t border-white/10 bg-slate-950 text-slate-400">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="col-span-2 space-y-3 md:col-span-1">
                        <Link to="/" className="inline-flex items-center text-white">
                            <BrandLogo size={28} />
                        </Link>
                        <p className="max-w-xs text-sm text-slate-500">
                            Practice, run, and collaborate on code in real time — all in your browser.
                        </p>
                    </div>

                    {columns.map(({ heading, items }) => (
                        <div key={heading} className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">{heading}</h4>
                            <ul className="space-y-2">
                                {items.map((link) => (
                                    <li key={link.name + link.url}>
                                        <Link to={link.url} className="text-sm text-slate-400 transition hover:text-teal-300">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
                    <p className="text-xs text-slate-500">© {new Date().getFullYear()} CodeShare. All rights reserved.</p>
                    <p className="text-xs text-slate-600">Built for developers, by developers.</p>
                </div>
            </div>
        </footer>
    );
}
