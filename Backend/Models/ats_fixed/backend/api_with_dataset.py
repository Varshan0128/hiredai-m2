"""
ATS Resume Scorer V4.0 - REST API with Job Dataset Integration
Flask backend with job selection from Peak Accuracy dataset

NEW FEATURES:
- Load jobs from Excel dataset (1,197 jobs)
- Filter jobs by category, experience level
- Search jobs by keyword
- Auto-populate job description from selected job
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
import pandas as pd
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

# In-memory storage for analysis history
analysis_history = []

# Load Job Dataset
DATASET_PATH = os.path.join(os.path.dirname(__file__), 'Peak_Accuracy_ATS_Dataset.xlsx')
jobs_df = None

def load_job_dataset():
    """Load job dataset from Excel file"""
    global jobs_df
    try:
        jobs_df = pd.read_excel(DATASET_PATH)
        print(f"✅ Loaded {len(jobs_df)} jobs from dataset")
        print(f"   Categories: {jobs_df['Category'].nunique()}")
        print(f"   Experience Levels: {jobs_df['Experience Level'].nunique()}")
        return True
    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        return False

# Load dataset on startup
load_job_dataset()


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '4.0-DATASET',
        'timestamp': datetime.now().isoformat(),
        'features': {
            'bert': scorer.bert_embedder.available if scorer.bert_embedder else False,
            'language_detection': True,
            'visual_analysis': True,
            'job_matching': True,
            'scoring_transparency': True,
            'job_dataset': jobs_df is not None,
            'total_jobs': len(jobs_df) if jobs_df is not None else 0
        },
        'dataset_info': {
            'loaded': jobs_df is not None,
            'total_jobs': len(jobs_df) if jobs_df is not None else 0,
            'categories': jobs_df['Category'].nunique() if jobs_df is not None else 0,
            'experience_levels': jobs_df['Experience Level'].nunique() if jobs_df is not None else 0
        }
    }), 200


@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    """
    Get list of jobs from dataset with optional filtering
    
    Query params:
        - category: Filter by category (optional)
        - experience_level: Filter by experience level (optional)
        - search: Search in job title and description (optional)
        - limit: Number of jobs to return (default: 100, max: 500)
    """
    
    if jobs_df is None:
        return jsonify({'error': 'Job dataset not loaded'}), 500
    
    try:
        # Start with all jobs
        filtered_df = jobs_df.copy()
        
        # Apply filters
        category = request.args.get('category')
        if category:
            filtered_df = filtered_df[filtered_df['Category'] == category]
        
        experience_level = request.args.get('experience_level')
        if experience_level:
            filtered_df = filtered_df[filtered_df['Experience Level'] == experience_level]
        
        search = request.args.get('search', '').strip()
        if search:
            search_lower = search.lower()
            filtered_df = filtered_df[
                filtered_df['Job Title'].str.lower().str.contains(search_lower, na=False) |
                filtered_df['Description'].str.lower().str.contains(search_lower, na=False) |
                filtered_df['Category'].str.lower().str.contains(search_lower, na=False)
            ]
        
        # Apply limit
        limit = request.args.get('limit', 100, type=int)
        limit = min(limit, 500)  # Max 500 jobs
        
        filtered_df = filtered_df.head(limit)
        
        # Convert to list of dicts
        jobs = filtered_df.to_dict('records')
        
        return jsonify({
            'success': True,
            'total': len(filtered_df),
            'total_in_dataset': len(jobs_df),
            'jobs': jobs
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error fetching jobs: {str(e)}'}), 500


@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id: int):
    """Get specific job by ID"""
    
    if jobs_df is None:
        return jsonify({'error': 'Job dataset not loaded'}), 500
    
    try:
        job = jobs_df[jobs_df['ID'] == job_id]
        
        if len(job) == 0:
            return jsonify({'error': 'Job not found'}), 404
        
        job_data = job.iloc[0].to_dict()
        
        return jsonify({
            'success': True,
            'job': job_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error fetching job: {str(e)}'}), 500


@app.route('/api/jobs/filters', methods=['GET'])
def get_job_filters():
    """Get available filter options from dataset"""
    
    if jobs_df is None:
        return jsonify({'error': 'Job dataset not loaded'}), 500
    
    try:
        return jsonify({
            'success': True,
            'categories': sorted(jobs_df['Category'].dropna().unique().tolist()),
            'experience_levels': sorted(jobs_df['Experience Level'].dropna().unique().tolist()),
            'sub_categories': sorted(jobs_df['Sub Category'].dropna().unique().tolist())
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error fetching filters: {str(e)}'}), 500


@app.route('/api/score', methods=['POST'])
def score_resume():
    """
    Score a resume with optional job description or job ID
    
    Request:
        - file: Resume file (PDF, TXT, DOCX, or image)
        - job_description: (optional) Job description text
        - job_id: (optional) Job ID from dataset
    
    Note: If job_id is provided, it takes precedence over job_description
    
    Response:
        - overall_score: Overall ATS score
        - category_scores: Breakdown by category
        - recommendations: List of improvement suggestions
        - job_match_score: Match score if job description provided
        - skills_gap: Missing skills if job description provided
        - scoring_breakdown: Transparency into scoring
        - job_info: Job details if job_id was used
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
        
        # Get job description - either from job_id or manual input
        job_description = None
        job_info = None
        
        job_id = request.form.get('job_id')
        if job_id and jobs_df is not None:
            try:
                job_id = int(job_id)
                job = jobs_df[jobs_df['ID'] == job_id]
                
                if len(job) > 0:
                    job_data = job.iloc[0]
                    
                    # Build comprehensive job description from dataset
                    job_description = f"""
Job Title: {job_data['Job Title']}

Description:
{job_data['Description']}

Required IT Skills:
{job_data['IT Skills']}

Required Soft Skills:
{job_data['Soft Skills']}

Education Requirements:
{job_data['Education']}

Experience Requirements:
{job_data['Experience']}

Category: {job_data['Category']}
Experience Level: {job_data['Experience Level']}
"""
                    
                    job_info = {
                        'id': int(job_data['ID']),
                        'title': job_data['Job Title'],
                        'category': job_data['Category'],
                        'experience_level': job_data['Experience Level'],
                        'it_skills': job_data['IT Skills'],
                        'soft_skills': job_data['Soft Skills']
                    }
                    
            except (ValueError, KeyError) as e:
                print(f"Error processing job_id: {e}")
        
        # If no job_id or job not found, use manual job description
        if not job_description:
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
            'has_job_match': job_description is not None,
            'job_id': job_id if job_id else None
        }
        analysis_history.append(analysis_record)
        
        # Clean up
        os.remove(filepath)
        
        # Return results
        response_data = {
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
            'scoring_breakdown': result.scoring_breakdown
        }
        
        # Add job info if job was selected from dataset
        if job_info:
            response_data['job_info'] = job_info
        
        return jsonify(response_data), 200
        
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
        - job_id: (optional) Job ID from dataset
    
    Response: Same as /api/score
    """
    
    try:
        data = request.get_json()
        
        if not data or 'resume_text' not in data:
            return jsonify({'error': 'No resume text provided'}), 400
        
        resume_text = data['resume_text']
        
        if len(resume_text.strip()) < 50:
            return jsonify({'error': 'Resume text too short. Please provide at least 50 characters.'}), 400
        
        # Get job description - either from job_id or manual input
        job_description = None
        job_info = None
        
        job_id = data.get('job_id')
        if job_id and jobs_df is not None:
            try:
                job_id = int(job_id)
                job = jobs_df[jobs_df['ID'] == job_id]
                
                if len(job) > 0:
                    job_data = job.iloc[0]
                    
                    # Build comprehensive job description from dataset
                    job_description = f"""
