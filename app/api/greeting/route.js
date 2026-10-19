import { greeting } from "../../../lib/greeting.js";

export function GET() {
  return Response.json(greeting, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
