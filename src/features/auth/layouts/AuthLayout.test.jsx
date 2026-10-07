import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import AuthLayout from "./AuthLayout";

function renderLayout(isAuthLogin) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<p>Beranda</p>} />
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<p>Isi Login</p>} />
      </Route>
    </Routes>,
    { route: "/auth/login", preloadedState: { isAuthLogin } }
  );
}

describe("AuthLayout", () => {
  it("menampilkan banner dan outlet untuk pengguna belum login", () => {
    renderLayout(false);
    expect(screen.getByTestId("auth-banner")).toBeInTheDocument();
    expect(screen.getByText("Isi Login")).toBeInTheDocument();
  });

  it("mengalihkan ke beranda jika sudah login", () => {
    renderLayout(true);
    expect(screen.getByText("Beranda")).toBeInTheDocument();
    expect(screen.queryByText("Isi Login")).not.toBeInTheDocument();
  });
});
