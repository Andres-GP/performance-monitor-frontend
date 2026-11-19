import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/api/webhooks(.*)",
  "/api/proxy/(.*)",
  "/api/clerk(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname === "/sign-in") {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (!isPublicRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: "/sign-in",
    });
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
