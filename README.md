<p align="center">
  <img src="first/assets/sangini_logo.png" alt="Sangini AI Logo" width="180"/>
</p>

<h1 align="center">Sangini AI</h1>

<p align="center">
  <strong>AI-Powered Women's Safety Ecosystem</strong><br/>
  Real-time threat detection &middot; Emergency SOS &middot; Intelligent surveillance
</p>

<p align="center">
  <a href="#features">Features</a> &nbsp;&bull;&nbsp;
  <a href="#architecture">Architecture</a> &nbsp;&bull;&nbsp;
  <a href="#tech-stack">Tech Stack</a> &nbsp;&bull;&nbsp;
  <a href="#getting-started">Getting Started</a> &nbsp;&bull;&nbsp;
  <a href="#screenshots">Screenshots</a> &nbsp;&bull;&nbsp;
  <a href="#contributing">Contributing</a> &nbsp;&bull;&nbsp;
  <a href="#license">License</a>
</p>

---

## Overview

**Sangini AI** is an end-to-end women's safety platform that combines a **Flutter mobile app** with an **AI-driven web surveillance dashboard**. The system leverages computer vision, real-time communication, and smart alerting to foster safer urban spaces.

| Component | Description |
|-----------|-------------|
| **Mobile App** (`first/`) | Flutter-based SOS app with emergency contacts, shake-to-alert, live location sharing, and proximity alerts via WebSocket |
| **Web Dashboard** (`webdashboard/`) | React + Flask surveillance control center with live camera feeds, AI-powered violence/gender/criminal detection, and incident reporting |
| **Backend Services** | Node.js & Python Socket.IO servers for real-time proximity alerts; Flask API for camera management & ML inference |

---

## Features

### Mobile App
- **Triple-Tap / Shake SOS** — Trigger emergency alerts by tapping the SOS button three times or shaking the device; sends GPS-tagged SMS to all saved contacts
- **Emergency Contacts** — Add, manage, and store trusted contacts locally for instant alerts
- **One-Tap Helpline Calling** — Direct dial to Police (100) and Women Helpline (181)
- **Emergency Mode** — Continuous location sharing at configurable intervals with auto-SMS updates
- **Nearby Safe Places** — Interactive OpenStreetMap showing police stations, hospitals, pharmacies, and fuel stations within 1 km radius with turn-by-turn navigation
- **Proximity Alerts** — Real-time WebSocket-based alerts from nearby Sangini users in distress
- **Live Location Tracking** — Periodic GPS updates broadcast every 10 seconds to the backend

### Web Dashboard
- **Live Camera Monitoring** — Multi-camera MJPEG streaming with add/remove/configure support (webcam, RTSP, YouTube Live)
- **AI Violence Detection** — Real-time inference using Roboflow models to detect knives, weapons, and violent behavior
- **Gender Ratio Analysis** — Detects gender imbalance scenarios (lone woman with multiple males) with time-aware staging
- **Criminal Face Recognition** — DeepFace + ArcFace-powered face matching against an uploadable criminal database
- **3-Stage Alert System** —
  - *Stage 1:* Gender imbalance detected
  - *Stage 2:* Gender imbalance + nighttime (6 PM–6 AM)
  - *Stage 3:* **CRITICAL** — Violence + nighttime + gender imbalance
- **Camera Map View** — Leaflet-based geospatial view of all camera locations
- **Video Analysis** — Upload and process recorded footage for violence/gender/criminal detection with annotated output
- **Incident Reports & Alert Log** — Timestamped, categorized alert history with stats tracking
- **Criminal Database Management** — Upload and manage criminal face images for real-time matching
- **Dark/Light Theme** — Persistent theme toggle saved to `localStorage`

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     SANGINI AI                          │
├────────────────────────┬────────────────────────────────┤
│     Mobile App         │       Web Dashboard            │
│   (Flutter / Dart)     │   (React + Tailwind CSS)       │
│                        │                                │
│  ┌──────────────┐      │  ┌──────────────────────────┐  │
│  │  SOS Engine  │      │  │  Dashboard / Map / Cams  │  │
│  │  GPS Tracker │      │  │  Video Analysis          │  │
│  │  Safe Places │      │  │  Criminal DB             │  │
│  │  Contact Mgr │      │  │  Incident Reports        │  │
│  └──────┬───────┘      │  └───────────┬──────────────┘  │
│         │              │              │                 │
├─────────┼──────────────┼──────────────┼─────────────────┤
│         │    Backend Services         │                 │
│         ▼                             ▼                 │
│  ┌──────────────┐          ┌───────────────────────┐    │
│  │ Socket.IO    │          │  Flask API (Python)   │    │
│  │ (Node / Py)  │          │  + Roboflow Inference │    │
│  │ Port 3000    │          │  + DeepFace / ArcFace │    │
│  └──────────────┘          │  Port 5000            │    │
│                            └───────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│                    ML Models                            │
│  Roboflow (Violence + Gender) │ DeepFace (Face Match)   │
│  Local Inference Server :9001 │ ArcFace / VGGFace       │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Mobile App
| Layer | Technology |
|-------|-----------|
| Framework | Flutter 3.x / Dart |
| Maps | flutter_map + OpenStreetMap + Overpass API |
| Real-time | socket_io_client (WebSocket) |
| Sensors | sensors_plus (accelerometer shake detection) |
| Location | location + geolocator |
| Storage | shared_preferences |
| Native Bridge | MethodChannel → Kotlin (SMS + Calls) |

### Web Dashboard
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Charts | Recharts |
| Maps | Leaflet + react-leaflet |
| Icons | Lucide React |
| HTTP | Axios |

