# Resume Grammar Checker - Complete Full-Stack Application

A professional, production-ready grammar checking application for resumes with a beautiful web interface.

## 🌟 Features

### Backend (FastAPI)
- ✅ **RESTful API** with comprehensive endpoints
- ✅ **File Upload Support** (.txt, .pdf, .docx)
- ✅ **Direct Text Analysis** via JSON
- ✅ **CORS Enabled** for frontend integration
- ✅ **Automatic API Documentation** (Swagger & ReDoc)
- ✅ **Error Handling** with detailed messages
- ✅ **Health Check** endpoint for monitoring

### Frontend (HTML/CSS/JavaScript)
- ✅ **Modern, Responsive Design** works on all devices
- ✅ **Drag & Drop File Upload** 
- ✅ **Real-time Analysis** with loading indicators
- ✅ **Beautiful Results Display** with categorization
- ✅ **No Framework Dependencies** - pure vanilla JS
- ✅ **Professional UI/UX** with gradient design

### Grammar Checking Engine
- ✅ **100+ Technical Terms** automatically ignored
- ✅ **Smart Filtering** for proper nouns, URLs, emails
- ✅ **Resume-Specific** handling (bullets, formatting)
- ✅ **Thread-Safe** singleton pattern
- ✅ **Category-Based** error classification
- ✅ **Context-Aware** error detection

---

## 🚀 Quick Start

### 1. Installation

```bash
# Install all dependencies
pip install fastapi uvicorn python-multipart PyPDF2 python-docx language-tool-python

# Or use requirements file
pip install -r requirements.txt
```

### 2. Run the Application

```bash
# Start the server
python app.py

# Server will start on ${VITE_PYTHON_API_URL}
```

### 3. Open in Browser

```
${VITE_PYTHON_API_URL}
```

That's it! The application is now running.

---

## 📋 Requirements

Create a `requirements.txt` file:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
PyPDF2==3.0.1
python-docx==1.1.0
language-tool-python==2.8.1
```

---

## 🎯 Usage

### Web Interface

1. **Open** `${VITE_PYTHON_API_URL}` in your browser
2. **Choose** between "Paste Text" or "Upload File" tabs
3. **Enter/Upload** your resume
4. **Click** "Check Grammar"
5. **Review** the results with detailed suggestions

### API Usage

#### 1. Analyze Text (cURL)

```bash
curl -X POST "${VITE_PYTHON_API_URL}/api/analyze/text" \
  -H "Content-Type: application/json" \
  -d '{"text": "I has 5 years of experience with Python and React"}'
```

#### 2. Analyze File (cURL)

```bash
curl -X POST "${VITE_PYTHON_API_URL}/api/analyze/file" \
  -F "file=@/path/to/resume.pdf"
```

#### 3. Using Python requests

```python
import requests

# Analyze text
response = requests.post(
    "${VITE_PYTHON_API_URL}/api/analyze/text",
    json={"text": "Your resume text here"}
)
print(response.json())

# Analyze file
with open('resume.pdf', 'rb') as f:
    response = requests.post(
        "${VITE_PYTHON_API_URL}/api/analyze/file",
        files={'file': f}
    )
    print(response.json())
```

#### 4. Using JavaScript (fetch)

```javascript
// Analyze text
const response = await fetch('${VITE_PYTHON_API_URL}/api/analyze/text', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        text: 'Your resume text here'
    })
});

const data = await response.json();
console.log(data);

// Analyze file
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('${VITE_PYTHON_API_URL}/api/analyze/file', {
    method: 'POST',
    body: formData
});

const data = await response.json();
console.log(data);
```

---

## 📡 API Endpoints

### Frontend

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Web interface (HTML) |

### API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/analyze/text` | Analyze text |
| `POST` | `/api/analyze/file` | Analyze uploaded file |
| `GET` | `/api/categories` | Get error categories |
| `GET` | `/api/stats` | Get API statistics |
| `GET` | `/api/docs` | Swagger documentation |
| `GET` | `/api/redoc` | ReDoc documentation |

---

## 📊 Response Format

```json
{
    "success": true,
    "total_issues": 2,
    "has_errors": true,
    "category_summary": {
        "GRAMMAR": 1,
        "TYPOS": 1
    },
    "issues": [
        {
            "error": "has",
            "suggestion": "have",
            "reason": "Subject-verb agreement error",
            "category": "GRAMMAR",
            "rule_id": "HE_VERB_AGR",
            "offset": 2,
            "context": "I has experience with Python"
        },
        {
            "error": "experiance",
            "suggestion": "experience",
            "reason": "Possible spelling mistake",
            "category": "TYPOS",
            "rule_id": "MORFOLOGIK_RULE_EN_US",
            "offset": 20,
            "context": "5 years of experiance in development"
        }
    ],
    "message": "Analysis completed successfully"
}
```

---

## 🎨 Frontend Features

### Design Highlights

