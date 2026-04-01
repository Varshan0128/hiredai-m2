import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageBackButton from "../../../components/PageBackButton";

const ATS_BASE_URL = (import.meta.env.VITE_ATS_API_URL || "http://localhost:5000").replace(/\/$/, "");
const GRAMMAR_BASE_URL = (import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000").replace(/\/$/, "");

interface AnalysisProps {
  jobId: string | number;
  jobTitle: string;
  resumeText?: string;
  onBack: () => void;
  onGoToDashboard?: () => void;
  onKeywordClick?: (keyword: string) => void;
  onDownload?: () => void;
  showDownloadButton?: boolean;
  score?: number;
  onScoreChange?: (score: number) => void;
}

const apiFetch = async (base: string, path: string, options: RequestInit = {}) => {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { Accept: "application/json", ...(options.headers || {}) },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.detail || `API ${path} failed: ${res.status}`);
  }
  return res.json();
};

const API = {
  health: () => apiFetch(ATS_BASE_URL, "/api/health"),
  getJob: (id: string | number) => apiFetch(ATS_BASE_URL, `/api/jobs/${id}`),
  getKeywords: () => apiFetch(ATS_BASE_URL, "/api/keywords"),
  scoreText: (text: string, options: { jobId?: string | number; jobDescription?: string }) => {
    const payload = {
      resume_text: text,
      ...(options.jobId ? { job_id: options.jobId } : {}),
      ...(options.jobDescription ? { job_description: options.jobDescription } : {}),
    };
    console.groupCollapsed("[ATS] POST /api/score/text payload");
    console.log("meta", {
      resumeTextLength: text.length,
      hasJobId: Boolean(options.jobId),
      hasJobDescription: Boolean(options.jobDescription),
    });
    console.log("payload", payload);
    console.log("resume_text", payload.resume_text);
    console.groupEnd();
    return apiFetch(ATS_BASE_URL, "/api/score/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  analyzeText: (text: string) =>
    apiFetch(GRAMMAR_BASE_URL, "/api/analyze/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }),
};

const asPercent = (value: unknown) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(numeric <= 1 ? numeric * 100 : numeric, 100));
};

const titleCase = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeResult = (data: any, fallbackTitle: string, selectedJob: any) => {
  const breakdown = data?.scoring_breakdown ?? {};
  const confidenceScore = asPercent(breakdown?.confidence?.score ?? breakdown?.confidence);
  const categoryScores = Object.entries(data?.category_scores ?? {}).map(([label, value]) => ({
    label: titleCase(label),
    value: asPercent(value),
  }));
  const sectionAnalysis = Object.entries(breakdown?.section_analysis ?? {}).map(([label, details]) => ({
    label: titleCase(label),
    present: Boolean((details as any)?.present),
    quality: asPercent((details as any)?.quality),
    textLength: Number((details as any)?.text_length ?? 0),
  }));

  return {
    score: asPercent(data?.overall_score ?? data?.score ?? 0),
    jobTitle: data?.job_info?.title ?? selectedJob?.["Job Title"] ?? fallbackTitle,
    jobDesc: selectedJob?.Description
      ? [selectedJob.Description, selectedJob?.["IT Skills"], selectedJob?.["Soft Skills"]].filter(Boolean)
      : [],
    skillGaps: data?.skills_gap ?? [],
    matchedSkills: breakdown?.matched_skills ?? [],
    requiredSkills: breakdown?.required_skills ?? [],
    strengths: breakdown?.positive_factors ?? [],
    weaknesses: data?.recommendations ?? [],
    categoryScores,
    sectionAnalysis,
    confidence: confidenceScore,
    confidenceSummary: breakdown?.confidence?.summary || "",
    semanticScore: asPercent(data?.bert_semantic_score),
    visualQualityScore: asPercent(data?.visual_quality_score),
    language: data?.language || "Detected",
    languageConfidence: asPercent(breakdown?.language_confidence),
    jobMatchScore: asPercent(data?.job_match_score),
    jobFitDetails: breakdown?.job_fit_details ?? {},
    scoreFactors: [
      `Job Match: ${asPercent(data?.job_match_score).toFixed(0)}%`,
      `Semantic Match: ${asPercent(data?.bert_semantic_score).toFixed(0)}%`,
      `Visual Quality: ${asPercent(data?.visual_quality_score).toFixed(0)}%`,
      `Confidence: ${confidenceScore.toFixed(0)}%`,
      `Language: ${data?.language || "Detected"}`,
    ],
    analysisId: data?.analysis_id,
    timestamp: data?.timestamp,
  };
};

const Card = ({ children, style = {} }: any) => (
  <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, ...style }}>{children}</div>
);

