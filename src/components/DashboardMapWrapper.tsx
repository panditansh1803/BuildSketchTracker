'use client'

import dynamic from 'next/dynamic'

const ProjectMap = dynamic(() => import('@/components/ProjectMap'), { ssr: false })

type ProjectLocation = {
    id: string
    name: string
    stage: string
    lat: number
    lng: number
}

export function DashboardMapWrapper({ projects }: { projects: ProjectLocation[] }) {
    return <ProjectMap projects={projects} />
}
