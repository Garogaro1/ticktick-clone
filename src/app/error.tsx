"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-background-main">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">Error</h1>
        <h2 className="text-2xl font-semibold text-text-primary">Something went wrong</h2>
        <p className="text-text-secondary">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
