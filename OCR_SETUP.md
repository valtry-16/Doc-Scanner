# OCR Setup Instructions

## Requirements

To use the OCR feature, you need to install two external dependencies:

### 1. Tesseract OCR

**Windows:**
- Download the installer from: https://github.com/UB-Mannheim/tesseract/wiki
- Run the installer and follow the setup wizard
- During installation, note the installation path (usually `C:\Program Files\Tesseract-OCR`)
- Add Tesseract to your PATH:
  1. Open System Properties → Environment Variables
  2. Edit the `Path` variable
  3. Add: `C:\Program Files\Tesseract-OCR` (or your installation path)
  4. Restart your terminal/IDE

**Verify Installation:**
```powershell
tesseract --version
```

### 2. Poppler (Required for PDF OCR only)

**Windows:**
- Download the latest release from: https://github.com/oschwartz10612/poppler-windows/releases
- Extract the ZIP file to a location (e.g., `C:\Program Files\poppler`)
- Add Poppler to your PATH:
  1. Open System Properties → Environment Variables
  2. Edit the `Path` variable
  3. Add: `C:\Program Files\poppler\Library\bin` (or your extraction path)
  4. Restart your terminal/IDE

**Verify Installation:**
```powershell
pdfinfo -v
```

## Feature Support

| Feature | Tesseract Only | Tesseract + Poppler |
|---------|---------------|---------------------|
| Image OCR (PNG, JPG, WebP) | ✅ Supported | ✅ Supported |
| PDF OCR | ❌ Not available | ✅ Supported |

## Troubleshooting

### "Tesseract OCR is not installed"
- Ensure Tesseract is installed and added to PATH
- Restart your backend server after installation
- Try running `tesseract --version` in terminal

### "Unable to get page count. Is poppler installed and in PATH?"
- This error appears when trying to OCR PDFs without Poppler installed
- **Workaround:** Use image files (PNG, JPG, WebP) for OCR
- **Solution:** Install Poppler following the instructions above

### Environment Variables Not Taking Effect
- Close all terminal windows and IDE
- Reopen and try again
- Verify PATH by running: `$env:Path` (PowerShell) or `echo %PATH%` (CMD)

## Alternative: Use Images for OCR

If you don't want to install Poppler, you can:
1. Convert your PDFs to images first (using the Convert feature or external tools)
2. Then perform OCR on the images
3. This works without Poppler installation!
