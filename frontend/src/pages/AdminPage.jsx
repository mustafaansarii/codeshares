import { useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import {
    MdAdd, MdEdit, MdDelete, MdArrowBack, MdPlayArrow, MdCheckCircle, MdCancel, MdSave, MdClose, MdUploadFile,
} from 'react-icons/md';
import Navbar from '../components/navbar/Navbar';
import RichTextEditor from '../components/admin/RichTextEditor';
import problemsService from '../services/problems.service';
import { LANGUAGES, langByLabel } from '../lib/languages';

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

// Full driver/helper programs: read stdin, call solve(input), print the result.
// These are the *visible* starter snippets users edit; the reference solution is the same
// shape with solve() implemented. Execution runs these raw (they contain main + I/O).
const HELPER_TEMPLATES = {
    Java: `import java.util.*;
import java.io.*;

public class Main {
    // Implement this — parse 'input' and return the answer.
    static String solve(String input) {
        return "";
    }

    public static void main(String[] args) throws IOException {
        String input = new String(System.in.readAllBytes()).trim();
        System.out.print(solve(input));
    }
}`,
    Python: `import sys

def solve(input):
    # Implement this — parse 'input' and return the answer (as a string).
    return ""

if __name__ == "__main__":
    data = sys.stdin.read().strip()
    sys.stdout.write(str(solve(data)))`,
    'C++': `#include <bits/stdc++.h>
using namespace std;

// Implement this — parse 'input' and return the answer.
string solve(string input) {
    return "";
}

int main() {
    string input((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());
    while (!input.empty() && (input.back() == '\\n' || input.back() == ' ')) input.pop_back();
    cout << solve(input);
}`,
    C: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Implement this — parse 'input' and return the answer. */
char* solve(char* input) {
    return "";
}

int main() {
    static char buf[1 << 20];
    int n = fread(buf, 1, sizeof(buf) - 1, stdin);
    while (n > 0 && (buf[n-1] == '\\n' || buf[n-1] == ' ')) n--;
    buf[n] = '\\0';
    printf("%s", solve(buf));
}`,
    'Node.js': `function solve(input) {
    // Implement this — parse 'input' and return the answer.
    return "";
}

const input = require('fs').readFileSync(0, 'utf8').trim();
process.stdout.write(String(solve(input)));`,
};

const inputClass = 'w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-clay focus:ring-2 focus:ring-clay/20';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted';

const emptyProblem = {
    title: '', difficulty: 'EASY', description: '', constraints: '',
    time_limit: 5000, memory_limit: 256, sheet_name: '',
    testCases: [{ input_data: '', expected_output: '', is_sample: true, weight: 1 }],
};

export default function AdminPage() {
    const [view, setView] = useState('list'); // 'list' | 'edit'
    const [editing, setEditing] = useState(null); // problem being edited (or new)

    return (
        <div className="min-h-screen bg-canvas">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                {view === 'list' ? (
                    <ListView
                        onNew={() => { setEditing({ ...emptyProblem }); setView('edit'); }}
                        onEdit={(p) => { setEditing(p); setView('edit'); }}
                    />
                ) : (
                    <ProblemEditor
                        initial={editing}
                        onBack={() => { setEditing(null); setView('list'); }}
                    />
                )}
            </main>
        </div>
    );
}

// ── List view ─────────────────────────────────────────────────────────────────
function ListView({ onNew, onEdit }) {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sheet, setSheet] = useState('ALL');

    const load = useCallback(() => {
        problemsService.getAll({ size: 1000 })
            .then((res) => setProblems(res.data ?? []))
            .catch(() => toast.error('Could not load problems'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const sheets = ['ALL', ...new Set(problems.map((p) => p.sheet_name).filter(Boolean))];
    const shown = sheet === 'ALL' ? problems : problems.filter((p) => p.sheet_name === sheet);

    const openEdit = async (id) => {
        try {
            const res = await problemsService.getById(id);
            onEdit(res.data ?? res);
        } catch {
            toast.error('Could not open problem');
        }
    };

    const handleDelete = async (p) => {
        if (!window.confirm(`Delete "${p.title}"? This removes its test cases too.`)) return;
        try {
            await problemsService.delete(p.id);
            toast.success('Problem deleted');
            setProblems((prev) => prev.filter((x) => x.id !== p.id));
        } catch {
            toast.error('Delete failed');
        }
    };

    return (
        <>
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="font-display text-4xl font-semibold text-ink">Admin · Problems</h1>
                    <p className="mt-1 text-sm text-ink-muted">Create, edit and organise problems and sheets.</p>
                </div>
                <button onClick={onNew} className="flex items-center gap-1.5 rounded-xl bg-clay px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-clay-strong">
                    <MdAdd className="h-4 w-4" /> New problem
                </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-1.5">
                {sheets.map((s) => (
                    <button key={s} onClick={() => setSheet(s)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            sheet === s ? 'bg-ink text-canvas' : 'border border-line bg-paper text-ink-soft hover:bg-cream'
                        }`}>
                        {s === 'ALL' ? 'All sheets' : s}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-paper">
                {loading ? (
                    <div className="p-10 text-center text-sm text-ink-muted">Loading…</div>
                ) : shown.length === 0 ? (
                    <div className="p-10 text-center text-sm text-ink-muted">No problems yet.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-line bg-cream text-left text-xs uppercase tracking-wider text-ink-muted">
                                <th className="px-5 py-3 font-semibold">Title</th>
                                <th className="px-4 py-3 font-semibold">Sheet</th>
                                <th className="px-4 py-3 font-semibold">Difficulty</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {shown.map((p) => (
                                <tr key={p.id} className="transition hover:bg-cream/60">
                                    <td className="px-5 py-3.5 font-semibold text-ink">{p.title}</td>
                                    <td className="px-4 py-3.5 text-ink-soft">{p.sheet_name || '—'}</td>
                                    <td className="px-4 py-3.5">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            p.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-700'
                                            : p.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-700'
                                            : 'bg-red-100 text-red-700'}`}>{p.difficulty}</span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => openEdit(p.id)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-cream hover:text-ink"><MdEdit className="h-4 w-4" /></button>
                                            <button onClick={() => handleDelete(p)} title="Delete" className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-600"><MdDelete className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}

// ── Editor view ───────────────────────────────────────────────────────────────
function ProblemEditor({ initial, onBack }) {
    const isNew = !initial.id;
    const [form, setForm] = useState(() => ({
        ...emptyProblem,
        ...initial,
        starterCode: initial.starter_code ?? {},
        testCases: (initial.test_cases ?? initial.testCases ?? emptyProblem.testCases).map((t) => ({
            input_data: t.input_data ?? '', expected_output: t.expected_output ?? '',
            is_sample: t.is_sample ?? false, weight: t.weight ?? 1,
        })),
    }));
    const [starterLang, setStarterLang] = useState(LANGUAGES[0]);
    const [refLang, setRefLang] = useState(LANGUAGES[0]);
    const [refCode, setRefCode] = useState(initial.starter_code?.Java || HELPER_TEMPLATES.Java);
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [validated, setValidated] = useState(false);

    const set = (patch) => setForm((f) => ({ ...f, ...patch }));
    const setTC = (i, patch) => { setValidated(false); setForm((f) => ({ ...f, testCases: f.testCases.map((t, j) => j === i ? { ...t, ...patch } : t) })); };
    const addTC = () => setForm((f) => ({ ...f, testCases: [...f.testCases, { input_data: '', expected_output: '', is_sample: false, weight: 1 }] }));

    // Starter snippet shown to the user, edited per language.
    const starterValue = form.starterCode[starterLang.label] ?? HELPER_TEMPLATES[starterLang.label] ?? '';
    const setStarter = (code) => setForm((f) => ({ ...f, starterCode: { ...f.starterCode, [starterLang.label]: code } }));
    const pickStarterLang = (l) => {
        setStarterLang(l);
        setForm((f) => f.starterCode[l.label] != null ? f : { ...f, starterCode: { ...f.starterCode, [l.label]: HELPER_TEMPLATES[l.label] || '' } });
    };

    // Parse uploaded .txt test-case files: each file is "<input>\n===\n<expected>".
    const onUploadTests = async (files) => {
        const parsed = [];
        for (const file of files) {
            const text = await file.text();
            const idx = text.search(/^\s*===\s*$/m);
            if (idx >= 0) {
                const sep = text.match(/^\s*===\s*$/m);
                const input = text.slice(0, idx).replace(/\n$/, '');
                const expected = text.slice(idx + sep[0].length).replace(/^\n/, '');
                parsed.push({ input_data: input, expected_output: expected, is_sample: false, weight: 1 });
            } else {
                parsed.push({ input_data: text, expected_output: '', is_sample: false, weight: 1 });
            }
        }
        if (parsed.length) {
            setValidated(false);
            setForm((f) => ({ ...f, testCases: [...f.testCases, ...parsed] }));
            toast.success(`Added ${parsed.length} test case${parsed.length > 1 ? 's' : ''}`);
        }
    };
    const removeTC = (i) => setForm((f) => ({ ...f, testCases: f.testCases.filter((_, j) => j !== i) }));

    const runTest = async () => {
        if (!refCode.trim()) { toast.error('Write a reference solution first'); return; }
        if (form.testCases.some((t) => !t.expected_output.trim())) { toast.error('Every test case needs an expected output'); return; }
        setTesting(true); setTestResult(null);
        try {
            const result = await problemsService.validate({
                code: refCode, language: refLang.label,
                testCases: form.testCases.map((t) => ({ input_data: t.input_data, expected_output: t.expected_output })),
            });
            setTestResult(result);
            setValidated(result.all_passed);
            result.all_passed ? toast.success('All test cases passed ✓') : toast.error(`${result.passed_test_cases}/${result.total_test_cases} passed`);
        } catch {
            toast.error('Validation failed to run');
        } finally {
            setTesting(false);
        }
    };

    const save = async () => {
        if (!form.title.trim()) { toast.error('Title is required'); return; }
        setSaving(true);
        const payload = {
            title: form.title, difficulty: form.difficulty, description: form.description,
            constraints: form.constraints, time_limit: Number(form.time_limit) || 5000,
            memory_limit: Number(form.memory_limit) || 256, sheet_name: form.sheet_name,
            starter_code: form.starterCode,
            testCases: form.testCases.map((t) => ({
                input_data: t.input_data, expected_output: t.expected_output,
                is_sample: !!t.is_sample, weight: Number(t.weight) || 1,
            })),
        };
        try {
            if (isNew) await problemsService.create(payload);
            else await problemsService.update(initial.id, payload);
            toast.success(isNew ? 'Problem created' : 'Problem updated');
            onBack();
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
                    <MdArrowBack className="h-4 w-4" /> Back to list
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={runTest} disabled={testing}
                        className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink transition hover:bg-cream disabled:opacity-50">
                        <MdPlayArrow className="h-4 w-4 text-clay" /> {testing ? 'Testing…' : 'Run test'}
                    </button>
                    <button onClick={save} disabled={saving || !validated} title={validated ? '' : 'Run a passing test first'}
                        className="flex items-center gap-1.5 rounded-xl bg-clay px-4 py-2 text-sm font-semibold text-white transition hover:bg-clay-strong disabled:cursor-not-allowed disabled:opacity-40">
                        <MdSave className="h-4 w-4" /> {saving ? 'Saving…' : isNew ? 'Create' : 'Save changes'}
                    </button>
                </div>
            </div>

            <h1 className="mb-6 font-display text-3xl font-semibold text-ink">{isNew ? 'New problem' : `Edit · ${initial.title}`}</h1>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* ── Left: metadata + description ── */}
                <div className="space-y-5">
                    <div>
                        <label className={labelClass}>Title</label>
                        <input value={form.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} placeholder="Two Sum" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Difficulty</label>
                            <select value={form.difficulty} onChange={(e) => set({ difficulty: e.target.value })} className={inputClass}>
                                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Sheet</label>
                            <input value={form.sheet_name || ''} onChange={(e) => set({ sheet_name: e.target.value })} className={inputClass} placeholder="Arrays & Strings" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Time limit (ms)</label>
                            <input type="number" value={form.time_limit} onChange={(e) => set({ time_limit: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Memory limit (MB)</label>
                            <input type="number" value={form.memory_limit} onChange={(e) => set({ memory_limit: e.target.value })} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Description</label>
                        <RichTextEditor value={form.description} onChange={(html) => set({ description: html })} />
                    </div>
                    <div>
                        <label className={labelClass}>Constraints</label>
                        <textarea value={form.constraints || ''} onChange={(e) => set({ constraints: e.target.value })} rows={3}
                            className={`${inputClass} font-mono`} placeholder="1 ≤ n ≤ 10^5" />
                    </div>
                </div>

                {/* ── Right: starter snippet + test cases + reference solution ── */}
                <div className="space-y-5">
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className={labelClass + ' mb-0'}>Starter code <span className="text-ink-muted/70">(shown to users)</span></label>
                            <select value={starterLang.label} onChange={(e) => pickStarterLang(langByLabel(e.target.value))}
                                className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-ink outline-none">
                                {LANGUAGES.map((l) => <option key={l.label} value={l.label}>{l.label}</option>)}
                            </select>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-line">
                            <Editor
                                height="200px"
                                language={starterLang.monaco}
                                value={starterValue}
                                onChange={(v) => setStarter(v ?? '')}
                                theme="vs-dark"
                                options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 10 } }}
                            />
                        </div>
                        <p className="mt-1.5 text-xs text-ink-muted">The visible helper that reads input and calls the user's function. Set one per language.</p>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className={labelClass + ' mb-0'}>Test cases</label>
                            <div className="flex items-center gap-3">
                                <label className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink">
                                    <MdUploadFile className="h-3.5 w-3.5" /> Upload .txt
                                    <input type="file" accept=".txt" multiple className="hidden"
                                        onChange={(e) => { onUploadTests([...e.target.files]); e.target.value = ''; }} />
                                </label>
                                <button onClick={addTC} className="flex items-center gap-1 text-xs font-semibold text-clay hover:text-clay-strong"><MdAdd className="h-3.5 w-3.5" /> Add</button>
                            </div>
                        </div>
                        <p className="mb-2 text-xs text-ink-muted">Upload format: one file per case — input, then a line <code className="rounded bg-cream px-1">===</code>, then expected output.</p>
                        <div className="space-y-3">
                            {form.testCases.map((t, i) => (
                                <div key={i} className="rounded-xl border border-line bg-paper p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-ink-muted">Case {i + 1}</span>
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                                                <input type="checkbox" checked={!!t.is_sample} onChange={(e) => setTC(i, { is_sample: e.target.checked })} /> Sample
                                            </label>
                                            <input type="number" value={t.weight} onChange={(e) => setTC(i, { weight: e.target.value })} title="Weight" className="w-14 rounded-md border border-line bg-canvas px-2 py-1 text-xs text-ink" />
                                            {form.testCases.length > 1 && (
                                                <button onClick={() => removeTC(i)} className="text-ink-muted hover:text-red-600"><MdClose className="h-4 w-4" /></button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <textarea value={t.input_data} onChange={(e) => setTC(i, { input_data: e.target.value })} rows={2} placeholder="Input (stdin)" className="rounded-md border border-line bg-canvas p-2 font-mono text-xs text-ink outline-none focus:border-clay" />
                                        <textarea value={t.expected_output} onChange={(e) => setTC(i, { expected_output: e.target.value })} rows={2} placeholder="Expected output" className="rounded-md border border-line bg-canvas p-2 font-mono text-xs text-ink outline-none focus:border-clay" />
                                    </div>
                                    {testResult?.test_results?.[i] && (
                                        <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${testResult.test_results[i].status === 'PASSED' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {testResult.test_results[i].status === 'PASSED' ? <MdCheckCircle className="h-4 w-4" /> : <MdCancel className="h-4 w-4" />}
                                            {testResult.test_results[i].status}
                                            {testResult.test_results[i].status !== 'PASSED' && testResult.test_results[i].actual_output != null && (
                                                <span className="font-normal text-ink-muted">· got: {JSON.stringify(testResult.test_results[i].actual_output)}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className={labelClass + ' mb-0'}>Reference solution <span className="text-ink-muted/70">(must pass to save)</span></label>
                            <select value={refLang.label} onChange={(e) => { const l = langByLabel(e.target.value); setRefLang(l); setRefCode(form.starterCode[l.label] || HELPER_TEMPLATES[l.label]); setValidated(false); }}
                                className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-ink outline-none">
                                {LANGUAGES.map((l) => <option key={l.label} value={l.label}>{l.label}</option>)}
                            </select>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-line">
                            <Editor
                                height="240px"
                                language={refLang.monaco}
                                value={refCode}
                                onChange={(v) => { setRefCode(v ?? ''); setValidated(false); }}
                                theme="vs-dark"
                                options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 10 } }}
                            />
                        </div>
                        {testResult && (
                            <p className={`mt-2 text-sm font-semibold ${testResult.all_passed ? 'text-emerald-600' : 'text-red-600'}`}>
                                {testResult.passed_test_cases}/{testResult.total_test_cases} test cases passed
                                {testResult.all_passed ? ' — ready to save' : ' — fix before saving'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
