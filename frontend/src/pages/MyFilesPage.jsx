import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    MdAdd, MdDelete, MdDriveFileRenameOutline, MdLock, MdPublic, MdClose, MdInsertDriveFile, MdPeople,
} from 'react-icons/md';
import Navbar from '../components/navbar/Navbar';
import filesService from '../services/files.service';
import { LANGUAGES } from '../lib/languages';

const LANG_BADGE = 'bg-cream text-ink-soft ring-1 ring-line';

export default function MyFilesPage() {
    const navigate = useNavigate();
    const [owned, setOwned] = useState([]);
    const [shared, setShared] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [renaming, setRenaming] = useState(null); // file being renamed

    useEffect(() => {
        let active = true;
        filesService.list()
            .then((data) => { if (active) { setOwned(data.owned ?? []); setShared(data.shared ?? []); } })
            .catch(() => { if (active) toast.error('Could not load files'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const handleDelete = async (file) => {
        if (!window.confirm(`Delete "${file.name}"? This can't be undone.`)) return;
        try {
            await filesService.remove(file.file_id);
            toast.success('File deleted');
            setOwned((prev) => prev.filter((f) => f.file_id !== file.file_id));
        } catch {
            toast.error('Delete failed');
        }
    };

    const toggleVisibility = async (file) => {
        const next = file.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
        try {
            await filesService.updateMeta(file.file_id, { visibility: next });
            setOwned((prev) => prev.map((f) => (f.file_id === file.file_id ? { ...f, visibility: next } : f)));
            toast.success(`File is now ${next.toLowerCase()}`);
        } catch {
            toast.error('Could not change visibility');
        }
    };

    return (
        <div className="min-h-screen bg-canvas">
            <Navbar />
            <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-ink">My Files</h1>
                        <p className="mt-1 text-sm text-ink-muted">Create, run, share and collaborate on code files.</p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-clay-strong"
                    >
                        <MdAdd className="h-4 w-4" /> New file
                    </button>
                </div>

                {loading ? (
                    <SkeletonList />
                ) : (
                    <>
                        <Section title="Your files" icon={<MdInsertDriveFile className="h-4 w-4" />}>
                            {owned.length === 0 ? (
                                <EmptyState onCreate={() => setCreateOpen(true)} />
                            ) : (
                                owned.map((f) => (
                                    <FileRow
                                        key={f.file_id}
                                        file={f}
                                        owner
                                        onOpen={() => navigate(`/files/${f.file_id}`)}
                                        onRename={() => setRenaming(f)}
                                        onDelete={() => handleDelete(f)}
                                        onToggleVisibility={() => toggleVisibility(f)}
                                    />
                                ))
                            )}
                        </Section>

                        {shared.length > 0 && (
                            <Section title="Shared with you" icon={<MdPeople className="h-4 w-4" />}>
                                {shared.map((f) => (
                                    <FileRow
                                        key={f.file_id}
                                        file={f}
                                        onOpen={() => navigate(`/files/${f.file_id}`)}
                                    />
                                ))}
                            </Section>
                        )}
                    </>
                )}
            </main>

            {createOpen && (
                <CreateModal
                    onClose={() => setCreateOpen(false)}
                    onCreated={(file) => navigate(`/files/${file.file_id}`)}
                />
            )}
            {renaming && (
                <RenameModal
                    file={renaming}
                    onClose={() => setRenaming(null)}
                    onRenamed={(name) => {
                        setOwned((prev) => prev.map((f) => (f.file_id === renaming.file_id ? { ...f, name } : f)));
                        setRenaming(null);
                    }}
                />
            )}
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {icon} {title}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm divide-y divide-line">
                {children}
            </div>
        </section>
    );
}

function FileRow({ file, owner, onOpen, onRename, onDelete, onToggleVisibility }) {
    return (
        <div className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-clay-soft/40">
            <button onClick={onOpen} className="flex flex-1 items-center gap-3 text-left">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-ink-muted">
                    <MdInsertDriveFile className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink group-hover:text-clay-strong">{file.name}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                        <span className={`rounded-full px-2 py-0.5 font-medium ${LANG_BADGE}`}>{file.language}</span>
                        {file.visibility === 'PUBLIC'
                            ? <span className="inline-flex items-center gap-1 text-emerald-600"><MdPublic className="h-3.5 w-3.5" /> Public</span>
                            : <span className="inline-flex items-center gap-1 text-ink-muted"><MdLock className="h-3.5 w-3.5" /> Private</span>}
                        {!owner && <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-600">{file.access}</span>}
                    </span>
                </span>
            </button>

            {owner && (
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <IconBtn title={file.visibility === 'PUBLIC' ? 'Make private' : 'Make public'} onClick={onToggleVisibility}>
                        {file.visibility === 'PUBLIC' ? <MdLock className="h-4 w-4" /> : <MdPublic className="h-4 w-4" />}
                    </IconBtn>
                    <IconBtn title="Rename" onClick={onRename}><MdDriveFileRenameOutline className="h-4 w-4" /></IconBtn>
                    <IconBtn title="Delete" danger onClick={onDelete}><MdDelete className="h-4 w-4" /></IconBtn>
                </div>
            )}
        </div>
    );
}

function IconBtn({ children, title, danger, onClick }) {
    return (
        <button
            title={title}
            onClick={onClick}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                danger ? 'text-ink-muted hover:bg-red-50 hover:text-red-500' : 'text-ink-muted hover:bg-cream hover:text-ink-soft'
            }`}
        >
            {children}
        </button>
    );
}

function EmptyState({ onCreate }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-ink-muted">
            <MdInsertDriveFile className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">No files yet</p>
            <button onClick={onCreate} className="mt-1 text-sm font-semibold text-clay hover:text-clay-strong">
                Create your first file
            </button>
        </div>
    );
}

function SkeletonList() {
    return (
        <div className="overflow-hidden rounded-2xl border border-line bg-paper divide-y divide-line">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4">
                    <div className="h-9 w-9 rounded-lg bg-cream animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 w-48 rounded bg-line animate-pulse" />
                        <div className="h-3 w-24 rounded bg-cream animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Modals ──────────────────────────────────────────────────────────────────────
function ModalShell({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl bg-paper p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-ink">{title}</h3>
                    <button onClick={onClose} className="text-ink-muted hover:text-ink-soft"><MdClose className="h-5 w-5" /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

const inputClass = 'w-full rounded-xl border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-clay focus:ring-2 focus:ring-clay/20';

function CreateModal({ onClose, onCreated }) {
    const [name, setName] = useState('');
    const [language, setLanguage] = useState(LANGUAGES[0].label);
    const [visibility, setVisibility] = useState('PRIVATE');
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!name.trim()) { toast.error('Name is required'); return; }
        setBusy(true);
        try {
            const file = await filesService.create({ name: name.trim(), language, visibility });
            toast.success('File created');
            onCreated(file);
        } catch {
            toast.error('Could not create file');
        } finally {
            setBusy(false);
        }
    };

    return (
        <ModalShell title="New file" onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-soft">File name</label>
                    <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="solution.java" className={inputClass} />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-soft">Language</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
                        {LANGUAGES.map((l) => <option key={l.label} value={l.label}>{l.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-soft">Visibility</label>
                    <div className="flex gap-2">
                        {['PRIVATE', 'PUBLIC'].map((v) => (
                            <button
                                type="button"
                                key={v}
                                onClick={() => setVisibility(v)}
                                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                                    visibility === v ? 'border-clay bg-clay-soft text-clay-strong' : 'border-line text-ink-muted hover:bg-cream'
                                }`}
                            >
                                {v === 'PUBLIC' ? <MdPublic className="h-4 w-4" /> : <MdLock className="h-4 w-4" />}
                                {v === 'PUBLIC' ? 'Public' : 'Private'}
                            </button>
                        ))}
                    </div>
                </div>
                <button disabled={busy} className="w-full rounded-xl bg-clay px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-clay-strong disabled:opacity-50">
                    {busy ? 'Creating…' : 'Create file'}
                </button>
            </form>
        </ModalShell>
    );
}

function RenameModal({ file, onClose, onRenamed }) {
    const [name, setName] = useState(file.name);
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setBusy(true);
        try {
            await filesService.updateMeta(file.file_id, { name: name.trim() });
            toast.success('Renamed');
            onRenamed(name.trim());
        } catch {
            toast.error('Rename failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <ModalShell title="Rename file" onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                <button disabled={busy} className="w-full rounded-xl bg-clay px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-clay-strong disabled:opacity-50">
                    {busy ? 'Saving…' : 'Save'}
                </button>
            </form>
        </ModalShell>
    );
}
