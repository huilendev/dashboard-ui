import { NextResponse } from "next/server";

// Mock user data
const users = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com" },
];

export async function GET() {
  // Simulate a potential error (50% chance for demonstration)
  if (Math.random() < 0.5) {
    return NextResponse.json(users);
  }
  
  // Simulate an error
  throw new Error("Failed to fetch users from database");
}
