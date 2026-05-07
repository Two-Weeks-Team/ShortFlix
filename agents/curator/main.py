"""ShortFlix Curator — placeholder skeleton.
TODO: implement daily 9-card composition (3 platforms × 3 cards) using Vertex AI Gemini
      planner + MCP YT/IG/TT for retrieval. Persist to Firestore daily-cards.
"""
from __future__ import annotations
import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

AGENT_NAME = os.environ.get("AGENT_NAME", "curator")
PORT = int(os.environ.get("PORT", "8082"))

app = FastAPI(title=f"shortflix-{AGENT_NAME}")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "agent": AGENT_NAME}


@app.post("/curate/today")
async def curate_today(req: Request) -> JSONResponse:
    return JSONResponse({"todo": "implement Curator", "agent": AGENT_NAME})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
