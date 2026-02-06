'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type ProjectLocation = {
    id: string
    name: string
    latitude: number | null
    longitude: number | null
    status: string
}

export default function ProjectLocationMap({ projects }: { projects: ProjectLocation[] }) {
    const [isMounted, setIsMounted] = useState(false)
    const [customIcon, setCustomIcon] = useState<L.Icon | null>(null)

    useEffect(() => {
        setIsMounted(true)
        // Fix for default marker icon in Leaflet + Next.js
        const icon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
        setCustomIcon(icon)
    }, [])

    if (!isMounted || !customIcon) return <div className="h-[600px] w-full bg-muted animate-pulse rounded-lg" />

    // Default center (Australia approx) or first project
    const validProjects = projects.filter(p => p.latitude !== null && p.longitude !== null)
    const center: [number, number] = validProjects.length > 0
        ? [validProjects[0].latitude!, validProjects[0].longitude!]
        : [-25.2744, 133.7751] // Center of Australia

    return (
        <MapContainer center={center} zoom={4} scrollWheelZoom={false} className="h-[600px] w-full rounded-lg shadow-md z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validProjects.map((project) => (
                <Marker
                    key={project.id}
                    position={[project.latitude!, project.longitude!]}
                    icon={customIcon}
                >
                    <Popup>
                        <div className="text-sm">
                            <strong className="block text-base mb-1">{project.name}</strong>
                            <span className="text-muted-foreground block mb-2">{project.status}</span>
                            <Link href={`/projects/${project.id}`} className="text-blue-600 hover:underline">
                                View Details
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}
