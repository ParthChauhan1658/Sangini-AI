# first

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

## Proximity Alerts over WebSocket

This app is configured to connect to a Socket.IO backend to:
- Send periodic location updates (every 10s)
- Emit emergency alerts (triple press button or shake)
- Receive alerts from other users and show a dialog

### Configure server URL
Edit `lib/main.dart` and set ` _serverUrl` to your PC's LAN IP and port:

```
static const String _serverUrl = 'http://192.168.1.100:3000';
```

### Minimal backend (Node.js)

Create `server.js` on your PC and run with Node 18+:

```js
// server.js
const io = require('socket.io')(3000, { cors: { origin: '*' } });

io.on('connection', (socket) => {
	socket.on('location', (data) => {
		// Track user location (in memory if needed)
		// console.log('location', data);
	});

	socket.on('alert', (data) => {
		// Broadcast to other clients
		socket.broadcast.emit('alert', data);
	});
});
```

Install and run:

```powershell
npm init -y
npm install socket.io
node server.js
```

Update your phone to the same Wi‑Fi network as the PC.

### Android network note
The app enables `android:usesCleartextTraffic="true"` to allow ws/http to a local IP.
For production, use HTTPS/WSS and remove cleartext.

### Run the app

```powershell
flutter pub get
flutter run
```
