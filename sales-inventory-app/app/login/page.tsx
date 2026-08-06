import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">BrightWay Retail Group</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sales &amp; Inventory Management System
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <LoginForm next={next ?? ""} />
        </div>

        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-4 text-xs text-slate-500 dark:text-slate-400">
          <p className="mb-2 font-semibold text-slate-600 dark:text-slate-300">
            Demo accounts (password: <code>password123</code>)
          </p>
          <ul className="space-y-0.5">
            <li>Admin — admin@brightway.com</li>
            <li>Branch Manager — manager.downtown@brightway.com</li>
            <li>Staff — staff.downtown@brightway.com</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
