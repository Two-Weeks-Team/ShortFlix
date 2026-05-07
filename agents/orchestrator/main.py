"""ShortFlix Orchestrator — placeholder skeleton.

User adds the real ADK code separately. This skeleton only provides:
  - /health  → 200 OK (used by Cloud Run probes)
  - /internal/nightly-batch → 202 (cloud-scheduler target)

LLM constraint (MD-03 R2): all model calls MUST go through google.cloud.aiplatform.
Do not import any non-Vertex SDK here. CI guard scripts/assert-llm-endpoints.sh
fails the build if any non-Vertex LLM provider hostname is referenced anywhere.
"""
from __future__ import annotations
import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

AGENT_NAME = os.environ.get("AGENT_NAME", "orchestrator")
PORT = int(os.environ.get("PORT", "8081"))

app = FastAPI(title=f"shortflix-{AGENT_NAME}")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "agent": AGENT_NAME}


@app.post("/internal/nightly-batch", status_code=status.HTTP_202_ACCEPTED)
async def nightly_batch(req: Request) -> JSONResponse:
    # TODO: dispatch curator pre-warm + trend-safety scoring here.
    return JSONResponse({"accepted": True, "agent": AGENT_NAME})


@app.post("/a2a/dispatch")
async def a2a_dispatch(req: Request) -> JSONResponse:
    # TODO: route intents to curator / search / trend-safety via HTTP A2A.
    body = await req.json()
    return JSONResponse({"echo": body, "todo": "implement A2A routing"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
