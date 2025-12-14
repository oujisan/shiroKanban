from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

active_users = {}

history = [] 

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    active_users[request.sid] = True
    
    emit('user_count', {'count': len(active_users)}, broadcast=True)
    
    emit('load_history', history)

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    if request.sid in active_users:
        del active_users[request.sid]
    emit('user_count', {'count': len(active_users)}, broadcast=True)

@socketio.on('draw')
def handle_draw(data):
    history.append({'type': 'draw', 'data': data})
    emit('draw', data, broadcast=True, include_self=False)

@socketio.on('clear_canvas')
def handle_clear():
    history.clear()
    emit('clear_canvas', broadcast=True, include_self=False)

@socketio.on('add_text')
def handle_text(data):
    history.append({'type': 'text', 'data': data})
    emit('add_text', data, broadcast=True, include_self=False)

@socketio.on('add_shape')
def handle_shape(data):
    history.append({'type': 'shape', 'data': data})
    emit('add_shape', data, broadcast=True, include_self=False)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)