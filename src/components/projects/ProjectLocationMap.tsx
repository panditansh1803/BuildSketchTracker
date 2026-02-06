'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Navigation } from 'lucide-react'

type ProjectLocation = {
    id: string
    name: string
    latitude: number | null
    longitude: number | null
    status: string
}

// Sub-component to handle map interactions (flyTo)
function MapSearchControl({ projects }: { projects: ProjectLocation[] }) {
    const map = useMap()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<ProjectLocation[]>([])

    // Filter projects based on query
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }
        const lower = query.toLowerCase()
        const matches = projects.filter(p =>
            (p.name.toLowerCase().includes(lower) || p.status.toLowerCase().includes(lower)) &&
            p.latitude && p.longitude
        )
        setResults(matches)
    }, [query, projects])

    const handleSelect = (project: ProjectLocation) => {
        if (project.latitude && project.longitude) {
            map.flyTo([project.latitude, project.longitude], 15, {
                duration: 1.5
            })
            // Close results
            setResults([])
            setQuery('')
        }
    }

    return (
        <div className="absolute top-4 right-4 z-[1000] w-72 flex flex-col gap-2">
            <Card className="p-2 shadow-xl bg-background/90 backdrop-blur-sm border-primary/20">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-8 bg-background/50 border-input"
                    />
                </div>
            </Card>

            {results.length > 0 && (
                <Card className="p-1 shadow-xl bg-background/95 backdrop-blur-md border-primary/20 max-h-[300px] overflow-auto">
                    <div className="flex flex-col gap-1">
                        {results.map(project => (
                            <Button
                                key={project.id}
                                variant="ghost"
                                className="justify-start h-auto py-2 px-3 text-left"
                                onClick={() => handleSelect(project)}
                            >
                                <div className='flex flex-col items-start gap-0.5 w-full'>
                                    <span className="font-medium text-sm flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-primary" /> {project.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                        {project.status}
                                    </span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
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
        <div className="relative h-[600px] w-full rounded-lg overflow-hidden border shadow-inner bg-slate-100 dark:bg-slate-900 group">
            <MapContainer center={center} zoom={4} scrollWheelZoom={false} className="h-full w-full z-0">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Search Control Overlay */}
                <MapSearchControl projects={validProjects} />

                {validProjects.map((project) => (
                    <Marker
                        key={project.id}
                        position={[project.latitude!, project.longitude!]}
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="min-w-[200px] p-1">
                                <div className="flex items-center gap-2 mb-2 border-b pb-2">
                                    <div className="bg-primary/10 p-1 rounded">
                                        <MapPin className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base leading-none">{project.name}</h3>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Project Site</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-3">
                                    <div className="flex justify-between items-center bg-muted/50 p-2 rounded text-sm">
                                        <span className="text-muted-foreground">Current Status:</span>
                                        <span className="font-semibold text-primary">{project.status}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Navigation className="w-3 h-3" />
                                        Approx. Location
                                    </div>
                                </div>

                                <Link href={`/projects/${project.id}`} className="block w-full">
                                    <Button size="sm" className="w-full">
                                        View Project Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}
