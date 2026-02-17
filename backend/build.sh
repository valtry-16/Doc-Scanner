#!/bin/bash

# Install system dependencies for PDF processing and OCR
apt-get update
apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    libpoppler-cpp-dev

# Install Python dependencies
pip install -r requirements.txt
