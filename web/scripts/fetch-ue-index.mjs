import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "src", "data");
const CACHE_PATH = path.join(process.env.TEMP || "/tmp", "otte-ue-index-cache.json");

const DOC_ORIGIN = "https://dev.epicgames.com";
const DOC_BASE = `${DOC_ORIGIN}/documentation/unreal-engine/`;
const INDEX_URL = `${DOC_BASE}BlueprintAPI`;
const NODE_REF_URL = `${DOC_BASE}node-reference`;
const HOME_URL = `${DOC_BASE}unreal-engine-5-8-documentation`;

const CONCURRENCY = 1;
const MAX_PAGES = 20000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const VERB =
  /^(get|set|add|is|has|make|break|find|spawn|destroy|create|enable|disable|apply|remove|update|clear|convert|calculate|draw|export|import|load|save|play|stop|pause|toggle|can|should|was|were|begin|end|reset|show|hide|open|close|attach|detach|print|delay|cast|call|execute|bind|unbind|register|unregister|notify|broadcast|listen|send|receive|flush|invalidate|refresh|rebuild|init|initialize|shutdown|start|finish|complete|abort|cancel|request|query|select|deselect|validate|check|debug|format|parse|multiply|divide|subtract|append|insert|contains|equal|delete|rename|move|evaluate|simulate|activate|deactivate)$/i;

const SECTIONS = [
  ["What's New", `${DOC_BASE}whats-new`],
  ["Understanding the Basics", `${DOC_BASE}understanding-the-basics-of-unreal-engine`],
  ["Working with Content", `${DOC_BASE}working-with-content-in-unreal-engine`],
  ["Building Virtual Worlds", `${DOC_BASE}building-virtual-worlds-in-unreal-engine`],
  ["Designing Visuals, Rendering, and Graphics", `${DOC_BASE}designing-visuals-rendering-and-graphics-with-unreal-engine`],
  ["AI Features, Tools, and Plugins", `${DOC_BASE}ai-features-tools-and-plugins-in-unreal-engine`],
  ["Creating Visual Effects", `${DOC_BASE}creating-visual-effects-in-niagara-for-unreal-engine`],
  ["Gameplay Tutorials", `${DOC_BASE}gameplay-tutorials-for-unreal-engine`],
  ["Blueprints Visual Scripting", `${DOC_BASE}blueprints-visual-scripting-in-unreal-engine`],
  ["Programming with C++", `${DOC_BASE}programming-with-cplusplus-in-unreal-engine`],
  ["Gameplay Systems", `${DOC_BASE}gameplay-systems-in-unreal-engine`],
  ["Mobile Development", `${DOC_BASE}getting-started-with-mobile-development-in-unreal-engine`],
  ["Animating Characters and Objects", `${DOC_BASE}animating-characters-and-objects-in-unreal-engine`],
  ["Motion Design", `${DOC_BASE}motion-design-in-unreal-engine`],
  ["Creating User Interfaces", `${DOC_BASE}creating-user-interfaces-with-umg-and-slate-in-unreal-engine`],
  ["Working with Audio", `${DOC_BASE}working-with-audio-in-unreal-engine`],
  ["Working with Media", `${DOC_BASE}working-with-media-in-unreal-engine`],
  ["Setting Up Your Production Pipeline", `${DOC_BASE}setting-up-your-production-pipeline-in-unreal-engine`],
  ["Testing and Optimizing Your Content", `${DOC_BASE}testing-and-optimizing-your-content`],
  ["Sharing and Releasing Projects", `${DOC_BASE}sharing-and-releasing-projects-for-unreal-engine`],
  ["Samples and Tutorials", `${DOC_BASE}samples-and-tutorials-for-unreal-engine`],
];

function decode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function canonical(href) {
  if (!href) return "";
  let url = decode(href).split("#")[0].split("?")[0];
  if (url.startsWith("/")) url = `${DOC_ORIGIN}${url}`;
  if (url.endsWith("/")) url = url.slice(0, -1);
  return url;
}

function docPath(href) {
  const url = canonical(href);
  const marker = "/documentation/unreal-engine/";
  const index = url.indexOf(marker);
  if (index === -1) return url;
  return url.slice(index + marker.length);
}