const SectionTitle = ({ title, endpoint }: { title: string; endpoint?: string }) => (
  <p style={{ margin: "0 0 10px 0", fontWeight: 600 }}>
    {title}
    {endpoint ? <span style={{ color: "#6b7280", fontWeight: 400, marginLeft: 8, fontSize: 12 }}>{endpoint}</span> : null}
  </p>
);

const CircularProgress = ({ score }: { score: number }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const safe = Math.min(Math.max(score || 0, 0), 100);
  const offset = circ - (safe / 100) * circ;
  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="#22c55e" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 24 }}>{safe.toFixed(0)}</div>
    </div>
  );
};

const LoadingSpinner = ({ size = 42, color = "#111827" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" aria-hidden="true">
    <circle cx="25" cy="25" r="20" fill="none" stroke="#e5e7eb" strokeWidth="5" />
    <path d="M25 5a20 20 0 0 1 20 20" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="0.9s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

const AnalysisBuffer = ({
  title,
  detail = "Preparing results...",
}: {
  title: string;
  detail?: string;
}) => (
  <div
    style={{
      minHeight: 140,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      textAlign: "center",
      color: "#374151",
    }}
  >
    <LoadingSpinner />
    <div>
      <p style={{ margin: 0, fontWeight: 600 }}>{title}</p>
      <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: 14 }}>{detail}</p>
    </div>
  </div>
);

const EmptyAnalysisState = ({ message }: { message: string }) => (
  <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>{message}</p>
);

const Pill = ({ children, tone = "#e5e7eb", text = "#111827" }: { children: any; tone?: string; text?: string }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      borderRadius: 999,
      padding: "6px 10px",
      background: tone,
      color: text,
      fontSize: 13,
      lineHeight: 1.2,
    }}
  >
    {children}
  </span>
);

const ProgressRow = ({ label, value, tone = "#2563eb" }: { label: string; value: number; tone?: string }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
      <span>{label}</span>
      <strong>{value.toFixed(0)}%</strong>
    </div>
    <div style={{ height: 8, borderRadius: 999, background: "#e5e7eb", overflow: "hidden" }}>
      <div style={{ width: `${Math.max(0, Math.min(value, 100))}%`, height: "100%", borderRadius: 999, background: tone }} />
    </div>
  </div>
);

