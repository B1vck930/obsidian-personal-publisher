const allowedOrigins = new Set([
  "app://obsidian.md",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);

export function createCorsHeaders(
  request: Pick<Request, "headers">,
  methods: string
): HeadersInit {
  const origin = request.headers.get("origin");
  const allowedOrigin =
    origin && allowedOrigins.has(origin) ? origin : "app://obsidian.md";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

export function withCors<T extends Response>(
  response: T,
  request: Pick<Request, "headers">,
  methods: string
): T {
  const headers = createCorsHeaders(request, methods);

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

export function corsOptionsResponse(
  request: Pick<Request, "headers">,
  methods: string
): Response {
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders(request, methods)
  });
}
