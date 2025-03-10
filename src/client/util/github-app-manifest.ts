import ApiEndpoints from "../../common/api-endpoints";
import ClientPages from "../pages/client-pages";

interface ManifestSettings {
  public: boolean,
}

export function getGitHubAppManifest(appUrl: string, manifestSettings: ManifestSettings): Record<string, unknown> {
  // the redirect url is the first one, which is redirected to after the app is created
  const redirectUrl = appUrl + ClientPages.SetupCreatingApp;

  // the callback url is the second one, which is redirect to after the app is installed
  const callbackUrl = appUrl + ClientPages.SetupInstalledApp;
  // the setup url is redirected to after the app is updated
  const setupUrl = callbackUrl + "?reload=true";

  const incomingWebhookUrl = appUrl + ApiEndpoints.Webhook.path;

  // https://docs.github.com/en/developers/apps/creating-a-github-app-from-a-manifest#github-app-manifest-parameters
  // the following parameters can also be in this payload (though you wouldn't know from the manifest doc)
  // https://docs.github.com/en/developers/apps/creating-a-github-app-using-url-parameters#github-app-configuration-parameters
  /* eslint-disable camelcase */
  return {
    name: "OpenShift Actions Connector",
    description: "Connect your OpenShift cluster to GitHub Actions",
    url: "https://github.com/redhat-actions",
    hook_attributes: {
      url: incomingWebhookUrl,
    },
    request_oauth_on_install: true,
    callback_url: callbackUrl,
    redirect_url: redirectUrl,
    setup_url: setupUrl,
    setup_on_update: true,
    public: manifestSettings.public,
    default_permissions: {
      actions: "write",
      secrets: "write",
      // TODO
      contents: "write",
      workflows: "write",
    },
    default_events: [
      "workflow_run",
    ],
  };
  /* eslint-enable camelcase */
}
