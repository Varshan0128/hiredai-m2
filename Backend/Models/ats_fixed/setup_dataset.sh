#!/bin/bash

# ATS Resume Scorer V4.0 - Dataset Integration Setup Script
# This script automates the setup process

set -e  # Exit on error

echo "======================================================================"
echo "  ATS Resume Scorer V4.0 - Dataset Integration Setup"
echo "======================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
echo -e "${BLUE}[1/6] Checking Python installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Python 3 is not installed. Please install Python 3.8+ and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python $(python3 --version) found${NC}"
echo ""

# Check if Node.js is installed
echo -e "${BLUE}[2/6] Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js 16+ and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version) found${NC}"
echo ""

# Install Python dependencies
echo -e "${BLUE}[3/6] Installing Python dependencies...${NC}"
cd backend
pip3 install -r requirements.txt --break-system-packages || pip3 install -r requirements.txt
cd ..
echo -e "${GREEN}✓ Python dependencies installed${NC}"
echo ""

# Check if dataset file exists
echo -e "${BLUE}[4/6] Verifying dataset file...${NC}"
if [ -f "backend/Peak_Accuracy_ATS_Dataset.xlsx" ]; then
    echo -e "${GREEN}✓ Dataset file found ($(ls -lh backend/Peak_Accuracy_ATS_Dataset.xlsx | awk '{print $5}'))${NC}"
else
    echo -e "${YELLOW}⚠ Dataset file not found at backend/Peak_Accuracy_ATS_Dataset.xlsx${NC}"
    echo -e "${YELLOW}  Please ensure the dataset file is in the correct location.${NC}"
fi
echo ""

# Replace frontend App.jsx with dataset version
echo -e "${BLUE}[5/6] Configuring frontend for dataset integration...${NC}"
if [ -f "frontend/src/App_with_dataset.jsx" ]; then
    cp frontend/src/App.jsx frontend/src/App_original.jsx
    cp frontend/src/App_with_dataset.jsx frontend/src/App.jsx
    echo -e "${GREEN}✓ Frontend configured (original backed up to App_original.jsx)${NC}"
else
    echo -e "${YELLOW}⚠ App_with_dataset.jsx not found, skipping...${NC}"
fi
echo ""

# Replace backend API with dataset version
echo -e "${BLUE}[6/6] Configuring backend for dataset integration...${NC}"
if [ -f "backend/api_with_dataset.py" ]; then
    cp backend/api.py backend/api_original.py
    cp backend/api_with_dataset.py backend/api.py
    echo -e "${GREEN}✓ Backend configured (original backed up to api_original.py)${NC}"
else
    echo -e "${YELLOW}⚠ api_with_dataset.py not found, skipping...${NC}"
fi
echo ""

echo "======================================================================"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo "======================================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend:"
echo -e "   ${BLUE}cd backend${NC}"
echo -e "   ${BLUE}python3 api.py${NC}"
echo ""
echo "2. In a new terminal, start the frontend:"
echo -e "   ${BLUE}cd frontend${NC}"
echo -e "   ${BLUE}npm install${NC}"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "3. Open your browser to http://${FRONTEND_HOST}:${FRONTEND_PORT}"
echo ""
echo "======================================================================"
echo -e "${GREEN}The system is now configured with job dataset integration!${NC}"
echo "Users can select from 1,197 jobs or enter job descriptions manually."
echo "======================================================================"
