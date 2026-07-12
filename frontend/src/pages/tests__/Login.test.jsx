import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../Login";
import AuthProvider from "../../context/AuthContext";
import { vi } from "vitest";

// Mock the auth API used by AuthProvider
vi.mock("../../api/auth", () => ({
  login: vi.fn(),
  me: vi.fn(() =>
    Promise.reject(new Error("No logged in user"))
  ),
}));

describe("Login Page", () => {
  test("renders login page", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(
  screen.getByRole("heading", { name: /login/i })
).toBeInTheDocument();
  });
});