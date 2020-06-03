import React from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { Arc, ArcConfig, DAO, EmptyView, Proposals } from "../src";

describe("Custom Empty view ", () => {
  afterEach(() => cleanup());

  const arcConfig = new ArcConfig("private");

  it("Shows nothing", async () => {
    const { findByTestId } = render(
      <Arc config={arcConfig}>
        <DAO address={"non existent id"}>
          <Proposals />
        </DAO>
      </Arc>
    );

    const emptyDiv = await findByTestId("default-empty-div");
    expect(emptyDiv).toBeInTheDocument();
  });

  it("Shows custom message", async () => {
    const { container } = render(
      <EmptyView render={() => <div>No proposals from this DAO</div>}>
        <Arc config={arcConfig}>
          <DAO address={"non existent id"}>
            <Proposals />
          </DAO>
        </Arc>
      </EmptyView>
    );

    const error = await screen.findByText(/No proposals from this DAO/);
    expect(error).toBeInTheDocument();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        No proposals from this DAO
      </div>
    `);
  });
});
