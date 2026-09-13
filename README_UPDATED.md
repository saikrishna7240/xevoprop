# Xevoprop Updated Full-Stack Build

This package consolidates the Xevoprop enquiry system around `property_enquiries`, fixes authentication, and adds database-backed favorites, projects, search, profile and notifications.

## Important security note
The original ZIP contained real backend credentials in `backend/.env`. That file is intentionally NOT included in this updated ZIP. Copy `backend/.env.example` to `backend/.env` and fill in your own values.

## Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
```
On Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

## Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
On Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

Set `VITE_API_URL` to the deployed backend API URL for production.

## Database migration
The backend automatically creates the canonical tables on startup. It also safely copies rows from the old `enquiries` table into `property_enquiries` when possible. No manual DROP is performed.

Canonical tables used by the updated app:
- users
- properties
- property_images
- property_visits
- property_enquiries
- enquiry_messages
- favorites
- projects
- notifications

## Main fixes/features
- JWT returned on registration
- AuthContext stores token and user id consistently
- Buyer -> property -> enquiry -> My Enquiries -> Chat flow uses one enquiry table
- Buyer/Seller enquiry chat authorization uses numeric ID comparison
- Enquiry status: new/contacted/resolved
- Database-backed favorites
- Database-backed developer projects with create/edit/view/delete
- PostgreSQL-backed property search
- Database-backed profile editing
- Activity notifications from enquiries, visits and chat messages
- Seller leads use real enquiry API
- Protected buyer/seller/developer routes
- `/api/health` endpoint
- Cloudinary upload base path standardized to `/api/upload`

## Current limitations intentionally left for the next hardening pass
- Real-time chat uses polling rather than WebSockets
- Visit scheduling is retained from the existing project
- Property/project cover image upload for developer projects remains URL-based
- Existing UI CSS is retained; functional changes are prioritized
- Production deployment still needs environment-specific frontend/backend URLs and final smoke testing
