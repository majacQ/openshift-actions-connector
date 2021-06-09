import ApiResponses from "../../common/api-responses";
import { Severity, Stringable } from "../../common/common-util";
import HttpConstants from "../../common/http-constants";

export function getSearchParam(param: string): string | null {
  return new URLSearchParams(window.location.search).get(param);
}

export function isJsonContentType(res: Response): boolean {
  const contentType = res.headers.get(HttpConstants.Headers.ContentType);

  return !!contentType
    && (
      contentType.startsWith(HttpConstants.ContentTypes.Json)
      || contentType.startsWith(HttpConstants.ContentTypes.Problem)
    );
}

async function getHttpError(res: Response): Promise<Error> {
  let message: string;
  let statusMessage: string | undefined;
  let severity: Severity | undefined;
  if (isJsonContentType(res)) {
    const resBody = await res.json();
    if ((resBody as ApiResponses.Error).message) {
      const errorBody = resBody as ApiResponses.Error;
      message = `${errorBody.message}`;
      severity = errorBody.severity;
      statusMessage = errorBody.statusMessage;
    }
    else {
      message = JSON.stringify(resBody);
    }

    if (message.startsWith("Error: ")) {
      message = message.substring("Error: ".length, message.length);
    }
  }
  else {
    message = await res.text();
  }

  const err = new Error(`${res.url} responded ${res.status}${statusMessage ? " " + statusMessage : ""}: ${message}`);
  (err as any).status = res.status;
  if (severity) {
    (err as any).severity = severity;
  }
  return err;
}

export async function throwIfError(res: Response): Promise<void> {
  if (res.status > 399) {
    const err = await getHttpError(res);
    throw err;
  }
}

export async function fetchJSON<
  // eslint-disable-next-line @typescript-eslint/ban-types
  Req extends {} = never,
  Res = void
>(
  method: HttpConstants.Methods, url: Stringable, body?: Req, options: Omit<RequestInit, "body" | "method"> = {}
): Promise<{ statusCode: number } & Res> {

  const hasBody = body != null;
  if (hasBody && method === "GET") {
    // eslint-disable-next-line no-console
    console.error(`GET request has body`);
  }

  let stringifiedBody: string | undefined;
  if (hasBody) {
    stringifiedBody = JSON.stringify(body);
  }

  const headers = {
    ...options.headers,
    ...HttpConstants.getJSONContentHeaders(stringifiedBody),
  };

  const res = await fetch(url.toString(), {
    ...options,
    method,
    headers,
    body: stringifiedBody,
  });

  await throwIfError(res);

  if (res.status === 204) {
    const resBody = {} as Res;
    return {
      statusCode: res.status,
      ...resBody,
    };
  }

  if (!isJsonContentType(res)) {
    throw new Error(`Received unexpected non-JSON Content-Type from "${url}": `
      + `${res.headers.get(HttpConstants.Headers.ContentType)}`);
  }

  const resBody = await res.json() as Res;
  return {
    statusCode: res.status,
    ...resBody,
  };
}

export function getWindowLocationNoPath(): string {
  return window.location.protocol + "//" + window.location.host;
}

export function isInOpenShiftConsole(): boolean {
  return process.env.IN_OPENSHIFT_CONSOLE?.toString() === "true";
}

export function getConsoleModifierClass(): string {
  return isInOpenShiftConsole() ? "is-console" : "is-standalone";     // "console" class is already used by bootstrap
}
