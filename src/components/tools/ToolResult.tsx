export function ResultCard({ children }: { children: React.ReactNode }) {
  return <section className="mt-6 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">{children}</section>;
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-6 rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white/80">
      {message}
    </p>
  );
}
