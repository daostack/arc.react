import * as React from "react";
import {
  CompetitionPlugin as Entity,
  IContributionRewardExtState as Data,
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

class InferredCompetitionPlugin extends Component<InferredProps, Entity, Data> {
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
      "CompetitionPlugin"
    );
  }

  public static get Data() {
    return CreateContextFeed(
      this.DataContext.Consumer,
      this.LogsContext.Consumer,
      "CompetitionPlugin"
    );
  }

  public static get Logs() {
    return CreateContextFeed(
      this.LogsContext.Consumer,
      this.LogsContext.Consumer,
      "CompetitionPlugin"
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

class CompetitionPlugin extends React.Component<RequiredProps> {
  public render() {
    const { id, children } = this.props;

    const renderInferred = (id: string | Entity) => (
      <Protocol.Config>
        {(config: ProtocolConfig) => (
          <InferredCompetitionPlugin id={id} config={config}>
            {children}
          </InferredCompetitionPlugin>
        )}
      </Protocol.Config>
    );

    if (!id) {
      return (
        <Plugin.Entity>
          {(plugin: Entity) => renderInferred(plugin.id)}
        </Plugin.Entity>
      );
    } else {
      return renderInferred(id);
    }
  }

  public static get Entity() {
    return InferredCompetitionPlugin.Entity;
  }

  public static get Data() {
    return InferredCompetitionPlugin.Data;
  }

  public static get Logs() {
    return InferredCompetitionPlugin.Logs;
  }
}

export default CompetitionPlugin;

export {
  CompetitionPlugin,
  InferredCompetitionPlugin,
  Entity as CompetitionPluginEntity,
  Data as CompetitionPluginData,
};
