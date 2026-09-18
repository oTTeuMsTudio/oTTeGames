# oTTeGames

Game center for the oTTeGames studio: store, library, and an in-app AI concierge.

The Next.js app lives in `web/`. The Unreal Windows package in `Packaged/` stays local and is not committed.

## Local

```bash
cd web
cp .env.example .env.local
# set XAI_API_KEY for oTTe Bot
npm install
npm run dev
```

## Deploy

Vercel project root is `web`. Production deploys from the GitHub repo `oTTeuMsTudio/oTTeGames`.
