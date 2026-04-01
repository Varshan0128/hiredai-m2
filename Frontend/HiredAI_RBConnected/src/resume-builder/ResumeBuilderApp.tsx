import { useCallback, useEffect, useMemo, useState } from "react";
import { JobRoleSelection } from "../features/resumes/components/JobRoleSelection";
import { TemplateSelection } from "../features/resumes/components/TemplateSelection";
import {
  TemplateEditor,
  createDefaultTemplateEditorFormData,
  type TemplateEditorFormData,
} from "../features/resumes/components/TemplateEditor";
import { sanitizeTemplateEditorFormData } from "../features/resumes/components/templateEditorDefaults";
import { ATSAnalysis } from "../features/resumes/components/ATSAnalysis";
import { KeywordEditor } from "../features/resumes/components/KeywordEditor";
import { useLocation, useNavigate } from "react-router-dom";

type Step =
  | "jobRole"
  | "template"
  | "editor"
  | "analysis"
  | "keywordEditor"
  | "updatedAnalysis";

interface EditorContinuePayload {
  resumeId?: number;
  resumeText: string;
}

interface AnalysisNavigationState {
  jobId: number;
  jobTitle: string;
  resumeText: string;
  resumeId?: number;
}

interface PersistedResumeBuilderState {
  selectedRole?: string;
  selectedJobId?: number | null;
  analysisResumeText?: string;
  selectedKeywords?: string[];
  selectedTemplate?: string;
  savedResumeId?: number | null;
  atsScore?: number;
  editorFormData?: TemplateEditorFormData;
}

const RESUME_BUILDER_STORAGE_KEY = "resume_builder_flow_v1";

