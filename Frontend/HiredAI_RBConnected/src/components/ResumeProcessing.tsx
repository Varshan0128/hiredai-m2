import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const PROCESSING_STEPS = [
  "Uploading resume...",
  "Extracting skills...",
  "Analyzing job role...",
  "Calculating demand...",
  "Matching similar jobs...",
  "Finalizing insights...",
];

const TOTAL_DURATION_MS = 6000;
const STEP_DURATION_MS = 1000;
const JOB_DISCOVERY_ROUTE = "/jobs";

type ParsedResume = {
  name: string;
  experienceYears: number;
  topSkills: string[];
  education: string;
  domain: string;
  gapAreas: string[];
  resumeText: string;
  targetRole: string;
};

type StoredJobRecord = {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  type?: string;
  salary?: string;
  experience?: string;
  posted?: string;
  description?: string;
  requirements?: string[];
  aiRisk?: number;
  matchPct?: number;
  reason?: string;
  link?: string;
  source?: string;
};

type ResumeAnalysisPayload = {
  resumeText?: string;
  selectedDomain?: string;
  targetRole?: string;
  skills?: string[];
  score?: number;
  job_matches?: StoredJobRecord[];
  jobs?: StoredJobRecord[];
  risk?: {
    score?: number;
    label?: string;
    role?: string;
    explanation?: string;
  };
  skill_gaps?: string[];
  experienceYears?: number;
  educationLevel?: string;
};

type MatchedJob = {
  title: string;
  matchPct: number;
  reason: string;
  type: string;
  location: string;
  aiRisk: number;
  company?: string;
  salary?: string;
  posted?: string;
};

type DemandResult = {
  demandScore: number;
  demandLabel: string;
  hotSkills: string[];
  marketInsight: string;
};

type RiskResult = {
  riskPct: number;
  riskLabel: string;
  verdict: string;
};

type CareerScoreResult = {
  score: number;
  verdict: string;
  skillMatch: number;
};

type FuturePoint = {
  year: number;
  riskPct: number;
  label: string;
};

type SafeRole = {
  title: string;
  fit: string;
  risk: string;
};

type RecruiterView = {
  strengths: string[];
  weaknesses: string[];
  risks: string[];
};

type AnalysisResult = {
  parsed: ParsedResume;
  jobs: MatchedJob[];
  demand: DemandResult;
  risk: RiskResult;
  timeline: FuturePoint[];
  futureSummary: string;
  careerScore: CareerScoreResult;
  simulations: { skill: string; scoreGain: number; impact: string }[];
  safeJobs: SafeRole[];
  hiddenOpportunities: string[];
  recruiterView: RecruiterView;
  learningPath: string[];
  timeToHire: string;
};

function readJsonFromStorage<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function uniqueItems(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeSkill(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

function readStoredJobs(): StoredJobRecord[] {
  const value = readJsonFromStorage<StoredJobRecord[] | { jobs?: StoredJobRecord[] }>("jobData");
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.jobs)) return value.jobs;
  return [];
}

function detectDomain(storedDomain?: string | null, roleTitle?: string | null) {
  const hint = `${storedDomain || ""} ${roleTitle || ""}`.toLowerCase();
  if (hint.includes("design")) return "design";
  if (hint.includes("data")) return "data";
  if (hint.includes("market")) return "marketing";
  if (hint.includes("business") || hint.includes("analyst")) return "business";
  if (hint.includes("software") || hint.includes("developer") || hint.includes("engineer")) return "software";
  return "general";
}

function extractResumeSource() {
  const resumeAnalysis = readJsonFromStorage<ResumeAnalysisPayload>("resumeAnalysis");
  const storedJobs =
    (Array.isArray(resumeAnalysis?.job_matches) && resumeAnalysis.job_matches.length
      ? resumeAnalysis.job_matches
      : Array.isArray(resumeAnalysis?.jobs) && resumeAnalysis.jobs.length
        ? resumeAnalysis.jobs
        : readStoredJobs());

  return {
    resumeAnalysis,
    resumeText: resumeAnalysis?.resumeText || "",
    selectedDomain: resumeAnalysis?.selectedDomain || null,
    storedJobs,
  };
}

