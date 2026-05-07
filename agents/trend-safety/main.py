"""ShortFlix Trend & Safety — placeholder skeleton.
TODO: Vertex AI Gemini moderation + trend scoring. NO external LLM endpoints.
"""
from __future__ import annotations
import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

AGENT_NAME = os.environ.get("AGENT_NAME", "trend-safety")
PORT = int(os.environ.get("PORT", "8084"))

app = FastAPI(title=f"shortflix-{AGENT_NAME}")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "agent": AGENT_NAME}


@app.post("/score")
async def score(req: Request) -> JSONResponse:
    return JSONResponse({"todo": "implement Trend-Safety", "agent": AGENT_NAME})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
