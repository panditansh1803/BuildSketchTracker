import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, FolderOpen, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function ClientsPage() {
    const user = await getCurrentUser()
    if (!user) return redirect('/login')

    // 1. Fetch Registered Clients
    const registeredClients = await prisma.user.findMany({
        where: { role: 'CLIENT' },
        include: {
            clientProjects: true
        }
    })

    // 2. Fetch Projects with Manual Clients
    // We only want projects where clientName is set manually AND clientId is null (hybrid case prefer clientId)
    const manualClientProjects = await prisma.project.findMany({
        where: {
            clientName: { not: null },
            // IF clientId is present, we treat it as registered client project, so filter those out from "Manual" list?
            // Or just show all.
            // Logic: If clientId is set, the project is under "registeredClients".
            // If clientId is NULL and clientName is SET, it's a "Manual Client".
            clientId: null
        }
    })

    // Group Manual projects by clientName
    const manualClientsMap = new Map<string, typeof manualClientProjects>()
    manualClientProjects.forEach(p => {
        const name = p.clientName!
        if (!manualClientsMap.has(name)) {
            manualClientsMap.set(name, [])
        }
        manualClientsMap.get(name)!.push(p)
    })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
                <div className="flex items-center space-x-2">
                    {/* Add button? Usually we add clients via Users or Projects */}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* REGISTERED CLIENTS */}
                {registeredClients.map(client => (
                    <Card key={client.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {client.name}
                            </CardTitle>
                            <Badge variant="default">Registered</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                <Mail className="h-3 w-3" />
                                {client.email}
                            </div>
                            <Separator className="my-3" />
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Active Projects</p>
                                {client.clientProjects.length > 0 ? (
                                    <div className="grid gap-1">
                                        {client.clientProjects.map(p => (
                                            <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between text-xs hover:underline bg-muted/50 p-1.5 rounded">
                                                <span>{p.name}</span>
                                                <Badge variant="outline" className="text-[10px] h-4">{p.status}</Badge>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">No active projects linked.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* MANUAL CLIENTS */}
                {Array.from(manualClientsMap.entries()).map(([name, projects]) => (
                    <Card key={name} className="hover:shadow-md transition-shadow border-dashed">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {name}
                            </CardTitle>
                            <Badge variant="secondary">Manual Entry</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                <AlertCircle className="h-3 w-3" />
                                No Account Access
                            </div>
                            <Separator className="my-3" />
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Projects</p>
                                {projects.map(p => (
                                    <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between text-xs hover:underline bg-muted/50 p-1.5 rounded">
                                        <span>{p.name}</span>
                                        <Badge variant="outline" className="text-[10px] h-4">{p.status}</Badge>
                                    </Link>
                                ))}
                            </div>
                            {/* Show latest requirements if any */}
                            {projects[0]?.clientRequirements && (
                                <div className="mt-3 p-2 bg-amber-50 rounded text-[10px] text-amber-800 border border-amber-100 italic line-clamp-2">
                                    "{projects[0].clientRequirements}"
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {registeredClients.length === 0 && manualClientsMap.size === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        <FolderOpen className="h-10 w-10 mb-2 opacity-50" />
                        <p>No clients found.</p>
                        <p className="text-sm">Add clients via the Team page or assign them manually in Projects.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
