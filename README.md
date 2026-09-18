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

Live: https://ottegames.vercel.app

Vercel project root is `web`. GitHub repo: https://github.com/oTTeuMsTudio/oTTeGames

oTTe Bot uses SpaceXAI (`grok-4.6`). Set `XAI_API_KEY` in Vercel project env (or `web/.env.local`) so the right-hand chat can reply.
