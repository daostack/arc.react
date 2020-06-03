import React, { Component } from "react";

export type EmptyRenderFunc = (() => JSX.Element) | undefined;

export interface EmptyRenderProps {
  errors: React.ReactNode[];
}

interface Props {
  render: EmptyRenderFunc;
}

export class EmptyView extends Component<Props> {
  private static _RenderContext = React.createContext<EmptyRenderFunc>(
    undefined
  );

  public static get Render() {
    return EmptyView._RenderContext.Consumer;
  }

  public render() {
    const EmptyProvider = EmptyView._RenderContext.Provider;
    const empty = this.props.render;
    return <EmptyProvider value={empty}>{this.props.children}</EmptyProvider>;
  }
}
