import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
      <Link href="/" className="font-display text-xl tracking-tight text-ink">
        内容工作室
      </Link>
      <nav className="flex flex-wrap justify-end gap-3 text-sm text-ink/70 md:gap-4">
        <Link href="/" className="transition hover:text-accent">
          项目
        </Link>
        <Link href="/triple-line" className="transition hover:text-accent">
          三点一线
        </Link>
        <Link href="/title-radar" className="transition hover:text-accent">
          标题雷达
        </Link>
        <Link href="/platform-titles" className="transition hover:text-accent">
          平台取向
        </Link>
      </nav>
    </header>
  );
}
