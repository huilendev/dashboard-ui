// Login endpoint
// POST /api/auth/login

import { NextRequest, NextResponse } from "next/server";
import { LoginInput, AuthResponse } from "@/types/auth";
import { validateLogin, hasValidationErrors } from "@/lib/validation";
import { login } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body: LoginInput = await request.json();
    
    // Validate input
    const errors = validateLogin(body);
    
    if (hasValidationErrors(errors)) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        message: errors.map(e => `${e.field}: ${e.message}`).join(", ")
      }, { status: 400 });
    }
    
    // Attempt login
    const result = await login(body.email, body.password);
    
    if (!result) {
      return NextResponse.json({
        success: false,
        error: "Invalid credentials"
      }, { status: 401 });
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: result.user.id,
        email: result.user.email
      },
      token: result.token
    }, { status: 200 });
    
  } catch (error) {
    console.error("Login error:", error);
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
