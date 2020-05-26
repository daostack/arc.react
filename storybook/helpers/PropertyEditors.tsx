import * as React from "react";
import * as R from "ramda";
import { Checkbox, TextField, FormControlLabel } from "@material-ui/core";

export enum PropertyType {
  string,
  object,
  number,
  boolean,
}

export type Converter = (value: any) => any;

export interface PropertyData {
  friendlyName: string;
  name: string;
  type: PropertyType;
  defaultValue: any;
  converter?: Converter;
  // TODO: dropdown -> possibleValues: any[]
}

interface Props {
  properties: PropertyData[];
  state: any;
  setState: (state: any) => void;
}

export class PropertyEditors extends React.Component<Props> {
  handleChange = (
    name: string,
    prop: string,
    converter: Converter | undefined
  ) => (event: any) => {
    let value = event.target[prop];
    if (converter) {
      value = converter(value);
    }
    this.props.setState(
      R.merge(this.props.state, {
        [name]: value,
      })
    );
  };

  public render() {
    const { properties, state, setState } = this.props;

    return (
      <>
        {properties.map((prop) => {
          // set the default value if it isn't already set
          if (state[prop.name] === undefined) {
            setState(
              R.merge(state, {
                [prop.name]: prop.defaultValue,
              })
            );
          }

          // TODO get rid of this switch by having the caller
          // give render methods for their types (with args they want forwarded)
          switch (prop.type) {
            case PropertyType.string:
              return (
                <TextField
                  style={{ marginTop: 12, marginBottom: 12 }}
                  id={`prop-editor-${prop.name}`}
                  label={prop.friendlyName}
                  value={state[prop.name]}
                  onChange={this.handleChange(
                    prop.name,
                    "value",
                    prop.converter
                  )}
                  variant="outlined"
                />
              );
              break;
            case PropertyType.number:
              return <></>;
              break;
            case PropertyType.boolean:
              return (
                <FormControlLabel
                  control={
                    <Checkbox
                      id={`prop-editor-${prop.name}`}
                      value={prop.friendlyName}
                      checked={state[prop.name]}
                      onChange={this.handleChange(
                        prop.name,
                        "checked",
                        prop.converter
                      )}
                    />
                  }
                  label={prop.friendlyName}
                  labelPlacement="top"
                />
              );
              break;
            default:
              return <></>;
              break;
          }
        })}
      </>
    );
  }
}
