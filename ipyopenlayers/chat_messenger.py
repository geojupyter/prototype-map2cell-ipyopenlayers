import jupyter_collaboration
import uuid
from functools import partial
from jupyterlab_chat.models import Message
from jupyterlab_chat.ychat import YChat
from jupyter_collaboration.utils import JUPYTER_COLLABORATION_EVENTS_URI
from jupyter_events import EventLogger
from jupyter_server.extension.application import ExtensionApp
from pycrdt import ArrayEvent


if int(jupyter_collaboration.__version__[0]) >= 3:
    COLLAB_VERSION = 3
else:
    COLLAB_VERSION = 2

USER = {"username": str(uuid.uuid4()), "name": "user", "display_name": "User"}


class MyExtension(ExtensionApp):
    name = "my_extension"
    app_name = "My Extension"
    description = """
    this extension interact with chats
    """

    def initialize(self):
        super().initialize()
        self.event_logger = self.serverapp.web_app.settings["event_logger"]
        self.event_logger.add_listener(
            schema_id=JUPYTER_COLLABORATION_EVENTS_URI, listener=self.connect_chat
        )

    async def connect_chat(
        self, logger: EventLogger, schema_id: str, data: dict
    ) -> None:
        if (
            data["room"].startswith("text:chat:")
            and data["action"] == "initialize"
            and data["msg"] == "Room initialized"
        ):
            self.log.info(f"Chat server is listening for {data['room']}")
            chat = await self.get_chat(data["room"])
            callback = partial(self.on_change, chat)
            chat.ymessages.observe(callback)

    async def get_chat(self, room_id: str) -> YChat:
        if COLLAB_VERSION == 3:
            collaboration = self.serverapp.web_app.settings["jupyter_server_ydoc"]
            document = await collaboration.get_document(room_id=room_id, copy=False)
        else:
            collaboration = self.serverapp.web_app.settings["jupyter_collaboration"]
            server = collaboration.ywebsocket_server

            room = await server.get_room(room_id)
            document = room._document
        return document

    def on_change(self, chat: YChat, events: ArrayEvent) -> None:
        for change in events.delta:
            if "insert" not in change.keys():
                continue
            messages = [Message(**m.to_py()) for m in change["insert"]]
            for message in messages:
                if message.sender == USER["username"]:
                    continue
                chat.create_task(
                    self.write_message(
                        chat,
                        f"Received:\n\n- **id**: *{message.id}*:\n\n- **body**: *{message.body}*",
                    )
                )

    async def write_message(self, chat: YChat, body: str) -> None:
        bot = chat.get_user_by_name(USER["name"])
        if not bot:
            chat.set_user(USER)
        else:
            USER["username"] = bot["username"]

        chat.add_message({"body": body, "sender": USER["username"]})
