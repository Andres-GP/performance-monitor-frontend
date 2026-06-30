import { act } from "@testing-library/react"
import { useUiStore } from "@/lib/store"

describe("useUiStore", () => {
  beforeEach(() => {
    act(() => useUiStore.setState({ mobileNavOpen: false }))
  })

  it("defaults mobileNavOpen to false", () => {
    expect(useUiStore.getState().mobileNavOpen).toBe(false)
  })

  it("setMobileNavOpen updates the value", () => {
    act(() => useUiStore.getState().setMobileNavOpen(true))
    expect(useUiStore.getState().mobileNavOpen).toBe(true)
  })

  it("toggleMobileNav flips the value", () => {
    act(() => useUiStore.getState().toggleMobileNav())
    expect(useUiStore.getState().mobileNavOpen).toBe(true)
    act(() => useUiStore.getState().toggleMobileNav())
    expect(useUiStore.getState().mobileNavOpen).toBe(false)
  })
})
