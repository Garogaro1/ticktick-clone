export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background-main">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-sm">Loading...</p>
      </div>
    </main>
  );
}
