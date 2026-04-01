"""
ATS Resume Scorer V4.0 - Complete AI Engine
Includes all features from V2.0, V3.0, V3.1, V3.2, V3.3

Features:
- V2.0: ML-based scoring with ensemble models
- V3.0: BERT-based semantic understanding
- V3.1: Job description matching
- V3.2: Visual resume element detection
- V3.3: Multi-language support
"""

import html
import os
import re
import json
import zipfile
import unicodedata
import numpy as np
from typing import Any, Dict, List, Set, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from xml.etree import ElementTree
from dotenv import load_dotenv
import warnings
warnings.filterwarnings('ignore')

# Load the workspace-level .env (walk up from this file path).
for _parent in Path(__file__).resolve().parents:
    _env_file = _parent / ".env"
    if _env_file.exists():
        load_dotenv(_env_file, override=False)
        break

# ML Libraries
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity

# Deep Learning
try:
    from transformers import BertTokenizer, BertModel
    import torch
    BERT_AVAILABLE = True
except ImportError:
    BERT_AVAILABLE = False
    print("Warning: BERT not available. Install transformers and torch for V3.0 features.")

# Language Detection
try:
    from langdetect import detect, detect_langs
    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False
    print("Warning: langdetect not available. Install for V3.3 multi-language support.")

# PDF/Image Processing
try:
    import PyPDF2
    import pdfplumber
    from PIL import Image
    import pytesseract
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("Warning: PDF libraries not available. Install PyPDF2, pdfplumber, PIL, pytesseract.")


@dataclass
class ATSScore:
    """Complete ATS scoring result"""
    overall_score: float
    category_scores: Dict[str, float]
    recommendations: List[str]
    scoring_breakdown: Optional[Dict[str, Any]] = None
    job_match_score: Optional[float] = None
    skills_gap: Optional[List[str]] = None
    language: Optional[str] = None
    visual_quality_score: Optional[float] = None
    bert_semantic_score: Optional[float] = None
    version: str = "4.0"


class BERTEmbedder:
    """V3.0: BERT-based semantic understanding"""
    
    def __init__(self):
        self.available = False
        self.tokenizer = None
        self.model = None

        if not BERT_AVAILABLE:
            return

        local_only = os.getenv('ATS_BERT_LOCAL_ONLY', '1').lower() not in {'0', 'false', 'no'}
        try:
            self.tokenizer = BertTokenizer.from_pretrained(
                'bert-base-uncased',
                local_files_only=local_only,
            )
            self.model = BertModel.from_pretrained(
                'bert-base-uncased',
                local_files_only=local_only,
            )
            self.model.eval()
            self.available = True
        except Exception:
            self.available = False
    
    def get_embedding(self, text: str) -> np.ndarray:
        """Get BERT embedding for text"""
        if not self.available:
            return np.zeros(768)
        
        inputs = self.tokenizer(text, return_tensors='pt', 
                               truncation=True, max_length=512, 
                               padding=True)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        # Use [CLS] token embedding
        return outputs.last_hidden_state[:, 0, :].numpy().flatten()
    
    def semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts"""
        emb1 = self.get_embedding(text1)
        emb2 = self.get_embedding(text2)
        
        similarity = cosine_similarity([emb1], [emb2])[0][0]
        return float(similarity)


class LanguageDetector:
    """V3.3: Multi-language support"""
    
    SUPPORTED_LANGUAGES = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'zh-cn': 'Chinese (Simplified)',
        'zh-tw': 'Chinese (Traditional)',
        'ja': 'Japanese',
        'ko': 'Korean',
        'pt': 'Portuguese',
        'it': 'Italian',
        'ru': 'Russian'
    }
    
    def detect_language(self, text: str) -> Tuple[str, float]:
        """Detect language with confidence score"""
        if not LANGDETECT_AVAILABLE or not text.strip():
            return ('en', 1.0)
        
        try:
            lang_probs = detect_langs(text)
            top_lang = lang_probs[0]
            return (top_lang.lang, top_lang.prob)
        except:
            return ('en', 1.0)
    
    def get_language_name(self, code: str) -> str:
        """Get human-readable language name"""
        return self.SUPPORTED_LANGUAGES.get(code, 'Unknown')


class VisualAnalyzer:
    """V3.2: Visual resume element detection"""
    
    def analyze_layout(self, file_path: str) -> Dict[str, Any]:
        """Analyze visual layout quality of resume"""
        if not PDF_AVAILABLE:
            return {'visual_score': 0.7, 'message': 'PDF analysis not available'}
        
        try:
            with pdfplumber.open(file_path) as pdf:
                results = {
                    'num_pages': len(pdf.pages),
                    'has_images': False,
                    'has_tables': False,
                    'avg_char_density': 0,
                    'margins': {},
                    'visual_score': 0
                }
                
                for page in pdf.pages:
                    # Check for images
                    if page.images:
                        results['has_images'] = True
                    
                    # Check for tables
                    if page.extract_tables():
                        results['has_tables'] = True
                    
                    # Calculate text density
                    text = page.extract_text()
                    if text:
                        results['avg_char_density'] += len(text)
                
                # Calculate visual quality score
                score = 0.5  # Base score
                
                # Optimal page count (1-2 pages)
                if results['num_pages'] <= 2:
                    score += 0.2
                
                # Tables indicate structure
                if results['has_tables']:
                    score += 0.15
                
                # Images can be good (logos) or bad (excessive)
                if results['has_images']:
                    score += 0.1
                
                # Text density check
                avg_density = results['avg_char_density'] / max(results['num_pages'], 1)
                if 1000 < avg_density < 3000:  # Optimal range
                    score += 0.15
                
                results['visual_score'] = min(score, 1.0)
                return results
                
        except Exception as e:
            return {'visual_score': 0.7, 'error': str(e)}
    
    def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from image-based resume"""
        if not PDF_AVAILABLE:
            return ""
        
        try:
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image)
            return text
        except:
            return ""