function parseResume(resumeAnalysis: ResumeAnalysisPayload | null, resumeText: string, selectedDomain?: string | null): ParsedResume {
  const topSkills = uniqueItems((resumeAnalysis?.skills ?? []).map(normalizeSkill));
  const gapAreas = uniqueItems((resumeAnalysis?.skill_gaps ?? []).map(normalizeSkill));
  const targetRole = (resumeAnalysis?.targetRole || "").trim();
  const domain = detectDomain(selectedDomain, targetRole);
  return {
    name: "Candidate",
    experienceYears: Number(resumeAnalysis?.experienceYears ?? 0),
    topSkills,
    education: resumeAnalysis?.educationLevel || "Not specified",
    domain,
    gapAreas,
    resumeText,
    targetRole,
  };
}

function matchJobs(storedJobs: StoredJobRecord[]): MatchedJob[] {
  return storedJobs
    .map((job) => ({
      title: job.title ?? "Untitled role",
      matchPct: clamp(Math.round(Number(job.matchPct ?? 0)), 0, 100),
      reason: job.reason || job.description || "Relevant match from your extracted resume skills.",
      type: job.type ?? "Not specified",
      location: job.location ?? "Not specified",
      aiRisk: clamp(Math.round(Number(job.aiRisk ?? 0)), 0, 100),
      company: job.company,
      salary: job.salary,
      posted: job.posted,
    }))
    .sort((a, b) => b.matchPct - a.matchPct);
}

function analyzeDemand(parsed: ParsedResume, jobs: MatchedJob[]): DemandResult {
  const averageMatch = jobs.length
    ? jobs.reduce((sum, job) => sum + job.matchPct, 0) / jobs.length
    : 0;
  const demandScore = clamp(Math.round(averageMatch * 0.75 + Math.min(jobs.length, 10) * 4), 0, 100);
  const demandLabel = demandScore >= 75 ? "High" : demandScore >= 45 ? "Moderate" : "Low";
  const hotSkills = parsed.gapAreas.length
    ? parsed.gapAreas
    : uniqueItems(
        jobs.flatMap((job) => job.reason.split(/[,.;]/).map((part) => part.trim())).filter(Boolean),
      ).slice(0, 5);

  return {
    demandScore,
    demandLabel,
    hotSkills,
    marketInsight: jobs.length
      ? `${jobs.length} relevant job matches were found for ${parsed.targetRole || "your resume profile"} using extracted resume skills only.`
      : "No strong live job matches were found from the extracted resume content.",
  };
}

function scoreAiRisk(parsed: ParsedResume, resumeAnalysis: ResumeAnalysisPayload | null): RiskResult {
  const riskPct = clamp(Math.round(Number(resumeAnalysis?.risk?.score ?? 0)), 0, 100);
  const riskLabel = (resumeAnalysis?.risk?.label || (riskPct <= 30 ? "Low" : riskPct <= 55 ? "Medium" : "High")).trim();

  return {
    riskPct,
    riskLabel,
    verdict: resumeAnalysis?.risk?.explanation || (
      parsed.targetRole
        ? `${parsed.targetRole} was identified as your closest role match from the uploaded resume, resulting in a ${riskLabel.toLowerCase()} automation-risk estimate.`
        : `The extracted resume signals indicate a ${riskLabel.toLowerCase()} automation-risk estimate.`
    ),
  };
}

function predictFuture(risk: RiskResult): { timeline: FuturePoint[]; summary: string } {
  const timeline = [2026, 2027, 2028, 2029, 2030].map((year, index) => {
    const riskPct = clamp(risk.riskPct + Math.max(index - 1, 0), 0, 100);
    const label = riskPct <= 30 ? "Low" : riskPct <= 50 ? "Medium" : "High";
    return { year, riskPct, label };
  });

  return {
    timeline,
    summary: `Projection starts from the current ${risk.riskLabel.toLowerCase()} risk estimate based on the extracted role and skills.`,
  };
}

