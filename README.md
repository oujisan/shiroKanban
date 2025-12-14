#  shiroKanban - Real-time Collaborative Whiteboard

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**shiroKanban** is a lightweight, real-time collaborative whiteboard application built with **Flask** and **Socket.IO**. It allows multiple users to draw, write text, and create shapes on a shared canvas simultaneously.

Designed with a focus on **User Experience (UX)**, it features a modern glassmorphism UI, Figma-style text input, and session history persistence so new users can see the entire drawing context upon joining.

---

## ✨ Key Features

* **⚡ Real-time Collaboration:** Low-latency synchronization using WebSockets. See other users' actions instantly.
* **🖌️ Drawing Tools:**
    * **Brush:** Smooth freehand drawing with adjustable size.
    * **Eraser:** True transparency eraser (not just painting white).
    * **Shapes:** Rectangle, Circle, and Arrow with real-time drag preview.
* **🔄 History Persistence:** New users joining the session automatically receive the full drawing history (no blank canvas for late joiners).
* **🎨 Modern UI:**
    * Clean, minimalist interface.
    * Glassmorphism toolbar effects.
    * Tailwind CSS styling.
* **🛠️ Utility:**
    * Adjustable brush size (1px - 50px).
    * 5 Curated color options + Correction White.
    * Active user counter.

---

## 🛠️ Tech Stack

* **Backend:** Python, Flask, Flask-SocketIO.
* **Frontend:** HTML5 Canvas API, Vanilla JavaScript.
* **Styling:** Tailwind CSS (via CDN).
* **Communication:** WebSocket (Socket.IO).

---

## 🚀 Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
* Python 3.x installed.
* `pip` (Python package manager).

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/shiroKanban.git
cd shiroKanban
```

### 2. Create a Virtual Environment (Optional but Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

Create a `requirements.txt` file or install directly:
```bash
pip install flask flask-socketio flask-cors
```

### 4. Run the Application
```bash
python app.py
```

### 5. Access the App

Open your browser and navigate to:
```
http://localhost:5000
```

Open the URL in multiple tabs or devices (connected to the same network) to test real-time collaboration.

---

## 📂 Project Structure
```text
shiroKanban/
├── app.py              # Main Flask server & Socket.IO logic
├── requirements.txt    # Python dependencies
├── static/
│   └── js/
│       └── script.js   # Client-side Canvas & Socket logic
└── templates/
    └── index.html      # Main UI Structure
```

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>
