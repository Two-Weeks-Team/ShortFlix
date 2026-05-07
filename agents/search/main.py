"""ShortFlix Search — placeholder skeleton.
TODO: real-time cross-platform search via MCP YT/IG/TT, with Vertex AI re-ranking.
"""
from __future__ import annotations
import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

AGENT_NAME = os.environ.get("AGENT_NAME", "search")
PORT = int(os.environ.get("PORT", "8083"))

app = FastAPI(title=f"shortflix-{AGENT_NAME}")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "agent": AGENT_NAME}


@app.post("/search")
async def search(req: Request) -> JSONResponse:
    body = await req.json()
    return JSONResponse({"todo": "implement Search", "query": body.get("q")})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
