type BackendMethod = "GET" | "POST";

const routes: Record<BackendMethod, RegExp[]> = {
  GET: [
    /^health$/,
    /^strategies$/,
    /^strategies\/[^/]+$/,
    /^strategies\/[^/]+\/(?:trades|equity)$/,
    /^performance\/metrics\/[^/]+$/,
    /^alerts$/,
    /^portfolios$/,
    /^portfolios\/[^/]+$/,
    /^portfolios\/[^/]+\/correlation$/,
    /^market\/regime$/,
    /^portfolio\/metrics$/,
    /^portfolio\/weights$/,
    /^capital\/summary$/,
    /^weekly\/reports\/latest$/,
  ],
  POST: [/^alerts\/\d+\/ack$/, /^portfolio\/weights$/],
};

export function isBackendRouteAllowed(
  method: string,
  pathSegments: string[],
): boolean {
  if (method !== "GET" && method !== "POST") return false;
  const path = pathSegments.join("/");
  return routes[method].some((pattern) => pattern.test(path));
}
