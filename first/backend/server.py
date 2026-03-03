import socketio
from starlette.applications import Starlette
from starlette.responses import PlainTextResponse
from starlette.routing import Route

# Async Socket.IO server (ASGI) with health endpoint
sio = socketio.AsyncServer(cors_allowed_origins='*', async_mode='asgi')

users = {}  # sid -> { username, lat, lng, ts }

@sio.event
async def connect(sid, environ):
    print('connect', sid)

@sio.event
async def disconnect(sid):
    users.pop(sid, None)
    print('disconnect', sid)

@sio.on('location')
async def on_location(sid, data):
    users[sid] = data

@sio.on('alert')
async def on_alert(sid, data):
    print('alert from', data.get('username'))
    await sio.emit('alert', data, skip_sid=sid)

async def health(request):
    return PlainTextResponse('Socket.IO server OK')

starlette_app = Starlette(routes=[Route('/', health)])
app = socketio.ASGIApp(sio, other_asgi_app=starlette_app)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=3000)
