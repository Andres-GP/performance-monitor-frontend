import { render, screen } from "@testing-library/react";
import { OfflineBanner } from "@/components/shared/offline-banner";

describe("OfflineBanner", () => {
  it("renders nothing when show is false", () => {
    const { container } = render(<OfflineBanner show={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
