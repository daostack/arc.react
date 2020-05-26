import * as React from "react";
import memoize from "memoize-one";
import { Subscription } from "rxjs";
// TODO: This should not be opinionated to arc
import {
  Entity as StatefulEntity,
  IEntityState as IStatefulEntityData,
} from "@daostack/arc.js";
import { MaybeAsync, executeMaybeAsyncFunction } from "./utils/async";
import { ComponentLogs } from "./logging/ComponentLogs";

export interface State<Data extends IStatefulEntityData> {
  data?: Data;
  // Diagnostics for the component
  logs: ComponentLogs;
}

export interface ComponentProps<
  Entity extends StatefulEntity<Data>,
  Data extends IStatefulEntityData
> {
  noSub?: boolean;
  entity?: Entity;
}

export abstract class Component<
  Props extends ComponentProps<Entity, Data>,
  Entity extends StatefulEntity<Data>,
  Data extends IStatefulEntityData
> extends React.Component<Props, State<Data>> {
  // Create the entity this component represents. This entity gives access
  // to the component's data. For example: DAO, Proposal, Member.
  // Note: This entity is not within the component's state, but instead a memoized
  // property that will be recreated whenever necessary. See `private entity` below...
  protected abstract createEntity(): MaybeAsync<Entity>;

  // Complete any asynchronous initialization work needed by the Entity
  protected async initialize(entity: Entity): Promise<void> {
    try {
      const state = await entity.fetchState();
      this.onQueryData(state);
    } catch (e) {
      this.onQueryError(e);
    }
  }

  // See here for more information on the React.Context pattern:
  // https://reactjs.org/docs/context.html
  public static EntityContext: React.Context<any | undefined>;
  public static DataContext: React.Context<any | undefined>;
  public static LogsContext: React.Context<ComponentLogs | undefined>;

  private entity = memoize(
    // This will only run when the function's arguments have changed :D
    // allowing us to only recreated/refetch the entity data when the props or arc context have changed.
    // See: https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
    this.createEntityWithProps
  );

  // Our graphql query's subscriber object
  private _subscription?: Subscription;

  // If the initialization logic after mount has finished
  private _initialized: boolean;

  private _entity?: Entity;

  constructor(props: Props) {
    super(props);

    this._initialized = false;

    this.state = {
      logs: new ComponentLogs(),
    };
    this.onQueryData = this.onQueryData.bind(this);
    this.onQueryError = this.onQueryError.bind(this);
    this.onQueryComplete = this.onQueryComplete.bind(this);
  }

  // This trick allows us to access the static objects
  // defined in the derived class. See this code sample:
  // https://github.com/Microsoft/TypeScript/issues/5989#issuecomment-163066313
  // @ts-ignore: This should always be there
  "constructor": typeof Component;

  public render() {
    const EntityProvider = this.constructor.EntityContext.Provider as any;
    const DataProvider = this.constructor.DataContext.Provider as any;
    const LogsProvider = this.constructor.LogsContext.Provider;

    const children = this.props.children;
    const { data, logs } = this.state;

    // create & fetch the entity whenever the props change
    this.entity(this.props);

    // if we're initialized, get the stored entity
    const entity = this._initialized ? this._entity : undefined;

    logs.reactRendered();

    return (
      <>
        <EntityProvider value={entity}>
          <DataProvider value={data}>
            <LogsProvider value={logs}>{children}</LogsProvider>
          </DataProvider>
        </EntityProvider>
      </>
    );
  }

  public async componentDidMount(): Promise<void> {
    const { logs } = this.state;

    try {
      await this.entity(this.props);
      this.forceUpdate();
    } catch (e) {
      logs.entityCreationFailed(e);
      this.setState({
        logs: logs.clone(),
      });
    }

    return Promise.resolve();
  }

  public componentWillUnmount() {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = undefined;
    }
  }

  private async createEntityWithProps(
    props: Props
  ): Promise<Entity | undefined> {
    const { logs } = this.state;
    const { entity } = this.props;

    logs.entityCreated();

    // TODO: find a way to get rid of this, as it's
    //causing a react warning/error during render.
    this.clearPrevState();

    try {
      if (entity !== undefined) {
        this._entity = entity;
      } else {
        const func = this.createEntity.bind(this);
        this._entity = await executeMaybeAsyncFunction(func);
      }

      if (!this._entity) {
        throw Error(`This should never happen, Entity undefined.`);
      }

      logs.dataQueryStarted();
      await this.initialize(this._entity);
      this._initialized = true;

      if (this._subscription) {
        this._subscription.unsubscribe();
      }

      // by default we subscribe to this entity's state changes
      if (!props.noSub) {
        this._subscription = this._entity
          .state({})
          .subscribe(this.onQueryData, this.onQueryError, this.onQueryComplete);
      }

      this.forceUpdate();
      return this._entity;
    } catch (e) {
      logs.entityCreationFailed(e);
      this.setState({
        data: this.state.data,
        logs: logs.clone(),
      });
      return undefined;
    }
  }

  private clearPrevState() {
    this.setState({
      data: undefined,
    });
  }

  private onQueryData(data: Data) {
    const { logs } = this.state;
    logs.dataQueryReceivedData();
    this.setState({
      data,
    });
  }

  private onQueryError(error: Error) {
    const { logs } = this.state;
    logs.dataQueryFailed(error);
    this.setState({
      logs: logs.clone(),
    });
  }

  private onQueryComplete() {
    const { logs } = this.state;
    logs.dataQueryCompleted();
    this.setState({
      logs: logs.clone(),
    });
  }
}
