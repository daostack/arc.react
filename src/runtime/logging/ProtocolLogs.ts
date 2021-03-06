import { ConfigLogs } from "./types";
import { LoggingConfig } from "./LoggingConfig";

export class ProtocolLogs {
  public get config(): ConfigLogs | undefined {
    return this._config;
  }

  public get getConfig(): ConfigLogs {
    if (!this._config) this._config = new ConfigLogs();
    return this._config;
  }

  private _config?: ConfigLogs;

  public configInitializeStarted() {
    if (!LoggingConfig.Current.enabled) return;
    this.getConfig.initializeStarted();
  }

  public configInitializeCompleted() {
    if (!LoggingConfig.Current.enabled) return;
    this.getConfig.initializeCompleted();
  }

  public configInitializeFailed(error: Error) {
    if (!LoggingConfig.Current.enabled) return;
    this.getConfig.initializeFailed(error);
  }

  public clone(): ProtocolLogs {
    var clone = new ProtocolLogs();
    clone._config = this.config;
    return clone;
  }
}
