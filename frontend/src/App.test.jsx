import { test, expect, beforeEach, vi } from "vitest";
import React from "react";
import App from "./App";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import api, { imageUrl } from "./services/api";
import DishListPage from "./pages/DishListPage";
import AddDishPage from "./pages/AddDishPage";
import DishDetailPage from "./pages/DishDetailPage";
import { AuthContext } from "./context/AuthContext";
vi.mock("./services/api", async (importOriginal) => ({
  ...(await importOriginal()),
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));
function mount(component) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ token: null }}>
        {component}
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}
const first = { _id: "a", name: "Dosa", images: [], price: 10 };
beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockImplementation((path) =>
    Promise.resolve({
      data:
        path === "/dishes/options"
          ? { cuisines: ["Indian"], dietary: false }
          : path === "/restaurants"
            ? { restaurants: [{ _id: "r", name: "Test Restaurant" }] }
            : { dishes: [first], total: 30, totalPages: 3 },
    }),
  );
});
test("search and filters persist while paginating", async () => {
  mount(<DishListPage />);
  await screen.findByText("Dosa");
  fireEvent.change(screen.getByRole("textbox", { name: "Search dishes" }), {
    target: { value: "dosa" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Search dishes" }));
  fireEvent.change(screen.getByLabelText("City"), {
    target: { value: "Seattle" },
  });
  await waitFor(() =>
    expect(api.get).toHaveBeenCalledWith(
      "/dishes",
      expect.objectContaining({
        params: expect.objectContaining({
          q: "dosa",
          city: "Seattle",
          page: 1,
        }),
      }),
    ),
  );
  await screen.findByText("Dosa");
  fireEvent.click(screen.getByRole("button", { name: "2" }));
  await waitFor(() =>
    expect(api.get).toHaveBeenLastCalledWith(
      "/dishes",
      expect.objectContaining({
        params: expect.objectContaining({
          q: "dosa",
          city: "Seattle",
          page: 2,
        }),
      }),
    ),
  );
});
test("a failed request shows an error and retry control", async () => {
  api.get.mockRejectedValue(new Error("Network unavailable"));
  mount(<DishListPage />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Network unavailable",
  );
  expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
});
test("empty results offer a clear reset action", async () => {
  api.get.mockResolvedValue({
    data: { dishes: [], total: 0, totalPages: 0, cuisines: [] },
  });
  mount(<DishListPage />);
  expect(await screen.findByText("No dishes found")).toBeInTheDocument();
  expect(
    screen.queryByRole("navigation", { name: "Dish pages" }),
  ).not.toBeInTheDocument();
});
test("add-dish form understands paginated restaurants and includes required fields", async () => {
  mount(<AddDishPage />);
  expect(
    await screen.findByRole("option", { name: "Test Restaurant" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Cuisine")).toBeInTheDocument();
  expect(screen.getByLabelText("Price range")).toBeInTheDocument();
});
test("detail fetch failure ends loading state", async () => {
  api.get.mockRejectedValue({ response: { data: { msg: "Dish not found" } } });
  mount(<DishDetailPage />);
  expect(await screen.findByText("Dish not found")).toBeInTheDocument();
  expect(screen.queryByText("Loading dish…")).not.toBeInTheDocument();
});
test("old hosted upload paths use the local backend", () => {
  expect(imageUrl("https://foodmaster-zwim.onrender.com/uploads/a.jpg")).toBe(
    "http://localhost:5001/uploads/a.jpg",
  );
  expect(imageUrl("javascript:alert(1)")).toBe("");
});
test("adding a dish submits complete schema fields without a live database", async () => {
  api.post.mockResolvedValue({ data: { _id: "new" } });
  mount(<AddDishPage />);
  await screen.findByRole("option", { name: "Test Restaurant" });
  fireEvent.change(screen.getByLabelText("Restaurant"), {
    target: { value: "r" },
  });
  fireEvent.change(screen.getByLabelText("Dish Name"), {
    target: { value: "Test Dosa" },
  });
  fireEvent.change(screen.getByLabelText("Price"), {
    target: { value: "12.50" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add Dish" }));
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith(
      "/dishes",
      expect.objectContaining({
        restaurant: "r",
        name: "Test Dosa",
        cuisineType: "Indian",
        priceTier: "$",
        price: "12.50",
      }),
    ),
  );
});

test("application shell renders with its authentication provider", () => {
  window.history.replaceState({}, "", "/");
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /Find your next favorite bite/ }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
});

test("forgot password shows email-delivery configuration errors honestly", async () => {
  api.post.mockRejectedValue({
    response: { data: { msg: "Password-reset email is not configured yet." } },
  });
  mount(<ForgotPasswordPage />);
  fireEvent.change(screen.getByLabelText("Email address"), {
    target: { value: "admin@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("not configured");
});
test("reset page rejects a missing token without asking for a password", () => {
  window.history.replaceState({}, "", "/reset-password");
  mount(<ResetPasswordPage />);
  expect(
    screen.getByText("This reset link is missing or invalid."),
  ).toBeInTheDocument();
  expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
});
test("reset page checks password confirmation before sending a request", async () => {
  window.history.replaceState(
    {},
    "",
    "/reset-password#token=" + "a".repeat(64),
  );
  mount(<ResetPasswordPage />);
  fireEvent.change(screen.getByLabelText("New password"), {
    target: { value: "test-passphrase-one" },
  });
  fireEvent.change(screen.getByLabelText("Confirm new password"), {
    target: { value: "test-passphrase-two" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Reset password", exact: true }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("do not match");
  expect(api.post).not.toHaveBeenCalled();
});
test("a successful reset clears the local session and offers sign in", async () => {
  window.history.replaceState(
    {},
    "",
    "/reset-password#token=" + "b".repeat(64),
  );
  api.post.mockResolvedValue({ data: {} });
  const clearSession = vi.fn();
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ clearSession }}>
        <ResetPasswordPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  for (const label of ["New password", "Confirm new password"])
    fireEvent.change(screen.getByLabelText(label), {
      target: { value: "test-passphrase-one" },
    });
  fireEvent.click(
    screen.getByRole("button", { name: "Reset password", exact: true }),
  );
  expect(
    await screen.findByText(/Your password has been reset/),
  ).toBeInTheDocument();
  expect(clearSession).toHaveBeenCalledOnce();
  expect(window.location.hash).toBe("");
});
test("profile saves editable fields without sending account identity or privilege fields", async () => {
  const profile = {
    id: "a",
    username: "Tester",
    email: "test@example.com",
    isAdmin: false,
    displayName: "",
    city: "",
    bio: "",
    preference: "none",
  };
  api.get.mockResolvedValue({ data: { user: profile } });
  api.patch.mockResolvedValue({
    data: { user: { ...profile, displayName: "Food lover" } },
  });
  const updateUser = vi.fn();
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ updateUser, clearSession: vi.fn() }}>
        <ProfilePage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  await screen.findByLabelText("Display name");
  fireEvent.change(screen.getByLabelText("Display name"), {
    target: { value: "Food lover" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
  expect(
    await screen.findByText("Your profile has been saved."),
  ).toBeInTheDocument();
  expect(api.patch).toHaveBeenCalledWith("/auth/me", {
    displayName: "Food lover",
    city: "",
    bio: "",
    preference: "none",
  });
  expect(updateUser).toHaveBeenCalled();
});
