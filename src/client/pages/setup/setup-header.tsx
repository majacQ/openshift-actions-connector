import classNames from "classnames";
import { Link, useHistory } from "react-router-dom";
import { Button } from "@patternfly/react-core";

import { ArrowRightIcon, CheckCircleIcon } from "@patternfly/react-icons";
import ClientPages from "../client-pages";
import BtnBody from "../../components/btn-body";
import { getSearchParam } from "../../util/client-util";

type SetupPageProps = {
  pageIndex: number,
  hideBtnBanner?: boolean,
  /**
   * has no effect if hideBtnBanner is "true"
   */
  canProceed?: boolean,
  // children: React.ReactNode
};

type SetupStepType = "passed" | "current" | "todo";

export const SETUP_QUERYPARAM = "setup";
const query = { [SETUP_QUERYPARAM]: "true" };

function isSetup(): boolean {
  return getSearchParam(SETUP_QUERYPARAM) != null;
}

export function getSetupSteps() {
  return [
    { title: "Welcome", path: ClientPages.Welcome.withQuery(query) },
    { title: "Set up App", path: ClientPages.SetupCreateApp.withQuery(query) },
    { title: "View App", path: ClientPages.App.withQuery(query) },
    // { title: "Create Service Account", path: getSetupPath(ClientPages.SetupServiceAccount) },
    { title: "Connect Repos", path: ClientPages.ConnectRepos.withQuery(query) },
    { title: "Image Registry", path: ClientPages.ImageRegistries.withQuery(query) },
    { title: "Complete", path: ClientPages.SetupFinished.withQuery(query) },
  ];
}

export default function SetupPageHeader(props: SetupPageProps): JSX.Element {

  const history = useHistory();

  if (!isSetup()) {
    return (<></>);
  }

  const setupSteps = getSetupSteps();

  if (props.pageIndex > setupSteps.length - 1 || props.pageIndex < 0) {
    return (
      <span className="error">
        Invalid setup step index {`"${props.pageIndex}"`}
      </span>
    );
  }

  // const nextBtnText = props.pageIndex === setupSteps.length - 1 ? "Finish" : "Next";
  const nextBtnText = "Next";
  // const showBackBtn = props.pageIndex !== 0;

  return (
    <div id="setup-header">
      <div id="setup-header-body">
        <div id="setup-header-steps" className="d-flex justify-content-around">
          {setupSteps.map((step, i) => {
            const isCurrentStep = i === props.pageIndex;
            let stepType: SetupStepType;
            if (isCurrentStep) {
              stepType = "current";
            }
            else if (props.pageIndex > i) {
              stepType = "passed";
            }
            else {
              stepType = "todo";
            }

            // const clickable = stepType === "passed";

            return (
              <Link to={step.path} key={i} className={classNames("setup-step", stepType)}>
                <div className="mb-2 d-flex justify-content-center">
                  <div className={`setup-step-circle ${stepType}`}>
                    {stepType === "passed" ? <CheckCircleIcon /> : (i + 1).toString()}
                  </div>
                </div>
                <span className={classNames({ b: isCurrentStep })}>{step.title}</span>
              </Link>
            );
          })}
        </div>
        <div id="setup-header-buttons" className={
          classNames("align-items-center justify-content-end", {
            "d-flex": props.hideBtnBanner !== true,
            "d-none": props.hideBtnBanner === true,
          })}>

          {!props.hideBtnBanner
            ? <Button disabled={props.canProceed === false}
              className={classNames("b btn-lg ml-auto d-flex justify-content-center")}
              title={props.canProceed ? nextBtnText : "Complete this page to proceed"}
              onClick={async () => {
                if (props.canProceed === false) {
                  return;
                }

                // if (props.pageIndex === setupSteps.length - 1) {
                //   history.push(ClientPages.SetupFinished.path);
                //   return;
                // }

                const nextPage = setupSteps[props.pageIndex + 1].path;
                history.push(nextPage);
              }}
            >
              <div className="d-flex align-items-center">
                <BtnBody icon={ArrowRightIcon} iconPosition="right" text={nextBtnText}/>
              </div>
            </Button>
            : ""}
        </div>
      </div>
    </div>
  );
}