function computeCareerScore(parsed: ParsedResume, jobs: MatchedJob[], demand: DemandResult, risk: RiskResult, resumeAnalysis: ResumeAnalysisPayload | null): CareerScoreResult {
  const skillMatch = jobs.length ? Math.round(jobs.reduce((sum, job) => sum + job.matchPct, 0) / jobs.length) : 0;
  const score = clamp(Math.round(Number(resumeAnalysis?.score ?? 0)), 0, 100);

  return {
    score,
    verdict:
      score >= 75
        ? `Strong profile based on ${parsed.topSkills.length} detected skills, ${parsed.experienceYears || 0} years of experience, and ${parsed.education.toLowerCase() || "education data"}.`
        : score >= 45
          ? `Moderate profile strength based on extracted skills, experience, and education evidence from the resume.`
          : `Current score is limited by the skills, experience, and education explicitly present in the uploaded resume.`,
    skillMatch,
  };
}

function simulateWhatIf(parsed: ParsedResume, careerScore: CareerScoreResult) {
  return parsed.gapAreas
    .slice(0, 3)
    .map((skill, index) => ({
      skill,
      scoreGain: 4 + index * 2,
      impact: `If you add ${skill}, score goes +${4 + index * 2} -> ${clamp(careerScore.score + 4 + index * 2, 0, 100)}.`,
    }));
}

function recommendSafeJobs(jobs: MatchedJob[]): SafeRole[] {
  return jobs
    .filter((job) => job.aiRisk <= 30)
    .slice(0, 3)
    .map((job) => ({
      title: job.title,
      fit: job.reason,
      risk: `${job.aiRisk}% risk`,
    }));
}

function findHiddenOpportunities(jobs: MatchedJob[]) {
  return uniqueItems(jobs.slice(2, 8).map((job) => job.title));
}

function buildRecruiterView(parsed: ParsedResume, demand: DemandResult, jobs: MatchedJob[], risk: RiskResult): RecruiterView {
  const strengths = [
    parsed.topSkills.length ? `${parsed.topSkills.length} verified skills extracted from the resume` : "",
    parsed.experienceYears ? `${parsed.experienceYears}+ years of explicit experience evidence` : "",
    parsed.education && parsed.education !== "Not specified" ? `${parsed.education} education detected` : "",
    jobs.length ? `${jobs.length} relevant live job matches found` : "",
  ].filter(Boolean);

  const weaknesses = [
    ...parsed.gapAreas.slice(0, 3).map((gap) => `Missing target-role skill: ${gap}`),
    !parsed.experienceYears ? "No explicit years-of-experience signal detected in the resume" : "",
    parsed.education === "Not specified" ? "Education signal was not clearly detected in the resume" : "",
  ].filter(Boolean);

  const risks = [
    risk.verdict,
    !jobs.length ? "No strong live job matches were returned for the extracted resume profile" : "",
  ].filter(Boolean);

  return {
    strengths,
    weaknesses,
    risks,
  };
}

function buildLearningPath(parsed: ParsedResume) {
  const path = [
    parsed.targetRole ? `Prioritize skills expected for ${parsed.targetRole}.` : "",
    ...parsed.gapAreas.slice(0, 3).map((gap) => `Build evidence for missing skill: ${gap}.`),
    parsed.topSkills.length ? `Highlight project outcomes that prove ${parsed.topSkills.slice(0, 2).join(" and ")}.` : "",
    !parsed.experienceYears ? "Add clearer experience duration signals if they exist in your background." : "",
  ].filter(Boolean);

  return path.slice(0, 5);
}

function estimateTimeToHire(score: number, demandScore: number, jobCount: number) {
  if (!jobCount) return "Unknown";
  const fastTrack = score >= 80 && demandScore >= 70;
  return fastTrack ? "4-8 weeks" : score >= 60 ? "8-16 weeks" : "12-20 weeks";
}

