import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FaPlus, FaList, FaUpload, FaSignOutAlt, FaSearch } from "react-icons/fa";

const CATEGORIES: Record<string, string[]> = {
    CS: ["DSA", "OOPS", "OS", "DBMS", "CN"],
    Electronics: ["Digital", "Analog", "Signals", "COA", "C_Prog"],
};

export function meta() {
    return [{ title: "Admin Dashboard - Apex" }];
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"list" | "add" | "bulk">("list");
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterCategory, setFilterCategory] = useState("");
    const [filterTopic, setFilterTopic] = useState("");

    // Auth Check
    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) navigate("/admin/login");
        fetchQuestions();
    }, []); // Only on mount initially

    // Re-fetch when filters change (debounced or manual refresh button? manual is safer for now, or effect)
    useEffect(() => {
        if (activeTab === "list") fetchQuestions();
    }, [filterCategory, filterTopic]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const params = new URLSearchParams();
            if (filterCategory) params.append("category", filterCategory);
            if (filterTopic) params.append("topic", filterTopic);

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/questions?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setQuestions(await res.json());
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-black/20 border-r border-white/5 p-6 flex flex-col">
                <h1 className="text-2xl font-bold text-cyan-400 mb-8">Apex Admin</h1>
                <nav className="flex-1 space-y-2">
                    <NavButton active={activeTab === "list"} onClick={() => setActiveTab("list")} icon={<FaList />} label="Question List" />
                    <NavButton active={activeTab === "add"} onClick={() => setActiveTab("add")} icon={<FaPlus />} label="Add Question" />
                    <NavButton active={activeTab === "bulk"} onClick={() => setActiveTab("bulk")} icon={<FaUpload />} label="Bulk Upload" />
                </nav>
                <button onClick={handleLogout} className="flex items-center gap-3 text-white/40 hover:text-red-400 transition-colors p-3 rounded-lg mt-auto">
                    <FaSignOutAlt /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold mb-6">
                    {activeTab === "list" && "Manage Questions"}
                    {activeTab === "add" && "Create Question"}
                    {activeTab === "bulk" && "Bulk Upload"}
                </h2>

                {activeTab === "list" && (
                    <div className="mb-6 flex gap-4">
                        <select className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm outline-none"
                            value={filterCategory} onChange={(e) => {
                                setFilterCategory(e.target.value);
                                setFilterTopic(""); // Reset topic when category changes
                            }}>
                            <option value="">All Categories</option>
                            {Object.keys(CATEGORIES).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <select className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm outline-none"
                            value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}>
                            <option value="">All Subtopics</option>
                            {(filterCategory ? CATEGORIES[filterCategory] : Object.values(CATEGORIES).flat()).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <button onClick={fetchQuestions} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm">
                            Refresh
                        </button>
                    </div>
                )}

                {activeTab === "list" && <QuestionList questions={questions} refresh={fetchQuestions} loading={loading} />}
                {activeTab === "add" && <AddQuestionForm onSuccess={() => { setActiveTab("list"); fetchQuestions(); }} />}
                {activeTab === "bulk" && <BulkUpload onSuccess={() => { setActiveTab("list"); fetchQuestions(); }} />}
            </main>
        </div>
    );
}

// Components

function NavButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? "bg-cyan-500/20 text-cyan-400" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
        >
            {icon} <span className="font-medium">{label}</span>
        </button>
    );
}