class ATSScorerV4:
    """
    Complete ATS Resume Scorer V4.0
    Integrates all features from V2.0 through V4.0
    """
    
    def __init__(self):
        self.version = "4.0"
        
        # V2.0 Components
        self.tfidf_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.scaler = StandardScaler()
        self.keywords = self._load_keywords()
        self.skill_aliases = self._load_skill_aliases()
        
        # V3.0: BERT
        self.bert_embedder = BERTEmbedder() if BERT_AVAILABLE else None
        
        # V3.2: Visual Analysis
        self.visual_analyzer = VisualAnalyzer()
        
        # V3.3: Language Detection
        self.language_detector = LanguageDetector()
        
        print(f"ATS Scorer V{self.version} initialized")
        print(f"   BERT: {'Enabled' if self.bert_embedder and self.bert_embedder.available else 'Disabled'}")
        print(f"   Language Detection: {'Enabled' if LANGDETECT_AVAILABLE else 'Disabled'}")
        print(f"   PDF Analysis: {'Enabled' if PDF_AVAILABLE else 'Disabled'}")
    
    def _load_keywords(self) -> Dict[str, List[str]]:
        """Load industry keywords for scoring"""
        return {
            'technical_skills': [
                'python', 'java', 'javascript', 'react', 'angular', 'node',
                'c++', 'c#', 'html', 'css', 'spring boot',
                'sql', 'mongodb', 'aws', 'azure', 'docker', 'kubernetes',
                'machine learning', 'data science', 'ai', 'tensorflow',
                'git', 'agile', 'scrum', 'ci/cd', 'devops'
            ],
            'soft_skills': [
                'leadership', 'communication', 'teamwork', 'problem solving',
                'analytical', 'creative', 'adaptable', 'collaborative',
                'strategic', 'innovative', 'management'
            ],
            'action_verbs': [
                'developed', 'created', 'managed', 'led', 'implemented',
                'designed', 'built', 'improved', 'optimized', 'achieved',
                'increased', 'reduced', 'collaborated', 'coordinated'
            ],
            'education': [
                'bachelor', 'master', 'phd', 'mba', 'degree', 'university',
                'college', 'certification', 'certificate', 'training'
            ]
        }

    def _load_skill_aliases(self) -> Dict[str, List[str]]:
        """Map canonical skills to common resume/job-description variants."""
        aliases = {
            'python': ['python', 'py'],
            'java': ['java'],
            'javascript': ['javascript', 'js', 'ecmascript', 'es6'],
            'react': ['react', 'reactjs', 'react.js'],
            'angular': ['angular', 'angularjs'],
            'node': ['node', 'nodejs', 'node.js'],
            'c++': ['c++', 'cpp'],
            'c#': ['c#', 'c sharp'],
            'html': ['html', 'html5'],
            'css': ['css', 'css3'],
            'spring boot': ['spring boot', 'springboot'],
            'sql': ['sql', 'mysql', 'postgresql', 'postgres', 'mssql'],
            'mongodb': ['mongodb', 'mongo db', 'mongo'],
            'aws': ['aws', 'amazon web services'],
            'azure': ['azure', 'microsoft azure'],
            'docker': ['docker', 'containerization', 'containers'],
            'kubernetes': ['kubernetes', 'k8s'],
            'machine learning': ['machine learning', 'ml'],
            'data science': ['data science', 'data analytics', 'analytics'],
            'ai': ['ai', 'artificial intelligence'],
            'tensorflow': ['tensorflow', 'tf'],
            'git': ['git', 'github', 'gitlab', 'bitbucket'],
            'agile': ['agile'],
            'scrum': ['scrum'],
            'ci/cd': ['ci/cd', 'ci cd', 'continuous integration', 'continuous delivery', 'continuous deployment'],
            'devops': ['devops', 'dev ops'],
            'leadership': ['leadership', 'leading', 'mentoring'],
            'communication': ['communication', 'communicating', 'presentation'],
            'teamwork': ['teamwork', 'team work', 'cross-functional collaboration', 'collaboration'],
            'problem solving': ['problem solving', 'problem-solving', 'troubleshooting'],
            'analytical': ['analytical', 'analysis'],
            'creative': ['creative', 'creativity'],
            'adaptable': ['adaptable', 'adaptability'],
            'collaborative': ['collaborative', 'collaboration'],
            'strategic': ['strategic', 'strategy'],
            'innovative': ['innovative', 'innovation'],
            'management': ['management', 'managing'],
        }

        for category in ('technical_skills', 'soft_skills'):
            for keyword in self.keywords[category]:
                aliases.setdefault(keyword, [keyword])

        return aliases

    def _normalize_text(self, text: str) -> str:
        """Normalize encoding artifacts and punctuation before scoring."""
        if not text:
            return ""

        normalized = unicodedata.normalize("NFKC", html.unescape(text))
        replacements = [
            (r'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ|ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“|Ã¢â‚¬â€œ|â€“|—', ' - '),
            (r'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢|ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢|Ã¢â‚¬Â¢|•|●|▪', '\n- '),
            (r'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢|ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢|Ã¢â‚¬â„¢|’', "'"),
            (r'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“|ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ|Ã¢â‚¬Å“|“', '"'),
            (r'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â|ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â|Ã¢â‚¬Â|”', '"'),
            (r'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬|ÃƒÂ¢Ã¢â€šÂ¬', ' '),
        ]

        for pattern, replacement in replacements:
            normalized = re.sub(pattern, replacement, normalized)

        normalized = normalized.replace('\r\n', '\n')
        normalized = re.sub(r'[ \t]+\n', '\n', normalized)
        normalized = re.sub(r'\n{3,}', '\n\n', normalized)
        normalized = re.sub(r'[ \t]{2,}', ' ', normalized)
        return normalized.strip()

    def _term_pattern(self, term: str) -> str:
        escaped = re.escape(term.lower())
        escaped = escaped.replace(r'\ ', r'[\s\-]+')
        escaped = escaped.replace(r'\/', r'[/\s\-]*')
        escaped = escaped.replace(r'\.', r'[.\s]?')
        escaped = escaped.replace(r'\#', r'(?:\#|\s+sharp)')
        return rf'(?<!\w){escaped}(?!\w)'

    def _contains_term(self, text: str, term: str) -> bool:
        return re.search(self._term_pattern(term), text) is not None

    def _extract_keyword_matches(self, text: str, category: str) -> Set[str]:
        found: Set[str] = set()
        for keyword in self.keywords.get(category, []):
            aliases = self.skill_aliases.get(keyword, [keyword])
            if any(self._contains_term(text, alias) for alias in aliases):
                found.add(keyword)
        return found

    def _count_action_verbs(self, text: str) -> Set[str]:
        return {
            action
            for action in self.keywords['action_verbs']
            if self._contains_term(text, action)
        }

    def _calculate_tfidf_similarity(self, text1: str, text2: str) -> float:
        """Lightweight lexical similarity for job matching fallback."""
        if not text1.strip() or not text2.strip():
            return 0.0

        try:
            vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2), min_df=1)
            matrix = vectorizer.fit_transform([text1, text2])
            return float(cosine_similarity(matrix[0], matrix[1])[0][0])
        except ValueError:
            return 0.0

    def _extract_sections(self, resume_text: str) -> Dict[str, str]:
        """Parse common resume sections for section-aware scoring and UI feedback."""
        section_aliases = {
            'summary': {'summary', 'professional summary', 'profile', 'objective', 'career objective'},
            'experience': {'experience', 'work experience', 'employment', 'professional experience', 'internship'},
            'education': {'education', 'academic background', 'academics'},
            'skills': {'skills', 'technical skills', 'areas of expertise', 'core competencies'},
            'projects': {'projects', 'project experience', 'academic projects'},
            'certifications': {'certifications', 'certification', 'licenses'},
            'contact': {'contact', 'contact information', 'personal details'},
        }

        sections: Dict[str, List[str]] = {}
        current_section: Optional[str] = None

        for raw_line in resume_text.splitlines():
            line = raw_line.strip()
            if not line:
                continue

            normalized_line = re.sub(r'[^a-z\s]', '', line.lower()).strip()
            matched_section = next(
                (
                    section
                    for section, aliases in section_aliases.items()
                    if normalized_line in aliases
                ),
                None,
            )

            if matched_section:
                current_section = matched_section
                sections.setdefault(current_section, [])
                continue

            if current_section:
                sections.setdefault(current_section, []).append(line)

        return {
            section: "\n".join(content).strip()
            for section, content in sections.items()
            if any(chunk.strip() for chunk in content)
        }

    def _summarize_section_analysis(self, sections: Dict[str, str]) -> Dict[str, Dict[str, Any]]:
        summary: Dict[str, Dict[str, Any]] = {}
        for name in ('summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'contact'):
            content = sections.get(name, '')
            summary[name] = {
                'present': bool(content),
                'word_count': len(content.split()) if content else 0,
                'preview': content[:160] if content else '',
            }
        return summary

    def _estimate_confidence(
        self,
        resume_text: str,
        category_scores: Dict[str, float],
        section_analysis: Dict[str, Dict[str, Any]],
        job_description: Optional[str],
    ) -> Dict[str, Any]:
        signal_points = 0.0
        reasons = []

        word_count = len(resume_text.split())
        if word_count >= 250:
            signal_points += 0.25
            reasons.append("resume_has_sufficient_text")
        if sum(1 for data in section_analysis.values() if data['present']) >= 4:
            signal_points += 0.25
            reasons.append("multiple_resume_sections_detected")
        if category_scores.get('contact', 0) >= 0.7:
            signal_points += 0.2
            reasons.append("contact_information_detected")
        if job_description:
            signal_points += 0.15
            reasons.append("job_context_available")
        if category_scores.get('keywords', 0) >= 0.5:
            signal_points += 0.15
            reasons.append("keyword_signal_is_strong")

        confidence_score = min(signal_points, 1.0)
        if confidence_score >= 0.75:
            label = 'high'
        elif confidence_score >= 0.5:
            label = 'medium'
        else:
            label = 'low'

        return {
            'label': label,
            'score': round(confidence_score * 100, 2),
            'reasons': reasons,
        }

    def _collect_positive_factors(
        self,
        category_scores: Dict[str, float],
        section_analysis: Dict[str, Dict[str, Any]],
        matched_skills: Optional[List[str]] = None,
    ) -> List[str]:
        positives: List[str] = []
        if category_scores.get('keywords', 0) >= 0.65:
            positives.append("Strong keyword coverage for ATS screening")
        if category_scores.get('experience', 0) >= 0.65:
            positives.append("Experience section includes strong achievement signals")
        if category_scores.get('contact', 0) >= 0.9:
            positives.append("Contact information is complete and ATS-friendly")
        if section_analysis.get('projects', {}).get('present'):
            positives.append("Project work is clearly represented")
        if matched_skills:
            positives.append(f"Matched job skills: {', '.join(matched_skills[:5])}")
        return positives

    def _analyze_job_fit(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        resume_lower = self._normalize_text(resume_text).lower()
        job_lower = self._normalize_text(job_description).lower()

        required_skills = sorted(
            self._extract_keyword_matches(job_lower, 'technical_skills')
            | self._extract_keyword_matches(job_lower, 'soft_skills')
        )
        resume_skills = (
            self._extract_keyword_matches(resume_lower, 'technical_skills')
            | self._extract_keyword_matches(resume_lower, 'soft_skills')
        )
        lexical_similarity = self._calculate_tfidf_similarity(resume_lower[:2000], job_lower[:2000])

        if required_skills:
            matched_skills = sorted(set(required_skills) & resume_skills)
            skill_coverage = len(matched_skills) / len(required_skills)
            score = (skill_coverage * 0.8) + (lexical_similarity * 0.2)
        else:
            matched_skills = []
            skill_coverage = 0.0
            score = lexical_similarity * 0.8

        bert_similarity = None
        if self.bert_embedder and self.bert_embedder.available:
            bert_similarity = self.bert_embedder.semantic_similarity(
                resume_text[:500], job_description[:500]
            )
            score = (score * 0.75) + (bert_similarity * 0.25)

        return {
            'score': min(max(score, 0.0), 1.0),
            'required_skills': required_skills,
            'matched_skills': matched_skills,
            'skills_gap': [skill for skill in required_skills if skill not in resume_skills],
            'lexical_similarity': round(lexical_similarity * 100, 2),
            'skill_coverage': round(skill_coverage * 100, 2),
            'bert_similarity': round(bert_similarity * 100, 2) if bert_similarity is not None else None,
        }
    
    def extract_text(self, file_path: str) -> str:
        """Extract text from resume file"""
        if file_path.lower().endswith('.pdf'):
            return self._normalize_text(self._extract_from_pdf(file_path))
        elif file_path.lower().endswith('.docx'):
            return self._normalize_text(self._extract_from_docx(file_path))
        elif file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
            return self._normalize_text(self.visual_analyzer.extract_text_from_image(file_path))
        else:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return self._normalize_text(f.read())
    
    def _extract_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF"""
        if not PDF_AVAILABLE:
            return ""
        
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
        except:
            try:
                with open(pdf_path, 'rb') as file:
                    reader = PyPDF2.PdfReader(file)
                    for page in reader.pages:
                        text += page.extract_text() + "\n"
            except:
                pass
        
        return text

    def _extract_from_docx(self, docx_path: str) -> str:
        """Extract text from DOCX without requiring external Word libraries"""
        xml_parts = [
            "word/document.xml",
            "word/header1.xml",
            "word/header2.xml",
            "word/header3.xml",
            "word/footer1.xml",
            "word/footer2.xml",
            "word/footer3.xml",
        ]
        namespace = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        text_chunks: List[str] = []

        try:
            with zipfile.ZipFile(docx_path) as archive:
                for part_name in xml_parts:
                    if part_name not in archive.namelist():
                        continue

                    root = ElementTree.fromstring(archive.read(part_name))
                    for paragraph in root.findall(".//w:p", namespace):
                        runs = [
                            node.text
                            for node in paragraph.findall(".//w:t", namespace)
                            if node.text
                        ]
                        if runs:
                            text_chunks.append("".join(runs).strip())
        except (OSError, zipfile.BadZipFile, ElementTree.ParseError):
            return ""

        return "\n".join(chunk for chunk in text_chunks if chunk)
    
    def score_resume(self, resume_text: str, 
                    job_description: Optional[str] = None,
                    file_path: Optional[str] = None) -> ATSScore:
        """
        Complete resume scoring with all V4.0 features
        
        Args:
            resume_text: Resume content
            job_description: Optional job description for matching (V3.1)
            file_path: Optional file path for visual analysis (V3.2)
        """
        
        resume_text = self._normalize_text(resume_text)
        resume_lower = resume_text.lower()
        sections = self._extract_sections(resume_text)
        section_analysis = self._summarize_section_analysis(sections)
        
        # V3.3: Language Detection
        language, lang_confidence = self.language_detector.detect_language(resume_text)
        
        # Category Scores
        category_scores = {}
        recommendations = []
        
        # 1. Keywords Score (V2.0)
        keywords_score, keyword_recs = self._score_keywords_v2(resume_lower)
        category_scores['keywords'] = keywords_score
        recommendations.extend(keyword_recs)
        
        # 2. Formatting Score (V2.0)
        format_score, format_recs = self._score_formatting_v2(resume_text)
        category_scores['formatting'] = format_score
        recommendations.extend(format_recs)
        
        # 3. Experience Score (V2.0)
        experience_score, exp_recs = self._score_experience_v2(resume_lower)
        category_scores['experience'] = experience_score
        recommendations.extend(exp_recs)
        
        # 4. Education Score (V2.0)
        education_score, edu_recs = self._score_education_v2(resume_lower)
        category_scores['education'] = education_score
        recommendations.extend(edu_recs)
        
        # 5. Contact Info Score (V2.0)
        contact_score, contact_recs = self._score_contact_info_v2(resume_lower)
        category_scores['contact'] = contact_score
        recommendations.extend(contact_recs)
        
        # V3.0: BERT Semantic Score
        bert_score = None
        if self.bert_embedder and self.bert_embedder.available:
            bert_score = self._calculate_bert_score(resume_text)
            category_scores['semantic_quality'] = bert_score
        
        # V3.1: Job Matching
        job_match_score = None
        skills_gap = None
        job_fit_details = None
        if job_description:
            job_fit_details = self._analyze_job_fit(
                resume_text, job_description
            )
            job_match_score = job_fit_details['score']
            skills_gap = job_fit_details['skills_gap']
            category_scores['job_match'] = job_match_score
            
            if skills_gap:
                recommendations.append(
                    f"Consider adding these skills: {', '.join(skills_gap[:5])}"
                )
        
        # V3.2: Visual Quality
        visual_score = None
        if file_path:
            visual_data = self.visual_analyzer.analyze_layout(file_path)
            visual_score = visual_data.get('visual_score', 0.7)
            category_scores['visual_quality'] = visual_score
            
            if visual_data.get('num_pages', 1) > 2:
                recommendations.append(
                    "Resume is longer than 2 pages. Consider condensing."
                )
        
        # Calculate Overall Score
        weights = {
            'keywords': 0.25,
            'formatting': 0.15,
            'experience': 0.20,
            'education': 0.15,
            'contact': 0.10,
            'job_match': 0.20 if job_match_score is not None else 0,
            'semantic_quality': 0.10 if bert_score is not None else 0,
            'visual_quality': 0.05 if visual_score is not None else 0
        }
        
        # Normalize weights
        total_weight = sum(weights.values())
        normalized_weights = {k: v/total_weight for k, v in weights.items()}
        
        overall_score = sum(
            category_scores.get(cat, 0) * weight 
            for cat, weight in normalized_weights.items()
        )

        confidence = self._estimate_confidence(
            resume_text=resume_text,
            category_scores=category_scores,
            section_analysis=section_analysis,
            job_description=job_description,
        )
        positive_factors = self._collect_positive_factors(
            category_scores=category_scores,
            section_analysis=section_analysis,
            matched_skills=(job_fit_details or {}).get('matched_skills'),
        )
        
        # Create scoring breakdown for transparency
        scoring_breakdown = {
            'weights_used': {k: round(v * 100, 2) for k, v in normalized_weights.items()},
            'category_scores': {k: round(v * 100, 2) for k, v in category_scores.items()},
            'overall_calculation': {
                'formula': 'weighted_sum_of_categories',
                'total_weight': round(total_weight, 2),
                'final_score': round(overall_score * 100, 2)
            },
            'features_used': {
                'bert_enabled': self.bert_embedder.available if self.bert_embedder else False,
                'visual_analysis': visual_score is not None,
                'job_matching': job_description is not None,
                'language_detection': language is not None
            },
            'confidence': confidence,
            'section_analysis': section_analysis,
            'matched_skills': (job_fit_details or {}).get('matched_skills', []),
            'required_skills': (job_fit_details or {}).get('required_skills', []),
            'job_fit_details': job_fit_details,
            'positive_factors': positive_factors,
            'language_confidence': round(lang_confidence * 100, 2),
        }
        
        recommendations = list(dict.fromkeys(rec for rec in recommendations if rec))

        return ATSScore(
            overall_score=round(overall_score * 100, 2),
            category_scores={k: round(v * 100, 2) for k, v in category_scores.items()},
            recommendations=recommendations,
            scoring_breakdown=scoring_breakdown,
            job_match_score=round(job_match_score * 100, 2) if job_match_score is not None else None,
            skills_gap=skills_gap,
            language=self.language_detector.get_language_name(language),
            visual_quality_score=round(visual_score * 100, 2) if visual_score is not None else None,
            bert_semantic_score=round(bert_score * 100, 2) if bert_score is not None else None,
            version=self.version
        )
    
    def _score_keywords(self, resume_lower: str) -> Tuple[float, List[str]]:
        """Score based on industry keywords"""
        recommendations = []
        scores = []
        
        # Technical skills
        tech_found = self._extract_keyword_matches(resume_lower, 'technical_skills')
        tech_score = min(len(tech_found) / 8, 1.0)
        scores.append(tech_score)
        
        if tech_score < 0.3:
            recommendations.append(
                "Add more technical skills relevant to your field"
            )
        
        # Soft skills
        soft_found = self._extract_keyword_matches(resume_lower, 'soft_skills')
        soft_score = min(len(soft_found) / 4, 1.0)
        scores.append(soft_score)
        
        if soft_score < 0.4:
            recommendations.append(
                "Include more soft skills (leadership, communication, etc.)"
            )
        
        # Action verbs
        action_found = self._count_action_verbs(resume_lower)
        action_score = min(len(action_found) / 6, 1.0)
        scores.append(action_score)
        
        if action_score < 0.5:
            recommendations.append(
                "Use more action verbs (developed, managed, led, etc.)"
            )
        
        return np.mean(scores), recommendations
    
    def _score_formatting(self, resume_text: str) -> Tuple[float, List[str]]:
        """Score resume formatting quality"""
        recommendations = []
        score = 0.5
        normalized_resume = self._normalize_text(resume_text)
        
        # Check length (optimal: 400-800 words)
        word_count = len(normalized_resume.split())
        if 400 <= word_count <= 800:
            score += 0.2
        elif word_count < 300:
            recommendations.append("Resume seems too short. Add more details.")
            score -= 0.1
        elif word_count > 1000:
            recommendations.append("Resume is quite long. Consider condensing.")
        
        # Check for sections
        section_groups = [
            ('experience', 'work experience', 'employment'),
            ('education', 'academics'),
            ('skills', 'technical skills', 'areas of expertise'),
            ('projects', 'project experience', 'academic projects'),
        ]
        sections_found = sum(
            1 for group in section_groups if any(term in normalized_resume.lower() for term in group)
        )
        score += (sections_found / len(section_groups)) * 0.2
        
        if sections_found < 2:
            recommendations.append(
                "Add clear sections: Experience, Education, Skills"
            )

        bullet_count = len(re.findall(r'(^|\n)\s*(?:-|•|\*)\s+', normalized_resume))
        if bullet_count >= 3:
            score += 0.1
        else:
            recommendations.append("Use bullet points for achievements to improve ATS readability.")
        
        return min(score, 1.0), recommendations
    
    def _score_experience(self, resume_lower: str) -> Tuple[float, List[str]]:
        """Score work experience section"""
        recommendations = []
        score = 0.3
        
        # Check for experience keywords
        exp_keywords = ['experience', 'work', 'employment', 'position', 'role']
        if any(kw in resume_lower for kw in exp_keywords):
            score += 0.3
        
        # Check for quantifiable achievements
        numbers = re.findall(r'\d+%|\$\d+|€\d+|\d+ years?', resume_lower)
        if numbers:
            score += min(len(numbers) / 5, 0.3)
        else:
            recommendations.append(
                "Add quantifiable achievements (percentages, numbers, metrics)"
            )
        
        # Check for job titles
        if re.search(r'(senior|junior|lead|manager|director|engineer|developer)', 
                    resume_lower):
            score += 0.1
        
        return min(score, 1.0), recommendations
    
    def _score_education(self, resume_lower: str) -> Tuple[float, List[str]]:
        """Score education section"""
        recommendations = []
        score = 0.4
        
        # Check for degree
        edu_found = sum(1 for kw in self.keywords['education'] 
                       if kw in resume_lower)
        score += min(edu_found / 3, 0.6)
        
        if edu_found == 0:
            recommendations.append(
                "Add education information (degree, university, graduation year)"
            )
        
        return min(score, 1.0), recommendations
    
    def _score_contact_info(self, resume_lower: str) -> Tuple[float, List[str]]:
        """Score contact information"""
        recommendations = []
        score = 0
        
        # Email
        if re.search(r'[\w\.-]+@[\w\.-]+\.\w+', resume_lower):
            score += 0.4
        else:
            recommendations.append("Add email address")
        
        # Phone
        if re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', resume_lower):
            score += 0.3
        else:
            recommendations.append("Add phone number")
        
        # LinkedIn/GitHub
        if 'linkedin' in resume_lower or 'github' in resume_lower:
            score += 0.3
        
        return min(score, 1.0), recommendations

    def _score_keywords_v2(self, resume_lower: str) -> Tuple[float, List[str]]:
        """Score keywords using synonym-aware matching."""
        recommendations = []
        scores = []

        tech_found = self._extract_keyword_matches(resume_lower, 'technical_skills')
        tech_score = min(len(tech_found) / 8, 1.0)
        scores.append(tech_score)
        if tech_score < 0.3:
            recommendations.append("Add more technical skills relevant to your field")

        soft_found = self._extract_keyword_matches(resume_lower, 'soft_skills')
        soft_score = min(len(soft_found) / 4, 1.0)
        scores.append(soft_score)
        if soft_score < 0.4:
            recommendations.append("Include more soft skills (leadership, communication, etc.)")

        action_found = self._count_action_verbs(resume_lower)
        action_score = min(len(action_found) / 6, 1.0)
        scores.append(action_score)
        if action_score < 0.5:
            recommendations.append("Use more action verbs (developed, managed, led, etc.)")

        return float(np.mean(scores)), recommendations

    def _score_formatting_v2(self, resume_text: str) -> Tuple[float, List[str]]:
        """Score formatting with stronger ATS readability heuristics."""
        recommendations = []
        score = 0.5
        normalized_resume = self._normalize_text(resume_text)

        word_count = len(normalized_resume.split())
        if 400 <= word_count <= 800:
            score += 0.2
        elif word_count < 300:
            recommendations.append("Resume seems too short. Add more details.")
            score -= 0.1
        elif word_count > 1000:
            recommendations.append("Resume is quite long. Consider condensing.")

        section_groups = [
            ('experience', 'work experience', 'employment'),
            ('education', 'academics'),
            ('skills', 'technical skills', 'areas of expertise'),
            ('projects', 'project experience', 'academic projects'),
        ]
        sections_found = sum(
            1 for group in section_groups if any(term in normalized_resume.lower() for term in group)
        )
        score += (sections_found / len(section_groups)) * 0.2
        if sections_found < 2:
            recommendations.append("Add clear sections: Experience, Education, Skills")

        bullet_count = len(re.findall(r'(^|\n)\s*(?:-|•|\*)\s+', normalized_resume))
        if bullet_count >= 3:
            score += 0.1
        else:
            recommendations.append("Use bullet points for achievements to improve ATS readability.")

        return min(score, 1.0), recommendations

    def _score_experience_v2(self, resume_lower: str) -> Tuple[float, List[str]]:
        """Score work experience with broader metric detection."""
        recommendations = []
        score = 0.3

        exp_keywords = ['experience', 'work', 'employment', 'position', 'role']
        if any(self._contains_term(resume_lower, kw) for kw in exp_keywords):
            score += 0.3

        numbers = re.findall(
            r'\b\d+(?:\.\d+)?\s*%|\$\s?\d+(?:,\d{3})*(?:\.\d+)?|₹\s?\d+(?:,\d{3})*(?:\.\d+)?|\b\d+\+?\s+years?\b|\b\d+\+?\s+(?:users|projects|clients|developers|engineers)\b',
            resume_lower,
        )
        if numbers:
            score += min(len(numbers) / 5, 0.3)
        else:
            recommendations.append("Add quantifiable achievements (percentages, numbers, metrics)")

        if re.search(r'(senior|junior|lead|manager|director|engineer|developer|intern)', resume_lower):
            score += 0.1

        if self._count_action_verbs(resume_lower):
            score += 0.1

        return min(score, 1.0), recommendations

    def _score_education_v2(self, resume_lower: str) -> Tuple[float, List[str]]:
        """Score education with year detection."""
        recommendations = []
        score = 0.4

        edu_found = sum(1 for kw in self.keywords['education'] if self._contains_term(resume_lower, kw))
        score += min(edu_found / 3, 0.5)
        if re.search(r'\b(19|20)\d{2}\b', resume_lower):
            score += 0.1

        if edu_found == 0:
            recommendations.append("Add education information (degree, university, graduation year)")

        return min(score, 1.0), recommendations

    def _score_contact_info_v2(self, resume_lower: str) -> Tuple[float, List[str]]:
        """Score contact information with international phone support."""
        recommendations = []
        score = 0

        if re.search(r'[\w\.-]+@[\w\.-]+\.\w+', resume_lower):
            score += 0.4
        else:
            recommendations.append("Add email address")

        phone_matches = re.findall(r'\+?\d[\d\-\.\s\(\)]{8,}\d', resume_lower)
        if any(len(re.sub(r'\D', '', match)) >= 10 for match in phone_matches):
            score += 0.3
        else:
            recommendations.append("Add phone number")

        if 'linkedin' in resume_lower or 'github' in resume_lower:
            score += 0.3

        return min(score, 1.0), recommendations

    def _match_job_description_v2(self, resume_text: str, job_description: str) -> Tuple[float, List[str]]:
        """Match resume against job description without inflated defaults."""
        details = self._analyze_job_fit(resume_text, job_description)
        return details['score'], details['skills_gap']
    
    def _calculate_bert_score(self, resume_text: str) -> float:
        """V3.0: Calculate BERT-based semantic quality score"""
        if not self.bert_embedder or not self.bert_embedder.available:
            return 0.7
        
        # Professional language benchmark
        professional_text = """
        Experienced software engineer with strong background in full-stack 
        development. Proficient in modern technologies and agile methodologies. 
        Proven track record of delivering high-quality solutions.
        """
        
        similarity = self.bert_embedder.semantic_similarity(
            resume_text[:500], professional_text
        )
        
        # Convert similarity to score (0.5-1.0 range)
        score = 0.5 + (similarity * 0.5)
        return min(max(score, 0), 1.0)
    
    def _match_job_description(self, resume_text: str, 
                               job_description: str) -> Tuple[float, List[str]]:
        """
        V3.1: Match resume against job description
        Returns match score and skills gap
        """
        
        resume_lower = resume_text.lower()
        job_lower = job_description.lower()
        
        # Extract skills from job description
        all_skills = (self.keywords['technical_skills'] + 
                     self.keywords['soft_skills'])
        
        required_skills = [skill for skill in all_skills if skill in job_lower]
        resume_skills = [skill for skill in all_skills if skill in resume_lower]
        
        # Calculate match
        if required_skills:
            matching_skills = set(required_skills) & set(resume_skills)
            match_score = len(matching_skills) / len(required_skills)
        else:
            match_score = 0.7  # Default if no specific skills found
        
        # Skills gap
        skills_gap = list(set(required_skills) - set(resume_skills))
        
        # BERT-based semantic similarity (if available)
        if self.bert_embedder and self.bert_embedder.available:
            bert_similarity = self.bert_embedder.semantic_similarity(
                resume_text[:500], job_description[:500]
            )
            # Combine TF-IDF and BERT scores
            match_score = (match_score * 0.6) + (bert_similarity * 0.4)
        
        return match_score, skills_gap


def main():
    """Demo the V4.0 scorer"""
    
    scorer = ATSScorerV4()
    
    # Sample resume
    sample_resume = """
    John Doe
    Email: john.doe@email.com | Phone: (555) 123-4567
    LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe
    
    PROFESSIONAL SUMMARY
    Experienced Software Engineer with 5+ years in full-stack development.
    Proficient in Python, JavaScript, React, and cloud technologies.
    
    EXPERIENCE
    Senior Software Engineer | Tech Corp | 2020-Present
    - Developed microservices architecture serving 1M+ users
    - Led team of 5 developers using Agile methodologies
    - Improved application performance by 40%
    - Implemented CI/CD pipelines reducing deployment time by 60%
    
    Software Engineer | StartupXYZ | 2018-2020
    - Built React-based dashboard increasing user engagement by 25%
    - Collaborated with cross-functional teams
    - Managed AWS infrastructure
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of Technology | 2018
    
    SKILLS
    Technical: Python, JavaScript, React, Node.js, AWS, Docker, SQL
    Soft Skills: Leadership, Communication, Problem Solving, Teamwork
    """
    
    sample_job = """
    We are looking for a Senior Software Engineer with:
    - 5+ years experience in Python and JavaScript
    - Strong knowledge of React and Node.js
    - Experience with AWS and cloud technologies
    - Leadership and team management skills
    - Excellent communication and problem-solving abilities
    """
    
    print("\n" + "="*60)
    print("ATS RESUME SCORER V4.0 - DEMO")
    print("="*60 + "\n")
    
    # Score the resume
    result = scorer.score_resume(
        resume_text=sample_resume,
        job_description=sample_job
    )
    
    print(f"Overall Score: {result.overall_score}/100")
    print(f"\nCategory Scores:")
    for category, score in result.category_scores.items():
        print(f"  {category.replace('_', ' ').title()}: {score}/100")
    
    if result.job_match_score:
        print(f"\nJob Match Score: {result.job_match_score}/100")
    
    if result.skills_gap:
        print(f"\nSkills Gap: {', '.join(result.skills_gap[:5])}")
    
    if result.language:
        print(f"\nLanguage: {result.language}")
    
    print(f"\nRecommendations:")
    for i, rec in enumerate(result.recommendations[:5], 1):
        print(f"  {i}. {rec}")
    
    print(f"\nScorer Version: {result.version}")
    print("="*60)


if __name__ == "__main__":
    main()
