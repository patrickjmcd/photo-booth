from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route, Mount, WebSocketRoute
from starlette.websockets import WebSocket
from starlette.staticfiles import StaticFiles
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

import os
import time
import base64
import uvicorn
import threading
import contextlib

from photobooth import PhotoBooth

photo_storage = os.getenv("PHOTO_STORAGE_LOCATION", "/tmp/photos")
photobooth = PhotoBooth(file_path=photo_storage)

MAX_FPS = 100


async def data(request):
    return JSONResponse({
        "startupTime": photobooth.startup_time,
        "currentCapture": photobooth.session_captured,
        "allCaptured": photobooth.all_captured,
        "allStrips": photobooth.all_strips
    })


async def snap(request):
    photobooth.snap()
    return JSONResponse({"snap": 1})


async def clear_current_capture(request):
    photobooth.clear_current()
    return JSONResponse({"clear": 1})


async def reprint_strip(request):
    jsonbody = await request.json()
    photobooth.print_strip_by_name(jsonbody['filename'])
    return JSONResponse({"print": jsonbody['filename']})


async def websocket_endpoint(websocket):
    await websocket.accept()
    # Process incoming messages
    PREV_IMAGE_ID = 0
    while True:
        mesg = await websocket.receive_text()
        while True:
            time.sleep(1./MAX_FPS)
            image_id = photobooth.live_image_id
            if image_id != PREV_IMAGE_ID:
                break
        PREV_IMAGE_ID = image_id
        image = photobooth.live_image
        image = base64.b64encode(image)
        await websocket.send_text(str(image, 'utf-8'))
    await websocket.close()

middleware = [
    Middleware(CORSMiddleware, allow_origins=['*'])
]

app = Starlette(debug=True, routes=[
    # Route('/', homepage),

    WebSocketRoute('/ws', websocket_endpoint),
    Route('/snap', snap, methods=['POST']),
    Route('/data', data),
    Route('/clear', clear_current_capture, methods=['POST']),
    Route('/reprint', reprint_strip, methods=['POST']),
    Mount("/images", app=StaticFiles(directory=photo_storage), name="images"),
    Mount('/', app=StaticFiles(directory='.', html=True), name="index"),
], middleware=middleware)


class Server(uvicorn.Server):
    def install_signal_handlers(self):
        pass

    @contextlib.contextmanager
    def run_in_thread(self):
        thread = threading.Thread(target=self.run)
        thread.start()
        try:
            while not self.started:
                time.sleep(1e-3)
            yield
        finally:
            self.should_exit = True
            thread.join()


config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="info")
server = Server(config=config)

if __name__ == '__main__':
    with server.run_in_thread():
        photobooth.capture()
