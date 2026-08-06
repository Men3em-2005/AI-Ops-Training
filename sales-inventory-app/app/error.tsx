"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-6 text-center">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">Something went wrong</h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
