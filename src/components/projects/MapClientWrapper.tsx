'use client'

import dynamic from 'next/dynamic'

const ProjectLocationMap = dynamic(
    () => import('./ProjectLocationMap'),
    { ssr: false }
)

type ProjectLocation = {
    id: string
    name: string
    latitude: number | null
    longitude: number | null
    status: string
}

export default function MapClientWrapper({ projects }: { projects: ProjectLocation[] }) {
    return <ProjectLocationMap projects={projects} />
}
