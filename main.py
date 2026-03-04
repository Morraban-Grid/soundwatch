import json
from pathlib import Path
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse


app = FastAPI(title="Baby Monitor MVP")
connected_clients: List[WebSocket] = []
BASE_DIR = Path(__file__).resolve().parent
INDEX_FILE = BASE_DIR / "index.html"


@app.get("/")
async def root() -> FileResponse:
    return FileResponse(INDEX_FILE)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()
    connected_clients.append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                continue

            if not isinstance(payload, dict):
                continue

            required_keys = {"clase", "confianza", "timestamp"}
            if not required_keys.issubset(payload.keys()):
                continue

            message = json.dumps(payload, ensure_ascii=False)
            stale_clients: List[WebSocket] = []

            for client in connected_clients:
                try:
                    await client.send_text(message)
                except Exception:
                    stale_clients.append(client)

            for stale in stale_clients:
                if stale in connected_clients:
                    connected_clients.remove(stale)

    except WebSocketDisconnect:
        pass
    finally:
        if websocket in connected_clients:
            connected_clients.remove(websocket)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
