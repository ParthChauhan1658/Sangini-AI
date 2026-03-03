import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Marker Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const BACKEND = "http://localhost:5000";

// Tile layer URLs
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

const CameraMap = () => {
    const [cameras, setCameras] = useState([]);
    const [isLightTheme, setIsLightTheme] = useState(false);

    useEffect(() => {
        // Check current theme
        setIsLightTheme(document.documentElement.getAttribute('data-theme') === 'light');

        // Watch for theme changes
        const observer = new MutationObserver(() => {
            setIsLightTheme(document.documentElement.getAttribute('data-theme') === 'light');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        axios.get(`${BACKEND}/cameras`).then(res => {
            const baseLat = 28.6139;
            const baseLng = 77.2090;

            const augmented = res.data.map((cam, i) => ({
                ...cam,
                lat: cam.lat || (baseLat + (Math.random() - 0.5) * 5),
                lng: cam.lng || (baseLng + (Math.random() - 0.5) * 5)
            }));
            setCameras(augmented);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="h-full w-full bg-[#0b0e14] relative flex flex-col p-6 overflow-hidden">
            <div className="z-10 mb-4 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white">Surveillance Map</h2>
                    <p className="text-gray-400 text-sm">Live Geospatial Tracking (OpenStreetMap)</p>
                </div>
                <div className="text-xs text-gray-500">
                    <span className="text-[#0ea5e9]">{isLightTheme ? 'CartoDB Positron' : 'CartoDB Dark Matter'}</span> Layer
                </div>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-[#1c232b] relative z-0">
                <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url={isLightTheme ? LIGHT_TILES : DARK_TILES}
                    />

                    {cameras.map(cam => (
                        <Marker key={cam.id} position={[cam.lat, cam.lng]}>
                            <Popup className="custom-popup">
                                <div className="p-2 min-w-[150px]">
                                    <h3 className="font-bold text-sm mb-1">{cam.name}</h3>
                                    <p className="text-xs text-gray-500 font-mono mb-2">{cam.source}</p>
                                    <div className="flex gap-1">
                                        {cam.settings?.violence && <span className="bg-red-500 text-white text-[9px] px-1 rounded">V</span>}
                                        {cam.settings?.face && <span className="bg-orange-500 text-white text-[9px] px-1 rounded">F</span>}
                                        {cam.settings?.gender && <span className="bg-blue-500 text-white text-[9px] px-1 rounded">G</span>}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default CameraMap;

