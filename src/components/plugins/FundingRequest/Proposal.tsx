import * as React from "react";
import {
  FundingRequestProposal as Entity,
  IFundingRequestProposalState as Data,
} from "@daostack/arc.js";
import {
  Arc as Protocol,
  ArcConfig as ProtocolConfig,
  Component,
  ComponentLogs,
  ComponentProps,
  Proposal,
} from "../../../";
import { CreateContextFeed } from "../../../runtime/ContextFeed";

interface RequiredProps extends ComponentProps<Entity, Data> {
  // Proposal ID
  id?: string | Entity;
}

interface InferredProps extends RequiredProps {
  config: ProtocolConfig;
  id: string | Entity;
}

class InferredFundingRequestProposal extends Component<
  InferredProps,
  Entity,
  Data
> {
  protected createEntity(): Entity {
    const { config, id } = this.props;
    if (!config) {
      throw Error(
        "Arc Config Missing: Please provide this field as a prop, or use the inference component."
      );
    }

    const proposalId = typeof id === "string" ? id : id.id;
    return new Entity(config.connection, proposalId);
  }

  public static get Entity() {
    return CreateContextFeed(
      this.EntityContext.Consumer,
      this.LogsContext.Consumer,
      "FundingRequestProposal"
    );
  }

  public static get Data() {
    return CreateContextFeed(
      this.DataContext.Consumer,
      this.LogsContext.Consumer,
      "FundingRequestProposal"
    );
  }

  public static get Logs() {
    return CreateContextFeed(
      this.LogsContext.Consumer,
      this.LogsContext.Consumer,
      "FundingRequestProposal"
    );
  }

  public static EntityContext = React.createContext<Entity | undefined>(
    undefined
  );
  public static DataContext = React.createContext<Data | undefined>(undefined);
  public static LogsContext = React.createContext<ComponentLogs | undefined>(
    undefined
  );
}

function useFundingRequestProposal(): [Data | undefined, Entity | undefined] {
  const data = React.useContext<Data | undefined>(
    InferredFundingRequestProposal.DataContext
  );
  const entity = React.useContext<Entity | undefined>(
    InferredFundingRequestProposal.EntityContext
  );

  return [data, entity];
}

class FundingRequestProposal extends React.Component<RequiredProps> {
  public render() {
    const { id, children } = this.props;

    const renderInferred = (id: string | Entity) => (
      <Protocol.Config>
        {(config: ProtocolConfig) => (
          <InferredFundingRequestProposal id={id} config={config}>
            {children}
          </InferredFundingRequestProposal>
        )}
      </Protocol.Config>
    );

    if (!id) {
      return (
        <Proposal.Entity>
          {(proposal: Entity) => renderInferred(proposal.id)}
        </Proposal.Entity>
      );
    } else {
      return renderInferred(id);
    }
  }

  public static get Entity() {
    return InferredFundingRequestProposal.Entity;
  }

  public static get Data() {
    return InferredFundingRequestProposal.Data;
  }

  public static get Logs() {
    return InferredFundingRequestProposal.Logs;
  }
}

export default FundingRequestProposal;

export {
  InferredFundingRequestProposal,
  FundingRequestProposal,
  Entity as FundingRequestProposalEntity,
  Data as FundingRequestProposalData,
  useFundingRequestProposal,
};
