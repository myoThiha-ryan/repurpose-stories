# Repurpose Stories

A Next.js web app that lets you upload a video and automatically post it to **Instagram Stories** and **Facebook Stories** via the Meta Graph API.

## Features

- Drag-and-drop video upload (MP4, MOV, WebM — up to 250MB)
- Post to Instagram Stories and/or Facebook Stories in one click
- OAuth 2.0 connection flow with Facebook (long-lived tokens)
- Upload history with real-time status tracking
- Connect / disconnect accounts from the UI

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Meta Graph API** (Facebook & Instagram)
- File-based storage (JSON) for tokens and history

## Prerequisites

- Node.js >= 20.9.0
- A [Facebook Developer App](https://developers.facebook.com) with:
  - **Facebook Login** product added
  - **Instagram Graph API** product added
  - A Facebook Page linked to an Instagram Business/Creator account
- A publicly accessible URL for local development (e.g. [ngrok](https://ngrok.com))

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/repurpose-stories.git
cd repurpose-stories
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Must be a public URL — Facebook/Instagram need to fetch the uploaded video
NEXT_PUBLIC_BASE_URL=https://your-ngrok-url.ngrok.io
```

### 3. Set up your Facebook App

1. Go to [developers.facebook.com](https://developers.facebook.com) → **My Apps** → **Create App**
2. Choose **Business** type
3. Add products: **Facebook Login** and **Instagram Graph API**
4. Under **Facebook Login → Settings**, add to **Valid OAuth Redirect URIs**:
   ```
   https://your-ngrok-url.ngrok.io/api/auth/facebook/callback
   ```
5. Copy your **App ID** and **App Secret** from **App Settings → Basic**

### 4. Run the dev server

```bash
# In one terminal — expose localhost via ngrok
ngrok http 3000

# In another terminal
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Navigate to `/connect` and click **Connect with Facebook**
2. Authorize the required permissions
3. Go back to the home page, upload a video, select platforms, and click **Post to Stories**

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/upload` | Upload a video file |
| `POST` | `/api/post-story` | Post to Instagram/Facebook Stories |
| `GET` | `/api/status/[id]` | Get status of a specific upload |
| `GET` | `/api/history` | Get all upload history |
| `GET` | `/api/auth/status` | Check connection status |
| `GET` | `/api/auth/facebook` | Initiate Facebook OAuth |
| `GET` | `/api/auth/facebook/callback` | OAuth callback handler |
| `POST` | `/api/auth/disconnect` | Disconnect accounts |

## Required Permissions

| Permission | Purpose |
|------------|---------|
| `instagram_basic` | Read Instagram account info |
| `instagram_content_publish` | Post to Instagram Stories |
| `pages_show_list` | List managed Facebook Pages |
| `pages_read_engagement` | Read page details |
| `pages_manage_posts` | Post to Facebook Stories |

> **Note:** For testing, these permissions work without Meta App Review as long as you use the app as its admin/developer account. Publishing to other users' accounts requires Meta App Review approval.

## Project Structure

```
app/
  page.tsx                    # Main upload UI
  connect/page.tsx            # Account connection page
  api/
    upload/route.ts           # Video upload endpoint
    post-story/route.ts       # Story posting endpoint
    history/route.ts          # Upload history
    status/[id]/route.ts      # Status check
    auth/
      status/route.ts         # Auth status
      disconnect/route.ts     # Disconnect accounts
      facebook/route.ts       # OAuth initiate
      facebook/callback/      # OAuth callback

components/ui/
  VideoUploader.tsx           # Drag-and-drop video picker
  PlatformSelector.tsx        # Platform toggle checkboxes
  StatusBadge.tsx             # Animated status pill
  UploadHistory.tsx           # Recent posts list

lib/
  facebook.ts                 # Facebook Graph API helpers
  instagram.ts                # Instagram Graph API helpers
  storage.ts                  # File-based token & history storage

types/
  index.ts                    # Shared TypeScript types

data/                         # Auto-created at runtime
  tokens.json                 # Stored access tokens
  history.json                # Upload history records

public/uploads/               # Uploaded video files (served statically)
```

## License

MIT
