import classNames from "classnames";
import React, { useState } from "react";
import {
  Button, Card, CardTitle, CardBody, Checkbox,
} from "@patternfly/react-core";
import { v4 as uuid } from "uuid";

import {
  BookOpenIcon, ExclamationTriangleIcon, GithubIcon, PlusIcon,
} from "@patternfly/react-icons";
import ApiEndpoints from "../../../../common/api-endpoints";
import ApiRequests from "../../../../common/api-requests";
import Banner from "../../../components/banner";
import { ExternalLink } from "../../../components/external-link";
import BtnBody from "../../../components/btn-body";
import { getWindowLocationNoPath, fetchJSON } from "../../../util/client-util";
import { getGitHubAppManifest } from "../../../util/github-app-manifest";

export const CREATE_NEW_TITLE = "Create New App";

export default function CreateAppCard(): JSX.Element {
  const [ publicChecked, setPublicChecked ] = useState(true);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState<string | undefined>(undefined);

  const state = uuid();

  const manifestFormId = "manifest-form";
  const manifestInputId = "manifest-input";
  // const enterpriseCheckboxId = "enterprise-checkbox";

  const githubManifestUrl = `https://github.com/settings/apps/new?state=${state}`;

  return (
    <React.Fragment>
      <Card>
        <CardTitle>
          {CREATE_NEW_TITLE}

          <Button variant="tertiary" className="ml-auto">
            <ExternalLink href="https://github.com/settings/apps/" icon={{ icon: GithubIcon, position: "left" }} >
              View your apps
            </ExternalLink>
          </Button>
        </CardTitle>
        <CardBody>
          <div>
            <Checkbox
              id="public-app"
              isChecked={publicChecked}
              onChange={(checked) => setPublicChecked(checked)}
              label="Public app"
            />
            <p className={classNames({ "d-none": publicChecked })}>
              <ExclamationTriangleIcon className="text-warning mr-2"/>
              If you make your app private, no one else will be able to install it.
            </p>
            <p>
              Public apps do not give users that install your app any access.
              Rather, users who install your app are giving the app permission to act on their behalf.
            </p>
            <p>
              A public app is recommended so your team members can share it.
            </p>

            <p>
              You can change this later in the GitHub app settings.
            </p>
            <p className="my-3">
              <ExternalLink href="https://docs.github.com/en/developers/apps/making-a-github-app-public-or-private"
                icon={{ icon: BookOpenIcon, position: "left" }}
              >
                Read more about public and private apps.
              </ExternalLink>
            </p>
          </div>

          <div className="d-flex flex-column align-items-center my-3">
            <form className="" id={manifestFormId} method="post" action={githubManifestUrl} onSubmit={
              async (e) => {
                e.preventDefault();
                setIsLoading(true);
                try {
                  const appManifest = getGitHubAppManifest(getWindowLocationNoPath(), { public: publicChecked });
                  const manifestInput = document.getElementById(manifestInputId) as HTMLInputElement;
                  manifestInput.value = JSON.stringify(appManifest);

                  await fetchJSON<ApiRequests.CreateCallbackState>("POST", ApiEndpoints.Setup.SetCreateAppState.path, {
                    state,
                  });

                  const manifestForm = document.getElementById(manifestFormId) as HTMLFormElement;
                  manifestForm.submit();
                }
                catch (err) {
                  setError(`Failed to start creation flow: ${err.message}`);
                }
                finally {
                  setTimeout(() => setIsLoading(false), 500);
                }
              }
            }>
              <input id={manifestInputId} className="d-none" name="manifest" type="manifest" readOnly={true} />
            </form>

            <Button type="submit" className="mt-2" form={manifestFormId}>
              <BtnBody icon={PlusIcon} text={CREATE_NEW_TITLE} isLoading={isLoading} />
            </Button>

          </div>

          <Banner title={error ?? ""} display={error != null} severity="danger" />

        </CardBody>
      </Card>
    </React.Fragment>
  );
}
