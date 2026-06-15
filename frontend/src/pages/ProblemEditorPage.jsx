import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MdPlayArrow, MdCheck } from 'react-icons/md';
import Navbar from '../components/navbar/Navbar';

const PROBLEM_API = '/codeshare/api/problems';
const CODE_API = '/codeshare/api/problems';

const LANGUAGE_OPTIONS = ['Java', 'C', 'C++', 'Python', 'Node.js'];

function ProblemEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // ── problem & code state ──────────────────────────────────────────────────
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('Java');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // ── execution state ───────────────────────────────────────────────────────
    const [output, setOutput] = useState(null);
    const [executing, setExecuting] = useState(false);

    // ── fetch problem ─────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const { data } = await axios.get(`${PROBLEM_API}/${id}`);
                setProblem(data.data || data);
                setCode(getTemplateCode(language));
            } catch (error) {
                toast.error('Failed to load problem');
                navigate('/problems');
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id, navigate]);

    // ── template codes ────────────────────────────────────────────────────────
    const getTemplateCode = (lang) => {
        const templates = {
            Java: 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
            Python: 'def solve():\n    # Your code here\n    pass\n\nsolve()',
            'Node.js': 'function solve() {\n    // Your code here\n}\n\nsolve();',
            C: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}',
            'C++': '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}'
        };
        return templates[lang] || '';
    };

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        setCode(getTemplateCode(newLang));
    };

    // ── run code (sample test cases) ──────────────────────────────────────────
    const handleRun = async () => {
        if (!code.trim()) {
            toast.error('Code cannot be empty');
            return;
        }

        setExecuting(true);
        try {
            const payload = {
                code,
                language,
                input: '',
                timeLimit: 5000
            };

            const { data } = await axios.post(`${CODE_API}/run`, payload);

            setOutput({
                type: 'sample',
                status: data.status,
                stdout: data.stdout || '',
                stderr: data.stderr || '',
                executionTime: data.execution_time_ms || 0,
                memory: data.memory_used || 0
            });

            if (data.status === 'OK') {
                toast.success('Code executed successfully');
            } else {
                toast.error(`Execution failed: ${data.status}`);
            }
        } catch (error) {
            toast.error('Failed to execute code');
            setOutput({
                type: 'error',
                message: error.message
            });
        } finally {
            setExecuting(false);
        }
    };

    // ── submit code (all test cases) ──────────────────────────────────────────
    const handleSubmit = async () => {
        if (!code.trim()) {
            toast.error('Code cannot be empty');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                code,
                language,
                problemId: id
            };

            const { data } = await axios.post(`${CODE_API}/submit`, payload);

            setOutput({
                type: 'submission',
                status: data.status,
                passed: data.passed_test_cases || 0,
                total: data.total_test_cases || 0,
                accuracy: data.accuracy || 0
            });

            if (data.status === 'ACCEPTED') {
                toast.success('All test cases passed! 🎉');
            } else {
                toast.error(`${data.passed_test_cases || 0}/${data.total_test_cases || 0} test cases passed`);
            }
        } catch (error) {
            toast.error('Failed to submit code');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Loading problem...</div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Problem not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />

            <div className="flex flex-col h-[calc(100vh-64px)]">
                {/* ── Header with buttons ── */}
                <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/problems')}
                            className="text-slate-400 hover:text-slate-200 transition"
                        >
                            ← Problems
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-white">{problem.title}</h1>
                            <p className="text-xs text-slate-400">ID: {problem.id}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleRun}
                            disabled={executing || submitting}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            <MdPlayArrow className="h-4 w-4" />
                            Run
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={executing || submitting}
                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                            <MdCheck className="h-4 w-4" />
                            Submit
                        </button>
                    </div>
                </div>

                {/* ── Main content (split layout) ── */}
                <div className="flex flex-1 gap-6 overflow-hidden px-6 py-6">

                    {/* ── LEFT PANEL (Description + Output) ── */}
                    <div className="flex flex-1 flex-col gap-6 min-w-0 overflow-y-auto">

                        {/* Description */}
                        <div className="flex-shrink-0 rounded-lg border border-slate-700 bg-slate-800 p-6">
                            <h2 className="mb-3 text-lg font-bold text-white">Description</h2>
                            <div className="text-slate-300 space-y-3 text-sm">
                                <p>{problem.description}</p>

                                {problem.constraints && (
                                    <div>
                                        <h3 className="font-semibold text-white mt-4 mb-2">Constraints</h3>
                                        <p className="text-slate-400">{problem.constraints}</p>
                                    </div>
                                )}

                                <div className="flex gap-6 pt-4 border-t border-slate-700">
                                    <div>
                                        <p className="text-xs text-slate-400">Difficulty</p>
                                        <p className={`text-sm font-semibold ${
                                            problem.difficulty === 'EASY' ? 'text-emerald-400' :
                                            problem.difficulty === 'MEDIUM' ? 'text-amber-400' :
                                            'text-red-400'
                                        }`}>
                                            {problem.difficulty}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Time Limit</p>
                                        <p className="text-sm font-semibold text-slate-200">{problem.time_limit}ms</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Memory Limit</p>
                                        <p className="text-sm font-semibold text-slate-200">{problem.memory_limit}MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Output Section */}
                        <div className="flex-1 rounded-lg border border-slate-700 bg-slate-800 p-6 flex flex-col overflow-hidden">
                            <h2 className="mb-4 text-lg font-bold text-white">Output</h2>

                            {!output ? (
                                <div className="flex-1 flex items-center justify-center text-slate-400">
                                    <p className="text-sm">Run or submit code to see output</p>
                                </div>
                            ) : output.type === 'error' ? (
                                <div className="flex-1 overflow-y-auto">
                                    <p className="text-red-400 text-sm font-mono">{output.message}</p>
                                </div>
                            ) : output.type === 'sample' ? (
                                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                                    <div className={`px-3 py-2 rounded text-sm font-semibold ${
                                        output.status === 'OK' ? 'bg-emerald-900 text-emerald-200' : 'bg-red-900 text-red-200'
                                    }`}>
                                        Status: {output.status}
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        <p className="text-xs text-slate-400 mb-2">Output:</p>
                                        <pre className="text-slate-300 text-xs font-mono bg-slate-900 p-3 rounded overflow-x-auto">
                                            {output.stdout || '(no output)'}
                                        </pre>
                                    </div>
                                    {output.stderr && (
                                        <div>
                                            <p className="text-xs text-slate-400 mb-2">Error:</p>
                                            <pre className="text-red-400 text-xs font-mono bg-slate-900 p-3 rounded overflow-x-auto">
                                                {output.stderr}
                                            </pre>
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-400">
                                        Execution time: {output.executionTime}ms
                                    </p>
                                </div>
                            ) : output.type === 'submission' ? (
                                <div className="flex-1 flex flex-col justify-center items-center gap-4">
                                    <div className={`px-4 py-3 rounded-lg text-center ${
                                        output.status === 'ACCEPTED' ? 'bg-emerald-900' : 'bg-amber-900'
                                    }`}>
                                        <p className={`font-bold text-lg ${
                                            output.status === 'ACCEPTED' ? 'text-emerald-200' : 'text-amber-200'
                                        }`}>
                                            {output.status === 'ACCEPTED' ? '✓ Accepted' : `${output.passed}/${output.total} Passed`}
                                        </p>
                                    </div>
                                    <div className="text-slate-300 text-center">
                                        <p className="text-sm">Accuracy: {(output.accuracy * 100).toFixed(1)}%</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* ── RIGHT PANEL (Code Editor) ── */}
                    <div className="flex flex-1 flex-col gap-4 min-w-0 overflow-hidden">

                        {/* Language selector */}
                        <div className="flex gap-2">
                            {LANGUAGE_OPTIONS.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                        language === lang
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>

                        {/* Code editor */}
                        <div className="flex-1 rounded-lg border border-slate-700 bg-slate-900 overflow-hidden">
                            <textarea
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                className="w-full h-full bg-slate-900 text-slate-200 font-mono text-sm p-4 outline-none resize-none"
                                spellCheck="false"
                                placeholder="Write your code here..."
                            />
                        </div>

                        {/* Test cases (optional) */}
                        {problem.test_cases && problem.test_cases.length > 0 && (
                            <div className="flex-shrink-0 rounded-lg border border-slate-700 bg-slate-800 p-4 max-h-40 overflow-y-auto">
                                <h3 className="text-xs font-bold text-slate-400 mb-2">Sample Test Cases ({problem.test_cases.filter(t => t.is_sample).length})</h3>
                                <div className="space-y-2">
                                    {problem.test_cases.filter(t => t.is_sample).map((tc, i) => (
                                        <div key={i} className="text-xs text-slate-300 bg-slate-900 p-2 rounded">
                                            <p className="text-slate-400">Input: <span className="font-mono text-slate-300">{tc.input_data}</span></p>
                                            <p className="text-slate-400">Output: <span className="font-mono text-slate-300">{tc.expected_output}</span></p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProblemEditorPage;
