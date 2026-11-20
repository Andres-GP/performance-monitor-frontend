import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SignInPage from "@/app/sign-in/[[...sign-in]]/page";

const mockSetActive = jest.fn();
const mockCreate = jest.fn();
const mockReplace = jest.fn();

jest.mock("@clerk/nextjs", () => ({
  useUser: () => ({ isLoaded: true, isSignedIn: false }),
  useClerk: () => ({
    setActive: mockSetActive,
    client: { signIn: { create: mockCreate } },
  }),
}));

jest.mock("next/navigation", () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock("@/components/layout/language-selector", () => ({
  LanguageSelector: () => <div aria-label="Language selector" />,
}));

describe("sign-in page", () => {
  beforeEach(() => {
    mockSetActive.mockReset().mockResolvedValue(undefined);
    mockCreate.mockReset().mockResolvedValue({ status: "complete", createdSessionId: "session-test" });
    mockReplace.mockReset();
  });

  it("uses the Alphaca brand and keeps the sign-in controls accessible", () => {
    render(<SignInPage />);

    expect(screen.getByRole("heading", { name: "A clearer view of your capital." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
  });

  it("activates the Clerk session after a successful sign-in", async () => {
    render(<SignInPage />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith({ identifier: "user@example.com", password: "test-password" }));
    expect(mockSetActive).toHaveBeenCalledWith({ session: "session-test" });
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