function extractDirItems(html) {
  const items = [];
  const seen = new Set();
  const re = /<block-dir-item-md\s+([^>]+)>/g;
  let match;
  while ((match = re.exec(html))) {
    const attrs = match[1];
    const href = canonical(attrs.match(/href="([^"]+)"/)?.[1] || "");
    const name = decode(attrs.match(/page-name="([^"]+)"/)?.[1] || "").trim();
    const type = attrs.match(/type="([^"]+)"/)?.[1] || "";
    if (!href || !name || seen.has(href)) continue;
    seen.add(href);
    items.push({ name, href, type });
  }
  return items;
}

function looksLikeFolder(name) {
  const clean = name.replace(/\.\.\.$/, "").replace(/\s+/g, " ").trim();
  const words = clean.split(" ").filter(Boolean);
  if (words.length === 0 || words.length > 4) return false;
  return !words.some((word) => VERB.test(word.replace(/[^a-z]/gi, "")));
}

function extractReferenceNodes(html, pageHref, pageTitle) {
  const rows = [];
  const article = html.match(/<article[\s\S]*?<\/article>/)?.[0] || html;
  const chunks = article.split(/<h3\b[^>]*>/i).slice(1);
  for (const chunk of chunks) {
    const title = decode(chunk.match(/^([^<]+)/)?.[1] || pageTitle).trim();
    const table = chunk.match(/<table[\s\S]*?<\/table>/i)?.[0] || "";
    const trs = [...table.matchAll(/<tr[\s\S]*?<\/tr>/gi)];
    for (const tr of trs) {
      const cells = [...tr[0].matchAll(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi)].map((cell) =>
        decode(cell[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()),
      );
      const nodeName = cells[0];
      if (!nodeName || /^node$/i.test(nodeName)) continue;
      rows.push({
        k: "r",
        g: `${pageTitle} / ${title}`,
        n: nodeName,
        p: docPath(pageHref),
      });
    }
  }
  return rows;
}

function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return new Map();
  const raw = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  return new Map(Object.entries(raw));
}

function saveCache(cache) {
  const obj = Object.fromEntries(cache);
  fs.writeFileSync(CACHE_PATH, JSON.stringify(obj));
}

