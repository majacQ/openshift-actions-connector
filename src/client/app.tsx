import React from "react";
import { Route, Switch } from "react-router-dom";
import { Helmet } from "react-helmet";

// note PF is excluded in the console by webpack.config.plugin
import "@patternfly/react-core/dist/styles/base.css";
import "./styles/index.scss";

import ClientPages from "./pages/client-pages";
import NotFound from "./pages/errors/404";
import { getConsoleModifierClass } from "./util/client-util";

export default function app(): JSX.Element {
  return (
    <React.Fragment>
      <Helmet>
        <title>OpenShift Actions Connector</title>
      </Helmet>
      <div id="wrapper" className="d-flex w-100 justify-content-center">
        <main className={getConsoleModifierClass()}>
          <Switch>
            {
              /* Creates the Route objects that map routes to components that represent pages */
              Object.values(ClientPages).map((page) => page.route)
            }
            <Route path="*">
              <NotFound path={window.location.pathname}/>
            </Route>
          </Switch>
        </main>
      </div>
    </React.Fragment>
  );
}
