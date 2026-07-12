import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

import Dashboard from "../Dashboard";

// Mock the API
vi.mock("../../api/dashboard", () => ({
  getDashboard: vi.fn(() =>
    Promise.resolve({
      message: "Welcome",
    })
  ),
}));

describe("Dashboard Page", () => {
  test("renders dashboard heading", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(
      screen.getByRole("heading", {
        name: /dashboard/i,
      })
    ).toBeInTheDocument();
  });
});