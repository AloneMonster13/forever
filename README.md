# Forever Us 💖

Proposal page → runaway "No" button → date planner (Thudugala Ella first, then Gold Restaurant) → "You are mine" finale with love notes. Saves to MongoDB.

## Deploy on Vercel
1. Push this folder to GitHub, import it in Vercel (Framework preset: **Other**, no build command).
2. Vercel → Project → Settings → Environment Variables:
   - `MONGODB_URI` = your Atlas connection string
   - `MONGODB_DB` = `forever_us` (optional, this is the default)
3. MongoDB Atlas → Network Access → add `0.0.0.0/0` (Vercel IPs change).
4. Deploy.

The `forever_us` database and its `bookings` + `comments` collections are created automatically on the first save.

## Files
- `public/index.html` – the whole site (UI, animations, generated romantic music)
- `api/booking.js` – POST, saves the date (server also enforces waterfall-first order)
- `api/comments.js` – GET / POST love notes
- `lib/mongo.js` – shared MongoDB connection
