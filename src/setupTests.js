import "@testing-library/jest-dom/vitest";

// jsdom tidak mengimplementasikan scrollIntoView
Element.prototype.scrollIntoView = vi.fn();
