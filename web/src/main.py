from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route, Mount, WebSocketRoute
from starlette.websockets import WebSocket
from starlette.staticfiles import StaticFiles
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

import redis
import time
import json
import base64

r = redis.Redis(host='192.168.1.131')
r.set("startupTime", time.time())
photo_storage = r.get("photoStorageLocation").decode('utf-8')


MAX_FPS = 100


def get_all_in_redis_list(key):
    all_in_list = []
    list_len = r.llen(key)
    for x in range(0, list_len):
        all_in_list.append(r.lindex(key, x).decode('utf-8'))
    return all_in_list


async def data(request):
    startup_time = r.get("startupTime").decode("utf-8")

    all_captured = get_all_in_redis_list("allCaptured")
    all_strips = get_all_in_redis_list("allStrips")

    current_counter = int(r.get("currentCounter").decode('utf-8'))
    current_capture = get_all_in_redis_list("sessionCaptured")

    return JSONResponse({"startupTime": startup_time, "currentCapture": current_capture, "allCaptured": all_captured, "allStrips": all_strips})


async def snap(request):
    r.set("snap", 1)
    return JSONResponse({"snap": 1})


async def websocket_endpoint(websocket):
    await websocket.accept()
    # Process incoming messages
    PREV_IMAGE_ID = 0
    while True:
        mesg = await websocket.receive_text()
        while True:
            time.sleep(1./MAX_FPS)
            image_id = r.get('image_id')
            if image_id != PREV_IMAGE_ID:
                break
        PREV_IMAGE_ID = image_id
        image = r.get('image')
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
    Mount("/images", app=StaticFiles(directory=photo_storage), name="images"),
    Mount('/', app=StaticFiles(directory='.', html=True), name="index"),
], middleware=middleware)
