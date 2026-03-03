import 'package:flutter/material.dart';
import 'package:location/location.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:flutter/services.dart'; // For MethodChannel
import 'package:sensors_plus/sensors_plus.dart'; // For shake detection
import 'dart:async'; // For Timer
import 'package:socket_io_client/socket_io_client.dart' as IO; // WebSocket client
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(SanginiApp());
}

class SanginiApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sangini',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
      ),
      home: SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  void _navigateToHome() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F0FF), // Light purple background
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Top section with title and logo
              Column(
                children: [
                  const SizedBox(height: 35),
                  const Text(
                    'Sangini',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF7C4DFF),
                      fontStyle: FontStyle.italic,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 15),
                  Image.asset(
                    'assets/sangini_logo.png',
                    width: 320,
                    height: 320,
                  ),
                ],
              ),
              // Middle section with heading and description
              Column(
                children: [
                  const Text(
                    'Protecting Women From\nThreats',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24.0),
                    child: Text(
                      'An AI-driven system ensuring women\'s safety through real-time threat detection and timely alerts, fostering secure and inclusive urban spaces.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.black54,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
              // Bottom section with Get Started button
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _navigateToHome,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7C4DFF), // Purple button
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    elevation: 2,
                  ),
                  child: const Text(
                    'Get Started',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isLoginTab = true;

  void _navigateToHome() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => ContactPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F0FF),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
            child: Column(
              children: [
                // Logo and title
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(
                      'assets/sangini_logo.png',
                      width: 50,
                      height: 50,
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Sangini',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF7C4DFF),
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 40),
                // Welcome text
                const Text(
                  'Welcome to Sangini',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 30),
                // Login/Signup tabs
                Container(
                  height: 50,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE1D4F7),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _isLoginTab = true),
                          child: Container(
                            decoration: BoxDecoration(
                              color: _isLoginTab ? const Color(0xFF7C4DFF) : Colors.transparent,
                              borderRadius: BorderRadius.circular(25),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Login',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: _isLoginTab ? Colors.white : Colors.black54,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _isLoginTab = false),
                          child: Container(
                            decoration: BoxDecoration(
                              color: !_isLoginTab ? const Color(0xFF7C4DFF) : Colors.transparent,
                              borderRadius: BorderRadius.circular(25),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Sign Up',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: !_isLoginTab ? Colors.white : Colors.black54,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
                // Email/Number field
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8E0F5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const TextField(
                    decoration: InputDecoration(
                      hintText: 'Email Address or Number',
                      hintStyle: TextStyle(color: Colors.black45),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Password field
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8E0F5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const TextField(
                    obscureText: true,
                    decoration: InputDecoration(
                      hintText: 'Password',
                      hintStyle: TextStyle(color: Colors.black45),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                // Forgot password
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {},
                    child: const Text(
                      'Forgot Password?',
                      style: TextStyle(
                        color: Colors.black54,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                // Divider
                Row(
                  children: const [
                    Expanded(child: Divider(color: Colors.black26)),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16.0),
                      child: Text(
                        'or Sign in with',
                        style: TextStyle(color: Colors.black54, fontSize: 14),
                      ),
                    ),
                    Expanded(child: Divider(color: Colors.black26)),
                  ],
                ),
                const SizedBox(height: 20),
                // Social login buttons
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 50,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8E0F5),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Image.network(
                              'https://www.google.com/favicon.ico',
                              width: 24,
                              height: 24,
                              errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata, size: 30),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Container(
                        height: 50,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8E0F5),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.apple, size: 30),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 30),
                // Sign in button
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: ElevatedButton(
                    onPressed: _navigateToHome,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF7C4DFF),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                      elevation: 2,
                    ),
                    child: const Text(
                      'Sign in',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class ContactPage extends StatefulWidget {
  @override
  _ContactPageState createState() => _ContactPageState();
}

class _ContactPageState extends State<ContactPage> {
  List<Map<String, String>> _contacts = [];
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  Location _location = Location();
  int _alertPressCount = 0;
  bool _isEmergencyModeActive = false; // State variable for Emergency Mode
  Timer? _emergencyModeTimer; // Timer for periodic updates
  static const platform = MethodChannel('sms_sender'); // MethodChannel for Kotlin communication

  // Proximity alert additions
  final TextEditingController _usernameController = TextEditingController();
  String _username = 'User';
  IO.Socket? _socket;
  Timer? _locationUpdateTimer; // 10s periodic location emitter
  static const String _serverUrl = 'http://192.168.137.1:3000'; // PC Mobile Hotspot IP
  bool _socketConnected = false;
  String? _socketStatusMessage; // last error or status

  @override
  void initState() {
    super.initState();
    _loadContacts();
    _loadUsername();
    _connectSocket();
    _startLocationUpdates();
    _startShakeDetection();
  }

  Future<void> _loadContacts() async {
    final prefs = await SharedPreferences.getInstance();
    String? contactsString = prefs.getString('contacts');
    if (contactsString != null) {
      List<dynamic> contactsList = jsonDecode(contactsString);
      setState(() {
        _contacts = contactsList.map((contact) => Map<String, String>.from(contact)).toList();
      });
    }
  }

  Future<void> _saveContacts() async {
    final prefs = await SharedPreferences.getInstance();
    String encodedContacts = jsonEncode(_contacts);
    await prefs.setString('contacts', encodedContacts);
  }

  Future<void> _loadUsername() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('username');
    if (saved != null && saved.isNotEmpty) {
      setState(() {
        _username = saved;
        _usernameController.text = saved;
      });
    }
  }

  Future<void> _saveUsername() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('username', _username);
  }

  void _addContact() {
    if (_nameController.text.isNotEmpty && _phoneController.text.isNotEmpty) {
      setState(() {
        _contacts.add({
          'name': _nameController.text,
          'phone': _phoneController.text,
        });
        _saveContacts();
        _nameController.clear();
        _phoneController.clear();
      });
    }
  }

  void _deleteContact(int index) {
    setState(() {
      _contacts.removeAt(index);
      _saveContacts();
    });
  }

  Future<void> _sendAlert() async {
    if (_alertPressCount < 2) {
      setState(() {
        _alertPressCount++;
      });
      return;
    }
    try {
      LocationData locationData = await _location.getLocation();
      String message =
          'Emergency! I need help. My location: https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}';
      List<String> recipients = _contacts.map((contact) => contact['phone']!).toList();

      // Send alert to backend as well
      _socket?.emit('alert', {
        'username': _username,
        'lat': locationData.latitude,
        'lng': locationData.longitude,
        'message': 'Emergency alert',
      });
      await platform.invokeMethod('sendSMS', {
        'phones': recipients,
        'message': message,
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Alert sent to contacts')),
      );
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to send alert')),
      );
    }
    setState(() {
      _alertPressCount = 0;
    });
  }

  Future<void> _callHelpline(String number) async {
    try {
      await platform.invokeMethod('call', {'phone': number});
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not make the call')),
      );
    }
  }

  void _startShakeDetection() {
    const shakeThreshold = 15.0; // Adjust this threshold as needed
    double x = 0, y = 0, z = 0;
    double lastX = 0, lastY = 0, lastZ = 0;
    accelerometerEvents.listen((AccelerometerEvent event) {
      x = event.x;
      y = event.y;
      z = event.z;
      double acceleration = ((x - lastX).abs() + (y - lastY).abs() + (z - lastZ).abs()) / 3;
      if (acceleration > shakeThreshold) {
        _sendAlert(); // Trigger alert on shake
      }
      lastX = x;
      lastY = y;
      lastZ = z;
    });
  }

  void _startEmergencyMode() {
    const interval = Duration(minutes: 1); // Adjust interval as needed
    _emergencyModeTimer = Timer.periodic(interval, (timer) async {
      try {
        LocationData locationData = await _location.getLocation();
        String message =
            'Emergency Mode Update: My current location: https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}';
        List<String> recipients = _contacts.map((contact) => contact['phone']!).toList();

        // Push periodic update to backend as well
        _socket?.emit('alert', {
          'username': _username,
          'lat': locationData.latitude,
          'lng': locationData.longitude,
          'message': 'Emergency mode update',
        });
        await platform.invokeMethod('sendSMS', {
          'phones': recipients,
          'message': message,
        });
      } catch (error) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to send location update')),
        );
      }
    });
  }

  // WebSocket connection + handlers
  void _connectSocket() {
    _socket = IO.io(
      _serverUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableReconnection()
          .setReconnectionDelay(2000)
          .build(),
    );

    _socket!.onConnect((_) {
      _emitLocation();
      setState(() {
        _socketConnected = true;
        _socketStatusMessage = 'Connected';
      });
    });

    _socket!.onDisconnect((_) {
      setState(() {
        _socketConnected = false;
        _socketStatusMessage = 'Disconnected';
      });
    });

    _socket!.on('alert', (data) {
      _onIncomingAlert(data);
    });

    _socket!.on('proximity_alert', (data) {
      _onIncomingAlert(data);
    });

    _socket!.onConnectError((err) {
      setState(() {
        _socketStatusMessage = 'Connect error';
      });
    });
    _socket!.onError((err) {
      setState(() {
        _socketStatusMessage = 'Error';
      });
    });
    _socket!.onReconnectAttempt((_) {
      setState(() {
        _socketStatusMessage = 'Reconnecting...';
      });
    });

    _socket!.connect();
  }

  void _onIncomingAlert(dynamic data) {
    final from = (data?['username'] ?? 'Unknown').toString();
    if (from == _username) return;
    final lat = data?['lat'];
    final lng = data?['lng'];
    final msg = data?['message'] ?? 'Proximity alert';

    if (!mounted) return;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Alert from $from'),
        content: Text('$msg\nLocation: ($lat, $lng)'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
        ],
      ),
    );
  }

  void _startLocationUpdates() {
    _locationUpdateTimer?.cancel();
    _locationUpdateTimer = Timer.periodic(const Duration(seconds: 10), (_) => _emitLocation());
  }

  Future<void> _emitLocation() async {
    try {
      final loc = await _location.getLocation();
      _socket?.emit('location', {
        'username': _username,
        'lat': loc.latitude,
        'lng': loc.longitude,
        'ts': DateTime.now().toIso8601String(),
      });
    } catch (_) {}
  }

  void _stopEmergencyMode() {
    _emergencyModeTimer?.cancel();
    _emergencyModeTimer = null;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Emergency Mode Deactivated')),
    );
  }

  @override
  void dispose() {
    _locationUpdateTimer?.cancel();
    _socket?.dispose();
    _usernameController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F0FF),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF5F0FF),
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: CircleAvatar(
            backgroundColor: Colors.grey[300],
            child: const Icon(Icons.person, color: Colors.black54),
          ),
        ),
        title: Padding(
          padding: const EdgeInsets.only(right: 40.0),
          child: const Text(
            'Guest',
            style: TextStyle(
              color: Colors.black87,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        centerTitle: false,
        actions: [
          Builder(
            builder: (context) => IconButton(
              icon: const Icon(Icons.menu, color: Colors.black87),
              onPressed: () => Scaffold.of(context).openEndDrawer(),
            ),
          ),
        ],
      ),
      endDrawer: Drawer(
        backgroundColor: const Color(0xFFF5F0FF),
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(
                color: Color(0xFF7C4DFF),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const CircleAvatar(
                    radius: 30,
                    backgroundColor: Colors.white,
                    child: Icon(Icons.person, size: 40, color: Color(0xFF7C4DFF)),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _username,
                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: _socketConnected ? Colors.green : Colors.red,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _socketStatusMessage ?? (_socketConnected ? 'Connected' : 'Offline'),
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.contacts, color: Color(0xFF7C4DFF)),
              title: const Text('Manage Emergency Contacts'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => ManageContactsScreen(
                    contacts: _contacts,
                    onContactsUpdated: (updatedContacts) {
                      setState(() => _contacts = updatedContacts);
                      _saveContacts();
                    },
                    username: _username,
                    onUsernameChanged: (newUsername) {
                      setState(() => _username = newUsername);
                      _saveUsername();
                    },
                  )),
                );
              },
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: const Text(
                'Welcome to Sangini',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ),
            const SizedBox(height: 20),
            // Profile completion banner - full width
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Color(0xFFD4C5F9),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Complete your profile to stay safer!',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _contacts.isEmpty
                        ? 'You haven\'t added any emergency contacts yet.\nTap the menu to add contacts now.'
                        : 'Keep your emergency contacts updated for instant assistance.',
                    style: const TextStyle(
                      fontSize: 13,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            // Action buttons grid
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: GridView.count(
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  children: [
                    _buildActionCard(
                      imagePath: 'assets/police_logo.png',
                      label: 'CALL\nPOLICE',
                      color: const Color(0xFF5C6BC0),
                      onTap: () => _callHelpline('100'),
                    ),
                    _buildActionCard(
                      imagePath: 'assets/women_helpline.png',
                      label: 'CALL WOMEN\nHELPLINE',
                      color: const Color(0xFFFFB74D),
                      onTap: () => _callHelpline('181'),
                    ),
                    _buildActionCard(
                      imagePath: 'assets/Emergency_soslogo.png',
                      label: 'TRIPLE TAP\nSOS',
                      color: const Color(0xFFE57373),
                      onTap: _sendAlert,
                    ),
                    _buildActionCard(
                      imagePath: 'assets/location_logo.png',
                      label: 'LOCATION',
                      color: const Color(0xFF64B5F6),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const SafePlacesScreen()),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            // Safe Mode toggle
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Center(
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _isEmergencyModeActive = !_isEmergencyModeActive;
                      if (_isEmergencyModeActive) {
                        _startEmergencyMode();
                      } else {
                        _stopEmergencyMode();
                      }
                    });
                  },
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: _isEmergencyModeActive
                            ? [const Color(0xFF7C4DFF), const Color(0xFF9575CD)]
                            : [const Color(0xFFB39DDB), const Color(0xFFCE93D8)],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF7C4DFF).withOpacity(0.4),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _isEmergencyModeActive ? Icons.shield : Icons.shield_outlined,
                          size: 40,
                          color: Colors.white,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _isEmergencyModeActive ? 'Emergency\nMode ON' : 'Emergency\nMode OFF',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard({
    required String imagePath,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Image.asset(imagePath, width: 40, height: 40),
            ),
            const SizedBox(height: 12),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
                height: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// New screen for managing contacts
class ManageContactsScreen extends StatefulWidget {
  final List<Map<String, String>> contacts;
  final Function(List<Map<String, String>>) onContactsUpdated;
  final String username;
  final Function(String) onUsernameChanged;

  const ManageContactsScreen({
    required this.contacts,
    required this.onContactsUpdated,
    required this.username,
    required this.onUsernameChanged,
  });

  @override
  _ManageContactsScreenState createState() => _ManageContactsScreenState();
}

class _ManageContactsScreenState extends State<ManageContactsScreen> {
  late List<Map<String, String>> _contacts;
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  late TextEditingController _usernameController;

  @override
  void initState() {
    super.initState();
    _contacts = List.from(widget.contacts);
    _usernameController = TextEditingController(text: widget.username);
  }

  void _addContact() {
    if (_nameController.text.isNotEmpty && _phoneController.text.isNotEmpty) {
      setState(() {
        _contacts.add({
          'name': _nameController.text,
          'phone': _phoneController.text,
        });
        _nameController.clear();
        _phoneController.clear();
      });
      widget.onContactsUpdated(_contacts);
    }
  }

  void _deleteContact(int index) {
    setState(() {
      _contacts.removeAt(index);
    });
    widget.onContactsUpdated(_contacts);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F0FF),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7C4DFF),
        title: const Text('Emergency Contacts'),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Username field
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(
                labelText: 'Your Username (for Alerts)',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
              ),
              onChanged: (v) => widget.onUsernameChanged(v),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Contact Name',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
                child: ElevatedButton(
                onPressed: _addContact,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7C4DFF),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Add Contact', style: TextStyle(fontSize: 16, color: Colors.black)),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Emergency Contacts List',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: _contacts.isEmpty
                  ? const Center(
                      child: Text(
                        'No contacts added yet',
                        style: TextStyle(color: Colors.black54),
                      ),
                    )
                  : ListView.builder(
                      itemCount: _contacts.length,
                      itemBuilder: (context, index) {
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: const Color(0xFF7C4DFF),
                              child: Text(
                                _contacts[index]['name']![0].toUpperCase(),
                                style: const TextStyle(color: Colors.white),
                              ),
                            ),
                            title: Text(_contacts[index]['name']!),
                            subtitle: Text(_contacts[index]['phone']!),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () => _deleteContact(index),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _usernameController.dispose();
    super.dispose();
  }
}

// Safe Places Screen with OpenStreetMap
class SafePlacesScreen extends StatefulWidget {
  const SafePlacesScreen({Key? key}) : super(key: key);

  @override
  _SafePlacesScreenState createState() => _SafePlacesScreenState();
}

class _SafePlacesScreenState extends State<SafePlacesScreen> {
  final MapController _mapController = MapController();
  LatLng? _userLocation;
  List<SafePlace> _safePlaces = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initLocation();
  }

  Future<void> _initLocation() async {
    try {
      Location location = Location();

      bool serviceEnabled = await location.serviceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await location.requestService();
        if (!serviceEnabled) {
          setState(() {
            _errorMessage = 'Location services are disabled';
            _isLoading = false;
          });
          return;
        }
      }

      PermissionStatus permission = await location.hasPermission();
      if (permission == PermissionStatus.denied) {
        permission = await location.requestPermission();
        if (permission != PermissionStatus.granted) {
          setState(() {
            _errorMessage = 'Location permission denied';
            _isLoading = false;
          });
          return;
        }
      }

      LocationData locationData = await location.getLocation();
      if (locationData.latitude != null && locationData.longitude != null) {
        setState(() {
          _userLocation = LatLng(locationData.latitude!, locationData.longitude!);
        });
        await _fetchSafePlaces(locationData.latitude!, locationData.longitude!);
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error getting location: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchSafePlaces(double lat, double lon) async {
    final String query = '''
[out:json][timeout:25];
(
  node["amenity"="police"](around:1000, $lat, $lon);
  way["amenity"="police"](around:1000, $lat, $lon);
  node["amenity"="hospital"](around:1000, $lat, $lon);
  way["amenity"="hospital"](around:1000, $lat, $lon);
  node["amenity"="fuel"](around:1000, $lat, $lon);
  node["amenity"="pharmacy"](around:1000, $lat, $lon);
);
out center;
''';

    try {
      final response = await http.post(
        Uri.parse('https://overpass-api.de/api/interpreter'),
        body: query,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List elements = data['elements'] ?? [];

        List<SafePlace> places = [];
        for (var element in elements) {
          double? placeLat;
          double? placeLon;

          // Handle nodes (direct lat/lon) and ways (center.lat/center.lon)
          if (element['type'] == 'node') {
            placeLat = element['lat']?.toDouble();
            placeLon = element['lon']?.toDouble();
          } else if (element['type'] == 'way' && element['center'] != null) {
            placeLat = element['center']['lat']?.toDouble();
            placeLon = element['center']['lon']?.toDouble();
          }

          if (placeLat != null && placeLon != null) {
            final tags = element['tags'] ?? {};
            final String amenity = tags['amenity'] ?? 'unknown';
            final String name = tags['name'] ?? _getDefaultName(amenity);

            places.add(SafePlace(
              name: name,
              type: amenity,
              location: LatLng(placeLat, placeLon),
            ));
          }
        }

        setState(() {
          _safePlaces = places;
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = 'Failed to fetch safe places';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Network error: $e';
        _isLoading = false;
      });
    }
  }

  String _getDefaultName(String amenity) {
    switch (amenity) {
      case 'police':
        return 'Police Station';
      case 'hospital':
        return 'Hospital';
      case 'fuel':
        return 'Gas Station';
      case 'pharmacy':
        return 'Pharmacy';
      default:
        return 'Unknown Place';
    }
  }

  Color _getMarkerColor(String type) {
    switch (type) {
      case 'police':
        return Colors.blue;
      case 'hospital':
        return Colors.red;
      case 'fuel':
      case 'pharmacy':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  IconData _getMarkerIcon(String type) {
    switch (type) {
      case 'police':
        return Icons.local_police;
      case 'hospital':
        return Icons.local_hospital;
      case 'fuel':
        return Icons.local_gas_station;
      case 'pharmacy':
        return Icons.local_pharmacy;
      default:
        return Icons.location_on;
    }
  }

  void _showPlaceDetails(SafePlace place) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFFF5F0FF),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _getMarkerColor(place.type).withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      _getMarkerIcon(place.type),
                      color: _getMarkerColor(place.type),
                      size: 30,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          place.name,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          place.type.toUpperCase(),
                          style: TextStyle(
                            fontSize: 14,
                            color: _getMarkerColor(place.type),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _openDirections(place),
                  icon: const Icon(Icons.directions, color: Colors.white),
                  label: const Text(
                    'GET DIRECTIONS',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7C4DFF),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }

  Future<void> _openDirections(SafePlace place) async {
    final double lat = place.location.latitude;
    final double lon = place.location.longitude;
    
    // Try multiple URL formats
    final urls = [
      'geo:$lat,$lon?q=$lat,$lon',  // Standard geo scheme
      'google.navigation:q=$lat,$lon',  // Google Maps navigation
      'https://www.google.com/maps/dir/?api=1&destination=$lat,$lon',  // Web fallback
    ];

    for (String urlString in urls) {
      final Uri url = Uri.parse(urlString);
      try {
        final bool launched = await launchUrl(
          url,
          mode: LaunchMode.externalApplication,
        );
        if (launched) {
          Navigator.pop(context); // Close the bottom sheet
          return;
        }
      } catch (e) {
        // Try next URL
        continue;
      }
    }

    // If all failed, show error
    if (mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open maps. Please install Google Maps.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F0FF),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7C4DFF),
        title: const Text('Nearby Safe Places'),
        elevation: 0,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: Color(0xFF7C4DFF)),
            SizedBox(height: 16),
            Text('Finding nearby safe places...', style: TextStyle(color: Colors.black54)),
          ],
        ),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 60, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, color: Colors.black54),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isLoading = true;
                    _errorMessage = null;
                  });
                  _initLocation();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7C4DFF),
                ),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_userLocation == null) {
      return const Center(
        child: Text('Unable to get location'),
      );
    }

    return Stack(
      children: [
        FlutterMap(
          mapController: _mapController,
          options: MapOptions(
            initialCenter: _userLocation!,
            initialZoom: 14.0,
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.example.first',
            ),
            MarkerLayer(
              markers: [
                // User location marker
                Marker(
                  point: _userLocation!,
                  width: 50,
                  height: 50,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.3),
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.my_location,
                        color: Colors.blue,
                        size: 30,
                      ),
                    ),
                  ),
                ),
                // Safe place markers
                ..._safePlaces.map((place) => Marker(
                  point: place.location,
                  width: 45,
                  height: 45,
                  child: GestureDetector(
                    onTap: () => _showPlaceDetails(place),
                    child: Container(
                      decoration: BoxDecoration(
                        color: _getMarkerColor(place.type),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: _getMarkerColor(place.type).withOpacity(0.4),
                            blurRadius: 8,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Icon(
                        _getMarkerIcon(place.type),
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                  ),
                )),
              ],
            ),
          ],
        ),
        // Legend
        Positioned(
          bottom: 16,
          left: 16,
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Legend', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                _buildLegendItem(Colors.blue, 'Police'),
                _buildLegendItem(Colors.red, 'Hospital'),
                _buildLegendItem(Colors.green, 'Fuel/Pharmacy'),
              ],
            ),
          ),
        ),
        // Place count
        Positioned(
          top: 16,
          right: 16,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF7C4DFF),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '${_safePlaces.length} places found',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
        ),
        // Recenter button
        Positioned(
          bottom: 16,
          right: 16,
          child: FloatingActionButton(
            backgroundColor: const Color(0xFF7C4DFF),
            onPressed: () {
              if (_userLocation != null) {
                _mapController.move(_userLocation!, 14.0);
              }
            },
            child: const Icon(Icons.my_location, color: Colors.white),
          ),
        ),
      ],
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}

// Data model for safe places
class SafePlace {
  final String name;
  final String type;
  final LatLng location;

  SafePlace({
    required this.name,
    required this.type,
    required this.location,
  });
}