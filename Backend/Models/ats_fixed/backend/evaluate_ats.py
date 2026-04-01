import json
from pathlib import Path

from ats_ai_model_v4 import ATSScorerV4


def main():
    scorer = ATSScorerV4()
    cases_path = Path(__file__).with_name("evaluation_cases.json")
    cases = json.loads(cases_path.read_text(encoding="utf-8"))

    passed = 0
    results = []

    for case in cases:
        result = scorer.score_resume(
            resume_text=case["resume_text"],
            job_description=case.get("job_description"),
        )

        checks = []
        if "expected_min_score" in case:
            checks.append(result.overall_score >= case["expected_min_score"])
        if "expected_max_score" in case:
            checks.append(result.overall_score <= case["expected_max_score"])
        if "expected_min_job_match" in case and result.job_match_score is not None:
            checks.append(result.job_match_score >= case["expected_min_job_match"])
        if "expected_max_job_match" in case and result.job_match_score is not None:
            checks.append(result.job_match_score <= case["expected_max_job_match"])
        for skill in case.get("expected_absent_skill_gaps", []):
            checks.append(skill not in (result.skills_gap or []))

        case_passed = all(checks) if checks else True
        passed += 1 if case_passed else 0
        results.append(
            {
                "name": case["name"],
                "passed": case_passed,
                "overall_score": result.overall_score,
                "job_match_score": result.job_match_score,
                "skills_gap": result.skills_gap or [],
            }
        )

    print(json.dumps(
        {
            "total_cases": len(cases),
            "passed_cases": passed,
            "pass_rate": round((passed / len(cases)) * 100, 2) if cases else 0.0,
            "results": results,
        },
        indent=2,
    ))


if __name__ == "__main__":
    main()
