import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import PageBackButton from "./PageBackButton";

const acceptedExtensions = [".pdf", ".doc", ".docx"];
const PYTHON_BASE_URL = (
  import.meta.env.VITE_PYTHON_API_URL ||
  "http://localhost:8000"
).replace(/\/$/, "");
const steps = [
  "Uploading Resume",
  "Finding Best Jobs",
  "Preparing Results",
];

function isSupportedFile(file) {
  const lowerName = file.name.toLowerCase();
  return acceptedExtensions.some((extension) => lowerName.endsWith(extension));
}

export default function ResumeUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;

    if (!isSupportedFile(file)) {
      setError("Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    let current = 0;

    try {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      setFileName(file.name);
      setIsProcessing(true);
      setProgress(0);
      setStep(0);
      setError("");

      progressIntervalRef.current = setInterval(() => {
        current += 10;

        if (current > 100) {
          current = 100;
        }

        setProgress(current);

        if (current >= 30) setStep(1);
        if (current >= 70) setStep(2);

        if (current >= 100) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }, 400);

      const formData = new FormData();
      formData.append("file", file);

      const res1 = await fetch(`${PYTHON_BASE_URL}/jobs-from-resume`, {
        method: "POST",
        body: formData,
      });

      if (!res1.ok) {
        const err = await res1.text();
        throw new Error("JOBS ERROR: " + err);
      }

      const data1 = await res1.json();
      const jobs = Array.isArray(data1?.jobs) ? data1.jobs : [];
      console.log("JOBS:", jobs);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setStep(2);
      setProgress(100);

      localStorage.removeItem("jobData");
      localStorage.setItem("jobData", JSON.stringify(jobs));
      localStorage.setItem("resumeUploaded", "true");
      console.log("Stored Data:", localStorage.getItem("jobData"));

      setTimeout(() => {
        navigate("/jobs");
      }, 300);
    } catch (err) {
      console.error("ERROR:", err);
      setError("Unable to process the resume right now.");
      setIsProcessing(false);
      setProgress(0);
      setStep(0);
      setFileName("");
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };

  const handleFileChange = async (file) => {
    await handleUpload(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed left-4 top-4 z-50">
        <PageBackButton fallbackTo="/dashboard" label="Dashboard" variant="floating" />
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl rounded-[24px] border-2 border-neutral-800 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
          {!isProcessing ? (
            <div className="text-center mb-8">
              <h1 className="font-['Poppins:Bold',sans-serif] text-3xl text-neutral-800">
                Upload Your Resume
              </h1>
              <p className="mt-2 font-['Poppins:Regular',sans-serif] text-neutral-600">
                Get AI-powered job matches
              </p>
            </div>
          ) : null}

          <motion.div className="mt-8 flex flex-col items-center justify-center" whileHover={{ scale: isProcessing ? 1 : 1.01 }}>
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                <p className="mb-2 text-lg font-semibold text-neutral-800">
                  {fileName}
                </p>

                <div className="mb-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-black transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-4 flex flex-col items-start space-y-2">
                  {steps.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                        index === step
                          ? "text-black font-semibold animate-pulse drop-shadow-[0_0_6px_rgba(0,0,0,0.4)]"
                          : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          index === step ? "bg-black" : "bg-gray-300"
                        }`}
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Upload a Resume
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(event) => handleFileChange(event.target.files?.[0])}
            />
          </motion.div>

          {error ? (
            <p className="mt-4 text-center font-['Poppins:Regular',sans-serif] text-sm text-red-600">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
