import React, { useState } from "react";
import {
  Card, CardTitle, CardBody, Checkbox,
} from "@patternfly/react-core";

import ApiEndpoints from "../../../../common/api-endpoints";
import ApiResponses from "../../../../common/api-responses";
import DataFetcher from "../../../components/data-fetcher";
import CreateAppCard from "./create-app";
import InstallExistingAppCard from "./install-existing-app";
import SetupPageHeader from "../setup-header";

export default function SetupAppPage(): JSX.Element {

  const [ createOrUse, setCreateOrUse ] = useState<"create" | "use-existing">();
  const [ enterpriseChecked, setEnterpriseChecked ] = useState(false);

  return (
    <React.Fragment>
      <SetupPageHeader pageIndex={1} hideBtnBanner={true}/>

      <DataFetcher type="api" endpoint={ApiEndpoints.App.Existing} loadingDisplay="card" >{
        (data: ApiResponses.Result) => {
          const appExists = data.success;

          setCreateOrUse(appExists ? "use-existing" : "create");

          return (
            <React.Fragment>
              <Card>
                <CardTitle>
                  Set up GitHub App
                </CardTitle>
                <CardBody>
                  <p>This is a description of what an app is, with links to GitHub documentation.</p>

                  <p>
                    {
                      appExists
                        ? "An app has been set up previously, so you must use that app."
                        : "No app has been set up yet, so you must create one."
                    }
                  </p>
                  <p>
                  </p>

                  <div className="d-none border-bottom px-2 py-3">
                    <Checkbox
                      id="use-ghe"
                      isDisabled={true}
                      isChecked={enterpriseChecked}
                      onChange={(checked) => setEnterpriseChecked(checked)}
                      label="Use GitHub Enterprise"
                    />
                    <p>
                      Use a GitHub Enterprise (GHE) instance instead of <code>github.com</code>. The GHE instance must be reachable from this cluster.
                    </p>
                    <p>
                      This cannot be changed later without creating another app.
                    </p>
                  </div>

                  {/* <div className="btn-line justify-content-around mt-4 mb-3">
                    <Button isLarge disabled={!appExists} active={createOrUse === "use-existing"} onClick={() => setCreateOrUse("use-existing")}>
                      <BtnBody icon="search" text={USE_EXISTING_TITLE} />
                    </Button>
                    <span className="text-lg">
                      or
                    </span>
                    <Button isLarge disabled={appExists} active={createOrUse === "create"} onClick={() => setCreateOrUse("create")}>
                      <BtnBody icon="plus" text={CREATE_NEW_TITLE} />
                    </Button>
                  </div> */}
                </CardBody>
              </Card>

              {
                createOrUse === "create" ? <CreateAppCard /> : <InstallExistingAppCard />
              }
            </React.Fragment>
          );
        }
      }
      </DataFetcher>

    </React.Fragment>
  );
}
