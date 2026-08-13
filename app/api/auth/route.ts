import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  let role: string | null = null;
  if (password === process.env.ADMIN_PASSWORD) role = "admin";
  else if (password === process.env.SECURITY_PASSWORD) role = "security";

  if (!role) {
    return NextResponse.json({ success: false });
  }

  const response = NextResponse.json({ success: true, role });
  response.cookies.set("auth_role", role, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12, // 12 hours
    path: "/",
  });
  return response;
}