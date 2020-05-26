import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import {
  Arc,
  ArcConfig,
  DAO,
  Loader,
  LoadingRenderProps,
  DAOData,
} from "../src";

describe("Custom loader ", () => {
  afterEach(() => cleanup());

  const arcConfig = new ArcConfig("private");

  it("Shows custom message", async () => {
    const daoAddress = "0x28d0cff49cc653632b91ef61ccb1b2cde7b952a9";
    const { container } = render(
      <Loader
        render={(props: LoadingRenderProps) => (
          <div>
            {props.errors.length > 0
              ? props.errors.map((error) => error)
              : "Loading without errors"}
          </div>
        )}
      >
        <Arc config={arcConfig}>
          <DAO address={daoAddress}>
            <DAO.Data>
              {(dao: DAOData) => <div>{"DAO name: " + dao.name}</div>}
            </DAO.Data>
          </DAO>
        </Arc>
      </Loader>
    );

    const loader = await screen.findByText("Loading without errors");
    expect(loader).toBeInTheDocument();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        Loading without errors
      </div>
    `);
  });

  it("Shows error", async () => {
    const { container } = render(
      <Loader
        render={(props: LoadingRenderProps) => (
          <div>
            {props.errors.length > 0
              ? props.errors.map((error) => error)
              : "Loading without errors"}
          </div>
        )}
      >
        <Arc config={arcConfig}>
          <DAO address={"non existent id"}>
            <DAO.Data>
              {(dao: DAOData) => <div>{"Name: " + dao.name}</div>}
            </DAO.Data>
          </DAO>
        </Arc>
      </Loader>
    );

    const error = await screen.findByText(/Could not find DAO with id/);
    expect(error).toBeInTheDocument();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        DAO ItemMap failed. Could not find DAO with id 'non existent id'
      </div>
    `);
  });
});
