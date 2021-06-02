import React from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import classNames from "classnames";
import {
  Button, Card, CardTitle, CardBody,
} from "@patternfly/react-core";

import { ExternalLink } from "./external-link";
import BtnBody from "./btn-body";

export default function appPageCard(props: {
    header: string,
    buttons: {
      href: string,
      icon: IconProp,
      text: string,
    }[],
    children: React.ReactNode,
}): JSX.Element {
  return (
    <Card>
      <CardTitle>
        <div>
          {props.header}
        </div>
        <div className="ml-auto"></div>
        <div className="btn-line">
          {
            props.buttons.map((btnProps, i) => {
              return (
                <Button variant="primary" key={i}
                  className={classNames("flex-grow-1")}
                  title={btnProps.text}
                >
                  <ExternalLink href={btnProps.href}>
                    <BtnBody icon={btnProps.icon} text={btnProps.text} />
                  </ExternalLink>
                </Button>
              );
            })
          }
        </div>
      </CardTitle>
      <CardBody>
        {props.children}
      </CardBody>
    </Card>
  );
}
