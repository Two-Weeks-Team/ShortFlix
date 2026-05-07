// ShortFlix MCP YT — placeholder skeleton.
// TODO: implement MCP tools (search.shorts, video.metadata) via undici → RapidAPI.
// Egress allowlist enforced at infra layer (VPC connector + Cloud NAT).

import http from "node:http";

const PORT = Number(process.env.PORT ?? 8090);
const MCP_NAME = process.env.MCP_NAME ?? "mcp-yt";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", mcp: MCP_NAME }));
    return;
  }
  // MCP RPC endpoint stub
  if (req.url?.startsWith("/mcp/") && req.method === "POST") {
    res.writeHead(501, { "content-type": "application/json" });
    res.end(JSON.stringify({ todo: "implement MCP RPC", mcp: MCP_NAME }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[${MCP_NAME}] listening on :${PORT}`);
});
