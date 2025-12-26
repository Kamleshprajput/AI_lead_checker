# Lead Analysis Application

A full-stack application for analyzing product inquiries using AI. The frontend is built with React + Vite, and the backend is built with Express + TypeScript.

## Features

- **AI-Powered Lead Analysis**: Analyzes product inquiries to determine intent, urgency, friction points, and recommended actions
- **Smart Caching**: Minimizes API calls by caching analysis results for 1 hour
- **Human Review Dashboard**: Dashboard for reviewing leads that require human attention
- **Real-time Analysis**: Instant AI analysis with confidence scoring

## Project Structure

```
.
├── backend/          # Express + TypeScript backend
│   ├── src/
│   │   ├── ai/      # AI analysis chains and prompts
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── server.ts
│   └── package.json
├── frontend/         # React + Vite frontend
│   ├── src/
│   │   └── app/
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key (for AI analysis)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   PORT=4000
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Build the TypeScript code:
   ```bash
   npm run build
   ```

5. Start the backend server:
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

The backend will run on `http://localhost:4000` (or the port specified in `.env`).

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory (optional, defaults to `http://localhost:4000`):
   ```env
   VITE_API_URL=http://localhost:4000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`.

5. Build for production:
   ```bash
   npm run build
   ```

The production build will be in the `frontend/dist` directory.

## API Caching

The application implements intelligent caching to minimize API calls:

- **Cache Duration**: 1 hour (3600 seconds)
- **Cache Key**: Based on normalized message content
- **Storage**: Browser localStorage
- **Automatic Cleanup**: Old cache entries are automatically removed when storage is full

Duplicate inquiries with the same message content will use cached results instead of making new API calls.

## Deployment

### Backend Deployment

1. Set environment variables on your hosting platform:
   - `PORT` (default: 4000)
   - `OPENAI_API_KEY` (required)

2. Build the backend:
   ```bash
   npm run build
   ```

3. Start the server:
   ```bash
   npm start
   ```

### Frontend Deployment

1. Set the `VITE_API_URL` environment variable to your backend URL

2. Build the frontend:
   ```bash
   npm run build
   ```

3. Deploy the `dist` folder to your static hosting service (Vercel, Netlify, etc.)

### Environment Variables

**Backend (.env)**:
- `PORT`: Server port (default: 4000)
- `OPENAI_API_KEY`: Your OpenAI API key (required)

**Frontend (.env)**:
- `VITE_API_URL`: Backend API URL (default: http://localhost:4000)

## API Endpoints

### POST `/api/leads`

Analyzes a lead inquiry.

**Request Body**:
```json
{
  "message": "I need pricing for 1000 units of material X",
  "source": "web_form",
  "contact": "user@example.com"
}
```

**Response**:
```json
{
  "analysis": {
    "intent": "Pricing Information Request",
    "urgency": "medium",
    "primary_friction": "budget_uncertainty",
    "lead_half_life_minutes": 120,
    "confidence": 0.85
  },
  "friction_action": "share_price_range",
  "decay_priority": "HIGH",
  "human_required": false
}
```

### GET `/health`

Health check endpoint. Returns "OK" if the server is running.

## Development

### Running Both Services

1. Start the backend in one terminal:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend in another terminal:
   ```bash
   cd frontend
   npm run dev
   ```

The Vite dev server is configured to proxy API requests to the backend.

## Troubleshooting

### Backend not connecting

- Ensure the backend is running on the correct port
- Check that `OPENAI_API_KEY` is set correctly
- Verify CORS is enabled (already configured in `server.ts`)

### Frontend API errors

- Check that `VITE_API_URL` matches your backend URL
- Ensure the backend is running and accessible
- Check browser console for detailed error messages

### Cache issues

- Clear browser localStorage if you need to reset the cache
- Cache is automatically cleaned up when storage is full

## License

ISC

