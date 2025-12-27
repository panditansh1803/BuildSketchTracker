'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'

// Fix for default marker icon
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

type ProjectLocation = {
    id: string
    name: string
    stage: string
    lat: number
    lng: number
}

export default function ProjectMap({ projects }: { projects: ProjectLocation[] }) {
    // Default center (Melbourne)
    const center: [number, number] = [-37.8136, 144.9631]

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border z-0">
            <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {projects.map((project) => (
                    <Marker key={project.id} position={[project.lat, project.lng]} icon={icon}>
                        <Popup>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-xs text-muted-foreground">{project.stage}</div>
                            <a href={`/projects/${project.id}`} className="text-xs text-primary hover:underline block mt-1">
                                View Project
                            </a>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}
