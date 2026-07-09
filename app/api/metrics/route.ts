import { NextResponse } from "next/server";

// Mock metrics data
const metrics = {
  totalUsers: 12430,
  monthlyRevenue: 48200,
  activeSessions: 1893,
  conversionRate: 0.032,
};

export async function GET() {
  // Simulate a potential error (50% chance for demonstration)
  if (Math.random() < 0.5) {
    return NextResponse.json(metrics);
  }
  
  // Simulate an error
  throw new Error("Failed to fetch metrics from database");
}
