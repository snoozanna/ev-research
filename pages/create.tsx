import React, { useState, useRef, useEffect, Fragment } from "react";
import Layout from "../components/Layout";
import Router from "next/router";
import { Listbox, Transition } from "@headlessui/react";
import { HiCheck, HiChevronDown } from "react-icons/hi";
import { colourEmojis } from "../components/Post";
import { format } from "date-fns";

type PerformanceOption = {
  id: string;
  name: string;
  dates: { id: string; dateTime: string }[];
  prompts?: { id: string; text: string }[];
};

type Mode = "voice" | "reflection" | "prompts" | "";

const Draft: React.FC = () => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dateError, setDateError] = useState("");
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string>("");
  const [selectedDateId, setSelectedDateId] = useState<string>("");
  const [colourRating, setColourRating] = useState<number>(3);
  const [performances, setPerformances] = useState<PerformanceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("");

  // voice note state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
console.log("promptAnswers", promptAnswers)
  useEffect(() => {
    const fetchPerformances = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/performances");
        const data: PerformanceOption[] = await res.json();
        setPerformances(data);
      } catch (err) {
        console.error("Error fetching performances:", err);
      } finally {
        setIsLoading(false);
      }
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

  const clearAll = () => {
    setMode("");
    setContent("");
    setPromptAnswers({});
    clearRecording();
    setColourRating(3);
  };

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setDateError("");
    // Require performance and date
    if (!selectedPerformanceId) {
      setError("Please select a performance before continuing.");
      setIsSubmitting(false);
      return;
    }
    if (!selectedDateId) {
      setDateError("Please select a performance date before continuing.");
      setIsSubmitting(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("performanceId", selectedPerformanceId);
      formData.append("performanceDateId", selectedDateId);
      formData.append("promptAnswers", JSON.stringify(promptAnswers));
      formData.append("colourRating", String(colourRating));
      if (audioBlob) formData.append("voiceNote", audioBlob, "voice-note.webm");

      const response = await fetch("/api/post", { method: "POST", body: formData });

      if (!response.ok) throw new Error("Error saving form");
      setIsSubmitted(true);
      setIsSubmitting(false);
      setTimeout(() => Router.push("/reflections"), 1000);
    } catch (err) {
      console.error(err);
      setError("Error saving form");
      setIsSubmitting(false);
    }
  };

  const selectedPerformance = performances.find((p) => p.id === selectedPerformanceId);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-2 max-w-xl mx-auto">Record a Reflection</h1>
      <form onSubmit={submitData} className="max-w-xl mx-auto">
        {/* STEP 1: Choose Performance */}
        <div className="space-y-2 mb-2">
        {colourRating ? 
              <div className="text-5xl transition-transform transform opacity-100 flex items-end w-full justify-end">{colourEmojis[colourRating]}</div> : ""}
          <label className="block text-(--darktext) font-medium">Performance</label>
          {isLoading ? (
            <p className="text-gray-500 italic">Loading performances...</p>
          ) : (
            <Listbox
              value={selectedPerformanceId}
              onChange={(val) => {
                if (selectedPerformanceId && val !== selectedPerformanceId) {
                  const confirmChange = confirm("Changing the performance will clear your current reflection. Continue?");
                  if (!confirmChange) return;
              
                  setSelectedPerformanceId(val);
                  setSelectedDateId("");
                  setMode("");
                  setContent("");
                  setPromptAnswers({});
                  clearRecording();
                  setColourRating(3);
                  setError("");
                } else {
                  // First time selecting — just set it
                  setSelectedPerformanceId(val);
                }
              }}
            >
              <div className="relative">
                <Listbox.Button className={`relative w-full cursor-pointer ${selectedPerformanceId ? `bg-(--pink)` : `bg-(--orange)`} text-white font-semibold py-2 pl-3 pr-10 text-left focus:border-(--green) focus:ring focus:ring-(--green) focus:outline-none sm:text-sm`}>
                  <span className="block truncate">
                    {selectedPerformanceId
                      ? performances.find((p) => p.id === selectedPerformanceId)?.name
                      : "Select performance"}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <HiChevronDown className="h-5 w-5 text-white" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white py-1 text-base shadow-lg ring-opacity-5 focus:outline-none sm:text-sm">
                    {performances.map((p) => (
                      <Listbox.Option
                        key={p.id}
                        value={p.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-3 pr-9 bold ${
                            active ? "bg-(--pink) text-white" : "text-(--pink)"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? "font-semibold" : ""}`}>
                              {p.name}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-(--greyblack)">
                                <HiCheck className="h-5 w-5" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          )}
        </div>

        {/* STEP 1.5: Choose Date */}
        {selectedPerformance && selectedPerformance.dates.length > 0 && (
          <div className="space-y-2 mb-6">
            <label className="block text-(--darktext) font-medium">Date</label>
            <Listbox value={selectedDateId} onChange={(val) => setSelectedDateId(val)}>
              <div className="relative">
                <Listbox.Button className={`relative w-full cursor-pointer ${selectedDateId ? `bg-(--pink)` : `bg-(--orange)`} text-white font-semibold py-2 pl-3 pr-10 text-left focus:border-(--green) focus:ring focus:ring-(--green) focus:outline-none sm:text-sm`}>
                  <span className="block truncate">
                    {selectedDateId
                      ? format(
                          new Date(
                            selectedPerformance.dates.find((d) => d.id === selectedDateId)?.dateTime
                          ),
                          "do MMMM yyyy, h.mma"
                        )
                      : "Select date"}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <HiChevronDown className="h-5 w-5 text-white" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white py-1 text-base shadow-lg ring-opacity-5 focus:outline-none sm:text-sm">
                    {selectedPerformance.dates.map((d) => (
                      <Listbox.Option
                        key={d.id}
                        value={d.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                            active ? "bg-(--pink) text-white" : "text-(--pink)"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? "font-semibold" : ""}`}>
                              {format(new Date(d.dateTime), "do MMMM yyyy, h.mma")}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-(--greyblack)">
                                <HiCheck className="h-5 w-5" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
            {dateError && <p className="text-(--red) text-sm mt-1">{dateError}</p>}
          </div>
        )}

        {/* STEP 2: Choose Reflection Type */}
        {selectedDateId && !mode && (
          <div className="space-y-2 mb-4">
            <h2 className="text-lg font-semibold text-(--orange) mb-4">How would you like to reflect?</h2>
            <div className="flex flex-row-reverse items-center sm:flex-row gap-4 justify-around">
              <button
                type="button"
                onClick={() => setMode("voice")}
                className="rounded-full  bg-(--peach) text-(--darktext) py-2 px-4 w-30 h-30 border-3 border-(--pink) shadow-[4px_6px_0px_rgba(0,0,0,0.15)] rotate-[2deg] hover:rotate-0 hover:shadow-[2px_3px_0px_rgba(0,0,0,0.2)] transition-all duration-200"
              >
                Voice note
              </button>
              <div className="flex flex-col gap-6">
                <button
                  type="button"
                  onClick={() => setMode("reflection")}
                  className="flex w-full bg-(--lavender) text-(--darktext) py-4 px-6 border-3 border-(--pink) shadow-[4px_6px_0px_rgba(0,0,0,0.15)] rotate-[2deg] rounded-md hover:rotate-0 hover:shadow-[2px_3px_0px_rgba(0,0,0,0.2)] transition-all duration-200"
                >
                  Written reflection
                </button>
                {selectedPerformance?.prompts.length > 0 && <button
                  type="button"
                  onClick={() => setMode("prompts")}
                  className="flex w-40 bg-(--green) text-(--darktext) border-3 border-(--pink) shadow-[4px_6px_0px_rgba(0,0,0,0.15)] rotate-[-2deg] rounded-md hover:rotate-0 hover:shadow-[2px_3px_0px_rgba(0,0,0,0.2)] transition-all duration-200 py-6 px-4"
                >
                  Answer prompts
                </button>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Reflection Input (only chosen one visible) */}
        {mode && (
          <div className="space-y-4">
            {/* Clear & Start Again */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-(--orange) font-medium underline hover:text-(--green)"
              >
                Clear reflection type
              </button>
            </div>

            {mode === "reflection" && (
              <div className="space-y-2">
                 <h3 className="text-lg font-semibold text-(--orange)">Written Reflection</h3>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="Write here..."
                  className="w-full rounded bg-(--offwhite) text-(--darktext) border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:outline-none p-2"
                />
              </div>
            )}

            {mode === "voice" && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-(--orange)">Voice Note</h3>
               
                {audioUrl ? 
              (
                <div className="flex items-center gap-2">
                  <audio controls src={audioUrl} className="flex-1" />
                  <button
                    type="button"
                    onClick={clearRecording}
                    className=" px-2 py-1 border rounded-md text-xs text-gray-700 hover:bg-gray-100"
                  >
                  Clear
                  </button>
                </div>
              )
                :
              !isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="rounded bg-(--green) text-(--darktext) py-2 px-4 focus:outline-none"
                  >
                    🎙 Start Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="rounded bg-(--red) text-white py-2 px-4"
                  >
                    ⏹ Stop Recording
                  </button>
                )}
              </div>
            )}

            {mode === "prompts" && selectedPerformance?.prompts && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-(--orange)">Reflection Prompts</h3>
                {selectedPerformance.prompts.map((p) => (
                  <div key={p.id} className="space-y-1">
                    <label className="block text-(--darktext)">{p.text}</label>
                    <textarea
                      rows={3}
                      value={promptAnswers[p.id] || ""}
                      onChange={(e) =>
                        setPromptAnswers((prev) => ({
                          ...prev,
                          [p.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded bg-(--offwhite) border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:outline-none p-2"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* STEP 4: Colour Rating */}
            <div className="space-y-2 mb-4">
              <label className="block text-(--orange) font-medium">Reaction</label>
            
              <div className="flex items-center gap-3">
             
{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
  <>
    <button
      key={num}
      type="button"
      onClick={() => setColourRating(num)}
      className={`text-2xl transition-transform transform hover:scale-125 ${
        colourRating === num ? "opacity-100 scale-125" : "opacity-60"
      }`}
      title={`Rating ${num}`}
    >
      {colourEmojis[num]}
    </button>
  </>
))}

              </div>
            </div>

            {error && <div className="text-red-600 font-medium mb-2">{error}</div>}

            <button
            type="submit"
            disabled={
              isSubmitting ||
              isSubmitted ||
              (mode === "reflection" && !content.trim()) ||
              (mode === "voice" && (!audioBlob || isRecording)) ||
              (mode === "prompts" &&
                Object.values(promptAnswers).filter((a) => a.trim() !== "").length === 0)
            }
            className={`w-full rounded py-2 px-4 font-semibold text-white transition-all duration-200
              ${
                isSubmitted
                  ? "bg-(--green)"
                  : isSubmitting
                  ? "bg-(--peach)"
                  : "bg-(--darkpink)"
              }
              disabled:opacity-25 disabled:cursor-not-allowed`}
          >
            {isSubmitted ? "Created" : isSubmitting ? "Creating..." : "Create"}
          </button>
          </div>
        )}
      </form>
 
    </Layout>
  );
};

export default Draft;