### Backend & ML
| Layer | Technology |
|-------|-----------|
| Surveillance API | Flask, Flask-CORS, OpenCV |
| Real-time Server | Socket.IO (Node.js) / python-socketio + Uvicorn (ASGI) |
| Violence Detection | Roboflow Inference SDK (local server) |
| Gender Detection | Roboflow custom model |
| Face Recognition | DeepFace, ArcFace, VGGFace |
| Video Processing | OpenCV (with optional CUDA GPU acceleration) |

---

## Getting Started

### Prerequisites

- **Flutter SDK** ≥ 3.5.3
- **Node.js** ≥ 18
- **Python** ≥ 3.9
- **Roboflow Inference Server** running on `localhost:9001` (for web dashboard ML features)

### 1. Clone the Repository

```bash
git clone https://github.com/ParthChauhan1658/Sangini-AI.git
cd Sangini-AI
```

### 2. Mobile App Setup

```bash
cd first
flutter pub get
```

**Configure the server URL** in `first/lib/main.dart`:

```dart
static const String _serverUrl = 'http://<YOUR_LAN_IP>:3000';
```

**Run on a connected device:**

```bash
flutter run
```

### 3. Mobile Backend (Socket.IO)

**Option A — Node.js:**

```bash
cd first/backend
npm install
npm start          # Starts on port 3000
```

**Option B — Python (ASGI):**

```bash
cd first/backend
pip install -r requirements.txt
python server.py   # Starts on port 3000
```

### 4. Web Dashboard — Backend

```bash
cd webdashboard/backend
pip install -r requirements.txt
```

**Start the Roboflow local inference server** (required for ML models):

```bash
# Follow https://inference.roboflow.com to install and run
# The backend expects it at http://localhost:9001
```

**Run the Flask API:**

```bash
python app.py      # Starts on port 5000
```

### 5. Web Dashboard — Frontend

```bash
cd webdashboard/frontend
npm install
npm run dev        # Starts Vite dev server (default: http://localhost:5173)
```

---

## Project Structure

```
Sangini-AI/
│
├── first/                        # Flutter Mobile App
│   ├── lib/
│   │   └── main.dart             # App entry — SOS, contacts, maps, WebSocket
│   ├── assets/                   # Logo, icons
│   ├── android/                  # Android platform config
│   ├── ios/                      # iOS platform config
│   ├── backend/
│   │   ├── server.js             # Node.js Socket.IO server
│   │   ├── server.py             # Python ASGI Socket.IO server
│   │   ├── package.json
│   │   └── requirements.txt
│   └── pubspec.yaml
│
├── webdashboard/                 # AI Surveillance Dashboard
│   ├── backend/
│   │   ├── app.py                # Flask REST API (cameras, alerts, videos)
│   │   ├── camera.py             # VideoProcessor + CameraManager (ML pipeline)
│   │   ├── video_analysis.py     # Offline video analysis engine
│   │   ├── cameras_config.json   # Persistent camera configuration
│   │   └── requirements.txt
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── App.jsx           # Main router (Dashboard, Map, Cameras, etc.)
│   │   │   ├── components/
│   │   │   │   ├── DashboardView.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   └── pages/
│   │   │       ├── CameraManagement.jsx
│   │   │       ├── CameraMap.jsx
│   │   │       ├── CriminalDatabase.jsx
│   │   │       ├── IncidentReports.jsx
│   │   │       ├── VideoAnalysis.jsx
│   │   │       └── Settings.jsx
│   │   ├── package.json
│   │   └── vite.config.js
│   ├── criminal_db/              # Criminal face images for matching
│   ├── ml_models/
│   │   └── vmodel.h5             # Pre-trained violence model
│   ├── historycriminal/
│   │   ├── arcface.py            # ArcFace face recognition experiments
│   │   └── vggface.py            # VGGFace face recognition experiments
│   ├── FINALVIOLENCE.py          # Standalone violence detection script
│   ├── FINALGENDER.py            # Standalone gender detection script
│   └── COMBINED.py               # Combined violence + gender pipeline
│
└── README.md
```

---

## Environment Variables & Configuration

| Variable / Config | Location | Description |
|-------------------|----------|-------------|
| `_serverUrl` | `first/lib/main.dart` | Socket.IO backend URL for the mobile app |
| `ROBOFLOW_API_URL` | `webdashboard/backend/camera.py` | Roboflow inference server endpoint |
| `ROBOFLOW_API_KEY` | `webdashboard/backend/camera.py` | Roboflow API key |
| `CRIMINAL_DB_PATH` | `webdashboard/backend/camera.py` | Path to criminal face images directory |
| `CRIMINAL_MODEL_NAME` | `webdashboard/backend/camera.py` | DeepFace model (`ArcFace` by default) |
| `cameras_config.json` | `webdashboard/backend/` | Persistent camera source configuration |

> **Note:** For production, move API keys to environment variables or a `.env` file.

---

## How the Alert Staging Works

The web dashboard implements a **3-stage intelligent alert escalation system**:

| Stage | Condition | Severity |
|-------|-----------|----------|
| **1** | 1 woman detected with >1 male | ⚠️ Warning |
| **2** | Stage 1 + nighttime (6 PM – 6 AM) | ⚠️ Warning |
| **3** | Stage 2 + active violence detected | 🚨 **Critical** |

Criminal face matches trigger an independent **critical alert** after consistent detection across multiple frames (threshold: 3 consecutive matches).

---

## Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** changes: `git commit -m "Add your feature"`
4. **Push** to branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

---

## Authors

- **Parth Chauhan** — [@ParthChauhan1658](https://github.com/ParthChauhan1658)

---

## License

This project is for educational and research purposes. See the repository for license details.

---

<p align="center">
  <em>Sangini AI — Protecting Women From Threats</em>
</p>
