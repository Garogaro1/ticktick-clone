export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-background-main">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-bold text-text-primary">
          TickTick Clone
        </h1>
        <p className="text-xl text-text-secondary">
          Modern task management application built with Next.js 15
        </p>
        <div className="flex gap-4 justify-center">
          <button
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200"
            type="button"
          >
            Get Started
          </button>
          <button
            className="px-8 py-3 border-2 border-primary text-primary rounded-lg hover:bg-background-secondary transition-all duration-200"
            type="button"
          >
            Learn More
          </button>
        </div>
        <p className="text-sm text-text-tertiary">
          Phase 1: Project Infrastructure in progress...
        </p>
      </div>
    </main>
  );
}
