<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1QTkiKAtYl2knxI0rWEm8CaU4_GwvUoez

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend API (in-memory demo server)

- Start the API server: `npm run server` (defaults to http://localhost:4000)
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (Bearer token)
- Actions: list/filter `GET /api/actions`, detail `GET /api/actions/:id`, create `POST /api/actions`, update `PUT /api/actions/:id`
- Join: `POST /api/actions/:id/join` validates tags, resource description, capacity, and assigns constellation `pointIndex`
- Interactions & interests: `POST /api/actions/:id/interact`, `GET /api/users/me/interested`
- Comments & replies: `POST /api/actions/:id/comments`, `POST /api/comments/:commentId/reply` (supports multipart image upload)
- Uploads & outcomes: `POST /api/upload`, manage outcomes via `POST|PUT|DELETE /api/actions/:id/outcomes`