- **Gradient Background** - Beautiful purple gradient
- **Card-Based Layout** - Clean, modern cards
- **Tab Interface** - Easy switching between text/file upload
- **Drag & Drop** - Intuitive file upload
- **Real-time Feedback** - Loading spinners and progress
- **Color-Coded Results** - Green for success, organized by category
- **Responsive Design** - Works on mobile, tablet, desktop

### User Flow

1. **Landing** → Clean interface with two options
2. **Input** → Paste text OR upload file
3. **Processing** → Beautiful loading animation
4. **Results** → Comprehensive breakdown with stats
5. **Details** → Each error shown with context

---

## 🔧 Configuration

### Port Configuration

Change the port in `app.py`:

```python
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,  # Change this
        log_level="info"
    )
```

### File Size Limits

Modify in `app.py`:

```python
# Maximum file size (default: 10MB)
if len(content) > 10 * 1024 * 1024:  # Change multiplier
    raise HTTPException(...)

# Maximum text length (default: 50,000 chars)
if len(request.text) > 50000:  # Change limit
    raise HTTPException(...)
```

### CORS Configuration

For production, update CORS settings in `app.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📁 Project Structure

```
resume-grammar-checker/
│
├── app.py                  # Main application (FastAPI + Frontend)
├── grammar_checker.py      # Grammar checking engine
├── file_reader.py          # File reading utilities
├── requirements.txt        # Python dependencies
│
└── README.md              # This file
```

---

## 🧪 Testing

### Manual Testing

1. **Test Text Analysis**:
   - Open web interface
   - Paste: "I has experience with Python"
   - Should detect "has" → "have" error

2. **Test File Upload**:
   - Create a test .txt file with errors
   - Upload via drag-drop
   - Should display results

3. **Test API**:
   ```bash
   curl ${VITE_PYTHON_API_URL}/api/health
   # Should return: {"status": "healthy", ...}
   ```

### Automated Testing

Create `test_api.py`:

```python
import requests

def test_text_analysis():
    response = requests.post(
        "${VITE_PYTHON_API_URL}/api/analyze/text",
        json={"text": "I has experience"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data['success'] == True
    assert data['total_issues'] >= 1
    print("✅ Text analysis test passed")

def test_health():
    response = requests.get("${VITE_PYTHON_API_URL}/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'healthy'
    print("✅ Health check test passed")

if __name__ == "__main__":
    test_health()
    test_text_analysis()
    print("\n✅ All tests passed!")
```

Run: `python test_api.py`

---

## 🐛 Troubleshooting

### Issue: "Failed to initialize LanguageTool"

**Solution**: Ensure Java is installed

```bash
# Check Java
java -version

# Install if missing
# Ubuntu/Debian
sudo apt-get install default-jre

# macOS
brew install openjdk

# Windows
# Download from https://www.java.com/download/
```

### Issue: "ModuleNotFoundError"

**Solution**: Install missing dependencies

```bash
pip install -r requirements.txt
```

### Issue: "Port already in use"

**Solution**: Change port or kill existing process

```bash
# Find process on port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change port in app.py
```

### Issue: "File upload fails"

**Solution**: Check file format and size

- Supported: .txt, .pdf, .docx
- Max size: 10MB
- Ensure file is readable

### Issue: "Empty results for clean text"

**Solution**: This is correct behavior!

- If no errors found, results show "Perfect!"
- Green success message displayed

---

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**:
```python
import os

PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
```

2. **CORS Configuration**:
```python
allow_origins=["https://yourdomain.com"]  # Exact origin
```

3. **File Upload Limits**:
```python
# Add rate limiting
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/analyze/file")
@limiter.limit("5/minute")  # 5 requests per minute
async def analyze_file(...):
    ...
```

4. **HTTPS**:
   - Use reverse proxy (nginx)
   - Enable SSL/TLS certificates

5. **Process Management**:
```bash
# Using gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker

# Using systemd
# Create /etc/systemd/system/grammar-checker.service
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install Java (required for LanguageTool)
RUN apt-get update && \
    apt-get install -y default-jre && \
    apt-get clean

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["python", "app.py"]
```

Build and run:

```bash
docker build -t grammar-checker .
docker run -p 8000:8000 grammar-checker
```

---

## 📝 License

MIT License - feel free to use in your projects!

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- [ ] Add support for more languages
- [ ] Implement user authentication
- [ ] Add resume templates
- [ ] Include ATS scoring (separate from grammar)
- [ ] Add batch processing
- [ ] Implement caching
- [ ] Add rate limiting

---

## 📞 Support

Having issues? Check:

1. **Documentation** - BEST_PRACTICES.md
2. **API Docs** - ${VITE_PYTHON_API_URL}/api/docs
3. **Examples** - test_examples.py

---

## ✨ Credits

Built with:
- [FastAPI](https://fastapi.tiangolo.com/) - Modern web framework
- [LanguageTool](https://languagetool.org/) - Grammar checking
- [PyPDF2](https://pypdf2.readthedocs.io/) - PDF reading
- [python-docx](https://python-docx.readthedocs.io/) - Word documents

---

**Made with ❤️ for job seekers everywhere**
