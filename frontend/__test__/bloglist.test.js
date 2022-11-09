import { render, screen } from "@testing-library/react";
import BlogList from "../views/BlogList";
import "@testing-library/jest-dom";

describe("BlogList", () => {
  render(<BlogList />);
  it("post list visible", () => {
    expect(screen.getByTestId("posts")).toBeVisible();
  });
});
