import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MdPlayArrow, MdCheck, MdArrowBack, MdCode, MdAccountCircle, MdGroupAdd, MdContentCopy, MdClose } from 'react-icons/md';
import { useCollab } from '../hooks/useCollab';
import collabService from '../services/collab.service';
import authService from '../services/auth.service';


const PROBLEM_API = '/codeshare/api/problems';
const CODE_API    = '/codeshare/api/problems';

// Stable per-user cursor color derived from their email/name.
const CURSOR_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
function colorFor(seed = '') {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

// ── Language config ───────────────────────────────────────────────────────────
const LANGUAGES = [
    { label: 'Java',    monaco: 'java',       ext: 'java'   },
    { label: 'Python',  monaco: 'python',     ext: 'py'     },
    { label: 'C++',     monaco: 'cpp',        ext: 'cpp'    },
    { label: 'C',       monaco: 'c',          ext: 'c'      },
    { label: 'Node.js', monaco: 'javascript', ext: 'js'     },
];

const TEMPLATES = {
    Java: `class Solution {
    public String solve(String input) {
        // 'input' is the raw test-case input as a single string
        // Parse it, solve the problem, return the answer as a String

        return "";
    }
}`,
    Python: `class Solution:
    def solve(self, input: str) -> str:
        # 'input' is the raw test-case input as a single string
        # Parse it, solve the problem, return the answer as a string

        return ""`,
    'C++': `class Solution {
public:
    std::string solve(std::string input) {
        // 'input' is the raw test-case input as a single string
        // Parse it, solve the problem, return the answer as a string

        return "";
    }
};`,
    C: `/* solve() receives the raw test-case input as a C string */
char* solve(char* input) {
    // Parse it, solve the problem, return the answer as a string

    return "";
}`,
    'Node.js': `class Solution {
    solve(input) {
        // 'input' is the raw test-case input as a single string
        // Parse it, solve the problem, return the answer as a string

        return "";
    }
}`,
};

const DIFF_STYLE = {
    EASY:   'text-emerald-400',
    MEDIUM: 'text-amber-400',
    HARD:   'text-red-400',
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col animate-pulse">
            <div className="h-16 bg-slate-800 border-b border-slate-700" />
            <div className="h-12 bg-slate-800 border-b border-slate-700" />
            <div className="flex flex-1 overflow-hidden">
                <div className="w-[42%] border-r border-slate-700 p-6 space-y-4">
                    <div className="h-6 w-48 rounded bg-slate-700" />
                    <div className="h-4 w-full rounded bg-slate-800" />
                    <div className="h-4 w-5/6 rounded bg-slate-800" />
                    <div className="h-4 w-4/6 rounded bg-slate-800" />
                </div>
                <div className="flex-1 bg-slate-900" />
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
function ProblemEditorPage() {
    const { id, sessionId } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const [problem,    setProblem]    = useState(null);
    const [language,   setLanguage]   = useState(LANGUAGES[0]);
    const [code,       setCode]       = useState(TEMPLATES.Java);
    const [loading,    setLoading]    = useState(true);
    const [executing,  setExecuting]  = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [output,     setOutput]     = useState(null);
    const [activeTab,  setActiveTab]  = useState('description'); // 'description' | 'output'
    const [fontSize,   setFontSize]   = useState(14);

    // ── collaboration ──────────────────────────────────────────────────────────
    const collabMode = Boolean(sessionId);
    const [editorInstance, setEditorInstance] = useState(null);
    const [identity,        setIdentity]       = useState(null);
    const [isOwner,         setIsOwner]         = useState(false);
    const [shareOpen,       setShareOpen]       = useState(false);
    const [inviting,        setInviting]        = useState(false);

    // Resolve current user identity (name + stable color) for the remote cursor.
    useEffect(() => {
        let active = true;
        authService.me()
            .then((u) => {
                const data = u?.data ?? u ?? {};
                const name = data.fullName || data.email || 'Guest';
                if (active) setIdentity({ name, email: data.email || '', color: colorFor(data.email || name) });
            })
            .catch(() => { if (active) setIdentity({ name: 'Guest', email: '', color: CURSOR_COLORS[0] }); });
        return () => { active = false; };
    }, []);

    // In a shared session, find out whether we're the owner (only the owner seeds code).
    useEffect(() => {
        if (!sessionId || !identity) return;
        collabService.getSession(sessionId)
            .then((s) => setIsOwner((s.owner_email || '') === (identity.email || '')))
            .catch(() => {});
    }, [sessionId, identity]);

    const collabUser = useMemo(
        () => (identity
            ? { name: identity.name, color: identity.color }
            : { name: 'Guest', color: CURSOR_COLORS[0] }),
        [identity],
    );

    const { connected, users } = useCollab({
        editor: collabMode ? editorInstance : null,
        sessionId: collabMode ? sessionId : null,
        user: collabUser,
        initialCode: code,
        isOwner,
    });

    // ── fetch problem ─────────────────────────────────────────────────────────
    useEffect(() => {
        axios.get(`${PROBLEM_API}/${id}`)
            .then(({ data }) => {
                const p = data.data || data;
                setProblem(p);
                document.title = p?.title ? `${p.title} | CodeShares` : 'CodeShares';
            })
            .catch(() => { toast.error('Problem not found'); navigate('/problems'); })
            .finally(() => setLoading(false));
        return () => { document.title = 'CodeShares'; };
    }, [id, navigate]);

    // ── language switch ───────────────────────────────────────────────────────
    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        // In a shared session the document is owned by Yjs — don't clobber it with a template.
        if (!collabMode) setCode(TEMPLATES[lang.label] || '');
    };

    // ── Monaco mount ─────────────────────────────────────────────────────────
    const handleEditorMount = (editor) => {
        editorRef.current = editor;
        setEditorInstance(editor);
        editor.focus();
    };

    // Live source: in collab mode the model is driven by Yjs, so read it straight from Monaco.
    const currentSource = () => editorRef.current?.getValue() ?? code;

    // ── invite to collaborate ───────────────────────────────────────────────────
    const handleInvite = async () => {
        if (collabMode) { setShareOpen(true); return; }
        setInviting(true);
        try {
            const session = await collabService.createSession(id, language.label);
            navigate(`/problems/${id}/collab/${session.session_id}`);
            setShareOpen(true);
        } catch {
            toast.error('Could not start a collab session');
        } finally {
            setInviting(false);
        }
    };

    // ── run ───────────────────────────────────────────────────────────────────
    const handleRun = async () => {
        const source = currentSource();
        if (!source.trim()) { toast.error('Write some code first'); return; }
        setExecuting(true);
        setActiveTab('output');
        try {
            const { data } = await axios.post(`${CODE_API}/run`, {
                code: source, language: language.label, problemId: Number(id), input: '', timeLimit: 5000,
            });
            const payload = data.data || data;
            setOutput({ type: 'run', ...payload });
            payload.failed_test_cases === 0 ? toast.success('Sample tests passed! 🎉') : toast.error('Some sample tests failed');
        } catch {
            toast.error('Execution failed');
            setOutput({ type: 'error', message: 'Execution service unavailable' });
        } finally { setExecuting(false); }
    };

    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const source = currentSource();
        if (!source.trim()) { toast.error('Write some code first'); return; }
        setSubmitting(true);
        setActiveTab('output');
        try {
            const { data } = await axios.post(`${CODE_API}/submit`, {
                code: source, language: language.label, problemId: id,
            });
            const payload = data.data || data;
            setOutput({ type: 'submit', ...payload });
            payload.status === 'ACCEPTED'
                ? toast.success('All tests passed! 🎉')
                : toast.error(`${payload.passed_test_cases ?? 0}/${payload.total_test_cases ?? 0} passed`);
        } catch {
            toast.error('Submission failed');
        } finally { setSubmitting(false); }
    };

    if (loading) return <LoadingSkeleton />;

    const sampleCases = (problem?.test_cases ?? []).filter(t => t.is_sample);

    return (
        <div className="flex flex-col h-screen bg-[#0f172a] text-slate-100 overflow-hidden">


            {/* ── Top bar ── */}
            <div className="grid grid-cols-3 items-center border-b border-slate-700 bg-slate-800/80 px-5 py-2.5 flex-shrink-0">
                {/* Left — back only */}
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/problems')}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                    >
                        <MdArrowBack className="h-4 w-4" /> Problems
                    </button>
                </div>

                {/* Center — Run + Submit */}
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={handleRun}
                        disabled={executing || submitting}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-600 disabled:opacity-40"
                    >
                        <MdPlayArrow className="h-4 w-4 text-blue-400" />
                        {executing ? 'Running…' : 'Run'}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={executing || submitting}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
                    >
                        <MdCheck className="h-4 w-4" />
                        {submitting ? 'Submitting…' : 'Submit'}
                    </button>
                </div>

                {/* Right — participants, invite, profile */}
                <div className="flex justify-end items-center gap-3">
                    {collabMode && (
                        <div className="flex items-center gap-2">
                            {/* live presence avatars */}
                            <div className="flex -space-x-2">
                                {users.map((u, i) => (
                                    <span
                                        key={i}
                                        title={u.name}
                                        className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-slate-800"
                                        style={{ backgroundColor: u.color }}
                                    >
                                        {(u.name || '?').charAt(0).toUpperCase()}
                                    </span>
                                ))}
                            </div>
                            <span
                                title={connected ? 'Connected' : 'Connecting…'}
                                className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}
                            />
                        </div>
                    )}

                    <button
                        onClick={handleInvite}
                        disabled={inviting}
                        title="Invite to collaborate"
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
                    >
                        <MdGroupAdd className="h-4 w-4" />
                        {inviting ? 'Starting…' : collabMode ? 'Share' : 'Invite'}
                    </button>

                    <button
                        onClick={() => navigate('/profile')}
                        title="My Profile"
                        className="flex items-center justify-center h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition"
                    >
                        <MdAccountCircle className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* ── Main split ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── LEFT PANEL ── */}
                <div className="w-[42%] min-w-[320px] flex flex-col border-r border-slate-700 overflow-hidden">

                    {/* Tabs */}
                    <div className="flex border-b border-slate-700 bg-slate-800/50 flex-shrink-0">
                        {['description', 'output'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-3 text-xs font-semibold capitalize transition ${
                                    activeTab === tab
                                        ? 'border-b-2 border-teal-400 text-teal-400'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {tab}
                                {tab === 'output' && output && (
                                    <span className={`ml-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                                        output.status === 'OK' || output.status === 'ACCEPTED'
                                            ? 'bg-emerald-400' : 'bg-red-400'
                                    }`} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto">
                        {activeTab === 'description' ? (
                            <div className="p-6 space-y-5 text-sm">
                                {/* Title + Difficulty */}
                                <div>
                                    <h1 className="text-xl font-bold text-white leading-snug">{problem?.title}</h1>
                                    <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                        problem?.difficulty === 'EASY'   ? 'bg-emerald-900/50 text-emerald-400' :
                                        problem?.difficulty === 'MEDIUM' ? 'bg-amber-900/50 text-amber-400' :
                                                                           'bg-red-900/50 text-red-400'
                                    }`}>{problem?.difficulty}</span>
                                </div>

                                <p className="text-slate-300 leading-relaxed">{problem?.description}</p>

                                {problem?.constraints && (
                                    <div>
                                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Constraints</h3>
                                        <p className="font-mono text-xs text-slate-400 bg-slate-800 rounded-lg p-3">{problem.constraints}</p>
                                    </div>
                                )}

                                {sampleCases.length > 0 && (
                                    <div>
                                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Examples</h3>
                                        <div className="space-y-3">
                                            {sampleCases.map((tc, i) => (
                                                <div key={i} className="rounded-lg bg-slate-800 p-4 text-xs font-mono space-y-2">
                                                    <div>
                                                        <span className="text-slate-400 mr-2">Input:</span>
                                                        <span className="text-slate-200">{tc.input_data}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 mr-2">Output:</span>
                                                        <span className="text-slate-200">{tc.expected_output}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-6 border-t border-slate-700 pt-4 text-xs text-slate-400">
                                    <div>
                                        <p className="mb-0.5 uppercase tracking-wider">Time Limit</p>
                                        <p className="font-semibold text-slate-300">{problem?.time_limit} ms</p>
                                    </div>
                                    <div>
                                        <p className="mb-0.5 uppercase tracking-wider">Memory</p>
                                        <p className="font-semibold text-slate-300">{problem?.memory_limit} MB</p>
                                    </div>
                                    {problem?.sheet_name && (
                                        <div>
                                            <p className="mb-0.5 uppercase tracking-wider">Sheet</p>
                                            <p className="font-semibold text-slate-300">{problem.sheet_name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <OutputPanel output={output} executing={executing} submitting={submitting} />
                        )}
                    </div>
                </div>

                {/* ── RIGHT PANEL (Monaco) ── */}
                <div className="flex flex-1 flex-col overflow-hidden">

                    {/* Editor toolbar */}
                    <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-4 py-2 flex-shrink-0">
                        {/* Language dropdown */}
                        <div className="flex items-center gap-2">
                            <MdCode className="h-4 w-4 text-slate-400" />
                            <select
                                value={language.label}
                                onChange={e => handleLanguageChange(LANGUAGES.find(l => l.label === e.target.value))}
                                className="rounded-md border border-slate-600 bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition cursor-pointer"
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang.label} value={lang.label}>{lang.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Font size control */}
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <button onClick={() => setFontSize(s => Math.max(10, s - 1))}
                                className="h-6 w-6 rounded hover:bg-slate-700 transition flex items-center justify-center">−</button>
                            <span className="w-8 text-center">{fontSize}px</span>
                            <button onClick={() => setFontSize(s => Math.min(24, s + 1))}
                                className="h-6 w-6 rounded hover:bg-slate-700 transition flex items-center justify-center">+</button>
                        </div>
                    </div>

                    {/* Share modal */}
                    {shareOpen && (
                        <ShareModal
                            link={`${window.location.origin}/problems/${id}/collab/${sessionId}`}
                            onClose={() => setShareOpen(false)}
                        />
                    )}

                    {/* Monaco Editor */}
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            language={language.monaco}
                            // In collab mode Yjs (via MonacoBinding) owns the document — go uncontrolled
                            // so React's value prop doesn't fight the CRDT.
                            {...(collabMode
                                ? { defaultValue: '' }
                                : { value: code, onChange: v => setCode(v ?? '') })}
                            onMount={handleEditorMount}
                            theme="vs-dark"
                            options={{
                                fontSize,
                                fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, monospace',
                                fontLigatures: true,
                                minimap:            { enabled: false },
                                scrollBeyondLastLine: false,
                                lineNumbers:        'on',
                                glyphMargin:        false,
                                folding:            true,
                                lineDecorationsWidth: 0,
                                renderLineHighlight: 'line',
                                tabSize:            4,
                                insertSpaces:       true,
                                wordWrap:           'off',
                                smoothScrolling:    true,
                                cursorBlinking:     'smooth',
                                cursorSmoothCaretAnimation: 'on',
                                bracketPairColorization: { enabled: true },
                                padding:            { top: 16, bottom: 16 },
                                scrollbar: {
                                    verticalScrollbarSize: 6,
                                    horizontalScrollbarSize: 6,
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Output panel ──────────────────────────────────────────────────────────────
function OutputPanel({ output, executing, submitting }) {
    if (executing || submitting) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-teal-400" />
                <p className="text-sm">{executing ? 'Running your code…' : 'Submitting…'}</p>
            </div>
        );
    }

    if (!output) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                <MdPlayArrow className="h-10 w-10 opacity-30" />
                <p className="text-sm">Run or submit to see output</p>
            </div>
        );
    }

    if (output.type === 'error') {
        return (
            <div className="p-6">
                <p className="text-xs text-red-400 font-mono">{output.message}</p>
            </div>
        );
    }

    if (output.type === 'run' || output.type === 'submit') {
        const accepted = output.failed_test_cases === 0 && output.passed_test_cases > 0;
        const passed   = output.passed_test_cases ?? 0;
        const total    = output.total_test_cases ?? 0;
        const pct      = total > 0 ? Math.round((passed / total) * 100) : 0;
        
        return (
            <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto">
                <div className={`w-full flex-shrink-0 rounded-xl p-6 text-center ${accepted ? 'bg-emerald-900/30 ring-1 ring-emerald-500/30' : 'bg-amber-900/20 ring-1 ring-amber-500/30'}`}>
                    <p className={`text-2xl font-bold ${accepted ? 'text-emerald-300' : 'text-amber-300'}`}>
                        {accepted ? '✓ ' + (output.type === 'submit' ? 'Accepted' : 'Sample Tests Passed') : '✗ Wrong Answer'}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                        {passed} / {total} test cases passed
                    </p>
                    {/* Progress bar */}
                    <div className="mt-4 h-2 w-full rounded-full bg-slate-700">
                        <div
                            className={`h-2 rounded-full transition-all ${accepted ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>

                {/* Individual Test Results */}
                {output.test_results?.length > 0 && (
                    <div className="space-y-4 pb-12">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Test Cases</h3>
                        {output.test_results.map((tr, idx) => (
                            <div key={idx} className={`rounded-lg p-4 border ${tr.status === 'PASSED' ? 'border-emerald-800/50 bg-emerald-900/10' : 'border-red-800/50 bg-red-900/10'}`}>
                                <p className={`text-sm font-semibold mb-3 flex justify-between ${tr.status === 'PASSED' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    <span>Test Case {idx + 1} {tr.status === 'PASSED' ? '✓' : '✗'}</span>
                                    <span className="text-xs opacity-70 font-normal">{tr.execution_time_ms}ms</span>
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {tr.error_message ? (
                                        <div className="col-span-2">
                                            <p className="text-xs text-slate-500 mb-1">Error</p>
                                            <pre className="text-xs text-red-300 bg-black/40 p-3 rounded-lg overflow-x-auto">{tr.error_message}</pre>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="col-span-2 lg:col-span-1">
                                                <p className="text-xs text-slate-500 mb-1">Expected Output</p>
                                                <pre className="text-xs text-slate-300 bg-black/40 p-3 rounded-lg whitespace-pre-wrap overflow-x-auto">{tr.expected_output}</pre>
                                            </div>
                                            <div className="col-span-2 lg:col-span-1">
                                                <p className="text-xs text-slate-500 mb-1">Actual Output</p>
                                                <pre className="text-xs text-slate-300 bg-black/40 p-3 rounded-lg whitespace-pre-wrap overflow-x-auto">{tr.actual_output}</pre>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return null;
}

// ── Share modal ─────────────────────────────────────────────────────────────────
function ShareModal({ link, onClose }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast.success('Link copied');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Could not copy');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="w-full max-w-md rounded-2xl bg-slate-800 p-6 ring-1 ring-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Invite to collaborate</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <MdClose className="h-5 w-5" />
                    </button>
                </div>
                <p className="mb-4 text-sm text-slate-400">
                    Anyone with this link can join and edit the code with you in real time.
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-900 p-2">
                    <input
                        readOnly
                        value={link}
                        className="flex-1 bg-transparent px-2 text-xs text-slate-300 outline-none"
                        onFocus={e => e.target.select()}
                    />
                    <button
                        onClick={copy}
                        className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                    >
                        <MdContentCopy className="h-3.5 w-3.5" />
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProblemEditorPage;
