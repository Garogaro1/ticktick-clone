export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-background-main">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-text-primary">Page Not Found</h2>
        <p className="text-text-secondary">
          The page you are looking for does not exist.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200"
        >
          Go Home
        </a>
      </div>
    </main>
  );
}
