import { resolve, relative, join, extname } from "path";
import { green, blue, gray, yellow, red, yellowBright } from "chalk";
import express, { NextFunction, Request, Response } from "express";
import { stripIndent } from "common-tags";

const redirect = process.argv[process.argv.length - 1] === "true";
const appPath = resolve(__dirname, "../dist/ng-pwa-redirect/");
const app = express();
const dateTime = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

app.use(logRequestHandler);
app.all("*", html5RouteRquestHandler);
app.use(express.static(appPath));
app.listen(3000, serverListener);

function html5RouteRquestHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!redirect) {
    next();
    return;
  }

  const redirectUrl = "https://www.google.com";
  console.log(blue(`Redirecting to ${redirectUrl}.`));
  res.redirect("https://www.google.com");
}

function serverListener() {
  console.log(stripIndent`
    - Serving from: ${blue(appPath)}
    - Listening on port: ${blue(3000)}
  `);
}

function logRequestHandler(req: Request, res: Response, next: NextFunction) {
  const hasExtension = !!extname(req.url);
  const requestType = hasExtension ? "[File]" : "[Document]";
  const currentTime = dateTime.format(new Date());
  const pathFromRoot = relative(process.cwd(), join(appPath, req.url));
  const spaces = new Array("[Document]".length - requestType.length + 1).join(
    " "
  );
  console.log(
    `${gray(currentTime)}  -  ${green("Requested")} ${yellow(
      req.method
    )} ${formatStatusCode(res.statusCode)} ${gray(
      requestType
    )}:${spaces} ./${pathFromRoot}`
  );
  next();
}

function formatStatusCode(statusCode: number) {
  const baseCode = Math.round(statusCode / 100) * 100;
  switch (baseCode) {
    case 500:
      return red(statusCode);
    case 400:
      return yellowBright(statusCode);
    case 300:
      return yellow(statusCode);
    case 200:
      return green(statusCode);
    default:
  }
  return statusCode;
}
