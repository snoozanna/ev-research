import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Router from "next/router";
import Layout from "../../components/Layout";

type Performance = {
  id: string;
  name: string;
  location: string;
  dates: { id: string; dateTime: string }[];
  prompts: { id: string; text: string }[];
};

const AdminPerformances = () => {
  const { data: session, status } = useSession();
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for adding/editing
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDates, setFormDates] = useState<string[]>([]);
  const [formPrompts, setFormPrompts] = useState<string[]>([]);

  useEffect(() => {
    console.log("session", session)
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      // Router.push("/"); // redirect if not admin
      console.log("error")
      return;
    }
    fetchPerformances();
  }, [status]);

  const fetchPerformances = async () => {
    setIsLoading(true);
    const res = await fetch("/api/performances");
    const data = await res.json();
    setPerformances(data);
    setIsLoading(false);
  };

  const resetForm = () => {
    setEditingPerformance(null);
    setFormName("");
    setFormLocation("");
    setFormDates([]);
    setFormPrompts([]);
  };

  const handleAddDate = () => setFormDates([...formDates, ""]);
  const handleAddPrompt = () => setFormPrompts([...formPrompts, ""]);

  const handleSave = async () => {
    const payload = {
      name: formName,
      location: formLocation,
      dates: formDates.filter(Boolean),
      prompts: formPrompts.filter(Boolean),
    };

    const method = editingPerformance ? "PUT" : "POST";
    const url = editingPerformance
      ? `/api/performances/${editingPerformance.id}`
      : "/api/performances";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await fetchPerformances();
      resetForm();
    } else {
      alert("Error saving performance");
    }
  };

  const handleEdit = (p: Performance) => {
    setEditingPerformance(p);
    setFormName(p.name);
    setFormLocation(p.location);
    setFormDates(p.dates.map((d) => new Date(d.dateTime).toISOString().slice(0, 16)));
    setFormPrompts(p.prompts.map((pr) => pr.text));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this performance?")) return;
    await fetch(`/api/performances/${id}`, { method: "DELETE" });
    fetchPerformances();
  };

  if (status === "loading" || isLoading) {
    return <Layout>Loading performances...</Layout>;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin: Manage Performances</h1>

        {/* Form for add/edit */}
        <div className="border p-4 rounded-lg bg-gray-50 space-y-4">
          <h2 className="text-xl font-semibold">
            {editingPerformance ? "Edit Performance" : "Add New Performance"}
          </h2>

          <input
            type="text"
            placeholder="Performance name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full border rounded p-2"
          />

          <input
            type="text"
            placeholder="Location"
            value={formLocation}
            onChange={(e) => setFormLocation(e.target.value)}
            className="w-full border rounded p-2"
          />

          {/* Dates */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Performance Dates</label>
            {formDates.map((d, idx) => (
              <input
                key={idx}
                type="datetime-local"
                value={d}
                onChange={(e) => {
                  const newDates = [...formDates];
                  newDates[idx] = e.target.value;
                  setFormDates(newDates);
                }}
                className="w-full border rounded p-2"
              />
            ))}
            <button
              type="button"
              onClick={handleAddDate}
              className="text-indigo-600 text-sm"
            >
              + Add Date
            </button>
          </div>

          {/* Prompts */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Reflection Prompts</label>
            {formPrompts.map((p, idx) => (
              <input
                key={idx}
                type="text"
                value={p}
                onChange={(e) => {
                  const newPrompts = [...formPrompts];
                  newPrompts[idx] = e.target.value;
                  setFormPrompts(newPrompts);
                }}
                placeholder="Enter prompt"
                className="w-full border rounded p-2"
              />
            ))}
            <button
              type="button"
              onClick={handleAddPrompt}
              className="text-indigo-600 text-sm"
            >
              + Add Prompt
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {editingPerformance ? "Update" : "Create"}
            </button>
            {editingPerformance && (
              <button
                onClick={resetForm}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Existing performances list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Existing Performances</h2>
          {performances.length === 0 ? (
            <p className="text-gray-600">No performances found.</p>
          ) : (
            performances.map((p) => (
              <div key={p.id} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p className="text-gray-600">{p.location}</p>
                <ul className="text-sm text-gray-700 mt-1">
                  {p.dates.map((d) => (
                    <li key={d.id}>
                      {new Date(d.dateTime).toLocaleString()}
                    </li>
                  ))}
                </ul>
                {p.prompts.length > 0 && (
                  <ul className="text-sm text-gray-700 mt-2 list-disc pl-5">
                    {p.prompts.map((pr) => (
                      <li key={pr.id}>{pr.text}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex gap-2">
                  {/* <button
                    onClick={() => handleEdit(p)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button> */}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPerformances;