function ATSAnalysisCore({
  jobId,
  jobTitle,
  resumeText,
  onBack,
  onGoToDashboard,
  onKeywordClick,
  onDownload,
  showDownloadButton,
  score,
  onScoreChange,
}: AnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" } | null>(null);

  const [health, setHealth] = useState<any>(null);
  const [selectedJobId, setSelectedJobId] = useState(jobId ? String(jobId) : "");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [grammarResult, setGrammarResult] = useState<any>(null);
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [autoAnalysisTriggered, setAutoAnalysisTriggered] = useState(false);
  const [analysisAttempted, setAnalysisAttempted] = useState(false);

  const [addedKeywords, setAddedKeywords] = useState<string[]>([]);
  const [cert, setCert] = useState("");
  const [certs, setCerts] = useState<string[]>([]);

  const notify = useCallback((msg: string, type: "ok" | "error" = "ok") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const resolveEffectiveResumeText = useCallback(() => {
    const propText = (resumeText || "").trim();
    const effectiveText = propText;
    const source = "resumeText-prop";

    console.groupCollapsed("[ATS] resolved resume text before scoring");
    console.log("meta", {
      source,
      propLength: propText.length,
      effectiveLength: effectiveText.length,
      jobId,
      selectedJobId,
      jobTitle,
    });
    console.log("propText", propText);
    console.log("effectiveText", effectiveText);
    console.groupEnd();

    return { effectiveText, source };
  }, [resumeText, jobId, selectedJobId, jobTitle]);

  const resolveGrammarText = useCallback((textOverride?: unknown) => {
    if (typeof textOverride === "string") {
      return textOverride.trim();
    }

    if (typeof resumeText === "string") {
      return resumeText.trim();
    }

    return "";
  }, [resumeText]);

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      const [h, k] = await Promise.allSettled([API.health(), API.getKeywords()]);
      if (h.status === "fulfilled") setHealth(h.value);
      if (k.status === "fulfilled") {
        const raw = k.value?.keywords || {};
        const arr = Array.isArray(raw) ? raw : Object.keys(raw);
        setKeywords(arr);
      }
      setLoading(false);
    };
    boot();
  }, []);

  useEffect(() => {
    setSelectedJobId(jobId ? String(jobId) : "");
  }, [jobId]);

  useEffect(() => {
    setAutoAnalysisTriggered(false);
    setAnalysisAttempted(false);
    setResult(null);
    setGrammarResult(null);
  }, [jobId, resumeText, jobTitle]);

  useEffect(() => {
    const incomingText = (resumeText || "").trim();
    console.groupCollapsed("[ATS] incoming props");
    console.log("meta", {
      jobId,
      jobTitle,
      resumeTextLength: incomingText.length,
    });
    console.log("resumeTextProp", incomingText);
    console.groupEnd();
  }, [jobId, jobTitle, resumeText]);

  useEffect(() => {
    const numericJobId = Number(selectedJobId);
    if (!Number.isFinite(numericJobId) || numericJobId <= 0) return;
    API.getJob(selectedJobId).then((r) => setSelectedJob(r?.job || null)).catch(() => {});
  }, [selectedJobId]);

  const handleGrammar = useCallback(async (textOverride?: unknown, options: { silent?: boolean } = {}) => {
    try {
      const effectiveText = resolveGrammarText(textOverride);
      if (!effectiveText || effectiveText.length < 50) {
        if (!options.silent) {
          notify("Resume content is unavailable for grammar analysis.", "error");
        }
        return;
      }
      setGrammarLoading(true);
      const data = await API.analyzeText(effectiveText);
      setGrammarResult(data);
      if (!options.silent) {
        notify("Grammar analysis completed");
      }
    } catch (e: any) {
      if (!options.silent) {
        notify(e.message || "Grammar service unavailable", "error");
      }
    } finally {
      setGrammarLoading(false);
    }
  }, [notify, resolveGrammarText]);

  const handleScore = useCallback(async () => {
    const { effectiveText, source } = resolveEffectiveResumeText();
    if (!effectiveText || effectiveText.length < 50) {
      return notify("Resume text is empty or too short. Please enter at least 50 characters in the editor.", "error");
    }

    setAnalysisAttempted(true);
    setScoring(true);
    setResult(null);
    setGrammarResult(null);
    try {
      const numericJobId = Number(selectedJobId);
      console.log("[ATS] scoring request context", {
        source,
        selectedJobId,
        numericJobId,
        mode: Number.isFinite(numericJobId) && numericJobId > 0 ? "job_id" : "job_description",
        jobTitle,
      });
      const raw = Number.isFinite(numericJobId) && numericJobId > 0
        ? await API.scoreText(effectiveText, { jobId: numericJobId })
        : await API.scoreText(effectiveText, { jobDescription: jobTitle });
      const normalized = normalizeResult(raw, jobTitle, selectedJob);
      setResult(normalized);
      onScoreChange?.(normalized.score);
      await handleGrammar(effectiveText, { silent: true });
      notify("Analysis complete");
    } catch (e: any) {
      notify(e.message || "Scoring failed", "error");
    } finally {
      setScoring(false);
    }
  }, [selectedJobId, selectedJob, jobTitle, notify, onScoreChange, resolveEffectiveResumeText, handleGrammar]);

  const hasAnalyzableResume = Boolean((resumeText || "").trim()) && (resumeText || "").trim().length >= 50;
  const showPendingAnalysis = hasAnalyzableResume && (!analysisAttempted || scoring) && !result;

  useEffect(() => {
    if (autoAnalysisTriggered) return;
    const effectiveText = (resumeText || "").trim();
    if (!effectiveText || effectiveText.length < 50) return;
    setAutoAnalysisTriggered(true);
    void handleScore();
  }, [autoAnalysisTriggered, handleScore, resumeText]);

  const addKeyword = (kw: string, options?: { openEditor?: boolean }) => {
    if (addedKeywords.includes(kw)) return;
    setAddedKeywords((p) => [...p, kw]);
    if (options?.openEditor) {
      onKeywordClick?.(kw);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PageBackButton onClick={onBack} className="px-0 py-0 hover:bg-transparent" />
            <h1 style={{ margin: 0 }}>ATS Analysis Results</h1>
          </div>
          <p style={{ margin: "4px 0 0 30px", color: "#6b7280" }}>{result?.jobTitle || selectedJob?.["Job Title"] || jobTitle}</p>
        </div>
      </div>

      <>
          <Card style={{ marginBottom: 24 }}>
            <SectionTitle title="Resume Analysis Input" />
            <p style={{ margin: "0 0 8px 0", color: "#374151" }}>
              <strong>Target Role:</strong> {jobTitle || "Not selected"}
            </p>
            <p style={{ margin: "0 0 12px 0", color: "#374151" }}>
              <strong>Resume Source:</strong> Resume created in Template Editor
            </p>
            <p style={{ margin: "0 0 12px 0", color: "#374151" }}>
              <strong>ATS API Status:</strong> {loading ? "Checking services..." : health?.status || "Unavailable"}
            </p>
            <p style={{ margin: "0", color: "#6b7280", fontSize: 13 }}>
              Job selection, file upload, and manual text input are disabled.
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={handleScore} disabled={scoring || loading} style={{ padding: "10px 20px" }}>{scoring ? "Analyzing..." : "Re-analyze Resume"}</button>
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Card>
                <SectionTitle title="Target job description or keywords" endpoint="GET /api/jobs/:id" />
                <ul>{(selectedJob ? [selectedJob?.Description, selectedJob?.["IT Skills"], selectedJob?.["Soft Skills"]] : result?.jobDesc || []).filter(Boolean).map((x: any, i: number) => <li key={i}>{String(x)}</li>)}</ul>
              </Card>
              <Card>
                <SectionTitle title="Matched skills and gaps" endpoint="POST /api/score" />
                {showPendingAnalysis ? (
                  <AnalysisBuffer title="Resolving skill match" detail="Separating matched requirements from missing ones." />
                ) : result ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>Matched skills</p>
                      {result?.matchedSkills?.length ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {result.matchedSkills.map((skill: string) => <Pill key={skill} tone="#dcfce7" text="#166534">{skill}</Pill>)}
                        </div>
                      ) : (
                        <EmptyAnalysisState message="Matched skills will appear here after analysis." />
                      )}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>Missing or weak signals</p>
                      {result?.skillGaps?.length ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {result.skillGaps.map((skill: string) => (
                            <button
                              key={skill}
                              onClick={() => addKeyword(String(skill), { openEditor: true })}
                              style={{ border: "none", background: "transparent", padding: 0 }}
                            >
                              <Pill tone="#fee2e2" text="#991b1b">{skill}</Pill>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <EmptyAnalysisState message="No major skill gaps were detected for the selected role." />
                      )}
                    </div>
                  </div>
                ) : (
                  <EmptyAnalysisState message="Skill match details will appear here after analysis." />
                )}
              </Card>
              <Card>
                <SectionTitle title="Skill gaps" endpoint="POST /api/score" />
                {showPendingAnalysis ? (
                  <AnalysisBuffer title="Analyzing skill gaps" detail="Matching resume content against the selected role." />
                ) : result?.skillGaps?.length ? (
                  <ul>{(result?.skillGaps || []).map((x: any, i: number) => <li key={i} onClick={() => addKeyword(String(x), { openEditor: true })} style={{ cursor: "pointer" }}>{String(x)}</li>)}</ul>
                ) : (
                  <EmptyAnalysisState message="Skill gaps will appear here after analysis." />
                )}
              </Card>
              <Card>
                <SectionTitle title="Suggested keywords" endpoint="GET /api/keywords" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {keywords.map((kw) => (
                    <button key={kw} onClick={() => addKeyword(kw)} style={{ padding: "6px 10px" }}>{addedKeywords.includes(kw) ? "ok" : "+"} {kw}</button>
                  ))}
                </div>
              </Card>
              <Card>
                <SectionTitle title="Add certification" />
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={cert} onChange={(e) => setCert(e.target.value)} style={{ flex: 1 }} />
                  <button onClick={() => { if (cert.trim()) { setCerts((p) => [...p, cert.trim()]); setCert(""); } }}>Add</button>
                </div>
                <ul>{certs.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </Card>
              <Card style={{ background: "#f0fdf4" }}>
                <SectionTitle title="Strengths" />
                {showPendingAnalysis ? (
                  <AnalysisBuffer title="Reviewing strengths" detail="Finding the strongest matching points in your resume." />
                ) : result?.strengths?.length ? (
                  <ul>{(result?.strengths || []).map((x: any, i: number) => <li key={i}>{String(x)}</li>)}</ul>
                ) : (
                  <EmptyAnalysisState message="Strengths will appear here after analysis." />
                )}
              </Card>
              <Card style={{ background: "#fff1f2" }}>
                <SectionTitle title="Weaknesses" />
                {showPendingAnalysis ? (
                  <AnalysisBuffer title="Checking improvement areas" detail="Compiling weak points and missing signals." />
                ) : result?.weaknesses?.length ? (
                  <ul>{(result?.weaknesses || []).map((x: any, i: number) => <li key={i}>{String(x)}</li>)}</ul>
                ) : (
                  <EmptyAnalysisState message="Recommendations will appear here after analysis." />
                )}
              </Card>
              {(showPendingAnalysis || grammarLoading || grammarResult) && (
                <Card style={{ background: "#eff6ff" }}>
                  <SectionTitle title="Grammar issues" endpoint="POST /api/analyze/*" />
                  {showPendingAnalysis || grammarLoading ? (
                    <AnalysisBuffer title="Checking grammar" detail="Scanning for language issues and writing fixes." />
                  ) : (
                    <>
                      <p>Total issues: {grammarResult?.total_issues ?? 0}</p>
                      <p>{grammarResult?.has_errors ? "Grammar issues found" : "No grammar issues found"}</p>
                      {Array.isArray(grammarResult?.issues) && grammarResult.issues.length > 0 ? (
                        <ul>
                          {grammarResult.issues.slice(0, 5).map((issue: any, index: number) => (
                            <li key={`${issue?.offset ?? index}-${index}`}>
                              {issue?.error ? <strong>{String(issue.error)}</strong> : "Issue"}
                              {issue?.suggestion ? ` -> ${String(issue.suggestion)}` : ""}
                              {issue?.reason ? ` (${String(issue.reason)})` : ""}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  )}
                </Card>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Card>
                <SectionTitle title="ATS score" endpoint="POST /api/score" />
                {showPendingAnalysis ? (
                  <AnalysisBuffer title="Analyzing resume" detail="Scoring ATS match, semantic fit, and resume quality." />
                ) : result ? (
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <CircularProgress score={result.score ?? score ?? 0} />
                    <ul>{(result.scoreFactors || []).map((x: any, i: number) => <li key={i}>{String(x)}</li>)}</ul>
                  </div>
                ) : (
                  <EmptyAnalysisState message="ATS score will appear here after analysis." />
                )}
              </Card>
              <Card>
                <SectionTitle title="Score breakdown" endpoint="POST /api/score" />
                {showPendingAnalysis ? (
                  <AnalysisBuffer title="Breaking down categories" detail="Scoring keyword match, formatting, experience, and more." />
                ) : result?.categoryScores?.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {result.categoryScores.map((item: any, index: number) => (
                      <ProgressRow
                        key={`${item.label}-${index}`}
                        label={item.label}
                        value={item.value}
                        tone={item.value >= 75 ? "#16a34a" : item.value >= 50 ? "#2563eb" : "#dc2626"}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyAnalysisState message="Category-level scoring will appear here after analysis." />
                )}
              </Card>
              <Card>
                <SectionTitle title="Confidence and fit signals" endpoint="POST /api/score" />
                {showPendingAnalysis ? (
                  <AnalysisBuffer title="Estimating confidence" detail="Combining section coverage, job fit, and parser quality." />
                ) : result ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <ProgressRow label="Confidence" value={result.confidence ?? 0} tone="#0f766e" />
                      <ProgressRow label="Job match" value={result.jobMatchScore ?? 0} tone="#1d4ed8" />
                      <ProgressRow label="Semantic match" value={result.semanticScore ?? 0} tone="#7c3aed" />
                      <ProgressRow label="Language confidence" value={result.languageConfidence ?? 0} tone="#ea580c" />
                    </div>
                    {result?.confidenceSummary ? (
                      <p style={{ margin: 0, color: "#475569", fontSize: 14 }}>{result.confidenceSummary}</p>
                    ) : null}
                  </div>
                ) : (
                  <EmptyAnalysisState message="Fit signals will appear here after analysis." />
                )}
              </Card>
              <Card>
                <SectionTitle title="Section coverage" endpoint="POST /api/score" />
                {showPendingAnalysis ? (
                  <AnalysisBuffer title="Reading resume sections" detail="Checking whether core ATS sections are present and usable." />
                ) : result?.sectionAnalysis?.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {result.sectionAnalysis.map((section: any, index: number) => (
                      <div key={`${section.label}-${index}`} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                          <strong>{section.label}</strong>
                          <Pill tone={section.present ? "#dcfce7" : "#fee2e2"} text={section.present ? "#166534" : "#991b1b"}>
                            {section.present ? "Present" : "Missing"}
                          </Pill>
                        </div>
                        <ProgressRow label="Section quality" value={section.quality} tone={section.present ? "#16a34a" : "#dc2626"} />
                        <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: 13 }}>
                          Text length: {section.textLength} characters
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyAnalysisState message="Section coverage details will appear here after analysis." />
                )}
              </Card>
            </div>
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button onClick={onBack}>Back</button>
            {showDownloadButton ? <button onClick={onDownload} disabled={!onDownload}>Download PDF</button> : null}
            {onGoToDashboard ? <button onClick={onGoToDashboard}>Go to Dashboard</button> : null}
          </div>
      </>

      {toast ? (
        <div style={{ position: "fixed", right: 20, bottom: 20, background: toast.type === "error" ? "#fee2e2" : "#dcfce7", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 14px" }}>
          {toast.msg}
        </div>
      ) : null}
    </div>
  );
}

export function ATSAnalysis(props: AnalysisProps) {
  return <ATSAnalysisCore {...props} />;
}

export default function ATSAnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobId, jobTitle, resumeText } = location.state || {};
  const effectiveJobId = jobId ?? 0;

  if (!effectiveJobId && !jobTitle) {
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <h2>No job data found</h2>
        <button onClick={() => navigate("/")}>Go back to Job Selection</button>
      </div>
    );
  }

  return (
    <ATSAnalysis
      jobId={effectiveJobId}
      jobTitle={jobTitle}
      resumeText={resumeText}
      onBack={() => navigate(-1)}
      onGoToDashboard={() => navigate("/dashboard")}
    />
  );
}