function requestOnce(url, redirectsLeft) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": UA,
          Accept: "text/html",
        },
      },
      (res) => {
        const status = res.statusCode || 0;
        if (status >= 300 && status < 400 && res.headers.location && redirectsLeft > 0) {
          res.resume();
          resolve(requestOnce(new URL(res.headers.location, url).href, redirectsLeft - 1));
          return;
        }
        if (status !== 200) {
          res.resume();
          reject(new Error(`${status} ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error(`timeout ${url}`)));
  });
}

let blockedSince = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url) {
  let otherFailures = 0;
  for (;;) {
    if (blockedSince && Date.now() - blockedSince > 20 * 60 * 1000) {
      throw new Error(`Epic docs stayed blocked for 20 minutes (${url})`);
    }
    try {
      const html = await requestOnce(url, 4);
      blockedSince = 0;
      await sleep(900);
      return html;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.startsWith("429") || message.startsWith("503") || message.includes("timeout")) {
        if (!blockedSince) blockedSince = Date.now();
        console.log(`waiting 45s after ${message.split(" ")[0]} (${url})`);
        await sleep(45000);
        continue;
      }
      otherFailures += 1;
      if (otherFailures > 2) throw error;
      await sleep(1500);
    }
  }
}

async function pool(items, worker) {
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, () => run()));
}

async function crawlBlueprint(cache) {
  const rows = [];
  const seenRows = new Set();
  const queued = new Set();
  const failures = [];

  function addRow(row) {
    const key = `${row.k}|${row.g}|${row.n}|${row.p}`;
    if (seenRows.has(key)) return;
    seenRows.add(key);
    rows.push(row);
  }

  const localIndex = path.join(process.env.TEMP || "", "bpapi.html");
  const indexHtml = fs.existsSync(localIndex)
    ? fs.readFileSync(localIndex, "utf8")
    : await fetchText(INDEX_URL);
  if (fs.existsSync(localIndex)) console.log("using saved blueprint index");
  const roots = extractDirItems(indexHtml).filter((item) => item.href.includes("/BlueprintAPI/"));
  console.log(`blueprint index entries: ${roots.length}`);

  const queue = roots.map((item) => ({
    href: item.href,
    name: item.name,
    group: "Blueprint API",
    depth: 0,
  }));
  roots.forEach((item) => queued.add(item.href));

  let fetched = 0;
  while (queue.length && fetched < MAX_PAGES) {
    const batch = queue.splice(0, 36);
    await pool(batch, async (item) => {
      fetched += 1;
      try {
        let page = cache.get(item.href);
        if (!page) {
          const html = await fetchText(item.href);
          page = {
            children: extractDirItems(html),
            h1: decode(html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1] || item.name).trim(),
          };
          cache.set(item.href, page);
        }
        const children = page.children.filter((child) => child.href.includes("/BlueprintAPI/"));
        if (children.length === 0) {
          addRow({ k: "b", g: item.group, n: page.h1 || item.name, p: docPath(item.href) });
          return;
        }
        addRow({ k: "c", g: item.group, n: page.h1 || item.name, p: docPath(item.href) });
        const childGroup = item.group === "Blueprint API" ? item.name : `${item.group} / ${item.name}`;
        for (const child of children) {
          if (looksLikeFolder(child.name) && item.depth < 6) {
            if (!queued.has(child.href)) {
              queued.add(child.href);
              queue.push({
                href: child.href,
                name: child.name,
                group: childGroup,
                depth: item.depth + 1,
              });
            }
            continue;
          }
          addRow({
            k: looksLikeFolder(child.name) ? "c" : "b",
            g: childGroup,
            n: child.name,
            p: docPath(child.href),
          });
        }
      } catch (error) {
        failures.push(`${item.href} ${error.message}`);
        addRow({ k: "c", g: item.group, n: item.name, p: docPath(item.href) });
      }
    });
    saveCache(cache);
    fs.writeFileSync(path.join(PUBLIC_DIR, "ue-nodes.json"), JSON.stringify(rows));
    console.log(
      `fetched ${fetched}, queued ${queue.length}, rows ${rows.length}, failures ${failures.length}`,
    );
  }

  return { rows, failures, fetched };
}

async function crawlNodeReference(cache) {
  const html = await fetchText(NODE_REF_URL);
  const links = [
    ...html.matchAll(/href="(\/documentation\/unreal-engine\/node-reference\/[^"]+)"[^>]*>([^<]+)/g),
  ].map((match) => ({
    href: canonical(match[1]),
    name: decode(match[2]).trim(),
  }));
  const unique = [];
  const seen = new Set();
  for (const link of links) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    unique.push(link);
  }
  console.log(`node reference pages: ${unique.map((link) => link.name).join(", ")}`);
  const rows = [];
  for (const link of unique) {
    const pageHtml = await fetchText(link.href);
    const found = extractReferenceNodes(pageHtml, link.href, link.name);
    console.log(`  ${link.name}: ${found.length} nodes`);
    rows.push(...found);
    rows.push({ k: "c", g: "Node Reference", n: link.name, p: docPath(link.href) });
    cache.set(link.href, { children: [], h1: link.name });
  }
  return rows;
}

function articleHtml(html) {
  return html.match(/<article[\s\S]*?<\/article>/)?.[0] || html;
}

function explanationLinks(html) {
  const source = articleHtml(html);
  const items = extractDirItems(source).filter((item) => {
    if (!item.href.includes("/documentation/unreal-engine/")) return false;
    if (item.href.includes("/BlueprintAPI")) return false;
    if (item.href.includes("/API/")) return false;
    if (item.href.includes("/node-reference")) return false;
    return true;
  });
  const anchors = [
    ...source.matchAll(/<a[^>]+href="(https:\/\/dev\.epicgames\.com\/documentation\/unreal-engine\/[^"]+|\/documentation\/unreal-engine\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g),
  ];
  for (const match of anchors) {
    const href = canonical(match[1]);
    const name = decode(match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    if (!name || name.length > 140) continue;
    if (href.includes("/BlueprintAPI") || href.includes("/API/") || href.includes("/node-reference")) continue;
    if (href.endsWith("/unreal-engine-5-8-documentation")) continue;
    items.push({ name, href, type: "a" });
  }
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

async function crawlMenu() {
  const menu = [];
  const seenGlobal = new Set(SECTIONS.map(([, href]) => canonical(href)));
  const sectionPages = new Map();

  await pool(SECTIONS, async ([title, href]) => {
    try {
      const html = await fetchText(href);
      sectionPages.set(href, explanationLinks(html).slice(0, 100));
      console.log(`menu section ${title}: ${sectionPages.get(href).length} links`);
    } catch (error) {
      console.log(`menu failed ${title}: ${error.message}`);
      sectionPages.set(href, []);
    }
  });

  const childJobs = [];
  for (const [, href] of SECTIONS) {
    for (const link of sectionPages.get(href) || []) {
      if (seenGlobal.has(link.href)) continue;
      seenGlobal.add(link.href);
      childJobs.push(link);
    }
  }

  const grandchildren = new Map();
  const cappedJobs = childJobs.slice(0, 180);
  console.log(`menu child pages to open: ${cappedJobs.length} of ${childJobs.length}`);
  await pool(cappedJobs, async (link) => {
    try {
      const html = await fetchText(link.href);
      const nested = explanationLinks(html)
        .filter((item) => !seenGlobal.has(item.href) && item.href !== link.href)
        .slice(0, 12);
      grandchildren.set(link.href, nested);
    } catch {
      grandchildren.set(link.href, []);
    }
  });

  for (const [title, href] of SECTIONS) {
    const children = (sectionPages.get(href) || []).map((link) => ({
      title: link.name,
      href: link.href,
      children: (grandchildren.get(link.href) || [])
        .filter((item) => item.href !== href)
        .map((item) => ({ title: item.name, href: item.href, children: [] })),
    }));
    menu.push({ title, href, children });
  }
  menu.push({
    title: "Developer Forums",
    href: "https://forums.unrealengine.com/categories?tag=unreal-engine",
    children: [],
  });
  menu.push({
    title: "Learning Library",
    href: "https://dev.epicgames.com/community/unreal-engine/learning",
    children: [],
  });
  return menu;
}

function countLinks(nodes) {
  return nodes.reduce((sum, node) => sum + 1 + countLinks(node.children || []), 0);
}

async function main() {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const cache = loadCache();
  const temp = process.env.TEMP || "";
  const seeds = [
    [`${DOC_BASE}BlueprintAPI/Actor`, path.join(temp, "actor.html")],
    [`${DOC_BASE}BlueprintAPI/Rendering`, path.join(temp, "rendering.html")],
    [`${DOC_BASE}BlueprintAPI/Math`, path.join(temp, "math.html")],
  ];
  for (const [url, file] of seeds) {
    if (!fs.existsSync(file) || cache.has(url)) continue;
    const html = fs.readFileSync(file, "utf8");
    cache.set(url, {
      children: extractDirItems(html),
      h1: decode(html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1] || "").trim(),
    });
  }
  console.log(`cache entries: ${cache.size}`);

  const blueprint = await crawlBlueprint(cache);
  saveCache(cache);
  const referenceRows = await crawlNodeReference(cache);
  const menu = await crawlMenu();

  const rows = [...blueprint.rows, ...referenceRows].sort((a, b) =>
    `${a.g}\u0000${a.n}`.localeCompare(`${b.g}\u0000${b.n}`),
  );

  const nodesPath = path.join(PUBLIC_DIR, "ue-nodes.json");
  const menuPath = path.join(DATA_DIR, "ue-menu.json");
  const metaPath = path.join(DATA_DIR, "ue-meta.json");
  fs.writeFileSync(nodesPath, JSON.stringify(rows));
  fs.writeFileSync(menuPath, JSON.stringify(menu, null, 2));
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        source: HOME_URL,
        blueprintIndex: INDEX_URL,
        nodeReference: NODE_REF_URL,
        indexedAt: new Date().toISOString(),
        nodes: rows.filter((row) => row.k === "b").length,
        blueprints: rows.filter((row) => row.k === "c").length,
        references: rows.filter((row) => row.k === "r").length,
        menuLinks: countLinks(menu),
        fetchedPages: blueprint.fetched,
        failures: blueprint.failures.slice(0, 40),
      },
      null,
      2,
    ),
  );
  console.log(`wrote ${rows.length} rows, ${countLinks(menu)} menu links`);
  console.log(`failures ${blueprint.failures.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
