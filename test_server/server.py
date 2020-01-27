from sanic import Sanic
from fire_api import CORS
from fire_odm import MongoDB
from fire_api import Redis


CORS.set_origins('*')

server = Sanic('sugar-blog')

@server.listener('before_server_start')
async def _(app, loop):
    MongoDB.set_event_loop(loop)
    await Redis.set_event_loop(loop)
    Redis.default_connection()
