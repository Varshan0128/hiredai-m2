"""
Resume File Reader Utility
===========================
Handles reading resume text from various file formats.

Supported formats:
- .txt
- .pdf
- .docx
"""

import os
from pathlib import Path
from typing import Tuple
from dotenv import load_dotenv

# Load the workspace-level .env (walk up from this file path).
for _parent in Path(__file__).resolve().parents:
    _env_file = _parent / ".env"
    if _env_file.exists():
        load_dotenv(_env_file, override=False)
        break


# ==========================================================
# TEXT FILE READER
# ==========================================================

def read_text_file(filepath: str) -> str:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except UnicodeDecodeError:
        with open(filepath, "r", encoding="latin-1") as f:
            return f.read()


# ==========================================================
# PDF FILE READER
# ==========================================================

def read_pdf_file(filepath: str) -> str:
    try:
        import PyPDF2
    except ImportError:
        raise ImportError(
            "PyPDF2 is required to read PDF files. Install with: pip install PyPDF2"
        )

    text = []

    with open(filepath, "rb") as f:
        pdf_reader = PyPDF2.PdfReader(f)

        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)

    combined_text = "\n".join(text)

    # Clean common PDF issues
    combined_text = combined_text.replace("\r", " ")
    combined_text = combined_text.replace("\n", " ")
    combined_text = " ".join(combined_text.split())

    return combined_text.strip()


# ==========================================================
# DOCX FILE READER
# ==========================================================

def read_docx_file(filepath: str) -> str:
    try:
        from docx import Document
    except ImportError:
        raise ImportError(
            "python-docx is required. Install with: pip install python-docx"
        )

    doc = Document(filepath)

    text = []
    for paragraph in doc.paragraphs:
        if paragraph.text.strip():
            text.append(paragraph.text.strip())

    return "\n".join(text).strip()


# ==========================================================
# MAIN ROUTER
# ==========================================================

def read_resume_file(filepath: str) -> str:

    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    file_ext = Path(filepath).suffix.lower()

    if file_ext == ".txt":
        content = read_text_file(filepath)
    elif file_ext == ".pdf":
        content = read_pdf_file(filepath)
    elif file_ext == ".docx":
        content = read_docx_file(filepath)
    else:
        raise ValueError(
            f"Unsupported file format: {file_ext}. "
            f"Supported formats: .txt, .pdf, .docx"
        )

    if not content.strip():
        raise ValueError("File contains no readable text.")

    return content


# ==========================================================
# FILE VALIDATION
# ==========================================================

def validate_file_path(filepath: str) -> Tuple[bool, str]:

    if not filepath or not filepath.strip():
        return False, "File path cannot be empty"

    filepath = filepath.strip()

    if not os.path.exists(filepath):
        return False, f"File not found: {filepath}"

    if not os.path.isfile(filepath):
        return False, f"Path is not a file: {filepath}"

    file_ext = Path(filepath).suffix.lower()
    supported = [".txt", ".pdf", ".docx"]

    if file_ext not in supported:
        return False, (
            f"Unsupported file format: {file_ext}. "
            f"Supported formats: {', '.join(supported)}"
        )

    if not os.access(filepath, os.R_OK):
        return False, f"File is not readable: {filepath}"

    return True, ""
