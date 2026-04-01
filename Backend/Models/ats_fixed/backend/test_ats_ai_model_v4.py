import tempfile
import unittest
import zipfile
from pathlib import Path

import ats_ai_model_v4 as ats_module


class ATSScorerV4Tests(unittest.TestCase):
    def setUp(self):
        self.original_bert_available = ats_module.BERT_AVAILABLE
        ats_module.BERT_AVAILABLE = False

    def tearDown(self):
        ats_module.BERT_AVAILABLE = self.original_bert_available

    def test_job_match_is_included_in_overall_score(self):
        scorer = ats_module.ATSScorerV4()
        scorer._score_keywords_v2 = lambda _: (0.8, [])
        scorer._score_formatting_v2 = lambda _: (0.6, [])
        scorer._score_experience_v2 = lambda _: (0.4, [])
        scorer._score_education_v2 = lambda _: (0.7, [])
        scorer._score_contact_info_v2 = lambda _: (1.0, [])
        scorer._analyze_job_fit = lambda resume, jd: {
            "score": 0.5,
            "skills_gap": ["aws"],
            "matched_skills": ["python"],
            "required_skills": ["python", "aws"],
        }

        result = scorer.score_resume(
            resume_text=(
                "Jane Doe\n"
                "jane@example.com\n"
                "(555) 111-2222\n"
                "Python developer with leadership and delivery experience."
            ),
            job_description="Senior Python developer with AWS experience",
        )

        raw_score = (
            (0.8 * 0.25)
            + (0.6 * 0.15)
            + (0.4 * 0.20)
            + (0.7 * 0.15)
            + (1.0 * 0.10)
            + (0.5 * 0.20)
        )
        expected_overall = round((raw_score / 1.05) * 100, 2)

        self.assertEqual(result.job_match_score, 50.0)
        self.assertAlmostEqual(result.overall_score, expected_overall, places=2)
        self.assertIn("job_match", result.scoring_breakdown["weights_used"])
        self.assertEqual(result.scoring_breakdown["weights_used"]["job_match"], 19.05)

    def test_extract_text_from_docx_reads_document_xml(self):
        scorer = ats_module.ATSScorerV4()

        with tempfile.TemporaryDirectory() as temp_dir:
            docx_path = Path(temp_dir) / "resume.docx"
            self._write_minimal_docx(
                docx_path,
                ["Jane Doe", "Python Developer", "Built ATS-friendly resumes"],
            )

            extracted_text = scorer.extract_text(str(docx_path))

        self.assertIn("Jane Doe", extracted_text)
        self.assertIn("Python Developer", extracted_text)
        self.assertIn("Built ATS-friendly resumes", extracted_text)

    def test_job_match_recognizes_skill_synonyms_and_normalizes_text(self):
        scorer = ats_module.ATSScorerV4()

        score, skills_gap = scorer._match_job_description_v2(
            "Built APIs with JS, Node.js, K8s, GitHub and CI CD pipelines â€¢ led deployments",
            "Seeking a JavaScript developer with Node, Kubernetes, Git, and CI/CD experience",
        )

        self.assertGreaterEqual(score, 0.8)
        self.assertEqual(skills_gap, [])

    def test_generic_job_description_does_not_default_to_high_match(self):
        scorer = ats_module.ATSScorerV4()

        score, skills_gap = scorer._match_job_description_v2(
            "Retail cashier with customer support and billing experience",
            "Seeking a backend platform engineer to build distributed systems and APIs",
        )

        self.assertLess(score, 0.4)
        self.assertEqual(skills_gap, [])

    def test_contact_info_supports_international_phone_numbers(self):
        scorer = ats_module.ATSScorerV4()

        score, recommendations = scorer._score_contact_info_v2(
            "ankit@example.com +91 98765 43210 linkedin.com/in/ankit"
        )

        self.assertEqual(score, 1.0)
        self.assertEqual(recommendations, [])

    def test_score_resume_exposes_section_analysis_and_confidence(self):
        scorer = ats_module.ATSScorerV4()

        result = scorer.score_resume(
            resume_text=(
                "Priya Sharma\n"
                "priya@example.com\n"
                "+91 98765 43210\n\n"
                "Summary\nBackend engineer focused on Python APIs and cloud systems.\n\n"
                "Skills\nPython, AWS, Docker, Kubernetes, SQL\n\n"
                "Experience\nBuilt internal APIs, improved latency by 35 percent, and deployed services on AWS.\n\n"
                "Education\nB.Tech in Computer Science\n"
            ),
            job_description="Need a backend Python engineer with AWS and Kubernetes experience",
        )

        breakdown = result.scoring_breakdown
        self.assertIn("section_analysis", breakdown)
        self.assertIn("confidence", breakdown)
        self.assertIn("job_fit_details", breakdown)
        self.assertGreater(breakdown["confidence"]["score"], 0)
        self.assertTrue(breakdown["section_analysis"]["experience"]["present"])
        self.assertIn("python", [skill.lower() for skill in breakdown["matched_skills"]])

    @staticmethod
    def _write_minimal_docx(path: Path, paragraphs):
        content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
"""
        relationships = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"""
        paragraph_xml = "".join(
            f"<w:p><w:r><w:t>{text}</w:t></w:r></w:p>" for text in paragraphs
        )
        document = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {paragraph_xml}
  </w:body>
</w:document>
"""

        with zipfile.ZipFile(path, "w") as archive:
            archive.writestr("[Content_Types].xml", content_types)
            archive.writestr("_rels/.rels", relationships)
            archive.writestr("word/document.xml", document)


if __name__ == "__main__":
    unittest.main()
