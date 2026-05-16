// Node SSR entry for Render deployments.
// Wraps TanStack Start's fetch handler in a Node http server.
import "./lib/error-capture";

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function nodeReqToWebRequest(req: IncomingMessage): Request {
  const host = req.headers.host ?? "localhost";
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0] ?? "http";
  const url = `${proto}://${host}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((vv) => headers.append(k, vv));
    else if (v != null) headers.set(k, String(v));
  }
  const method = req.method ?? "GET";
  const init: RequestInit & { duplex?: "half" } = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = Readable.toWeb(req) as unknown as BodyInit;
    init.duplex = "half";
  }
  return new Request(url, init);
}

async function sendWebResponse(res: ServerResponse, webRes: Response): Promise<void> {
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => res.setHeader(key, value));
  if (!webRes.body) {
    res.end();
    return;
  }
  const nodeStream = Readable.fromWeb(webRes.body as never);
  nodeStream.pipe(res);
  await new Promise<void>((resolve, reject) => {
    nodeStream.on("end", () => resolve());
    nodeStream.on("error", reject);
  });
}

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

const server = createServer(async (req, res) => {
  try {
    const handler = await getServerEntry();
    const webRequest = nodeReqToWebRequest(req);
    const webResponse = await handler.fetch(webRequest, {}, {});
    await sendWebResponse(res, webResponse);
  } catch (error) {
    console.error(consumeLastCapturedError() ?? error);
    try {
      await sendWebResponse(res, brandedErrorResponse());
    } catch {
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }
});

server.listen(port, host, () => {
  console.log(`[CampMatch] Server listening on http://${host}:${port}`);
});