Job Title: {job_data['Job Title']}

Description:
{job_data['Description']}

Required IT Skills:
{job_data['IT Skills']}

Required Soft Skills:
{job_data['Soft Skills']}

Education Requirements:
{job_data['Education']}

Experience Requirements:
{job_data['Experience']}

Category: {job_data['Category']}
Experience Level: {job_data['Experience Level']}
"""
                    
                    job_info = {
                        'id': int(job_data['ID']),
                        'title': job_data['Job Title'],
                        'category': job_data['Category'],
                        'experience_level': job_data['Experience Level'],
                        'it_skills': job_data['IT Skills'],
                        'soft_skills': job_data['Soft Skills']
                    }
                    
            except (ValueError, KeyError) as e:
                print(f"Error processing job_id: {e}")
        
        # If no job_id or job not found, use manual job description
        if not job_description:
            job_description = data.get('job_description', None)
        
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
            'has_job_match': job_description is not None,
            'job_id': job_id if job_id else None
        }
        analysis_history.append(analysis_record)
        
        response_data = {
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
            'scoring_breakdown': result.scoring_breakdown
        }
        
        if job_info:
            response_data['job_info'] = job_info
        
        return jsonify(response_data), 200
        
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
        - job_id: (optional) Job ID from dataset for all
    
    Response:
        - results: Array of scoring results
    """
    
    try:
        files = request.files.getlist('files[]')
        
        if not files or len(files) == 0:
            return jsonify({'error': 'No files provided'}), 400
        
        if len(files) > 20:
            return jsonify({'error': 'Maximum 20 files allowed'}), 400
        
        # Get job description
        job_description = None
        job_info = None
        
        job_id = request.form.get('job_id')
        if job_id and jobs_df is not None:
            try:
                job_id = int(job_id)
                job = jobs_df[jobs_df['ID'] == job_id]
                
                if len(job) > 0:
                    job_data = job.iloc[0]
                    job_description = f"""
Job Title: {job_data['Job Title']}
Description: {job_data['Description']}
Required IT Skills: {job_data['IT Skills']}
Required Soft Skills: {job_data['Soft Skills']}
Education: {job_data['Education']}
Experience: {job_data['Experience']}
"""
                    job_info = {
                        'id': int(job_data['ID']),
                        'title': job_data['Job Title']
                    }
            except Exception as e:
                print(f"Error processing job_id: {e}")
        
        if not job_description:
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
                            'scoring_breakdown': result.scoring_breakdown
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
        
        response = {
            'success': True,
            'total_processed': len(results),
            'results': results
        }
        
        if job_info:
            response['job_info'] = job_info
        
        return jsonify(response), 200
        
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
        - job_id: (optional) Job ID from dataset
    """
    
    try:
        if 'file1' not in request.files or 'file2' not in request.files:
            return jsonify({'error': 'Two files required'}), 400
        
        file1 = request.files['file1']
        file2 = request.files['file2']
        
        # Get job description
        job_description = None
        job_id = request.form.get('job_id')
        
        if job_id and jobs_df is not None:
            try:
                job = jobs_df[jobs_df['ID'] == int(job_id)]
                if len(job) > 0:
                    job_data = job.iloc[0]
                    job_description = f"{job_data['Description']}\n\nRequired Skills: {job_data['IT Skills']}\nSoft Skills: {job_data['Soft Skills']}"
            except Exception as e:
                print(f"Error processing job_id: {e}")
        
        if not job_description:
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
                'scoring_breakdown': result.scoring_breakdown
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
    print("ATS Resume Scorer V4.0 - WITH JOB DATASET - API Server")
    print("="*60)
    print(f"Server starting on {ATS_API_URL}")
    
    if jobs_df is not None:
        print(f"\n✅ Job Dataset Loaded:")
        print(f"   Total Jobs: {len(jobs_df)}")
        print(f"   Categories: {jobs_df['Category'].nunique()}")
        print(f"   Experience Levels: {jobs_df['Experience Level'].nunique()}")
    else:
        print("\n❌ Job Dataset NOT loaded - check Peak_Accuracy_ATS_Dataset.xlsx")
    
    print("\n📋 New Endpoints:")
    print("   GET  /api/jobs - Get list of jobs with filters")
    print("   GET  /api/jobs/<id> - Get specific job")
    print("   GET  /api/jobs/filters - Get filter options")
    print("   POST /api/score - Now accepts job_id parameter")
    print("="*60 + "\n")
    
    app.run(host=ATS_BIND_HOST, port=ATS_BIND_PORT, debug=True)