function readPersistedResumeBuilderState(): PersistedResumeBuilderState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(RESUME_BUILDER_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedResumeBuilderState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

const RESUME_BUILDER_API_BASE = (import.meta.env.VITE_RESUME_BUILDER_API_URL || "http://localhost:8090").replace(/\/$/, "");

export default function ResumeBuilderApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialState = useMemo(readPersistedResumeBuilderState, []);

  const stepFromPath = (pathname: string): Step => {
    const clean = pathname.replace(/\/+$/, "");
    if (clean.endsWith("/template")) return "template";
    if (clean.endsWith("/editor")) return "editor";
    if (clean.endsWith("/analysis")) return "analysis";
    if (clean.endsWith("/keywords")) return "keywordEditor";
    if (clean.endsWith("/analysis-updated")) return "updatedAnalysis";
    return "jobRole";
  };

  const [currentStep, setCurrentStep] = useState<Step>(() => stepFromPath(location.pathname));

  const [selectedRole, setSelectedRole] = useState<string>(initialState.selectedRole || "");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(initialState.selectedJobId ?? null);
  const [analysisResumeText, setAnalysisResumeText] = useState<string>(initialState.analysisResumeText || "");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(initialState.selectedKeywords || []);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialState.selectedTemplate || "minimal");
  const [savedResumeId, setSavedResumeId] = useState<number | null>(initialState.savedResumeId ?? null);
  const [atsScore, setAtsScore] = useState<number>(initialState.atsScore ?? 0);
  const [editorFormData, setEditorFormData] = useState<TemplateEditorFormData>(
    () =>
      sanitizeTemplateEditorFormData(
        initialState.editorFormData || createDefaultTemplateEditorFormData(),
      ) as TemplateEditorFormData,
  );
  const routeState = (location.state as Partial<AnalysisNavigationState> | null) || null;
  const effectiveResumeText = (routeState?.resumeText || "").trim() || analysisResumeText;

  const getBasePath = useCallback(() => {
    return location.pathname.startsWith("/resume-builder") ? "/resume-builder" : "/jobrole";
  }, [location.pathname]);

  const stepPath = useCallback((step: Step) => {
    const base = getBasePath();
    const map: Record<Step, string> = {
      jobRole: "",
      template: "/template",
      editor: "/editor",
      analysis: "/analysis",
      keywordEditor: "/keywords",
      updatedAnalysis: "/analysis-updated",
    };
    return `${base}${map[step]}`;
  }, [getBasePath]);

  const gotoStep = useCallback((step: Step, replace = false, state?: AnalysisNavigationState) => {
    setCurrentStep(step);
    navigate(stepPath(step), { replace, state });
  }, [navigate, stepPath]);

  useEffect(() => {
    const incoming = stepFromPath(location.pathname);
    if (incoming !== currentStep) {
      setCurrentStep(incoming);
    }
  }, [location.pathname, currentStep]);

  useEffect(() => {
    if (currentStep !== "jobRole" && !selectedRole) {
      gotoStep("jobRole", true);
    }
  }, [currentStep, selectedRole, gotoStep]);

  useEffect(() => {
    if (!routeState) return;
    if (routeState.jobTitle && !selectedRole) {
      setSelectedRole(routeState.jobTitle);
    }
    if (typeof routeState.jobId === "number" && selectedJobId === null) {
      setSelectedJobId(routeState.jobId);
    }
    if (routeState.resumeText && !analysisResumeText) {
      setAnalysisResumeText(routeState.resumeText.trim());
    }
    if (typeof routeState.resumeId === "number" && savedResumeId === null) {
      setSavedResumeId(routeState.resumeId);
    }
  }, [routeState, selectedRole, selectedJobId, analysisResumeText, savedResumeId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const snapshot: PersistedResumeBuilderState = {
      selectedRole,
      selectedJobId,
      analysisResumeText,
      selectedKeywords,
      selectedTemplate,
      savedResumeId,
      atsScore,
      editorFormData: sanitizeTemplateEditorFormData(editorFormData) as TemplateEditorFormData,
    };
    window.localStorage.setItem(RESUME_BUILDER_STORAGE_KEY, JSON.stringify(snapshot));
  }, [
    selectedRole,
    selectedJobId,
    analysisResumeText,
    selectedKeywords,
    selectedTemplate,
    savedResumeId,
    atsScore,
    editorFormData,
  ]);

  const handleRoleSelection = (selection: { role: string; jobId: number | null }) => {
    setSelectedRole(selection.role);
    setSelectedJobId(selection.jobId);
    setAnalysisResumeText("");
    setSelectedKeywords([]);
    setSavedResumeId(null);
    setAtsScore(0);
    setEditorFormData(createDefaultTemplateEditorFormData());
    gotoStep("template");
  };

  const handleTemplateSelection = (template: string) => {
    setSelectedTemplate(template);
    gotoStep("editor");
  };

  const handleGenerateAnalysis = (payload?: EditorContinuePayload) => {
    const fullResumeText = (payload?.resumeText ?? "").trim();
    const resumeId = payload?.resumeId ?? null;
    const navState: AnalysisNavigationState = {
      jobId: selectedJobId ?? 0,
      jobTitle: selectedRole,
      resumeText: fullResumeText,
      ...(resumeId ? { resumeId } : {}),
    };

    setSavedResumeId(resumeId);
    setAnalysisResumeText(fullResumeText);
    setSelectedKeywords([]);
    gotoStep("analysis", false, navState);
  };

  const handleKeywordClick = (keyword: string) => {
    setSelectedKeywords((prev) => [...prev, keyword]);
    gotoStep("editor", false, {
      jobId: selectedJobId ?? 0,
      jobTitle: selectedRole,
      resumeText: effectiveResumeText,
      ...(savedResumeId ? { resumeId: savedResumeId } : {}),
    });
  };

  const handleSaveChanges = () => {
    gotoStep("updatedAnalysis", false, {
      jobId: selectedJobId ?? 0,
      jobTitle: selectedRole,
      resumeText: effectiveResumeText,
      ...(savedResumeId ? { resumeId: savedResumeId } : {}),
    });
  };

  const handleBackFromTemplate = () => {
    gotoStep("jobRole");
  };

  const handleBackFromJobRole = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleBackFromEditor = () => {
    gotoStep("template");
  };

  const handleBackFromAnalysis = () => {
    gotoStep("editor");
  };

  // Avoid rendering step UIs without required role context during refresh redirects.
  if (currentStep !== "jobRole" && !selectedRole) {
    return <div className="min-h-screen grid place-items-center text-neutral-700">Loading resume flow...</div>;
  }

  const handleBackFromKeywordEditor = () => {
    gotoStep("analysis", false, {
      jobId: selectedJobId ?? 0,
      jobTitle: selectedRole,
      resumeText: effectiveResumeText,
      ...(savedResumeId ? { resumeId: savedResumeId } : {}),
    });
  };

  const handleBackFromUpdatedAnalysis = () => {
    gotoStep("keywordEditor", false, {
      jobId: selectedJobId ?? 0,
      jobTitle: selectedRole,
      resumeText: effectiveResumeText,
      ...(savedResumeId ? { resumeId: savedResumeId } : {}),
    });
  };

  const downloadFromUrl = async (url: string, filename: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Download failed");
    }
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  const handleDownloadPdf = async () => {
    if (!savedResumeId) {
      alert("Resume ID not found. Please continue from editor once to save your resume.");
      return;
    }

    try {
      await downloadFromUrl(
        `${RESUME_BUILDER_API_BASE}/api/resume/${savedResumeId}/download-template?template=${encodeURIComponent(selectedTemplate)}`,
        `resume_${savedResumeId}_${selectedTemplate}.pdf`,
      );
    } catch (error) {
      console.error(error);
      alert("Download failed. Please try again.");
    }
  };

  return (
      <div className="min-h-screen bg-white">
        {currentStep === "jobRole" && (
        <JobRoleSelection
          onContinue={handleRoleSelection}
          onBack={handleBackFromJobRole}
        />
        )}

      {currentStep === "template" && (
        <TemplateSelection
          selectedRole={selectedRole}
          selectedTemplate={selectedTemplate}
          formData={editorFormData}
          onContinue={handleTemplateSelection}
          onBack={handleBackFromTemplate}
        />
      )}

      {currentStep === "editor" && (
        <TemplateEditor
          selectedTemplate={selectedTemplate}
          selectedRole={selectedRole}
          formData={editorFormData}
          setFormData={setEditorFormData}
          onContinue={handleGenerateAnalysis}
          onBack={handleBackFromEditor}
        />
      )}

      {currentStep === "analysis" && (
        <ATSAnalysis
          jobId={selectedJobId ?? 0}
          jobTitle={selectedRole}
          resumeText={effectiveResumeText}
          onDownload={handleDownloadPdf}
          onBack={handleBackFromAnalysis}
          onGoToDashboard={() => navigate("/dashboard")}
          onKeywordClick={handleKeywordClick}
          showDownloadButton={true}
          onScoreChange={setAtsScore}
        />
      )}

      {currentStep === "keywordEditor" && (
        <KeywordEditor
          selectedRole={selectedRole}
          selectedKeywords={selectedKeywords}
          onSaveChanges={handleSaveChanges}
          onBack={handleBackFromKeywordEditor}
        />
      )}

      {currentStep === "updatedAnalysis" && (
        <ATSAnalysis
          jobId={selectedJobId ?? 0}
          jobTitle={selectedRole}
          resumeText={effectiveResumeText}
          score={atsScore}
          onDownload={handleDownloadPdf}
          onBack={handleBackFromUpdatedAnalysis}
          onGoToDashboard={() => navigate("/dashboard")}
          onKeywordClick={handleKeywordClick}
          showDownloadButton={true}
          onScoreChange={setAtsScore}
        />
      )}
    </div>
  );
}
