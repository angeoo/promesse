import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders label and responds to click", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Tester</Button>);

    const button = screen.getByRole("button", { name: /tester/i });
    await user.click(button);

    expect(button).toBeEnabled();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loader when loading", () => {
    render(<Button loading>Chargement</Button>);
    expect(screen.getByRole("button", { name: /chargement/i })).toHaveAttribute("aria-busy", "true");
  });
});
