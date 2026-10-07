export type GameStatus = "playable" | "coming-soon" | "readable";

export type Game = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  genre: string;
  platforms: string[];
  status: GameStatus;
  engine?: string;
  cover: string;
  hero: string;
  highlights: string[];
  readHref?: string;
};

export function statusLabel(status: GameStatus, compact = false) {
  if (status === "playable") return "Playable";
  if (status === "readable") return compact ? "Book" : "Blueprint book";
  return compact ? "Soon" : "Coming soon";
}

export const games: Game[] = [
  {
    slug: "fgiu",
    title: "FGIU",
    tagline: "Leap the floating ruins.",
    description:
      "A third-person 3D platformer from oTTeGames. Sprint across mossy stone islands, time your jumps over waterfalls, and chase the next ruin before the timer resets.",
    genre: "3D Platformer",
    platforms: ["Windows"],
    status: "playable",
    engine: "Unreal Engine 5.8",
    cover: "/games/fgiu-cover.jpg",
    hero: "/games/fgiu-hero.jpg",
    highlights: [
      "Third-person traversal",
      "Floating-island levels",
      "Windows playable build",
    ],
  },
  {
    slug: "studio-lab",
    title: "Studio Lab",
    tagline: "Experiments from the oTTe bench.",
    description:
      "A holding bay for prototypes, tools, and arcade sketches from the studio. Nothing here is a finished game yet — it is where the next oTTeGames title starts.",
    genre: "Prototype",
    platforms: ["Windows"],
    status: "coming-soon",
    cover: "/games/studio-lab.jpg",
    hero: "/games/studio-lab.jpg",
    highlights: ["In development", "Studio experiments", "Not playable yet"],
  },
  {
    slug: "adventure-artist",
    title: "Adventure Artist",
    tagline: "Every Blueprint, explained.",
    description:
      "The Blueprint Book for the Unreal project. It records the adventure, the first-person template, the prototype actors, and the arena shooter. Read it by chapter on this site, or download the typeset PDF.",
    genre: "Blueprint study",
    platforms: ["Web"],
    status: "readable",
    engine: "Unreal Engine",
    cover: "/games/adventure-artist-cover.jpg",
    hero: "/games/adventure-artist-hero.jpg",
    highlights: [
      "77 Blueprints",
      "Three-part reading order",
      "PDF of the full book",
    ],
    readHref: "/book",
  },
];

export function getGame(slug: string) {
  return games.find((game) => game.slug === slug);
}

export const featuredGame = games[0];
