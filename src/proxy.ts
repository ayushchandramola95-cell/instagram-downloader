import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // If traffic hits the internal Cloud Run URL (*.run.app), permanently 301 redirect to gramsave.site
  if (host.includes(".run.app")) {
    const url = request.nextUrl.clone();
    url.host = "gramsave.site";
    url.protocol = "https";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
