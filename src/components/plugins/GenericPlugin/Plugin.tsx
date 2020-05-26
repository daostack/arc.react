import * as React from "react";
import {
  GenericPlugin as Entity,
  IGenericPluginState as Data,
} from "@daostack/arc.js";
import { CreateContextFeed } from "../../../runtime/ContextFeed";
import {
  Arc as Protocol,
  ArcConfig as ProtocolConfig,
  Component,
  ComponentLogs,
  ComponentProps,
  Plugin,
} from "../../../";

interface RequiredProps extends ComponentProps<Entity, Data> {
  // Plugin ID
  id?: string | Entity;
}

interface InferredProps extends RequiredProps {
  config: ProtocolConfig;
  id: string | Entity;
}

class InferredGenericPlugin extends Component<InferredProps, Entity, Data> {
  protected createEntity(): Entity {
    const { config, id } = this.props;

    if (!config) {
      throw Error(
        "Arc Config Missing: Please provide this field as a prop, or use the inference component."
      );
    }

    const pluginId = typeof id === "string" ? id : id.id;
    return new Entity(config.connection, pluginId);
  }

  public static get Entity() {
    return CreateContextFeed(
      this.EntityContext.Consumer,
      this.LogsContext.Consumer,
      "GenericPlugin"
    );
  }

  public static get Data() {
    return CreateContextFeed(
      this.DataContext.Consumer,
      this.LogsContext.Consumer,
      "GenericPlugin"
    );
  }

  public static get Logs() {
    return CreateContextFeed(
      this.LogsContext.Consumer,
      this.LogsContext.Consumer,
      "GenericPlugin"
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

function useGenericPlugin(): [Data | undefined, Entity | undefined] {
  const data = React.useContext<Data | undefined>(
    InferredGenericPlugin.DataContext
  );
  const entity = React.useContext<Entity | undefined>(
    InferredGenericPlugin.EntityContext
  );

  return [data, entity];
}

class GenericPlugin extends React.Component<RequiredProps> {
  public render() {
    const { id, children } = this.props;

    const renderInferred = (id: string | Entity) => (
      <Protocol.Config>
        {(config: ProtocolConfig) => (
          <InferredGenericPlugin id={id} config={config}>
            {children}
          </InferredGenericPlugin>
        )}
      </Protocol.Config>
    );

    if (!id) {
      return (
        <Plugin.Entity>
          {(proposal: Entity) => renderInferred(proposal.id)}
        </Plugin.Entity>
      );
    } else {
      return renderInferred(id);
    }
  }

  public static get Entity() {
    return InferredGenericPlugin.Entity;
  }

  public static get Data() {
    return InferredGenericPlugin.Data;
  }

  public static get Logs() {
    return InferredGenericPlugin.Logs;
  }
}

export default Plugin;

export {
  GenericPlugin,
  InferredGenericPlugin,
  Entity as GenericPluginEntity,
  Data as GenericPluginData,
  useGenericPlugin,
};