function runRoleRadarAnalysis(): AnalysisResult {
  const { resumeAnalysis, resumeText, selectedDomain, storedJobs } = extractResumeSource();
  const parsed = parseResume(resumeAnalysis, resumeText, selectedDomain);
  const jobs = matchJobs(storedJobs);
  const demand = analyzeDemand(parsed, jobs);
  const risk = scoreAiRisk(parsed, resumeAnalysis);
  const future = predictFuture(risk);
  const careerScore = computeCareerScore(parsed, jobs, demand, risk, resumeAnalysis);
  const simulations = simulateWhatIf(parsed, careerScore);
  const safeJobs = recommendSafeJobs(jobs);
  const hiddenOpportunities = findHiddenOpportunities(jobs);
  const recruiterView = buildRecruiterView(parsed, demand, jobs, risk);
  const learningPath = buildLearningPath(parsed);
  const timeToHire = estimateTimeToHire(careerScore.score, demand.demandScore, jobs.length);

  return {
    parsed,
    jobs,
    demand,
    risk,
    timeline: future.timeline,
    futureSummary: future.summary,
    careerScore,
    simulations,
    safeJobs,
    hiddenOpportunities,
    recruiterView,
    learningPath,
    timeToHire,
  };
}

export default function ResumeProcessing() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const completedSteps = useMemo(
    () => PROCESSING_STEPS.map((_, index) => index < currentStep),
    [currentStep],
  );

  useEffect(() => {
    const stepInterval = window.setInterval(() => {
      setCurrentStep((value) =>
        value < PROCESSING_STEPS.length - 1 ? value + 1 : value,
      );
    }, STEP_DURATION_MS);

    const progressInterval = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          return 100;
        }

        return Math.min(value + 100 / (TOTAL_DURATION_MS / 100), 100);
      });
    }, 100);

    const timeout = window.setTimeout(() => {
      setIsComplete(true);
    }, TOTAL_DURATION_MS);

    return () => {
      window.clearInterval(stepInterval);
      window.clearInterval(progressInterval);
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!isComplete || analysis) {
      return;
    }

    setAnalysis(runRoleRadarAnalysis());
  }, [analysis, isComplete]);

  const topMatches = analysis?.jobs.slice(0, 2) ?? [];
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
        <div className="w-full max-w-2xl">
          <div className="text-center">
            <h1 className="font-['Poppins:Bold',sans-serif] text-3xl text-neutral-800">
              Analyzing your resume...
            </h1>
            <p className="mt-2 font-['Poppins:Regular',sans-serif] text-neutral-600">
              Our AI is preparing your insights
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <motion.div
              className="h-14 w-14 rounded-full border-4 border-neutral-200 border-t-black"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between text-sm font-['Poppins:Medium',sans-serif] text-neutral-700">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="h-full bg-black"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-neutral-200 p-5">
            <AnimatePresence mode="wait">
              <motion.p
                key={PROCESSING_STEPS[currentStep]}
                className="text-center font-['Poppins:Medium',sans-serif] text-neutral-800"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {PROCESSING_STEPS[currentStep]}
              </motion.p>
            </AnimatePresence>

            <div className="mt-6 space-y-3">
              {PROCESSING_STEPS.map((step, index) => {
                const isActive = index === currentStep;
                const isStepComplete = completedSteps[index];

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-3 text-sm transition-colors ${
                      isActive
                        ? "text-black"
                        : isStepComplete
                          ? "text-neutral-700"
                          : "text-neutral-400"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                        isStepComplete || isActive
                          ? "border-black bg-black text-white"
                          : "border-neutral-300 bg-white text-neutral-400"
                      }`}
                    >
                      {isStepComplete ? "✓" : index + 1}
                    </div>
                    <span
                      className={`font-['Poppins:Regular',sans-serif] ${
                        isActive ? "font-semibold" : ""
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {isComplete && analysis ? (
              <motion.div
                className="mt-8 space-y-6 text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <div className="rounded-2xl border border-neutral-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black bg-black text-white">
                      ✓
                    </div>
                    <div>
                      <p className="font-['Poppins:Bold',sans-serif] text-lg text-neutral-900">
                        Analysis Complete
                      </p>
                      <p className="font-['Poppins:Regular',sans-serif] text-sm text-neutral-600">
                        Your resume insights are ready for review.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard label="Career Score" value={`${analysis.careerScore.score} / 100`} detail={analysis.careerScore.verdict} />
                  <MetricCard label="AI Risk" value={`${analysis.risk.riskPct}% · ${analysis.risk.riskLabel}`} detail={analysis.risk.verdict} />
                  <MetricCard label="Market Demand" value={`${analysis.demand.demandScore} / 100`} detail={`${analysis.demand.demandLabel} demand`} />
                  <MetricCard label="Time to Hire" value={analysis.timeToHire} detail="Estimated based on fit and demand" />
                </div>

                <div className="space-y-3">
                  <p className="font-['Poppins:Bold',sans-serif] text-lg text-neutral-900">
                    Similar job matches
                  </p>
                  {topMatches.map((job) => (
                    <div key={job.title} className="rounded-2xl border border-neutral-200 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-['Poppins:Bold',sans-serif] text-lg text-neutral-900">
                            {job.title}
                          </p>
                          {job.company ? (
                            <p className="mt-1 font-['Poppins:Regular',sans-serif] text-sm text-neutral-500">
                              {job.company}
                            </p>
                          ) : null}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
                            <span>{job.location}</span>
                            <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-['Poppins:Medium',sans-serif] text-neutral-700">
                              {job.type}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full border border-black px-3 py-1 text-xs font-['Poppins:Bold',sans-serif] text-neutral-900">
                          {job.matchPct}% match
                        </span>
                      </div>
                      <p className="mt-3 font-['Poppins:Regular',sans-serif] text-sm text-neutral-700">
                        {job.reason}
                      </p>
                      <p className="mt-2 font-['Poppins:Medium',sans-serif] text-sm text-neutral-600">
                        Role risk: {job.aiRisk}%
                      </p>
                      {job.salary || job.posted ? (
                        <p className="mt-1 font-['Poppins:Regular',sans-serif] text-xs text-neutral-500">
                          {[job.salary, job.posted].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-neutral-200 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="font-['Poppins:Bold',sans-serif] text-lg text-neutral-900">
                        AI Risk Prediction
                      </p>
                      <p className="mt-1 font-['Poppins:Bold',sans-serif] text-2xl text-neutral-900">
                        {analysis.risk.riskPct}% · {analysis.risk.riskLabel}
                      </p>
                    </div>
                    <p className="font-['Poppins:Regular',sans-serif] text-sm text-neutral-600">
                      {analysis.risk.verdict}
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl border border-neutral-200 p-4">
                    <div className="mb-3 flex items-center justify-between text-xs text-neutral-500">
                      <span>AI automation exposure by year</span>
                      <span>Risk % histogram</span>
                    </div>
                    <div className="grid grid-cols-[36px_1fr] gap-3">
                      <div className="flex h-48 flex-col justify-between text-xs text-neutral-400">
                        {[100, 75, 50, 25, 0].map((tick) => (
                          <span key={tick}>{tick}</span>
                        ))}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex flex-col justify-between">
                          {[0, 1, 2, 3, 4].map((line) => (
                            <div key={line} className="border-t border-dashed border-neutral-200" />
                          ))}
                        </div>
                        <div className="relative flex h-48 items-end justify-between gap-3">
                          {analysis.timeline.map((point) => (
                            <div key={point.year} className="flex flex-1 flex-col items-center gap-2">
                              <div className="flex h-full w-full items-end justify-center px-1">
                                <motion.div
                                  className="w-full max-w-[72px] rounded-t-xl bg-black"
                                  initial={{ height: 0 }}
                                  animate={{ height: `${point.riskPct}%` }}
                                  transition={{ duration: 0.4, ease: "easeOut" }}
                                />
                              </div>
                              <p className="font-['Poppins:Regular',sans-serif] text-xs text-neutral-500">
                                {point.year}
                              </p>
                              <p className="font-['Poppins:Medium',sans-serif] text-xs text-neutral-700">
                                {point.riskPct}% · {point.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 font-['Poppins:Regular',sans-serif] text-sm text-neutral-600">
                    {analysis.futureSummary}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 p-4">
                  <button
                    type="button"
                    onClick={() => setIsExpanded((value) => !value)}
                    className="flex w-full items-center justify-between font-['Poppins:Bold',sans-serif] text-neutral-900"
                  >
                    <span>{isExpanded ? "Show Less ▴" : "Read More ▾"}</span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.div
                        className="mt-5 space-y-5"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <div className="space-y-3">
                          <p className="font-['Poppins:Bold',sans-serif] text-base text-neutral-900">
                            All job matches
                          </p>
                          {analysis.jobs.map((job) => (
                            <div key={`${job.title}-expanded`} className="rounded-2xl border border-neutral-200 p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-['Poppins:Bold',sans-serif] text-base text-neutral-900">
                                    {job.title}
                                  </p>
                                  <p className="mt-1 font-['Poppins:Regular',sans-serif] text-sm text-neutral-600">
                                    {job.location} · {job.type}
                                  </p>
                                </div>
                                <span className="rounded-full border border-black px-3 py-1 text-xs font-['Poppins:Bold',sans-serif] text-neutral-900">
                                  {job.matchPct}% match
                                </span>
                              </div>
                              <p className="mt-2 font-['Poppins:Regular',sans-serif] text-sm text-neutral-700">
                                {job.reason}
                              </p>
                            </div>
                          ))}
                        </div>

                        <TagSection title="Skills detected" items={analysis.parsed.topSkills} />
                        <TagSection title="Skill gaps" items={analysis.parsed.gapAreas} accent="border-amber-300 bg-amber-50 text-amber-700" />
                        <TagSection title="Safe AI-resilient roles" items={analysis.safeJobs.map((job) => `${job.title} · ${job.risk}`)} />

                        <div>
                          <p className="font-['Poppins:Bold',sans-serif] text-base text-neutral-900">
                            What-if simulations
                          </p>
                          <div className="mt-3 space-y-2">
                            {analysis.simulations.map((simulation) => (
                              <div key={simulation.skill} className="rounded-2xl border border-neutral-200 p-4 font-['Poppins:Regular',sans-serif] text-sm text-neutral-700">
                                {simulation.impact}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="font-['Poppins:Bold',sans-serif] text-base text-neutral-900">
                            Hidden opportunities
                          </p>
                          <div className="mt-3 space-y-2">
                            {analysis.hiddenOpportunities.map((opportunity) => (
                              <div key={opportunity} className="rounded-2xl border border-neutral-200 p-4 font-['Poppins:Regular',sans-serif] text-sm text-neutral-700">
                                • {opportunity}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="font-['Poppins:Bold',sans-serif] text-base text-neutral-900">
                            Recruiter view
                          </p>
                          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                            <ColumnList title="Strengths" items={analysis.recruiterView.strengths} />
                            <ColumnList title="Weaknesses" items={analysis.recruiterView.weaknesses} />
                            <ColumnList title="Risks" items={analysis.recruiterView.risks} />
                          </div>
                        </div>

                        <div>
                          <p className="font-['Poppins:Bold',sans-serif] text-base text-neutral-900">
                            5-step learning path
                          </p>
                          <div className="mt-3 space-y-2">
                            {analysis.learningPath.map((step, index) => (
                              <div key={step} className="rounded-2xl border border-neutral-200 p-4">
                                <p className="font-['Poppins:Medium',sans-serif] text-sm text-neutral-900">
                                  {index + 1}. {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(JOB_DISCOVERY_ROUTE)}
                  className="w-full rounded-2xl border border-black bg-black px-6 py-4 font-['Poppins:Bold',sans-serif] text-white transition-transform hover:scale-[1.01]"
                >
                  Continue to Job Discovery →
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <p className="font-['Poppins:Regular',sans-serif] text-sm text-neutral-500">
        {label}
      </p>
      <p className="mt-2 font-['Poppins:Bold',sans-serif] text-xl text-neutral-900">
        {value}
      </p>
      <p className="mt-2 font-['Poppins:Regular',sans-serif] text-xs text-neutral-600">
        {detail}
      </p>
    </div>
  );
}

function TagSection({
  title,
  items,
  accent = "border-neutral-200 bg-neutral-50 text-neutral-700",
}: {
  title: string;
  items: string[];
  accent?: string;
}) {
  return (
    <div>
      <p className="font-['Poppins:Bold',sans-serif] text-base text-neutral-900">
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border px-3 py-1 text-xs font-['Poppins:Medium',sans-serif] ${accent}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ColumnList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <p className="font-['Poppins:Bold',sans-serif] text-sm text-neutral-900">
        {title}
      </p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <p key={item} className="font-['Poppins:Regular',sans-serif] text-sm text-neutral-700">
            • {item}
          </p>
        ))}
      </div>
    </div>
  );
}
