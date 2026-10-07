# oTTeGames

Game center for the oTTeGames studio: store, library, an in-app AI concierge, and the Adventure Artist Blueprint Book.

The book lives at `/book`. Its left menu is generated from `web/src/data/blueprint-book.json` (parts, chapters, and one page per Blueprint). The PDF is `web/public/books/adventure-artist-blueprint-book.pdf`. Regenerate the catalog with `web/scripts/build_book_catalog.py` after a fresh editor dump.

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
