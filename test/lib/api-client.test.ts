import { ApiError, apiGet, apiSend, getWithFallback } from "@/lib/api-client";

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  } as unknown as Response;
}

describe("api-client", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  describe("apiGet", () => {
    it("requests the proxy path and returns parsed JSON", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ hello: "world" }));
      const data = await apiGet<{ hello: string }>("/strategies");
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/proxy/strategies",
        expect.objectContaining({ headers: { accept: "application/json" } }),
      );
      expect(data).toEqual({ hello: "world" });
    });

    it("throws an ApiError with the status code on failure", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 404));
      const error = await apiGet("/missing").catch((e) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ status: 404 });
    });
  });

  describe("apiSend", () => {
    it("serializes the body and sets content-type", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
      const result = await apiSend("/portfolio/weights", "POST", {
        target_weight: 0.3,
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/proxy/portfolio/weights",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ target_weight: 0.3 }),
        }),
      );
      expect(result).toEqual({ ok: true });
    });

    it("returns an empty object when the response has no body", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse("", true));
      const result = await apiSend("/strategies/1", "DELETE");
      expect(result).toEqual({});
    });

    it("throws an ApiError on a failed mutation", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500));
      await expect(apiSend("/strategies/1", "DELETE")).rejects.toBeInstanceOf(
        ApiError,
      );
    });
  });

  describe("getWithFallback", () => {
    it("returns live data when the request succeeds", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse([1, 2, 3]));
      const res = await getWithFallback("/x");
      expect(res).toEqual({ data: [1, 2, 3], isFallback: false });
    });

    it("does not hide authentication and permission failures as offline data", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Unauthorized" }, false, 401));
      await expect(getWithFallback("/alerts")).rejects.toMatchObject({ status: 401 });
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Forbidden" }, false, 403));
      await expect(getWithFallback("/alerts")).rejects.toMatchObject({ status: 403 });
    });

    it("uses the empty offline state for server errors", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Unavailable" }, false, 503));
      await expect(getWithFallback("/alerts")).resolves.toEqual({ data: null, isFallback: true });
    });

    it("treats an expected missing dataset as empty without hiding other 404s", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "No portfolio metrics available" }, false, 404));
      await expect(getWithFallback("/portfolio/metrics", { emptyOnNotFound: true })).resolves.toEqual({ data: null, isFallback: false });

      fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "No market regime data available" }, false, 404));
      await expect(getWithFallback("/market/regime", { emptyOnNotFound: true })).resolves.toEqual({ data: null, isFallback: false });

      fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "Not Found" }, false, 404));
      await expect(getWithFallback("/unknown", { emptyOnNotFound: true })).rejects.toMatchObject({ status: 404 });
    });
  });
});
