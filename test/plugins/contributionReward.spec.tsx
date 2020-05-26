import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import {
  Arc,
  ArcConfig,
  PluginData,
  ProposalData,
  Proposal,
  Plugin,
  ContributionRewardPlugin,
  ContributionRewardProposal,
  ContributionRewardPluginEntity,
  useContributionRewardPlugin,
} from "../../src";

const arcConfig = new ArcConfig("private");
const pluginId =
  "0xe9e42dce678c0cab29937f1ce36de94c74e68a7e1cee9a983bc703acfe2fff40";
const proposalId =
  "0xdda5a5025e1b33ee2758d451b5485d1eaa728af090bc9576c2b71ea22d692f07";

describe("Plugin contribution reward component ", () => {
  afterEach(() => cleanup());

  it("Shows plugin name", async () => {
    const { container } = render(
      <Arc config={arcConfig}>
        <ContributionRewardPlugin id={pluginId}>
          <ContributionRewardPlugin.Data>
            {(plugin: PluginData) => <div>{"Plugin name: " + plugin.name}</div>}
          </ContributionRewardPlugin.Data>
        </ContributionRewardPlugin>
      </Arc>
    );

    const name = await screen.findByText(/Plugin name:/);
    expect(name).toBeInTheDocument();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        Plugin name: ContributionReward
      </div>
    `);
  });

  it("Works with inferred plugin", async () => {
    const { container } = render(
      <Arc config={arcConfig}>
        <Plugin id={pluginId}>
          <ContributionRewardPlugin>
            <ContributionRewardPlugin.Data>
              {(plugin: PluginData) => (
                <div>{"Plugin name: " + plugin.name}</div>
              )}
            </ContributionRewardPlugin.Data>
          </ContributionRewardPlugin>
        </Plugin>
      </Arc>
    );

    const name = await screen.findByText(/Plugin name:/);
    expect(name).toBeInTheDocument();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        Plugin name: ContributionReward
      </div>
    `);
  });

  it("Shows name using useContributionRewardPlugin", async () => {
    const ContributionRewardPluginWithHooks = () => {
      const [contributionRewardPluginData] = useContributionRewardPlugin();
      return <div>{"Plugin name: " + contributionRewardPluginData?.name}</div>;
    };
    const { container, findByText } = render(
      <Arc config={arcConfig}>
        <ContributionRewardPlugin id={pluginId}>
          <ContributionRewardPluginWithHooks />
        </ContributionRewardPlugin>
      </Arc>
    );

    const name = await findByText(/Plugin name: ContributionReward/);
    expect(name).toBeInTheDocument();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        Plugin name: ContributionReward
      </div>
    `);
  });
});

describe.skip("Proposal component ", () => {
  afterEach(() => cleanup());

  it("Shows proposal id", async () => {
    const { container } = render(
      <Arc config={arcConfig}>
        <ContributionRewardProposal id={proposalId}>
          <ContributionRewardProposal.Data>
            {(proposal: ProposalData) => (
              <div>{"Proposal id: " + proposal.id}</div>
            )}
          </ContributionRewardProposal.Data>
        </ContributionRewardProposal>
      </Arc>
    );

    const name = await screen.findByText(/Proposal id:/);
    expect(name).toBeInTheDocument();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        Proposal id: ${proposalId}
      </div>
    `);
  });

  it("Works with inferred proposal", async () => {
    const { container } = render(
      <Arc config={arcConfig}>
        <Proposal id={proposalId}>
          <ContributionRewardProposal>
            <ContributionRewardProposal.Data>
              {(proposal: ProposalData) => (
                <div>{"Proposal id: " + proposal.id}</div>
              )}
            </ContributionRewardProposal.Data>
          </ContributionRewardProposal>
        </Proposal>
      </Arc>
    );

    const name = await screen.findByText(/Proposal id:/);
    expect(name).toBeInTheDocument();
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div>
        Proposal id: ${proposalId}
      </div>
    `);
  });
});

describe("Send tx", () => {
  it.skip("Creates a new proposal", async () => {
    const { container, findByTestId } = render(
      <Arc config={arcConfig}>
        <ContributionRewardPlugin id={pluginId}>
          <ContributionRewardPlugin.Data>
            <ContributionRewardPlugin.Entity>
              {(
                entity: ContributionRewardPluginEntity,
                data: ContributionRewardPlugin
              ) => (
                <button
                  data-testid="click-me"
                  onClick={async () => {
                    await entity.createProposalTransaction({
                      dao: "0x666a6eb4618d0438511c8206df4d5b142837eb0d",
                      beneficiary: "0x61FfE691821291D02E9Ba5D33098ADcee71a3a17",
                      tags: ["proposal from dao componenets :-D"],
                      plugin: entity.coreState!.address,
                    });
                  }}
                />
              )}
            </ContributionRewardPlugin.Entity>
          </ContributionRewardPlugin.Data>
        </ContributionRewardPlugin>
      </Arc>
    );

    const loader = await findByTestId("click-me");
    fireEvent.doubleClick(loader);
  });
});
