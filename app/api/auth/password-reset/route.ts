import { NextRequest, NextResponse } from "next/server";
import { PasswordResetRequestSchema, PasswordResetConfirmSchema, validateInput } from "@/lib/validation";
import { requestPasswordReset, resetPassword } from "@/lib/auth";

// Request password reset (send reset link)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateInput(PasswordResetRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { email } = validation.data!;

    // Request password reset
    const result = await requestPasswordReset(email);

    // Return the token for testing purposes
    return NextResponse.json(
      { success: true, message: result.message, token: result.token },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Confirm password reset with token
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateInput(PasswordResetConfirmSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { token, newPassword } = validation.data!;

    // Reset password
    const result = await resetPassword(token, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: result.message },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}
