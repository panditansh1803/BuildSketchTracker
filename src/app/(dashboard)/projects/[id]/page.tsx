import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentList } from '@/components/DocumentList'
import { PhotoGallery } from '@/components/PhotoGallery'
import { ProjectTimeline } from '@/components/projects/ProjectTimeline'
import { DeleteProjectButton } from '@/components/projects/DeleteProjectButton'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { SiteActivityFeed } from '@/components/projects/SiteActivityFeed'
import { DownloadProjectPdf } from '@/components/projects/DownloadProjectPdf'
import MapClientWrapper from '@/components/projects/MapClientWrapper'
import { checkSlaCompliance } from '@/lib/brain'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Run SLA Check on Load (Smart Protocol)
    await checkSlaCompliance(id)

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            documents: true,
            photos: true,
            assignedTo: true,
            history: {
                orderBy: { createdAt: 'desc' }
                // Removed 'take' limit for Full Audit Trail reporting
            },
        },
    })

    if (!project) notFound()

    // Fetch users for assignment dropdown
    const users = await prisma.user.findMany({
        select: { id: true, name: true }
    })

    const historyEntries = project.history.map((h: any) => ({
        id: h.id,
        description: `${h.fieldName} changed from ${h.oldValue} to ${h.newValue}`,
        date: h.createdAt,
        userInitials: h.changedBy ? h.changedBy.substring(0, 2).toUpperCase() : '??'
    }))

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground">ID: {project.projectId} • {project.stage}</p>
                </div>
                <div className="flex items-center gap-4">
                    <DownloadProjectPdf project={project} />
                    <div className="text-right hidden sm:block">
                        <p className="text-2xl font-bold">{project.percentComplete}%</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Completion</p>
                    </div>
                    <ProjectForm project={project} users={users} />
                    <DeleteProjectButton projectId={project.id} projectName={project.name} />
                </div>
            </div>

            {/* Row 2: Timeline & Map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="h-full">
                    <CardContent className="pt-6">
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Project Progress</h3>
                            <ProjectTimeline currentStage={project.stage} houseType={project.houseType} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full overflow-hidden">
                    <div className="h-[300px] w-full relative">
                        {project.latitude && project.longitude ? (
                            <MapClientWrapper projects={[{
                                id: project.id,
                                name: project.name,
                                latitude: project.latitude,
                                longitude: project.longitude,
                                status: project.status
                            }]} />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                                No Location Data Set
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Row 3: Design, Docs & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Documents & Photos */}
                <div className="lg:col-span-7">
                    <div className="mb-2">
                        <h2 className="text-xl font-semibold tracking-tight">Project Design & Documentation</h2>
                        <p className="text-sm text-muted-foreground">Official plans, designs, and site photos.</p>
                    </div>
                    <Tabs defaultValue="documents" className="h-[500px] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <TabsList>
                                <TabsTrigger value="documents">Design Docs</TabsTrigger>
                                <TabsTrigger value="photos">Site Photos</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <TabsContent value="documents" className="h-full mt-0">
                                <Card className="h-full">
                                    <CardContent className="pt-6 h-full overflow-auto">
                                        <DocumentList projectId={project.id} documents={project.documents} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="photos" className="h-full mt-0">
                                <Card className="h-full">
                                    <CardContent className="pt-6 h-full overflow-auto">
                                        <PhotoGallery
                                            projectId={project.id}
                                            photos={project.photos}
                                            houseType={project.houseType}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Right: Site Activity Feed */}
                <div className="lg:col-span-5">
                    <div className="mb-2">
                        <h2 className="text-xl font-semibold tracking-tight">Activity Log</h2>
                        <p className="text-sm text-muted-foreground">Recent updates and changes.</p>
                    </div>
                    <div className="h-[500px]">
                        <SiteActivityFeed activities={historyEntries} />
                    </div>
                </div>
            </div>
        </div>
    )
}
