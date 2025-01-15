from flask import Flask, request
from flask_socketio import SocketIO, emit
 
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
 
# Store mapping of token_id to socket IDs
user_sockets = {}
 
@socketio.on("connect")
def handle_connect():
    print(f"Client connected: {request.sid}")
 
@socketio.on("register")
def handle_register(data):
    """Register user with token_id."""
    token_id = data.get("token_id")
    if token_id:
        user_sockets[token_id] = request.sid  # Map token_id to the socket ID
        print(f"Registered token_id {token_id} with SID {request.sid}")
        emit("success", {"message": f"Token {token_id} registered successfully"})
    else:
        emit("error", {"message": "token_id is required"}, to=request.sid)
 
@socketio.on("private_message")
def handle_private_message(data):
    """Send private message to a specific user based on token_id."""
    target_token_id = data.get("token_id")
    message = data.get("message")
 
    if target_token_id in user_sockets:
        target_sid = user_sockets[target_token_id]
        emit("message", {"message": message}, to=target_sid)
    else:
        emit("error", {"message": "Recipient not connected"}, to=request.sid)
 
@socketio.on("disconnect")
def handle_disconnect():
    """Remove disconnected clients."""
    for token_id, sid in list(user_sockets.items()):
        if sid == request.sid:
            del user_sockets[token_id]
            print(f"Disconnected token_id {token_id}")
            break
 
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)