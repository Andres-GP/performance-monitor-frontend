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
      const res = await getWithFallback("/x", []);
      expect(res).toEqual({ data: [1, 2, 3], isFallback: false });
    });
  });
});
