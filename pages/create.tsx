import React, { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import Router from "next/router";

type PerformanceOption = {
  id: string;
  name: string;
  dates: { id: string; dateTime: string }[];
  prompts?: { id: string; text: string }[]; // 👈 Make sure your schema includes this
};

type Mode = "voice" | "reflection" | "prompts" | "";

const Draft: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | "">("");
  const [selectedDateId, setSelectedDateId] = useState<string | "">("");
  const [customName, setCustomName] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customDate, setCustomDate] = useState("");

  const [performances, setPerformances] = useState<PerformanceOption[]>([]);
  const [mode, setMode] = useState<Mode>("");

  // voice note state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const fetchPerformances = async () => {
      const res = await fetch("/api/performance"); 
      const data: PerformanceOption[] = await res.json();
      console.log("data", data)
      setPerformances(data);
    };
    fetchPerformances();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl("");
  };

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("performanceId", selectedPerformanceId);
      formData.append("performanceDateId", selectedDateId);
      formData.append("customName", customName);
      formData.append("customLocation", customLocation);
      formData.append("customDate", customDate);
      formData.append("promptAnswers", JSON.stringify(promptAnswers));
      if (audioBlob) formData.append("voiceNote", audioBlob, "voice-note.webm");

      await fetch("/api/post", { method: "POST", body: formData });
      Router.push("/drafts");
    } catch (err) {
      console.error(err);
    }
  };

  const selectedPerformance = performances.find((p) => p.id === selectedPerformanceId);
  console.log("selectedPerformance", selectedPerformance)

  return (
    <Layout>
      <form onSubmit={submitData}>
        <h1>Make entry</h1>

        {/* STEP 1: Choose performance */}
        <label>Performance</label>
        <select
          value={selectedPerformanceId}
          onChange={(e) => {
            setSelectedPerformanceId(e.target.value);
            setMode(""); // reset mode
          }}
        >
          <option value="">Select performance</option>
          {performances.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          <option value="custom">Custom Performance</option>
        </select>

        {selectedPerformanceId === "custom" && (
          <>
            <input
              type="text"
              placeholder="Performance name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Location"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
            />
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
            />
          </>
        )}

        {selectedPerformance && selectedPerformance.dates.length > 0 && (
          <>
            <label>Date</label>
            <select value={selectedDateId} required onChange={(e) => setSelectedDateId(e.target.value)}>
              <option value="">Select date</option>
              {selectedPerformance.dates.map((d) => (
                <option key={d.id} value={d.id}>
                  {new Date(d.dateTime).toLocaleString()}
                </option>
              ))}
            </select>
          </>
        )}

        {/* STEP 2: Choose reflection type */}
        {selectedPerformanceId && (
          <div>
            <h2>How would you like to reflect?</h2>
            <button type="button" onClick={() => setMode("voice")}>
              🎤 Record a Voice Note
            </button>
            <button type="button" onClick={() => setMode("reflection")}>
              ✍️ Write a Reflection
            </button>
            <button type="button" onClick={() => setMode("prompts")}>
              📝 Answer Prompts
            </button>
          </div>
        )}

        {/* STEP 3: Depending on mode */}
        {mode === "reflection" && (
          <div>
            <label>Write your reflection</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} />
          </div>
        )}

        {mode === "voice" && (
          <div className="voice-section">
            <h3>Voice Note</h3>
            {!isRecording ? (
              <button type="button" onClick={startRecording}>
                🎤 Start Recording
              </button>
            ) : (
              <button type="button" onClick={stopRecording}>
                ⏹ Stop Recording
              </button>
            )}
            {audioUrl && (
              <div>
                <audio controls src={audioUrl} />
                <button type="button" onClick={clearRecording}>
                  🗑️ Clear
                </button>
              </div>
            )}
          </div>
        )}

{mode === "prompts" && selectedPerformance?.prompts && (
  <div>
    <h3>Reflection Prompts</h3>
    {selectedPerformance.prompts.map((p) => (
      <div key={p.id}>
        <label>{p.text}</label>
        <textarea
          rows={3}
          value={promptAnswers[p.id] || ""}
          onChange={(e) =>
            setPromptAnswers((prev) => ({
              ...prev,
              [p.id]: e.target.value,
            }))
          }
        />
      </div>
    ))}
  </div>
)}

        {mode && <input type="submit" disabled={mode === "reflection" && !content} value="Create" />}
      </form>
    </Layout>
  );
};

export default Draft;
