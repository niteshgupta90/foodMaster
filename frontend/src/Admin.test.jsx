import React from "react";
import { test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import { AuthContext } from "./context/AuthContext";
import api from "./services/api";
vi.mock("./services/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const restaurants = Array.from({ length: 6 }, (_, i) => ({
  _id: String(i),
  name: `Restaurant ${i + 1}`,
  address: "Seattle, WA",
}));
function defaultGet(path, { params }) {
  return Promise.resolve({
    data:
      path === "/dishes"
        ? { total: 159 }
        : params.limit === 1
          ? { total: 72 }
          : { restaurants, total: 72, totalPages: 12 },
  });
}
function mount(isAdmin = true) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ user: { isAdmin, username: "Admin", displayName: "Nitesh" } }}
      >
        <AdminPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockImplementation(defaultGet);
});
test("admin overview shows real totals, a directory and contribution controls", async () => {
  mount();
  expect(await screen.findByText("159")).toBeInTheDocument();
  expect(await screen.findByText("72")).toBeInTheDocument();
  expect(
    await screen.findByRole("link", { name: "Restaurant 1", exact: true }),
  ).toHaveAttribute("href", "/restaurants/0");
  expect(screen.getByLabelText("Restaurant name")).toBeInTheDocument();
  expect(screen.getByLabelText("Full address")).toBeInTheDocument();
});
test("restaurant search resets pagination and retains its query on next page", async () => {
  mount();
  await screen.findByText("Restaurant 1");
  fireEvent.click(screen.getByRole("button", { name: "Next restaurant page" }));
  await waitFor(() =>
    expect(api.get).toHaveBeenCalledWith(
      "/restaurants",
      expect.objectContaining({ params: { q: "", page: 2, limit: 6 } }),
    ),
  );
  await screen.findByText("7–12 of 72 restaurants");
  fireEvent.change(
    screen.getByRole("textbox", { name: "Search restaurant directory" }),
    { target: { value: "Dosa" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Search", exact: true }));
  await waitFor(() =>
    expect(api.get).toHaveBeenCalledWith(
      "/restaurants",
      expect.objectContaining({ params: { q: "Dosa", page: 1, limit: 6 } }),
    ),
  );
  await screen.findByText("1–6 of 72 restaurants");
  fireEvent.click(screen.getByRole("button", { name: "Next restaurant page" }));
  await waitFor(() =>
    expect(api.get).toHaveBeenLastCalledWith(
      "/restaurants",
      expect.objectContaining({ params: { q: "Dosa", page: 2, limit: 6 } }),
    ),
  );
});
test("regular users cannot see the dashboard or trigger catalog requests", () => {
  mount(false);
  expect(screen.getByText("Admin access required")).toBeInTheDocument();
  expect(api.get).not.toHaveBeenCalled();
  expect(screen.queryByLabelText("Restaurant name")).not.toBeInTheDocument();
});
test("failed restaurant submissions retain entered data and show a useful error", async () => {
  api.post.mockRejectedValue({
    response: { data: { msg: "Unable to add restaurant" } },
  });
  mount();
  fireEvent.change(screen.getByLabelText("Restaurant name"), {
    target: { value: "New Cafe" },
  });
  fireEvent.change(screen.getByLabelText("Full address"), {
    target: { value: "123 Example St, Seattle, WA" },
  });
  fireEvent.click(screen.getByRole("button", { name: "+ Add restaurant" }));
  expect(
    await screen.findByText("Unable to add restaurant"),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Restaurant name")).toHaveValue("New Cafe");
});
test("successful restaurant submissions clear fields and link to the new record", async () => {
  api.post.mockResolvedValue({ data: { _id: "new", name: "New Cafe" } });
  mount();
  fireEvent.change(screen.getByLabelText("Restaurant name"), {
    target: { value: "New Cafe" },
  });
  fireEvent.change(screen.getByLabelText("Full address"), {
    target: { value: "123 Example St, Seattle, WA" },
  });
  fireEvent.click(screen.getByRole("button", { name: "+ Add restaurant" }));
  expect(await screen.findByText("New Cafe added.")).toBeInTheDocument();
  expect(screen.getByLabelText("Restaurant name")).toHaveValue("");
  expect(
    screen.getByRole("link", { name: "View restaurant →" }),
  ).toHaveAttribute("href", "/restaurants/new");
  expect(api.post).toHaveBeenCalledWith("/restaurants", {
    name: "New Cafe",
    address: "123 Example St, Seattle, WA",
  });
});
test("directory failures provide a retry action", async () => {
  api.get.mockImplementation((path, options) =>
    options.params.limit === 6
      ? Promise.reject(new Error("offline"))
      : defaultGet(path, options),
  );
  mount();
  expect(
    await screen.findByText("The restaurant directory could not be loaded."),
  ).toBeInTheDocument();
  api.get.mockImplementation(defaultGet);
  fireEvent.click(screen.getByRole("button", { name: "Retry directory" }));
  expect(await screen.findByText("Restaurant 1")).toBeInTheDocument();
});
