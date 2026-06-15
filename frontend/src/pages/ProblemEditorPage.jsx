import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MdPlayArrow, MdCheck, MdArrowBack, MdCode, MdAccountCircle } from 'react-icons/md';


const PROBLEM_API = '/codeshare/api/problems';
const CODE_API    = '/codeshare/api/problems';

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
    const { id } = useParams();
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
        setCode(TEMPLATES[lang.label] || '');
    };

    // ── Monaco mount ─────────────────────────────────────────────────────────
    const handleEditorMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };

    // ── run ───────────────────────────────────────────────────────────────────
    const handleRun = async () => {
        if (!code.trim()) { toast.error('Write some code first'); return; }
        setExecuting(true);
        setActiveTab('output');
        try {
            const { data } = await axios.post(`${CODE_API}/run`, {
                code, language: language.label, problemId: Number(id), input: '', timeLimit: 5000,
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
        if (!code.trim()) { toast.error('Write some code first'); return; }
        setSubmitting(true);
        setActiveTab('output');
        try {
            const { data } = await axios.post(`${CODE_API}/submit`, {
                code, language: language.label, problemId: id,
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

                {/* Right — profile icon */}
                <div className="flex justify-end">
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

                    {/* Monaco Editor */}
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            language={language.monaco}
                            value={code}
                            onChange={v => setCode(v ?? '')}
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

export default ProblemEditorPage;
