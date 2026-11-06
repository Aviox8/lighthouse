import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * `/?q=…` used to open the workbench in place. Keep `/` static and hand
 * shared links off to `/workbench` before the homepage renders.
 */
export function proxy(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (q) {
    return NextResponse.redirect(
      new URL(`/workbench?q=${encodeURIComponent(q)}`, request.url),
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
