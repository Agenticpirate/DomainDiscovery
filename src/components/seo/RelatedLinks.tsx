import Link from 'next/link';

export type RelatedLink = { href: string; label: string; description?: string };

export function RelatedLinks({ title = 'Related', links }: { title?: string; links: RelatedLink[] }) {
  if (!links.length) return null;
  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-white/10 bg-black px-3 py-2.5 hover:bg-white/[0.05]"
          >
            <div className="text-[14px] font-semibold text-white/90">{link.label}</div>
            {link.description && (
              <div className="mt-0.5 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                {link.description}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
