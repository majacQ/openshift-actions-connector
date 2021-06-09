import express from "express";

import ApiEndpoints from "common/api-endpoints";
import { send405 } from "server/util/send-error";
import ApiResponses from "common/api-responses";
import User from "server/lib/user";
import { deleteSecrets } from "common/types/gh-types";
import GitHubApp from "server/lib/github/gh-app";

const router = express.Router();

router.route(ApiEndpoints.User.App.path)
  .get(async (req, res: express.Response<ApiResponses.UserAppState>, next) => {
    const user = await User.getUserForSession(req, res);
    if (!user) {
      return undefined;
    }

    // there are four states which correspond to the subtypes of ApiResponses.GitHubAppState,
    // depending on two variables -
    // 1. does the user own an app?
    // 2. does the user have an app installed?

    let installedAppResponse: ApiResponses.UserAppInstalled | undefined;
    let installedAppData: ApiResponses.UserAppInstalledData | undefined;

    if (user.installation != null) {
      installedAppData = {
        installation: await user.installation.getInstallation(),
        installUrls: user.installation.urls,
        repos: await user.installation.getRepos(),
      };

      installedAppResponse = {
        installed: true,
        owned: false,
        success: true,

        appData: {
          html_url: user.installation.app.config.html_url,
          name: user.installation.app.config.name,
          slug: user.installation.app.config.slug,
        },
        installedAppData,
      };
    }

    if (user.ownsAppId != null) {
      // owned
      const ownedApp = await GitHubApp.load(user.ownsAppId);
      if (!ownedApp) {
        throw new Error(`User "${user.name} owns app ${user.ownsAppId} but that app was not found`);
      }

      const appData = {
        html_url: ownedApp.config.html_url,
        name: ownedApp.config.name,
        slug: ownedApp.config.slug,
      };

      const ownedAppData: ApiResponses.UserOwnedAppData = {
        appConfig: deleteSecrets(ownedApp.config),
        installations: await ownedApp.getInstallations(),
        ownerUrls: ownedApp.urls,
      };

      if (installedAppData != null) {
        // owned and installed

        const combinedData: ApiResponses.UserAppOwnedAndInstalled = {
          success: true,

          // this is duplicated in this obj
          appData,
          installedAppData,
          installed: true,
          ownedAppData,
          owned: true,
        };

        return res.json(combinedData);
      }

      const ownedAppResponse: ApiResponses.UserAppOwned = {
        success: true,
        installed: false,
        owned: true,

        appData,
        ownedAppData,
      };

      // owned but not installed
      return res.json(ownedAppResponse);
    }

    // not owned

    if (!installedAppResponse) {
      // neither owned nor installed

      const resBody: ApiResponses.GitHubAppMissing = {
        message: `User "${user.name}" does not own an app, or have an app installed.`,
        success: false,
      };

      return res.json(resBody);
    }

    // not owned, but installed
    return res.json(installedAppResponse);
  })
  .delete(async (
    req, res: express.Response<ApiResponses.RemovalResult>, next
  ) => {
    const user = await User.getUserForSession(req, res);
    if (!user) {
      return undefined;
    }

    const removed = await user.removeInstallation();
    const message = removed
      ? `Removed app installation from ${user.name}"`
      : `No installation was found for ${user.name}`;

    return res.json({
      success: true,
      message,
      removed,
    });
  })
  .all(send405([ "GET", "DELETE" ]));

export default router;
