import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login" || path === "/register";

  const token = 
    request.cookies.get("token")?.value || 
    request.cookies.get("next-auth.session-token")?.value;

  // 💡 ຖ້າ Token ໝົດອາຍຸ ຫຼື ບໍ່ມີ Token
  if (!isPublicPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("expired", "true"); // ແນບ Flag ໄປບອກໜ້າ Login
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/incomes/:path*",
    "/expenses/:path*",
    "/budgets/:path*",
    "/assets/:path*",
    "/reports/:path*",
  ],
};