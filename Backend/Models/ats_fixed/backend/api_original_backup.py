"""
ATS Resume Scorer V4.0 - REST API (FIXED)
Flask backend with complete API endpoints

✅ FIXED BUGS:
- Returns scoring transparency in responses
- Better error messages
- Improved file handling
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
from typing import Dict, List
import tempfile
import shutil
from pathlib import Path
from dotenv import load_dotenv

from ats_ai_model_v4 import ATSScorerV4, ATSScore

# Load the workspace-level .env (walk up from this file path).
for _parent in Path(__file__).resolve().parents:
    _env_file = _parent / ".env"
    if _env_file.exists():
        load_dotenv(_env_file, override=False)
        break


def _to_int(value: str, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


ATS_API_URL = (os.getenv("ATS_API_URL") or "http://localhost:5000").rstrip("/")
ATS_BIND_HOST = os.getenv("ATS_BIND_HOST") or os.getenv("ATS_HOST") or "0.0.0.0"
ATS_BIND_PORT = _to_int(os.getenv("ATS_PORT"), 5000)
FRONTEND_URL = os.getenv("VITE_FRONTEND_URL") or os.getenv("FRONTEND_URL")
ALLOWED_ORIGINS = [origin for origin in [FRONTEND_URL, "http://localhost:3000", "http://${FRONTEND_HOST}:${FRONTEND_PORT}"] if origin and "${" not in origin]

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})  # Enable CORS for frontend

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()
ALLOWED_EXTENSIONS = {'pdf', 'txt', 'doc', 'docx', 'png', 'jpg', 'jpeg'}

# Initialize AI Model
scorer = ATSScorerV4()

# In-memory storage for analysis history (use database in production)
analysis_history = []


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '4.0-FIXED',
        'timestamp': datetime.now().isoformat(),
        'features': {
            'bert': scorer.bert_embedder.available if scorer.bert_embedder else False,
            'language_detection': True,
            'visual_analysis': True,
            'job_matching': True,
            'scoring_transparency': True  # ✅ NEW
        },
        'bug_fixes': [
            'Case-insensitive skill matching',
            'Proper scoring formula with industry weights',
            'Full transparency in scoring decisions',
            'Handles all text formatting variations',
            'Terminology variation support'
        ]
    }), 200


@app.route('/api/score', methods=['POST'])
def score_resume():
    """
    Score a resume with optional job description
    
    Request:
        - file: Resume file (PDF, TXT, DOCX, or image)
        - job_description: (optional) Job description text
    
    Response:
        - overall_score: Overall ATS score
        - category_scores: Breakdown by category
        - recommendations: List of improvement suggestions
        - job_match_score: Match score if job description provided
        - skills_gap: Missing skills if job description provided
        - scoring_breakdown: ✅ NEW - Transparency into scoring
    """
    
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'error': f'File type not allowed. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract text from file
        resume_text = scorer.extract_text(filepath)
        
        if not resume_text or len(resume_text.strip()) < 50:
            os.remove(filepath)
            return jsonify({
                'error': 'Could not extract sufficient text from file. Please ensure the file contains readable text.'
            }), 400
        
        # Get optional job description
        job_description = request.form.get('job_description', None)
        
        # Score the resume
        result = scorer.score_resume(
            resume_text=resume_text,
            job_description=job_description,
            file_path=filepath
        )
        
        # Save to history
        analysis_record = {
            'id': len(analysis_history) + 1,
            'filename': filename,
            'timestamp': datetime.now().isoformat(),
            'score': result.overall_score,
            'has_job_match': job_description is not None
        }
        analysis_history.append(analysis_record)
        
        # Clean up
        os.remove(filepath)
        
        # Return results with ✅ NEW transparency data
        return jsonify({
            'success': True,
            'analysis_id': analysis_record['id'],
            'overall_score': result.overall_score,
            'category_scores': result.category_scores,
            'recommendations': result.recommendations,
            'job_match_score': result.job_match_score,
            'skills_gap': result.skills_gap,
            'language': result.language,
            'visual_quality_score': result.visual_quality_score,
            'bert_semantic_score': result.bert_semantic_score,
            'version': result.version,
            'timestamp': analysis_record['timestamp'],
            'scoring_breakdown': result.scoring_breakdown  # ✅ NEW: Transparency
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error: {traceback.format_exc()}")
        return jsonify({
            'error': f'Error processing resume: {str(e)}'
        }), 500


@app.route('/api/score/text', methods=['POST'])
def score_text():
    """
    Score resume from plain text (no file upload)
    
    Request JSON:
        - resume_text: Resume content as text
        - job_description: (optional) Job description text
    
    Response: Same as /api/score
    """
    
    try:
        data = request.get_json()
        
        if not data or 'resume_text' not in data:
            return jsonify({'error': 'No resume text provided'}), 400
        
        resume_text = data['resume_text']
        job_description = data.get('job_description', None)
        
        if len(resume_text.strip()) < 50:
            return jsonify({'error': 'Resume text too short. Please provide at least 50 characters.'}), 400
        
        # Score the resume
        result = scorer.score_resume(
            resume_text=resume_text,
            job_description=job_description
        )
        
        # Save to history
        analysis_record = {
            'id': len(analysis_history) + 1,
            'filename': 'text_input',
            'timestamp': datetime.now().isoformat(),
            'score': result.overall_score,
            'has_job_match': job_description is not None
        }
        analysis_history.append(analysis_record)
        
        return jsonify({
            'success': True,
            'analysis_id': analysis_record['id'],
            'overall_score': result.overall_score,
            'category_scores': result.category_scores,
            'recommendations': result.recommendations,
            'job_match_score': result.job_match_score,
            'skills_gap': result.skills_gap,
            'language': result.language,
            'bert_semantic_score': result.bert_semantic_score,
            'version': result.version,
            'timestamp': analysis_record['timestamp'],
            'scoring_breakdown': result.scoring_breakdown  # ✅ NEW: Transparency
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error: {traceback.format_exc()}")
        return jsonify({
            'error': f'Error processing text: {str(e)}'
        }), 500


@app.route('/api/batch', methods=['POST'])
def batch_score():
    """
    Score multiple resumes at once
    
    Request:
        - files[]: Multiple resume files
        - job_description: (optional) Single job description for all
    
    Response:
        - results: Array of scoring results
    """
    
    try:
        files = request.files.getlist('files[]')
        
        if not files or len(files) == 0:
            return jsonify({'error': 'No files provided'}), 400
        
        if len(files) > 20:
            return jsonify({'error': 'Maximum 20 files allowed'}), 400
        
        job_description = request.form.get('job_description', None)
        results = []
        
        for file in files:
            if file and allowed_file(file.filename):
                try:
                    # Save and process each file
                    filename = secure_filename(file.filename)
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(filepath)
                    
                    resume_text = scorer.extract_text(filepath)
                    
                    if resume_text and len(resume_text.strip()) >= 50:
                        result = scorer.score_resume(
                            resume_text=resume_text,
                            job_description=job_description,
                            file_path=filepath
                        )
                        
                        results.append({
                            'filename': filename,
                            'success': True,
                            'overall_score': result.overall_score,
                            'category_scores': result.category_scores,
                            'job_match_score': result.job_match_score,
                            'scoring_breakdown': result.scoring_breakdown  # ✅ NEW
                        })
                    else:
                        results.append({
                            'filename': filename,
                            'success': False,
                            'error': 'Could not extract text'
                        })
                    
                    os.remove(filepath)
                    
                except Exception as e:
                    results.append({
                        'filename': file.filename,
                        'success': False,
                        'error': str(e)
                    })
        
        return jsonify({
            'success': True,
            'total_processed': len(results),
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Batch processing error: {str(e)}'
        }), 500


@app.route('/api/history', methods=['GET'])
def get_history():
    """
    Get analysis history
    
    Query params:
        - limit: Number of records to return (default: 50)
    """
    
    limit = request.args.get('limit', 50, type=int)
    limit = min(limit, 100)  # Max 100 records
    
    return jsonify({
        'success': True,
        'total': len(analysis_history),
        'history': analysis_history[-limit:][::-1]  # Most recent first
    }), 200


@app.route('/api/history/<int:analysis_id>', methods=['GET'])
def get_analysis(analysis_id: int):
    """Get specific analysis by ID"""
    
    analysis = next(
        (a for a in analysis_history if a['id'] == analysis_id), 
        None
    )
    
    if not analysis:
        return jsonify({'error': 'Analysis not found'}), 404
    
    return jsonify({
        'success': True,
        'analysis': analysis
    }), 200


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get aggregate statistics"""
    
    if not analysis_history:
        return jsonify({
            'success': True,
            'total_analyses': 0,
            'average_score': 0,
            'score_distribution': {}
        }), 200
    
    scores = [a['score'] for a in analysis_history]
    
    # Score distribution
    distribution = {
        'excellent': len([s for s in scores if s >= 80]),
        'good': len([s for s in scores if 60 <= s < 80]),
        'fair': len([s for s in scores if 40 <= s < 60]),
        'needs_improvement': len([s for s in scores if s < 40])
    }
    
    return jsonify({
        'success': True,
        'total_analyses': len(analysis_history),
        'average_score': sum(scores) / len(scores),
        'highest_score': max(scores),
        'lowest_score': min(scores),
        'score_distribution': distribution,
        'with_job_matching': len([a for a in analysis_history if a['has_job_match']])
    }), 200


