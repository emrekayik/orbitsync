import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders correctly with default props", () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement.className).toContain("bg-primary");
  });

  it("renders as a child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const linkElement = screen.getByRole("link", { name: /link button/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", "/test");
  });

  it("applies the correct variant classes", () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByRole("button", { name: /delete/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement.className).toContain("text-destructive");
  });
});
