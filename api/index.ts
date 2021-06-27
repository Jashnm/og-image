import { IncomingMessage, ServerResponse } from "http";
import { parseRequest } from "./_lib/parser";
import { getScreenshot } from "./_lib/chromium";
import { getHtml } from "./_lib/template";

const isDev = !process.env.AWS_REGION;
const isHtmlDebug = process.env.OG_HTML_DEBUG === "1";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const parsedReq = parseRequest(req);
    parsedReq.images.length = 0;
    parsedReq.images.push(
      "https://user-images.githubusercontent.com/50929873/123553493-093ea280-d799-11eb-9685-745d92cfbe17.png"
    );

    // parsedReq.fontSize = "6.6rem";

    const html = getHtml(parsedReq);
    if (isHtmlDebug) {
      res.setHeader("Content-Type", "text/html");
      res.end(html);
      return;
    }
    const { fileType } = parsedReq;
    const file = await getScreenshot(html, fileType, isDev);
    res.statusCode = 200;
    res.setHeader("Content-Type", `image/${fileType}`);
    res.setHeader(
      "Cache-Control",
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`
    );
    res.end(file);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>Internal Error</h1><p>Sorry, there was a problem</p>");
    console.error(e);
  }
}
