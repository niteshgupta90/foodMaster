# FoodMaster

React/Vite frontend and Express/MongoDB backend for discovering dishes and restaurant-specific reviews.

## Run locally

Use two Terminal windows. Both packages include a project-local Node 24 development runtime; npm scripts use it without changing system Node. Install dependencies with `npm ci` in each folder when setting up a fresh checkout.

```sh
cd ~/Desktop/foodRatingApp/backend
npm start
```

```sh
cd ~/Desktop/foodRatingApp/frontend
npm start
```

Open http://localhost:3000. The API listens on http://localhost:5001/api. The API root has no homepage.

The existing `backend/.env` contains the Atlas connection and JWT signing secret. Keep it private. The frontend's development environment uses `http://localhost:5001`. Production frontend configuration remains separate.

If a resumed Atlas cluster still has a stale DNS result locally, use this process-only override:

```sh
LOCAL_DNS_SERVERS=1.1.1.1,8.8.8.8 npm start
```

This sends DNS queries to the listed resolvers for that backend process; it doesn't change macOS settings.

**Local development currently uses the original Atlas database.** Adding dishes, restaurants, or reviews through the UI writes to that database. Use a separate database for destructive or automated write tests. Application startup disables automatic index changes on Atlas.

Uploaded photos are served from `backend/uploads`. Legacy hosted upload URLs are mapped to the configured backend by the frontend. A cloud deployment needs persistent upload storage.

## Validation

```sh
cd backend
npm test
cd ../frontend
npm test
npm run build
```

Backend tests stub database methods and do not connect to Atlas. Frontend tests mock API calls. Test JWT secrets are isolated from application credentials.

## Data and behavior

- Dish search, restaurant, city, distance, price, dietary, rating, and sort options combine and persist through pagination.
- Legacy singular and plural restaurant references are both supported.
- Displayed dish averages and counts are computed from reviews without rewriting legacy cached fields.
- Missing cuisine and dietary metadata is not inferred; confirm ingredients with restaurants.
- Authenticated review creation uses the same validation and summary update path for both review endpoints.
- Admin privileges cannot be requested through public registration. Signed-in community users can add dishes and reviews. Restaurant creation and the admin dashboard are restricted to administrator accounts.
- Unsupported deletion controls have been removed; a recoverable deletion workflow is not implemented.

Existing deployment addresses: https://food-master-blush.vercel.app and https://foodmaster-zwim.onrender.com. This review changes the local checkout only.

The frontend uses Vite and Vitest; JSX sources use `.jsx` extensions. `REACT_APP_` environment variables remain supported. Production output stays in `frontend/build`. Only public client variables should use this prefix.

## Accounts and password recovery

- `/forgot-password`: requests an email reset link. Until SMTP is configured, it explicitly reports that reset email is unavailable.
- `/reset-password`: accepts a single-use token in the URL fragment and lets the account owner choose a new password.
- `/profile`: signed-in users can edit display name, city, dietary preference and bio, or change their password using the current password. Email, username and admin role cannot be changed through this form.
- New passwords require at least 12 characters and no more than 72 UTF-8 bytes. Existing shorter passwords continue to work until changed.
- Reset tokens are random, stored only as hashes, expire after 15 minutes, and are consumed atomically. A password reset or change increments the account's session version, rejecting older JWTs.

For a trusted, local reset without email, run from `backend`:

```sh
LOCAL_DNS_SERVERS=1.1.1.1,8.8.8.8 npm run reset-link -- account@example.com
```

This prints a private localhost reset URL and stores its hash/expiry on the selected account. It does not change the password. Keep the link private and have the account owner enter and submit the new password. There is no HTTP endpoint that reveals these links.

For email delivery later, configure these variables in `backend/.env` or your deployment secret manager, then restart the backend:

```dotenv
FRONTEND_URL=https://your-frontend.example
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=FoodMaster <your-verified-sender@example.com>
```

Only use a verified sender address. Set `FRONTEND_URL=http://localhost:3000` during local development. SMTP is required to use TLS. Never put SMTP credentials in frontend environment variables. Email delivery is not tested until a real provider is configured. Current recovery rate limits are per-process; use a shared store when deploying multiple backend instances.
