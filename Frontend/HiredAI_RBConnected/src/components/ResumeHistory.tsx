import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ResumeService, type StoredResume } from "../services/resumeService";

function BackArrow() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

interface ResumeHistoryProps {
  onBackClick: () => void;
}

export default function ResumeHistory({ onBackClick }: ResumeHistoryProps) {
  const { user, status } = useAuth();
  const [resumes, setResumes] = useState<StoredResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!user?.email) {
      setResumes([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    ResumeService.getHistory(user.email)
      .then((data) => {
        if (!isMounted) return;
        setResumes(Array.isArray(data) ? data : []);
      })
      .catch((fetchError: unknown) => {
        if (!isMounted) return;
        const message =
          fetchError instanceof Error ? fetchError.message : "Failed to load resume history";
        setError(message);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [status, user?.email]);

  const handleDownload = async (resume: StoredResume) => {
    try {
      const label = resume.TARGETROLE || resume.FULL_NAME || `resume_${resume.ID}`;
      await ResumeService.downloadResumePdf(
        resume.ID,
        `${label.replace(/[^\w-]+/g, "_")}.pdf`,
      );
    } catch (downloadError) {
      const message =
        downloadError instanceof Error ? downloadError.message : "Could not download resume";
      setError(message);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "Unknown date";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Unknown date";
    return parsed.toLocaleString();
  };

  return (
    <div className="w-full h-full bg-white px-6 py-6 overflow-y-auto">
      <button
        onClick={onBackClick}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
      >
        <BackArrow />
      </button>

      <h1 className="text-2xl font-semibold text-[#262626] text-center mt-4 mb-8">
        Resume history
      </h1>

      <div className="max-w-5xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-500">Loading resumes...</p>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#fff1f2] rounded-2xl border border-[#fecdd3]">
            <p className="text-lg font-medium text-[#262626] mb-2">Could not load resume history</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : !user?.email ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#f6f6f4] rounded-2xl">
            <p className="text-lg font-medium text-[#262626] mb-2">Sign in to view resume history</p>
            <p className="text-sm text-gray-500">Your saved resumes are linked to your account email.</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#f6f6f4] rounded-2xl">
            <p className="text-lg font-medium text-[#262626] mb-2">
              No resumes created yet
            </p>
            <p className="text-sm text-gray-500">
              Once you build a resume, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume.ID}
                className="bg-[#f6f6f4] rounded-2xl p-6 hover:shadow-lg transition"
              >
                <div className="aspect-[3/4] bg-white rounded-lg mb-4 flex items-center justify-center border border-neutral-200">
                  <div className="text-center px-4">
                    <p className="text-lg font-semibold text-[#262626]">
                      {resume.TARGETROLE || "Untitled Resume"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {resume.FULL_NAME || resume.EMAIL || user.email}
                    </p>
                  </div>
                </div>

                <p className="text-[15px] font-medium text-[#262626]">
                  {resume.TARGETROLE || "Untitled Resume"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Template: {resume.TEMPLATE_NAME || "basic"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Version: {resume.VERSION ?? 1}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Saved: {formatDate(resume.CREATEDAT)}
                </p>
                <button
                  onClick={() => void handleDownload(resume)}
                  className="mt-4 w-full rounded-lg bg-black text-white py-2 text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  Download Resume
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
