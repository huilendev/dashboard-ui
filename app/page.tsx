import Button from "@/components/Button";

const stats = [
  { label: "Total Users", value: "12,430" },
  { label: "Monthly Revenue", value: "$48,200" },
  { label: "Active Sessions", value: "1,893" },
  { label: "Conversion Rate", value: "3.2%" },
];

export default function OverviewPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">Export</Button>
          <Button>New Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No recent activity to display.
        </p>
      </div>
    </div>
  );
}
