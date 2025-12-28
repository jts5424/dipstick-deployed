# Dipstik

Dipstik is a web-based platform that provides users with used car negotiation leverage techniques. The main functionality is to build an upcoming service summary including routine and typical unscheduled items, cost, likelihood, and background info.

## Quick Start

**IMPORTANT: Always run from the project root directory. Both servers must run together.**

1. Install all dependencies:
   ```bash
   npm run install:all
   ```

2. Run the application:
   ```bash
   npm run dev
   ```

3. Open your browser to: http://localhost:3000

See `START_SERVERS.md` for detailed instructions.

## Features

The two main features:
1. Immediately due work package based on comparing the service history records to a recommended routine maintenance schedule.
2. Unscheduled maintenance forecast report based on service history records, mileage and typical unscheduled maintenance drivers.

## Project Structure

- `backend/` - Express.js API server
- `frontend/` - React + Vite application
- Run both from the root directory using `npm run dev` or `npm start`






