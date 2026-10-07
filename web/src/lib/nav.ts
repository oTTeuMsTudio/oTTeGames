import {
  BookOpen,
  Compass,
  Download,
  Gamepad2,
  Heart,
  Library,
  Map,
  Newspaper,
  Settings,
  Users,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const topNav: NavItem[] = [
  { href: "/", label: "Store", icon: Compass },
  { href: "/library", label: "Library", icon: Library },
  { href: "/community", label: "Community", icon: Users },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/book", label: "Book", icon: BookOpen },
  { href: "/tutorial", label: "Tutorial", icon: Map },
];

export const leftNav: NavItem[] = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/library", label: "My Library", icon: Library },
  { href: "/games/fgiu", label: "FGIU", icon: Gamepad2 },
  { href: "/tutorial", label: "Top-Down Tutorial", icon: Map },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/downloads", label: "Downloads", icon: Download },
  { href: "/settings", label: "Settings", icon: Settings },
];
