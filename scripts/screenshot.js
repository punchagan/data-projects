const path = require("path");
const puppeteer = require("puppeteer");
const http = require("http");
const finalhandler = require("finalhandler");
const serveStatic = require("serve-static");

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const createServer = () => {
  const dir = path.resolve(process.argv[1], "..", "..");
  console.log(`Serving directory: ${dir}`);
  const serve = serveStatic(dir);
  const server = http.createServer(function (req, res) {
    const done = finalhandler(req, res);
    serve(req, res, done);
  });
  return server;
};

const screenshot = async (projectDir, serverPort) => {
  const indexPath = path.join(projectDir, "index.html");
  const url = `http://localhost:${serverPort}/${indexPath}`;
  console.debug(`Capturing screenshot at ${url}`);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await sleep(2000);
  await page.screenshot({ path: path.resolve(projectDir, "screenshot.png") });
  browser.close();
};

const run = async (projectDir, port) => {
  server = createServer();
  server.listen(port);
  console.log(`Started server on ${port}`);
  await screenshot(projectDir, port);
  server.close();
};

const projectDir = process.argv[2];
const port = process.argv[3] || 9000;

if (projectDir) {
  run(projectDir, port);
} else {
  console.log("Pass a project directory argument to take a screenshot from");
}