@app.route('/api/compare', methods=['POST'])
def compare_resumes():
    """
    Compare two resumes side-by-side
    
    Request:
        - file1: First resume
        - file2: Second resume
        - job_description: (optional) Job description
    """
    
    try:
        if 'file1' not in request.files or 'file2' not in request.files:
            return jsonify({'error': 'Two files required'}), 400
        
        file1 = request.files['file1']
        file2 = request.files['file2']
        job_description = request.form.get('job_description', None)
        
        results = []
        
        for file in [file1, file2]:
            if not allowed_file(file.filename):
                return jsonify({'error': f'Invalid file type: {file.filename}'}), 400
            
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            resume_text = scorer.extract_text(filepath)
            result = scorer.score_resume(
                resume_text=resume_text,
                job_description=job_description,
                file_path=filepath
            )
            
            results.append({
                'filename': filename,
                'overall_score': result.overall_score,
                'category_scores': result.category_scores,
                'job_match_score': result.job_match_score,
                'recommendations': result.recommendations,
                'scoring_breakdown': result.scoring_breakdown  # ✅ NEW
            })
            
            os.remove(filepath)
        
        # Calculate comparison insights
        score_diff = results[0]['overall_score'] - results[1]['overall_score']
        winner = 0 if score_diff > 0 else 1
        
        return jsonify({
            'success': True,
            'resume1': results[0],
            'resume2': results[1],
            'comparison': {
                'score_difference': abs(score_diff),
                'higher_scoring': results[winner]['filename'],
                'winner_index': winner
            }
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error: {traceback.format_exc()}")
        return jsonify({
            'error': f'Comparison error: {str(e)}'
        }), 500


@app.route('/api/keywords', methods=['GET'])
def get_keywords():
    """Get list of tracked keywords by category"""
    return jsonify({
        'success': True,
        'keywords': getattr(scorer, 'keywords', {}),
        'skill_synonyms': getattr(scorer, 'skill_synonyms', {})
    }), 200


@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large error"""
    return jsonify({
        'error': 'File too large. Maximum size is 16MB.'
    }), 413


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("ATS Resume Scorer V4.0 - FIXED - API Server")
    print("="*60)
    print(f"Server starting on {ATS_API_URL}")
    print(f"API Documentation: {ATS_API_URL}/api/health")
    print("\n✅ Bug Fixes Applied:")
    print("   - Case-insensitive skill matching")
    print("   - Proper scoring formula with industry weights")
    print("   - Full transparency in scoring decisions")
    print("   - Handles all text formatting variations")
    print("   - Terminology variation support (JS=JavaScript, etc.)")
    print("="*60 + "\n")
    
    app.run(host=ATS_BIND_HOST, port=ATS_BIND_PORT, debug=True)
