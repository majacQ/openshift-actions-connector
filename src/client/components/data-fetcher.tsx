import React from "react";
import { Card, CardBody, Spinner } from "@patternfly/react-core";
import UrlPath from "../../common/types/url-path";
import { fetchJSON } from "../util/client-util";

interface BaseDataFetcherProps<Data> {
    children: (data: Data, reload: () => Promise<void>) => React.ReactNode,
    type: "generic" | "api",
    loadingDisplay?: "text" | "spinner" | "card" | "card-body" | "none" | JSX.Element,
    loadingStyle?: React.CSSProperties,
}

interface GenericDataFetcherProps<Data> extends BaseDataFetcherProps<Data> {
    type: "generic",
    fetchData: () => Promise<Data>,
}

interface ApiDataFetcherProps<Data> extends BaseDataFetcherProps<Data> {
    type: "api",
    endpoint: UrlPath,
}

type DataFetcherProps<Data> = GenericDataFetcherProps<Data> | ApiDataFetcherProps<Data>;

interface DataFetcherState<Data> {
    data: Data | undefined,
    loaded: boolean,
    loadingError: Error | undefined,
}

// Heavily inspired by https://github.com/argoproj/argo-ui/blob/master/src/components/data-loader.tsx
// Usage: https://github.com/argoproj/argo-ui/blob/master/stories/data-loader.tsx

/**
 * Utility component which can load data asynchronously and then pass the data to children.
 */
export default class DataFetcher<Data> extends React.Component<DataFetcherProps<Data>, DataFetcherState<Data>> {

  constructor(
    props: DataFetcherProps<Data>,
  ) {
    super(props);
    this.state = { data: undefined, loadingError: undefined, loaded: false };
  }

  static getDerivedStateFromError(error: any) {
    return { loadingError: error };
  }

  override async componentDidMount(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.setState({
      data: undefined,
      loadingError: undefined,
      loaded: false,
    });

    try {
      let data: Data;
      if (this.props.type === "api") {
        data = await fetchJSON<{}, Data>("GET", this.props.endpoint.path);
      }
      else {
        data = await this.props.fetchData();
      }

      this.setState({
        data,
        loadingError: undefined,
      });
    }
    catch (err) {
      console.warn(`Error loading data:`, err);
      this.setState({ loadingError: err });
    }
    finally {
      // If you receive an error on this line "Objects are not valid as a React child"
      // It is not a problem with the DataFetcher - somewhere in a DataFetcher's child you have put an object in JSX that should be a string
      // The browser console will contain a trace of the error element
      this.setState({ loaded: true });
    }
  }

  override render() {
    const cardSpinnerSize = "lg";

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.state == null || !this.state.loaded) {
      const loadingDisplayType = this.props.loadingDisplay ?? "text";
      if (loadingDisplayType === "text") {
        return (
          <span style={this.props.loadingStyle}>Loading...</span>
        );
      }
      else if (loadingDisplayType === "spinner") {
        const loadingStyle = this.props.loadingStyle ?? {};
        return (
          <Spinner style={loadingStyle} diameter="1em"/>
        );
      }
      else if (loadingDisplayType === "card") {
        return (
          <Card style={{ minHeight: "100px" }}>
            <CardBody className="centers">
              <Spinner style={this.props.loadingStyle ?? {}} size={cardSpinnerSize}/>
            </CardBody>
          </Card>
        );
      }
      else if (loadingDisplayType === "card-body") {
        return (
          <CardBody className="centers">
            <Spinner style={this.props.loadingStyle ?? {}} size={cardSpinnerSize} />
          </CardBody>
        );
      }
      else if (loadingDisplayType === "none") {
        return (<></>);
      }
      return loadingDisplayType;
    }
    else if (this.state.loadingError) {
      return (
        <p className="text-danger">
          {this.state.loadingError.message}
        </p>
      );
    }
    else if (this.state.data == null) {
      return (
        <p className="text-danger">
          Data to fetch was {this.state.data}.
        </p>
      );
    }
    return this.props.children(this.state.data, async () => {
      console.log("DataFetcher reload");
      await this.load();
    });
  }
}
