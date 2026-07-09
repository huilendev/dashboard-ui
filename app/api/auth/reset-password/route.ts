// Password reset endpoint
// POST /api/auth/reset-password

import { NextRequest, NextResponse } from "next/server";
import { ResetPasswordInput, AuthResponse } from "@/types/auth";
import { validateResetPassword, hasValidationErrors } from "@/lib/validation";
import { requestPasswordReset, resetPassword } from "@/lib/auth";

/**
 * Request a password reset token or reset password
 * POST /api/auth/reset-password
 * 
 * Two modes:
 * 1. Email-only: Request a reset token to be sent to the email
 * 2. Full reset: Use token, email, and newPassword to reset password
 */
export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body: Partial<ResetPasswordInput> = await request.json();
    
    // If only email is provided (and no token or newPassword), generate and return a reset token
    if (body.email && !body.token && !body.newPassword) {
      const token = await requestPasswordReset(body.email);
      
      return NextResponse.json({
        success: true,
        message: token
      }, { status: 200 });
    }
    
    // Otherwise, validate full reset password input
    const resetInput: ResetPasswordInput = {
      email: body.email || "",
      token: body.token || "",
      newPassword: body.newPassword || "",
      confirmPassword: body.confirmPassword
    };
    
    const errors = validateResetPassword(resetInput);
    
    if (hasValidationErrors(errors)) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        message: errors.map(e => `${e.field}: ${e.message}`).join(", ")
      }, { status: 400 });
    }
    
    // Attempt password reset
    const success = await resetPassword(
      resetInput.email,
      resetInput.token,
      resetInput.newPassword
    );
    
    if (!success) {
      return NextResponse.json({
        success: false,
        error: "Invalid or expired token"
      }, { status: 400 });
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Password reset successful"
    }, { status: 200 });
    
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

// Only allow POST method
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: "Method not allowed"
  }, { status: 405 });
}
