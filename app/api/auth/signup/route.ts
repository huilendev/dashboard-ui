// Signup endpoint
// POST /api/auth/signup

import { NextRequest, NextResponse } from "next/server";
import { SignupInput, AuthResponse } from "@/types/auth";
import { validateSignup, hasValidationErrors } from "@/lib/validation";
import { signup } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body: SignupInput = await request.json();
    
    // Validate input
    const errors = validateSignup(body);
    
    if (hasValidationErrors(errors)) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        message: errors.map(e => `${e.field}: ${e.message}`).join(", ")
      }, { status: 400 });
    }
    
    // Attempt signup
    try {
      const result = await signup(body.email, body.password);
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: "Signup successful",
        user: {
          id: result.user.id,
          email: result.user.email
        },
        token: result.token
      }, { status: 201 });
      
    } catch (error) {
      if (error instanceof Error && error.message === "User already exists") {
        return NextResponse.json({
          success: false,
          error: "User already exists"
        }, { status: 409 });
      }
      throw error;
    }
    
  } catch (error) {
    console.error("Signup error:", error);
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
