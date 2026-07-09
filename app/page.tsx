"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import ErrorBoundary from "@/components/ErrorBoundary";

interface Metrics {
  totalUsers: number;
  monthlyRevenue: number;
  activeSessions: number;
  conversionRate: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch users"));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading users...</p>;
  }

  if (error) {
    throw error; // This will be caught by the ErrorBoundary
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-base font-medium text-gray-900 mb-4">Users</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="text-sm text-gray-700">
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/metrics");
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch metrics"));
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading metrics...</p>;
  }

  if (error) {
    throw error; // This will be caught by the ErrorBoundary
  }

  if (!metrics) {
    return <p className="text-sm text-gray-500">No metrics available</p>;
  }

  const stats = [
    { label: "Total Users", value: metrics.totalUsers.toLocaleString() },
    { label: "Monthly Revenue", value: `$${metrics.monthlyRevenue.toLocaleString()}` },
    { label: "Active Sessions", value: metrics.activeSessions.toLocaleString() },
    { label: "Conversion Rate", value: `${(metrics.conversionRate * 100).toFixed(1)}%` },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg border border-gray-200 p-5"
        >
          <p className="text-sm text-gray-500">{stat.label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default function OverviewPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">Export</Button>
          <Button>New Report</Button>
        </div>
      </div>

      <ErrorBoundary>
        <MetricsDashboard />
      </ErrorBoundary>

      <ErrorBoundary>
        <UserList />
      </ErrorBoundary>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-base font-medium text-gray-900 mb-4">
          Recent Activity
        </h2>
        <p className="text-sm text-gray-500">No recent activity to display.</p>
      </div>
    </div>
  );
}
