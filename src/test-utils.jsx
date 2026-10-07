import { render } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { reducer } from "./store";

export function createTestStore(preloadedState) {
  return configureStore({ reducer, preloadedState });
}

export function renderWithProviders(
  ui,
  { preloadedState, store = createTestStore(preloadedState), route = "/", ...options } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}
