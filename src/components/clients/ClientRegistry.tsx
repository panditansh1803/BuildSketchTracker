'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User, Mail, FolderOpen, AlertCircle, Plus, Shield, Trash2, Phone, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { createClient, assignEmployeeToClient, removeEmployeeFromClient } from '@/app/actions/clientActions'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
    currentUserRole: string
    registeredClients: any[]
    manualProjects: any[]
    allEmployees: any[]
}

export function ClientRegistry({ currentUserRole, registeredClients, manualProjects, allEmployees }: Props) {
    const isAdmin = currentUserRole === 'ADMIN'

    // Group Manual projects
    const manualClientsMap = new Map<string, any[]>()
    manualProjects.forEach(p => {
        const name = p.clientName!
        if (!manualClientsMap.has(name)) {
            manualClientsMap.set(name, [])
        }
        manualClientsMap.get(name)!.push(p)
    })

    return (
        <div className="space-y-6">
            {/* Top Stats or Actions */}
            {isAdmin && (
                <div className="flex justify-end">
                    <AddClientDialog />
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* REGISTERED CLIENTS */}
                {registeredClients.map(client => (
                    <Card key={client.id} className="hover:shadow-md transition-shadow relative">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <CardTitle className="text-base font-medium leading-none">
                                    {client.name}
                                </CardTitle>
                            </div>
                            <Badge variant="default" className="bg-blue-600">Portal Access</Badge>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5" />
                                    {client.email}
                                </div>
                                {client.supabaseId ? (
                                    <div className="flex items-center gap-2 text-emerald-600 text-xs">
                                        <Shield className="h-3 w-3" />
                                        Verified Account
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-amber-600 text-xs">
                                        <AlertCircle className="h-3 w-3" />
                                        Pending Accept
                                    </div>
                                )}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-4">
                                {/* Assigned Staff Section (New) */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-medium text-muted-foreground">Assigned Staff</p>
                                        {isAdmin && (
                                            <ManageAccessDialog
                                                client={client}
                                                allEmployees={allEmployees}
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {client.allowedEmployees?.length > 0 ? (
                                            client.allowedEmployees.map((emp: any) => (
                                                <Badge key={emp.id} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900">
                                                    {emp.name.split(' ')[0]}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">No specific assignments</span>
                                        )}
                                    </div>
                                </div>

                                {/* Active Projects */}
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Active Projects ({client.clientProjects.length})</p>
                                    {client.clientProjects.length > 0 ? (
                                        <div className="grid gap-1.5">
                                            {client.clientProjects.map((p: any) => (
                                                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between text-sm hover:bg-muted/50 p-2 rounded border border-transparent hover:border-muted transition-colors">
                                                    <span className="truncate max-w-[150px]">{p.name}</span>
                                                    <Badge variant={p.status === 'Completed' ? 'secondary' : 'outline'} className="text-[10px] h-5 px-1.5">
                                                        {p.status}
                                                    </Badge>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">No projects found.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* MANUAL CLIENTS */}
                {Array.from(manualClientsMap.entries()).map(([name, projects]) => (
                    <Card key={name} className="hover:shadow-md transition-shadow border-dashed bg-slate-50/50 dark:bg-slate-900/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Briefcase className="h-4 w-4 text-slate-500" />
                                </div>
                                <CardTitle className="text-base font-medium leading-none text-muted-foreground">
                                    {name}
                                </CardTitle>
                            </div>
                            <Badge variant="secondary">Offline</Badge>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-sm text-amber-600/80 mb-4">
                                <AlertCircle className="h-3.5 w-3.5" />
                                No Portal Access
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Projects ({projects.length})</p>
                                    <div className="grid gap-1.5">
                                        {projects.map(p => (
                                            <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between text-sm hover:bg-muted/50 p-2 rounded border border-transparent hover:border-muted transition-colors">
                                                <span className="truncate max-w-[150px]">{p.name}</span>
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5">{p.status}</Badge>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {projects[0]?.clientRequirements && (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md text-xs text-amber-900 dark:text-amber-200 border border-amber-100 dark:border-amber-900/50 italic">
                                        "{projects[0].clientRequirements}"
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {registeredClients.length === 0 && manualClientsMap.size === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                        <FolderOpen className="h-10 w-10 mb-2 opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">No Clients Found</h3>
                        <p className="text-sm">Add your first client to get started.</p>
                        {isAdmin && (
                            <div className="mt-4">
                                <AddClientDialog />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function AddClientDialog() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        const res = await createClient({ name, email })
        setLoading(false)
        if (res.success) {
            setOpen(false)
            setName('')
            setEmail('')
        } else {
            alert(res.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Client
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                        Create a portal account for a client. They will receive an email to set their password.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Client Name</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" required />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Client'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function ManageAccessDialog({ client, allEmployees }: { client: any, allEmployees: any[] }) {
    const [open, setOpen] = useState(false)
    const [selectedEmp, setSelectedEmp] = useState('')

    async function handleAdd() {
        if (!selectedEmp) return
        await assignEmployeeToClient(client.id, selectedEmp)
        setSelectedEmp('')
    }

    async function handleRemove(empId: string) {
        await removeEmployeeFromClient(client.id, empId)
    }

    // Filter out already assigned
    const assignedIds = new Set(client.allowedEmployees?.map((e: any) => e.id) || [])
    const availableEmployees = allEmployees.filter(e => !assignedIds.has(e.id))

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full hover:bg-muted">
                    <Plus className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background">
                <DialogHeader>
                    <DialogTitle>Manage Access</DialogTitle>
                    <DialogDescription>
                        Select employees allowed to manage <strong>{client.name}</strong>'s data.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    {/* Add Area */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedEmp}
                                onChange={e => setSelectedEmp(e.target.value)}
                            >
                                <option value="">Select Employee...</option>
                                {availableEmployees.map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={handleAdd} disabled={!selectedEmp} size="sm">Add</Button>
                    </div>

                    <Separator />

                    {/* List Area */}
                    <div className="space-y-2">
                        <Label>Allowed Employees</Label>
                        {client.allowedEmployees?.length > 0 ? (
                            <div className="grid gap-2">
                                {client.allowedEmployees.map((emp: any) => (
                                    <div key={emp.id} className="flex items-center justify-between p-2 rounded border bg-muted/40">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                                                {emp.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium">{emp.name}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100" onClick={() => handleRemove(emp.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No employees assigned yet.</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
