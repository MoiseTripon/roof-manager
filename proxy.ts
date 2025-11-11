import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const supportedLocales = ["en", "es"];
const defaultLocale = "en";

function getLocale(request: NextRequest): string {
  // 1. Check cookie first (user preference)
  const cookieLocale = request.cookies.get("preferred-locale")?.value;
  if (cookieLocale && supportedLocales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header (browser preference)
  const acceptLanguage = request.headers.get("Accept-Language");
  if (acceptLanguage) {
    const detectedLocale = acceptLanguage
      .split(",")
      .map((lang) => lang.split("-")[0].trim())
      .find((lang) => supportedLocales.includes(lang));

    if (detectedLocale) {
      return detectedLocale;
    }
  }

  // 3. Try to detect from geo location (if you have this enabled in Vercel/deployment)
  const country =
    typeof (request as any).geo === "object" && (request as any).geo?.country
      ? String((request as any).geo.country).toLowerCase()
      : undefined;
  const countryToLocale: Record<string, string> = {
    es: "es",
    mx: "es",
    ar: "es",
    co: "es",
    cl: "es",
    // Add more Spanish-speaking countries as needed
  };

  if (country && countryToLocale[country]) {
    return countryToLocale[country];
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Only set locale for page requests, not API or assets
  if (
    !request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.includes(".")
  ) {
    const locale = getLocale(request);

    // Pass locale to the app via header
    response.headers.set("x-locale", locale);

    // If no cookie exists, set it based on detection
    if (!request.cookies.get("preferred-locale")) {
      response.cookies.set("preferred-locale", locale, {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        sameSite: "lax",
        path: "/",
      });
    }
  }

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
