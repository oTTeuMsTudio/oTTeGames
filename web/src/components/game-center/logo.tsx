import Image from "next/image";
import Link from "next/link";

export function StudioLogo() {
  return (
    <Link
      href="/"
      className="flex h-16 w-full items-center gap-2.5 bg-white px-3 text-black"
      aria-label="oTTeGames home"
    >
      <Image
        src="/logo.jpg"
        alt="oTTeGames mark"
        width={40}
        height={40}
        className="size-10 rounded-md object-contain"
        priority
      />
      <span className="hidden font-heading text-base font-semibold tracking-tight md:inline">
        oTTeGames
      </span>
    </Link>
  );
}
