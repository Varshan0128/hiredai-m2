"""
Resume Grammar Checker API (Debug Version)
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import tempfile
import os
import uvicorn
import re
from pathlib import Path
from dotenv import load_dotenv

# Import grammar checker
from grammar_checker import (
    grammar_analysis,
    get_errors_by_category,
    get_error_count,
    has_errors,
    filter_by_category
)

from analysis_engine import analyze_resume, discover_jobs_for_skills
from file_reader import read_resume_file
from job_services import (
    dedupe_jobs,
    enrich_jobs_with_details,
    fetch_job_details,
    fetch_scrapingdog_jobs,
    fetch_serpapi_jobs,
    fetch_serper_jobs,
    make_job_id,
    normalize_text,
)
from resume_validation import (
    INVALID_RESUME_MESSAGE,
    get_file_extension,
    is_allowed_resume_upload,
    is_valid_resume_text,
)

# Load the workspace-level .env (walk up from this file path).
for _parent in Path(__file__).resolve().parents:
    _env_file = _parent / ".env"
    if _env_file.exists():
        load_dotenv(_env_file, override=False)
        break


def _to_int(value: Optional[str], default: int) -> int:
    try:
        return int(value) if value is not None else default
    except ValueError:
        return default


PYTHON_PUBLIC_URL = (os.getenv("VITE_PYTHON_API_URL") or "http://localhost:8000").rstrip("/")
PYTHON_BIND_HOST = os.getenv("PYTHON_BIND_HOST", "0.0.0.0")
PYTHON_BIND_PORT = _to_int(os.getenv("PYTHON_PORT"), 8000)
FRONTEND_URL = os.getenv("VITE_FRONTEND_URL")
ALLOWED_ORIGINS = [
    origin for origin in [
        FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://${FRONTEND_HOST}:${FRONTEND_PORT}"
    ] if origin and "${" not in origin
]
SERPAPI_KEY = (os.getenv("SERPAPI_KEY") or "").strip()
SERPER_API_KEY = (os.getenv("SERPER_API_KEY") or "").strip()
SCRAPINGDOG_API_KEY = (os.getenv("SCRAPINGDOG_API_KEY") or "").strip()


def _invalid_resume_exception() -> HTTPException:
    return HTTPException(status_code=400, detail=INVALID_RESUME_MESSAGE)


def _validate_upload_metadata(file: UploadFile) -> str:
    if not file.filename:
        raise _invalid_resume_exception()

    suffix = get_file_extension(file.filename)
    if not is_allowed_resume_upload(file.filename, file.content_type):
        raise _invalid_resume_exception()

    return suffix


def _extract_and_validate_resume_text(temp_file: str) -> str:
    try:
        resume_text = read_resume_file(temp_file)
    except Exception as exc:
        raise _invalid_resume_exception() from exc

    if not is_valid_resume_text(resume_text):
        raise _invalid_resume_exception()

    return resume_text


# =============================================================================
# FASTAPI CONFIG
# =============================================================================

app = FastAPI(
    title="Resume Grammar Checker",
    version="2.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# MODELS
# =============================================================================

class TextAnalysisRequest(BaseModel):
    text: str


class JobDiscoveryRequest(BaseModel):
    skills: List[str] = []
    location: str = "India"


class GrammarIssue(BaseModel):
    error: str
    suggestion: str
    reason: str
    category: str
    rule_id: str
    offset: int
    context: str


class AnalysisResponse(BaseModel):
    success: bool
    total_issues: int
    has_errors: bool
    category_summary: Dict[str, int]
    issues: List[GrammarIssue]
    message: Optional[str] = None


# =============================================================================
# JOB DISCOVERY ENDPOINT
# =============================================================================

def _build_jobs_response(skills: List[str], location: str) -> Dict[str, object]:
    skills = [skill.strip() for skill in skills if isinstance(skill, str) and skill.strip()]
    location = location or "India"
    discovery = discover_jobs_for_skills(
        skills=skills,
        location=location,
        resume_text=" ".join(skills),
        serpapi_key=SERPAPI_KEY,
        serper_key=SERPER_API_KEY,
        scrapingdog_key=SCRAPINGDOG_API_KEY,
    )
    jobs = discovery["jobs"]
    source = jobs[0].get("source") if jobs else "none"
    return {
        "jobs": jobs,
        "roles": discovery["roles"],
        "domains": discovery["domains"],
        "demand": discovery["demand"],
        "risk": discovery["risk"],
        "targetRole": discovery["target_role"],
        "selectedDomain": discovery["selected_domain"],
        "structuredOutput": discovery["structured_output"],
        "source": source,
        "count": len(jobs),
    }


@app.get("/jobs")
async def get_jobs(role: str = "Software Developer", location: str = "India"):
    skills = [part.strip() for part in re.split(r"[,/]| and ", role) if part.strip()]
    if not skills:
        skills = [role]
    return _build_jobs_response(skills, location)


@app.post("/jobs")
async def get_jobs_post(request: JobDiscoveryRequest):
    return _build_jobs_response(request.skills, request.location)


@app.post("/jobs-from-resume")
async def get_jobs_from_resume(file: UploadFile = File(...)):
    temp_file = None
    try:
        suffix = _validate_upload_metadata(file)
        content = await file.read()

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp.write(content)
            temp_file = temp.name

        resume_text = _extract_and_validate_resume_text(temp_file)
        analysis = analyze_resume(
            resume_text=resume_text,
            location="India",
            serpapi_key=SERPAPI_KEY,
            serper_key=SERPER_API_KEY,
            scrapingdog_key=SCRAPINGDOG_API_KEY,
        )
        jobs = analysis["job_matches"]

        return {
            "jobs": jobs,
            "resumeText": analysis["resume_text"],
            "selectedDomain": analysis["selected_domain"],
            "targetRole": analysis["target_role"],
            "skills": analysis["skills"],
            "tools": analysis["tools"],
            "softSkills": analysis["soft_skills"],
            "keywords": analysis["keywords"],
            "domains": analysis["domains"],
            "roles": analysis["roles"],
            "score": analysis["score"],
            "job_matches": jobs,
            "risk": analysis["risk"],
            "demand": analysis["demand"],
            "skill_gaps": analysis["skill_gaps"],
            "experienceYears": analysis["experience_years"],
            "educationLevel": analysis["education_level"],
            "expandedRoles": analysis["expanded_roles"],
            "allRoles": analysis["all_roles"],
            "structuredOutput": analysis["structured_output"],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if temp_file and os.path.exists(temp_file):
            os.unlink(temp_file)


# =============================================================================
# SIMPLE FRONTEND
# =============================================================================

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    return """
    <html>
    <head><title>Grammar Checker</title></head>
    <body>
        <h2>Resume Grammar Checker</h2>
        <textarea id="text" rows="10" cols="80"></textarea><br><br>
        <button onclick="check()">Check Grammar</button>
        <pre id="output"></pre>

        <script>
        async function check() {
            const text = document.getElementById("text").value;

            const res = await fetch("/api/analyze/text", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({text})
            });

            const data = await res.json();
            document.getElementById("output").innerText =
                JSON.stringify(data, null, 2);
        }
        </script>
    </body>
    </html>
    """


@app.get("/docs", include_in_schema=False)
async def docs_redirect():
    return RedirectResponse(url="/api/docs")


# =============================================================================
# TEXT ANALYSIS ENDPOINT (DEBUG ENABLED)
# =============================================================================

@app.post("/api/analyze/text", response_model=AnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):

    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        print("\n================ DEBUG START ================")
        print("[DEBUG] RECEIVED TEXT:")
        print(request.text)
        print("=============================================")

        issues = grammar_analysis(request.text)

        print("[DEBUG] ISSUES FOUND:")
        print(issues)
        print("=============================================\n")

        return AnalysisResponse(
            success=True,
            total_issues=get_error_count(issues),
            has_errors=has_errors(issues),
            category_summary=get_errors_by_category(issues),
            issues=issues,
            message="Analysis completed successfully"
        )

    except Exception as e:
        print("[ERROR]", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# FILE ANALYSIS ENDPOINT (DEBUG ENABLED)
# =============================================================================

@app.post("/api/analyze/file", response_model=AnalysisResponse)
async def analyze_file(file: UploadFile = File(...)):

    temp_file = None

    try:
        suffix = _validate_upload_metadata(file)
        content = await file.read()

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp.write(content)
            temp_file = temp.name

        resume_text = _extract_and_validate_resume_text(temp_file)

        print("\n================ FILE DEBUG START ================")
        print("[DEBUG] EXTRACTED TEXT (first 500 chars):")
        print(resume_text[:500])
        print("==================================================")

        issues = grammar_analysis(resume_text)

        print("[DEBUG] ISSUES FOUND:")
        print(issues)
        print("==================================================\n")

        return AnalysisResponse(
            success=True,
            total_issues=get_error_count(issues),
            has_errors=has_errors(issues),
            category_summary=get_errors_by_category(issues),
            issues=issues,
            message="File analysis completed"
        )

    except HTTPException:
        raise
    except Exception as e:
        print("[FILE ERROR]", str(e))
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if temp_file and os.path.exists(temp_file):
            os.unlink(temp_file)


# =============================================================================
# STARTUP
# =============================================================================

@app.on_event("startup")
async def startup_event():
    print("\n======================================")
    print("Grammar Checker API Starting")
    print(f"URL: {PYTHON_PUBLIC_URL}")
    print("======================================\n")


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    uvicorn.run(app, host=PYTHON_BIND_HOST, port=PYTHON_BIND_PORT)
