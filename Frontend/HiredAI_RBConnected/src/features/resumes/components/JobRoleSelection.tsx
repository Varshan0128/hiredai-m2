import { useState, useEffect } from "react";
import svgPaths from "../imports/svg-3rwxnainwp";
import { useAuth } from "../../../auth/AuthContext";
import PageBackButton from "../../../components/PageBackButton";

const FLASK_API_BASE = "http://localhost:5000/api";
const HEIREDAI_API_BASE = (import.meta.env.VITE_HEIREDAI_API_URL || "http://localhost:8080").replace(/\/$/, "");
const SPRING_BOOT_API_BASE = `${HEIREDAI_API_BASE}/api/user`;

interface JobRoleSelectionProps {
  onContinue?: (selection: { role: string; jobId: number | null }) => void;
  onBack?: () => void;
  userEmail?: string;
}

export function JobRoleSelection({
  onContinue,
  onBack,
  userEmail = "user@example.com",
}: JobRoleSelectionProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategoriesByCategory, setSubCategoriesByCategory] = useState<Record<string, string[]>>({});

  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isFetchingRoles, setIsFetchingRoles] = useState(false);

  const buildDreamJobHeaders = () => ({ "Content-Type": "application/json" });

  const resolveUserEmail = () => {
    if (user?.email) return user.email;
    if (userEmail && userEmail !== "user@example.com") return userEmail;
    return null;
  };

  const resolveJobId = async (): Promise<number | null> => {
    if (!category || !subCategory) return null;
    try {
      const response = await fetch(
        `${FLASK_API_BASE}/jobs?category=${encodeURIComponent(category)}&search=${encodeURIComponent(subCategory)}&limit=100`,
      );
      if (!response.ok) return null;
      const data = await response.json();
      const jobs = Array.isArray(data.jobs) ? data.jobs : [];
      const exact = jobs.find(
        (job: any) =>
          String(job["Sub Category"] || "").toLowerCase() === subCategory.toLowerCase(),
      );
      const selected = exact || jobs[0];
      return selected?.ID ? Number(selected.ID) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    async function loadFilters() {
      try {
        const response = await fetch(`${FLASK_API_BASE}/jobs/filters`);
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Error connecting to Flask:", err);
      } finally {
        setIsFetching(false);
      }
    }
    loadFilters();
  }, []);

  useEffect(() => {
    if (!category || subCategoriesByCategory[category]) {
      return;
    }

    let isActive = true;

    async function loadRolesForCategory() {
      setIsFetchingRoles(true);
      try {
        const response = await fetch(
          `${FLASK_API_BASE}/jobs?category=${encodeURIComponent(category)}&limit=500`,
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Could not load roles for category");
        }

        const uniqueRoles = Array.from(
          new Set(
            (Array.isArray(data.jobs) ? data.jobs : [])
              .map((job: any) => String(job["Sub Category"] || "").trim())
              .filter(Boolean),
          ),
        ).sort((a, b) => a.localeCompare(b));

        if (!isActive) return;

        setSubCategoriesByCategory((prev) => ({
          ...prev,
          [category]: uniqueRoles,
        }));
      } catch (err) {
        console.error("Error loading roles for category:", err);
        if (!isActive) return;

        setSubCategoriesByCategory((prev) => ({
          ...prev,
          [category]: [],
        }));
      } finally {
        if (isActive) {
          setIsFetchingRoles(false);
        }
      }
    }

    loadRolesForCategory();

    return () => {
      isActive = false;
    };
  }, [category, subCategoriesByCategory]);

  const availableSubCategories = category
    ? subCategoriesByCategory[category] || []
    : [];

  const handleRoleSelect = async () => {
    if (!category || !subCategory) return;

    const fullRoleName = `${category} - ${subCategory}`;
    setIsLoading(true);

    try {
      const effectiveEmail = resolveUserEmail();
      if (!effectiveEmail) {
        console.warn("Skipping dream job save: no authenticated user email found.");
        return;
      }

      let response = await fetch(`${SPRING_BOOT_API_BASE}/dreamJob`, {
        method: "POST",
        headers: buildDreamJobHeaders(),
        credentials: "include",
        body: JSON.stringify({
          email: effectiveEmail,
          dreamJobs: [fullRoleName],
        }),
      });

      if (response.ok) {
        console.log("Success: Dream job saved in Spring Boot");
      } else {
        console.error("Spring Boot error:", await response.text());
      }
    } catch (err) {
      console.error("Failed to connect to Spring Boot:", err);
    } finally {
      setIsLoading(false);
      const jobId = await resolveJobId();
      onContinue?.({ role: fullRoleName, jobId });
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 sm:px-8 lg:px-14 py-8 lg:py-12">
      <div className="max-w-[1400px] mx-auto">
        <PageBackButton
          onClick={onBack}
          fallbackTo="/dashboard"
          className="mb-8"
        />

        <div className="mb-8 lg:mb-12">
          <h1 className="font-['Poppins:Bold',sans-serif] text-[#262626] text-3xl sm:text-4xl lg:text-5xl mb-4">
            Select your job role
          </h1>
          <p className="font-['Poppins:Medium',sans-serif] text-[rgba(65,65,65,0.7)] text-lg sm:text-xl">
            Choose the role from our dataset to get a tailored AI resume score
          </p>
        </div>

        <div className="mt-8">
          <p className="font-['Poppins:Medium',sans-serif] text-[#262626] text-lg mb-6">
            Category: {isFetching && <span className="text-sm text-blue-500 ml-2 animate-pulse">(Loading...)</span>}
          </p>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubCategory("");
            }}
            disabled={isFetching}
            className="w-full bg-[#f6f6f4] border border-[rgba(0,0,0,0.25)] rounded-lg px-6 py-4 font-['Poppins:Medium',sans-serif] text-lg text-[#262626] focus:outline-none focus:border-black transition-opacity disabled:opacity-50"
          >
            <option value="">{isFetching ? "Loading Categories..." : "Select category..."}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-10">
          <p className="font-['Poppins:Medium',sans-serif] text-[#262626] text-lg mb-4">
            Target Role:
            {category && isFetchingRoles ? (
              <span className="ml-2 text-sm text-blue-500 animate-pulse">
                (Loading roles...)
              </span>
            ) : null}
          </p>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            disabled={!category || isFetching || isFetchingRoles}
            className="w-full bg-[#f6f6f4] border border-[rgba(0,0,0,0.25)] rounded-lg px-6 py-4 font-['Poppins:Medium',sans-serif] text-lg text-[#262626] focus:outline-none focus:border-black disabled:opacity-50"
          >
            <option value="">
              {!category
                ? "Select category first..."
                : isFetchingRoles
                  ? "Loading roles..."
                  : availableSubCategories.length > 0
                    ? "Select sub-category..."
                    : "No roles found for this category"}
            </option>
            {availableSubCategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 flex justify-start">
          <button
            onClick={handleRoleSelect}
            disabled={!category || !subCategory || isLoading}
            className={`bg-black text-white rounded-lg px-8 py-4 flex items-center justify-center gap-2 transition-all ${
              category && subCategory && !isLoading
                ? "hover:bg-gray-800 cursor-pointer scale-100"
                : "opacity-50 cursor-not-allowed scale-95"
            }`}
          >
            <span className="font-['Poppins:Medium',sans-serif] text-lg sm:text-xl">
              {isLoading ? "Saving..." : "Continue to Analysis"}
            </span>
            {!isLoading && (
              <div className="rotate-90">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 28 27">
                  <path
                    d={svgPaths.pf308500}
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
