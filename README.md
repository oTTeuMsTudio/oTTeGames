# oTTeGames

Full-screen index of Unreal Engine 5.8 blueprint nodes, blueprint groups, and visual-scripting node references. Names link to the official explanations on the Epic Developer Community. The top menu is generated from the documentation sections on [Unreal Engine 5.8 Documentation](https://dev.epicgames.com/documentation/unreal-engine).

The Next.js app lives in `web/`. Refresh the index with:

```bash
node web/scripts/fetch-ue-index.mjs
```

That writes `web/public/ue-nodes.json`, `web/src/data/ue-menu.json`, and `web/src/data/ue-meta.json`.

## Local

```bash
cd web
npm install
npm run dev
```

## Deploy

Live: https://ottegames.vercel.app

Vercel project root is `web`. GitHub repo: https://github.com/oTTeuMsTudio/oTTeGames
