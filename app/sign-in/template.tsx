import type { ReactNode } from "react";

export default function SignInTemplate({ children }: { children: ReactNode }) {
  return <div className="app-route-enter">{children}</div>;
}
