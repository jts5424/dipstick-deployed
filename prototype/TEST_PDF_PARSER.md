# Testing the AI PDF Parser

## Step 1: Start the Backend Server

Open a terminal and run:
```bash
cd backend
npm start
```

Or for development with auto-reload:
```bash
cd backend
npm run dev
```

You should see:
```
Database initialized
Server running on port 5000
```

## Step 2: Test with curl (Command Line)

### Test 1: Check if server is running
```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"ok","message":"Dipstik API is running"}`

### Test 2: Upload a PDF file

Replace `path/to/your/carfax.pdf` with the actual path to your PDF file:

```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "make=Toyota" \
  -F "model=Camry" \
  -F "year=2018" \
  -F "mileage=75000" \
  -F "serviceHistory=@C:/path/to/your/carfax.pdf"
```

**Windows PowerShell:**
```powershell
curl.exe -X POST http://localhost:5000/api/analyze `
  -F "make=Toyota" `
  -F "model=Camry" `
  -F "year=2018" `
  -F "mileage=75000" `
  -F "serviceHistory=@C:\path\to\your\carfax.pdf"
```

**Windows CMD:**
```cmd
curl -X POST http://localhost:5000/api/analyze -F "make=Toyota" -F "model=Camry" -F "year=2018" -F "mileage=75000" -F "serviceHistory=@C:\path\to\your\carfax.pdf"
```

## Step 3: Test via Frontend (Easier)

1. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open browser**: http://localhost:3000

3. **Fill in the form**:
   - Make: e.g., "Toyota"
   - Model: e.g., "Camry"
   - Year: e.g., "2018"
   - Mileage: e.g., "75000"
   - Upload your Carfax PDF

4. **Click "Generate Reports"**

5. **Check the backend terminal** for logs:
   - If OpenAI key is set: `Using AI to parse PDF...`
   - If no key: `Using basic PDF parsing...`

## What to Expect

### With OpenAI API Key (AI Parsing):
- Structured service records with dates, mileage, descriptions
- Service types categorized
- Costs and locations extracted
- Better accuracy for Carfax reports

### Without OpenAI API Key (Basic Parsing):
- Basic text extraction
- Simple pattern matching
- May miss some records in complex formats like Carfax

## Troubleshooting

### "Failed to connect" error:
- Make sure backend server is running on port 5000
- Check: `curl http://localhost:5000/api/health`

### "OpenAI API key not configured":
- This is normal if you haven't set up the API key
- The system will use basic parsing instead
- To enable AI parsing, create `backend/.env` with your OpenAI key

### "Validation failed" error:
- Check that all fields are filled correctly
- Year must be between 1900 and current year + 1
- Mileage must be 0 or greater
- PDF file must be a valid PDF

