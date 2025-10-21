import React, { useState, useRef, useEffect, Fragment } from "react";
import Layout from "../components/Layout";
import Router from "next/router";
import { Listbox, Transition } from "@headlessui/react";
import { HiCheck, HiChevronDown } from "react-icons/hi";
import { colourClasses } from "../components/Post";
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

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
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

      Router.push("/reflections");
    } catch (err) {
      console.error(err);
      setError("Error saving form");
    }
  };

  const selectedPerformance = performances.find((p) => p.id === selectedPerformanceId);

  return (
    <Layout>
       <h1 className='text-2xl font-bold mb-6'>Record a Reflection</h1>
      <form
        onSubmit={submitData}
        className="max-w-xl mx-auto "
      >
     

        {/* STEP 1: Choose Performance */}
        <div className="space-y-2 mb-2">
          <label className="block text-gray-700 font-medium ">Performance</label>

          {isLoading ? (
            <p className="text-gray-500 italic">Loading performances...</p>
          ) : (
            <Listbox
              value={selectedPerformanceId}
              onChange={(val) => {
                setSelectedPerformanceId(val);
                setMode("");
              }}
            >
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-pointer bg-(--pink) text-white font-semibold py-2 pl-3 pr-10 text-left  focus:border-(--green) focus:ring focus:ring-(--green) focus:outline-none sm:text-sm">
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
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white py-1 text-base shadow-lg  ring-opacity-5 focus:outline-none sm:text-sm">
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
                            <span
                              className={`block truncate ${selected ? "font-semibold" : ""}`}
                            >
                              {p.name}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
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
  <div className="space-y-2 mb-4">
    <label className="block text-gray-700 font-medium">Date</label>

    <Listbox
      value={selectedDateId}
      onChange={(val) => setSelectedDateId(val)}
    >
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-pointer bg-(--pink) text-white font-semibold py-2 pl-3 pr-10 text-left focus:border-(--green) focus:ring focus:ring-(--green) focus:outline-none sm:text-sm">
          <span className="block truncate">
            {selectedDateId
              ? format(
                  new Date(
                    selectedPerformance.dates.find(
                      (d) => d.id === selectedDateId
                    )?.dateTime
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
                    <span
                      className={`block truncate ${
                        selected ? "font-semibold" : ""
                      }`}
                    >
                      {format(new Date(d.dateTime), "do MMMM yyyy, h.mma")}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-black">
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
  </div>
)}



        {/* STEP 2: Choose reflection type */}
        {selectedPerformanceId && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">
              How would you like to reflect?
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setMode("voice")}
                className="flex-1 rounded bg-(--button) text-black py-2 px-4 hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200"
              >
                Voice note
              </button>
              <button
                type="button"
                onClick={() => setMode("reflection")}
                className="flex-1 rounded bg-(--button) text-black py-2 px-4 hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200"
              >
                Written reflection
              </button>
              <button
                type="button"
                onClick={() => setMode("prompts")}
                className="flex-1 rounded bg-(--button) text-black py-2 px-4 hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200"
              >
                Answer prompts
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Reflection Inputs */}
        {mode === "reflection" && (
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium">Write your reflection</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full rounded bg-(--offwhite) text-(--colordark) border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:outline-none p-2"
            />
          </div>
        )}

        {mode === "voice" && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">Voice Note</h3>
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="rounded bg-green-600 text-white py-2 px-4 hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-200"
              >
                🎤 Start Recording
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="rounded bg-red-600 text-white py-2 px-4 hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-200"
              >
                ⏹ Stop Recording
              </button>
            )}
            {audioUrl && (
              <div className="flex items-center gap-2">
                <audio controls src={audioUrl} className="flex-1" />
                <button
                  type="button"
                  onClick={clearRecording}
                  className="rounded bg-gray-200 text-gray-700 py-1 px-2 hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-200"
                >
                  🗑️ Clear
                </button>
              </div>
            )}
          </div>
        )}

        {mode === "prompts" && selectedPerformance?.prompts && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Reflection Prompts</h3>
            {selectedPerformance.prompts.map((p) => (
              <div key={p.id} className="space-y-1">
                <label className="block text-gray-700">{p.text}</label>
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

        {mode && (
          <>
           {/* STEP 4: Colour Rating */}
<div className="space-y-2">
  <label className="block text-gray-700 font-medium">Colour Rating</label>
  <div className="flex items-center gap-3">
    {[1, 2, 3, 4, 5].map((num) => (
      <button
        key={num}
        type="button"
        onClick={() => setColourRating(num)}
        className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${
          colourRating === num ? "border-white" : "border-transparent"
        } ${colourClasses[num]}`}
        title={`Colour ${num}`}
      />
    ))}
  </div>
</div>

            {error && <div className="text-red-600 font-medium mb-2">{error}</div>}
            <input
              type="submit"
              disabled={mode === "reflection" && !content}
              value="Create"
              className="w-full rounded bg-(--button) text-white py-2 px-4 hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </>
        )}
      </form>
    </Layout>
  );
};

export default Draft;
