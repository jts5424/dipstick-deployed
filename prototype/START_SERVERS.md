# How to Run Dipstik

## Prerequisites
- Node.js installed (v18 or higher)
- All dependencies installed (run `npm run install:all` from root if needed)

## Running the Application

**IMPORTANT: Always run from the project root directory. Both servers must run together.**

1. Open a terminal/command prompt
2. Navigate to the project root:
   ```bash
   cd C:\Users\jts54\OneDrive\Desktop\Dipstik
   ```
3. Run both servers together:
   ```bash
   npm run dev
   ```
   Or for production mode:
   ```bash
   npm start
   ```
4. You should see output from both servers:
   - Backend: "Database initialized" and "Server running on port 5000"
   - Frontend: "Local: http://localhost:3000/" (or similar)
5. **Keep this terminal open** - both servers need to keep running

## Step 2: Access the Application

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to: **http://localhost:3000**
3. You should see the Dipstik interface with:
   - A header saying "Dipstik - Used Car Negotiation Leverage Platform"
   - A form to enter vehicle information (Make, Model, Year, Mileage)
   - A file upload field for the service history PDF
   - A "Generate Reports" button

## Step 3: Test the Application

1. Fill in the vehicle form:
   - **Make**: e.g., "Toyota"
   - **Model**: e.g., "Camry"
   - **Year**: e.g., "2018"
   - **Current Mileage**: e.g., "75000"
2. Upload a service history PDF (if you have one, or you can test with any PDF for now)
3. Click "Generate Reports"
4. The application will process the data and display reports (note: the AI integration needs to be configured for full functionality)

## Troubleshooting

### Application won't start:
- Make sure you're in the **root directory** (not in `backend` or `frontend`)
- Verify all dependencies are installed: `npm run install:all`
- Make sure ports 5000 (backend) and 3000 (frontend) are not already in use

### Can't connect to backend:
- Make sure the backend server is running in the first terminal
- Check that you see "Server running on port 5000" message
- Try accessing http://localhost:5000/api/health in your browser - you should see a JSON response

### Frontend shows errors:
- Make sure both servers are running
- Check the browser console (F12) for error messages
- Verify the backend is accessible at http://localhost:5000

## Stopping the Servers

- In each terminal, press **Ctrl + C** to stop the server
- Stop the backend first, then the frontend