function QuestionList({ questions, refresh, loading }: any) {
    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const token = localStorage.getItem("adminToken");
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/questions/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ isActive: !currentStatus })
        });
        refresh();
    };

    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-white/5 text-white/40 text-sm uppercase tracking-wider">
                        <th className="p-4">Title</th>
                        <th className="p-4">Topic</th>
                        <th className="p-4">Difficulty</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading ? <tr><td colSpan={5} className="p-8 text-center text-white/30">Loading...</td></tr> :
                        questions.map((q: any) => (
                            <tr key={q._id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium">{q.title} <div className="text-xs text-white/40 truncate max-w-xs">{q.description}</div></td>
                                <td className="p-4"><span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold">{q.topic}</span></td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${q.difficulty === "EASY" ? "text-green-400 bg-green-500/10" :
                                        q.difficulty === "MEDIUM" ? "text-yellow-400 bg-yellow-500/10" : "text-red-400 bg-red-500/10"
                                        }`}>{q.difficulty}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${q.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${q.isActive ? "bg-green-400" : "bg-red-400"}`} />
                                        {q.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => toggleStatus(q._id, q.isActive)}
                                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${q.isActive ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                                            }`}
                                    >
                                        {q.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

function AddQuestionForm({ onSuccess }: any) {
    const [formData, setFormData] = useState({
        title: "", description: "", topic: "DSA", category: "CS", difficulty: "EASY",
        type: "MULTIPLE_CHOICE", correctAnswer: "", timeLimit: 60, options: ["", "", "", ""]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            options: formData.options.map((text, i) => ({ text, isCorrect: text === formData.correctAnswer }))
        };

        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Question created successfully!");
            onSuccess();
        } else {
            const err = await res.json();
            // Show specific validation error if available, otherwise generic message
            alert(`Failed to create: ${err.error || err.message || "Unknown error"}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl bg-white/5 p-8 rounded-2xl border border-white/10 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-white/50 mb-1">Category</label>
                    <select className="w-full bg-black/20 p-3 rounded-lg border border-white/10 outline-none"
                        value={formData.category} onChange={e => {
                            const newCat = e.target.value;
                            setFormData({
                                ...formData,
                                category: newCat,
                                topic: CATEGORIES[newCat][0] // Reset topic to first in new category
                            });
                        }}>
                        {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-white/50 mb-1">Subcategory (Topic)</label>
                    <select className="w-full bg-black/20 p-3 rounded-lg border border-white/10 outline-none"
                        value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })}>
                        {(CATEGORIES[formData.category] || []).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-white/50 mb-1">Difficulty</label>
                    <select className="w-full bg-black/20 p-3 rounded-lg border border-white/10 outline-none"
                        value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}>
                        {["EASY", "MEDIUM", "HARD"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm text-white/50 mb-1">Title (Question Statement)</label>
                <input type="text" className="w-full bg-black/20 p-3 rounded-lg border border-white/10 outline-none" required
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. What is the time complexity..." />
            </div>

            <div>
                <label className="block text-sm text-white/50 mb-1">Description (Optional)</label>
                <textarea className="w-full bg-black/20 p-3 rounded-lg border border-white/10 outline-none" rows={3}
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Additional context..." />
            </div>

            <div className="space-y-3">
                <label className="block text-sm text-white/50">Options (Select radio for correct answer)</label>
                {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <input type="radio" name="correct" className="accent-cyan-400"
                            checked={opt !== "" && opt === formData.correctAnswer}
                            onChange={() => setFormData({ ...formData, correctAnswer: opt })}
                            disabled={opt === ""}
                        />
                        <input type="text" className="flex-1 bg-black/20 p-3 rounded-lg border border-white/10 outline-none text-sm"
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={e => {
                                const newOpts = [...formData.options];
                                newOpts[idx] = e.target.value;
                                setFormData({ ...formData, options: newOpts });
                            }}
                        />
                    </div>
                ))}
            </div>

            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-bold transition-colors">
                Create Question
            </button>
        </form>
    );
}

function BulkUpload({ onSuccess }: any) {
    const [jsonInput, setJsonInput] = useState("");

    const handleUpload = async () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) throw new Error("Must be an array of questions");

            const token = localStorage.getItem("adminToken");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/questions/bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(parsed)
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Successfully uploaded ${data.count} questions!`);
                onSuccess();
            } else {
                const err = await res.json();
                alert(`Upload failed: ${err.error || err.message || "Unknown error"}`);
            }
        } catch (e: any) {
            alert(`Invalid JSON format: ${e.message}`);
        }
    };

    return (
        <div className="max-w-4xl bg-white/5 p-8 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-4">Paste JSON Data</h3>
            <p className="text-white/40 text-sm mb-4">
                Format: <code className="bg-black/30 p-1 rounded">[{`{"title": "...", "description": "...", "category": "CS", ...}`}]</code>
                <br /><br />
                <strong>Note:</strong> "Topic" here refers to the specific subtopic (e.g. DSA, OOPS, Digital), while "Category" should be "CS" or "Electronics".
            </p>
            <textarea
                className="w-full h-96 bg-black/20 border border-white/10 rounded-xl p-4 font-mono text-sm outline-none mb-4"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[
  {
    "title": "Example Question",
    "description": "Short explanation or context...",
    "category": "CS",
    "topic": "DSA",
    "difficulty": "EASY",
    "correctAnswer": "A",
    "options": [
      { "text": "A", "isCorrect": true },
      { "text": "B", "isCorrect": false }
    ]
  }
]'
            />
            <button onClick={handleUpload} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold">
                Upload Questions
            </button>
        </div>
    );
}
