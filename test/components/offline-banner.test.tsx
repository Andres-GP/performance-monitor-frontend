import { render, screen } from "@testing-library/react"
import { OfflineBanner } from "@/components/shared/offline-banner"

describe("OfflineBanner", () => {
  it("renders the offline message by default", () => {
    render(<OfflineBanner />)
    expect(screen.getByText(/Backend no disponible/i)).toBeInTheDocument()
  })

  it("renders nothing when show is false", () => {
    const { container } = render(<OfflineBanner show={false} />)
    expect(container).toBeEmptyDOMElement()
  })
})
