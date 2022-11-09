import { render, screen } from "@testing-library/react";
import UrlConnect from "../views/UrlConnect";
import "@testing-library/jest-dom";

describe("UrlConnect", () => {
  it("host url setting and connection msg not visible", () => {
    render(<UrlConnect />);

    expect(screen.getByRole("textbox")).toHaveDisplayValue(
      "https://testproject-wordpress-10312022.lcbits.com/wp-json/wp/v2/posts"
    );
    expect(screen.getByTestId("msg")).not.toBeVisible();
  });
});
