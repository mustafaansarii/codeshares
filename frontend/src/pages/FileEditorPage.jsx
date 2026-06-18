import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
    MdArrowBack, MdPlayArrow, MdContentCopy, MdClose, MdAccountCircle, MdCode, MdLock, MdPublic,
    MdShare, MdDelete,
} from 'react-icons/md';
import { useCollab } from '../hooks/useCollab';
import filesService from '../services/files.service';
import authService from '../services/auth.service';
import { LANGUAGES, langByLabel } from '../lib/languages';

const RUN_API = '/codeshare/api/run';
const CURSOR_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
function colorFor(seed = '') {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export default function FileEditorPage() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const saveTimer = useRef(null);

    const [file, setFile]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [editorInstance, setEditorInstance] = useState(null);
    const [identity, setIdentity] = useState(null);

    const [input, setInput]   = useState('');
    const [output, setOutput] = useState(null);
    const [running, setRunning] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    const canEdit = file?.access === 'OWNER' || file?.access === 'EDIT';
    const isOwner = file?.access === 'OWNER';

    // ── load file ───────────────────────────────────────────────────────────────
    useEffect(() => {
        let active = true;
        filesService.get(fileId)
            .then((f) => {
                if (!active) return;
                setFile(f);
                setLanguage(langByLabel(f.language));
                document.title = `${f.name} | CodeShares`;
            })
            .catch((e) => {
                if (!active) return;
                toast.error(e?.response?.status === 403 ? 'You don’t have access to this file' : 'File not found');
                navigate('/files');
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; document.title = 'CodeShares'; };
    }, [fileId, navigate]);

    // ── current user identity (for the remote cursor) ───────────────────────────
    useEffect(() => {
        let active = true;
        authService.me()
            .then((u) => {
                const d = u?.data ?? u ?? {};
                const name = d.fullName || d.email || 'Guest';
                if (active) setIdentity({ name, color: colorFor(d.email || name) });
            })
            .catch(() => { if (active) setIdentity({ name: 'Guest', color: CURSOR_COLORS[0] }); });
        return () => { active = false; };
    }, []);

    const collabUser = useMemo(() => identity || { name: 'Guest', color: CURSOR_COLORS[0] }, [identity]);

    // Every file editor is a collab room: file:<fileId>. Reuses the Yjs + WS relay.
    const { connected, users } = useCollab({
        editor: editorInstance,
        sessionId: file ? `file:${fileId}` : null,
        user: collabUser,
        initialCode: file?.content || '',
        isOwner: canEdit, // any editor may seed the doc when it's still empty
    });

    // ── persist content (debounced) on every change, editors only ───────────────
    const handleEditorMount = (editor) => {
        editorRef.current = editor;
        setEditorInstance(editor);
        editor.onDidChangeModelContent(() => {
            if (!canEdit) return;
            clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => {
                filesService.saveContent(fileId, editor.getValue()).catch(() => {});
            }, 1200);
        });
    };

    useEffect(() => () => clearTimeout(saveTimer.current), []);

    // ── run with custom input ────────────────────────────────────────────────────
    const handleRun = useCallback(async () => {
        const code = editorRef.current?.getValue() ?? '';
        if (!code.trim()) { toast.error('Write some code first'); return; }
        setRunning(true);
        setOutput(null);
        try {
            const { data } = await axios.post(RUN_API, {
                code, language: language.label, input, timeLimit: 5000, raw: true,
            });
            setOutput(data.data ?? data);
        } catch {
            toast.error('Execution failed');
            setOutput({ status: 'ERROR', stderr: 'Execution service unavailable', exit_code: -1 });
        } finally {
            setRunning(false);
        }
    }, [language, input]);

    const handleLanguageChange = async (lang) => {
        setLanguage(lang);
        if (isOwner) {
            try {
                await filesService.updateMeta(fileId, { language: lang.label });
            } catch { /* non-fatal */ }
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#0f172a] text-slate-400">Loading…</div>;

    const shareLink = `${window.location.origin}/files/${fileId}`;

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-[#0f172a] text-slate-100">
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/80 px-5 py-2.5">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/files')} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
                        <MdArrowBack className="h-4 w-4" /> Files
                    </button>
                    <span className="text-slate-600">/</span>
                    <span className="text-sm font-semibold text-white">{file?.name}</span>
                    {file?.visibility === 'PUBLIC'
                        ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 px-2 py-0.5 text-[11px] text-emerald-300"><MdPublic className="h-3 w-3" /> Public</span>
                        : <span className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-2 py-0.5 text-[11px] text-slate-300"><MdLock className="h-3 w-3" /> Private</span>}
                    {!canEdit && <span className="rounded-full bg-amber-900/40 px-2 py-0.5 text-[11px] text-amber-300">View only</span>}
                </div>

                <div className="flex items-center gap-3">
                    {/* presence */}
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {users.map((u, i) => (
                                <span key={i} title={u.name}
                                    className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-slate-800"
                                    style={{ backgroundColor: u.color }}>
                                    {(u.name || '?').charAt(0).toUpperCase()}
                                </span>
                            ))}
                        </div>
                        <span title={connected ? 'Connected' : 'Connecting…'}
                            className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    </div>

                    <button onClick={handleRun} disabled={running}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40">
                        <MdPlayArrow className="h-4 w-4" /> {running ? 'Running…' : 'Run'}
                    </button>

                    <button onClick={() => setShareOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700">
                        <MdShare className="h-4 w-4" /> Share
                    </button>

                    <button onClick={() => navigate('/profile')} title="My Profile"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">
                        <MdAccountCircle className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* ── Main split ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-800/50 px-4 py-2">
                        <MdCode className="h-4 w-4 text-slate-400" />
                        <select
                            value={language.label}
                            disabled={!isOwner}
                            onChange={(e) => handleLanguageChange(langByLabel(e.target.value))}
                            className="rounded-md border border-slate-600 bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-200 outline-none focus:border-teal-500 disabled:opacity-60"
                        >
                            {LANGUAGES.map((l) => <option key={l.label} value={l.label}>{l.label}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            language={language.monaco}
                            defaultValue=""
                            onMount={handleEditorMount}
                            theme="vs-dark"
                            options={{
                                readOnly: !canEdit,
                                fontSize: 14,
                                fontFamily: '"JetBrains Mono", "Fira Code", Menlo, monospace',
                                fontLigatures: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                cursorSmoothCaretAnimation: 'on',
                                padding: { top: 16, bottom: 16 },
                                scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                            }}
                        />
                    </div>
                </div>

                {/* Console: stdin + output */}
                <div className="flex w-[36%] min-w-[300px] flex-col border-l border-slate-700">
                    <div className="flex flex-col border-b border-slate-700" style={{ height: '40%' }}>
                        <div className="border-b border-slate-700 bg-slate-800/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Custom Input (stdin)
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type input your program reads from stdin…"
                            spellCheck={false}
                            className="flex-1 resize-none bg-[#0b1120] p-4 font-mono text-xs text-slate-200 outline-none placeholder:text-slate-600"
                        />
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="border-b border-slate-700 bg-slate-800/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Output
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <RunOutput output={output} running={running} />
                        </div>
                    </div>
                </div>
            </div>

            {shareOpen && (
                <ShareModal
                    file={file}
                    link={shareLink}
                    isOwner={isOwner}
                    onClose={() => setShareOpen(false)}
                    onSharesChange={(shares) => setFile((f) => ({ ...f, shares }))}
                />
            )}
        </div>
    );
}

// ── Run output ──────────────────────────────────────────────────────────────────
function RunOutput({ output, running }) {
    if (running) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-400" />
                <p className="text-sm">Running…</p>
            </div>
        );
    }
    if (!output) {
        return <div className="flex h-full items-center justify-center text-sm text-slate-600">Run to see output</div>;
    }
    const ok = output.exit_code === 0 && output.status !== 'ERROR';
    return (
        <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center gap-3">
                <span className={`rounded px-2 py-0.5 font-semibold ${ok ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'}`}>
                    {output.status || (ok ? 'OK' : 'ERROR')}
                </span>
                {typeof output.execution_time_ms === 'number' && <span className="text-slate-500">{output.execution_time_ms} ms</span>}
                <span className="text-slate-500">exit {output.exit_code}</span>
            </div>
            {output.stdout && (
                <div>
                    <p className="mb-1 text-slate-500">stdout</p>
                    <pre className="whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-slate-200">{output.stdout}</pre>
                </div>
            )}
            {output.stderr && (
                <div>
                    <p className="mb-1 text-slate-500">stderr</p>
                    <pre className="whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-red-300">{output.stderr}</pre>
                </div>
            )}
        </div>
    );
}

// ── Share modal ───────────────────────────────────────────────────────────────
function ShareModal({ file, link, isOwner, onClose, onSharesChange }) {
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState('');
    const [access, setAccess] = useState('VIEW');
    const [busy, setBusy] = useState(false);
    const shares = file.shares || [];

    const copy = async () => {
        try { await navigator.clipboard.writeText(link); setCopied(true); toast.success('Link copied'); setTimeout(() => setCopied(false), 2000); }
        catch { toast.error('Could not copy'); }
    };

    const addShare = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setBusy(true);
        try {
            const updated = await filesService.addShare(file.file_id, email.trim().toLowerCase(), access);
            onSharesChange(updated);
            setEmail('');
            toast.success('Shared');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not share');
        } finally {
            setBusy(false);
        }
    };

    const removeShare = async (target) => {
        try {
            const updated = await filesService.removeShare(file.file_id, target);
            onSharesChange(updated);
        } catch {
            toast.error('Could not remove');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 ring-1 ring-slate-700" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Share “{file.name}”</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><MdClose className="h-5 w-5" /></button>
                </div>

                <p className="mb-2 text-xs text-slate-400">Anyone with edit access can collaborate live. Copy the link:</p>
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-900 p-2">
                    <input readOnly value={link} onFocus={(e) => e.target.select()}
                        className="flex-1 bg-transparent px-2 text-xs text-slate-300 outline-none" />
                    <button onClick={copy} className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                        <MdContentCopy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>

                {isOwner && (
                    <>
                        <form onSubmit={addShare} className="mb-4 flex gap-2">
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@email.com"
                                className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-teal-500" />
                            <select value={access} onChange={(e) => setAccess(e.target.value)}
                                className="rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-xs text-slate-200 outline-none">
                                <option value="VIEW">View</option>
                                <option value="EDIT">Edit</option>
                            </select>
                            <button disabled={busy} className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
                                Add
                            </button>
                        </form>

                        {shares.length > 0 && (
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">People with access</p>
                                {shares.map((s) => (
                                    <div key={s.email} className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                                        <span className="truncate text-xs text-slate-300">{s.email}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300">{s.access}</span>
                                            <button onClick={() => removeShare(s.email)} className="text-slate-500 hover:text-red-400"><MdDelete className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
