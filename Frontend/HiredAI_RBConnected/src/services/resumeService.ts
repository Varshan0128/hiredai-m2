const RESUME_BUILDER_API_BASE = (import.meta.env.VITE_RESUME_BUILDER_API_URL || "http://localhost:8090").replace(/\/$/, "");
const RESUME_API_BASE = `${RESUME_BUILDER_API_BASE}/api/resume`;

export interface StoredResume {
  ID: number;
  USEREMAIL?: string;
  TARGETROLE?: string;
  VERSION?: number;
  ACTIVE?: boolean;
  CREATEDAT?: string;
  FULL_NAME?: string;
  EMAIL?: string;
  TEMPLATE_NAME?: string;
  SUMMARY?: string;
}

export const ResumeService = {
  saveResume: async (resumeData: unknown) => {
    const response = await fetch(RESUME_API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resumeData),
    });
    if (!response.ok) throw new Error("Failed to save resume");
    return response.json();
  },

  getHistory: async (email: string): Promise<StoredResume[]> => {
    const response = await fetch(`${RESUME_API_BASE}/history/${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error("Failed to fetch history");
    return response.json();
  },

  downloadResumePdf: async (resumeId: number, fileName?: string) => {
    const response = await fetch(`${RESUME_API_BASE}/${resumeId}/download-used-template`);
    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || `resume_${resumeId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteResume: async (resumeId: number) => {
    const response = await fetch(`${RESUME_API_BASE}/${resumeId}`, {
      method: "DELETE",
    });
    return response.ok;
  },
};
