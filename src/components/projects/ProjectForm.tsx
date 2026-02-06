'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


import { updateProject } from '@/app/actions/projectActions'
import { Pencil, AlertTriangle, Users, Calendar, MapPin, ChevronDown, Check, ChevronsUpDown, User, Lock, Clock } from 'lucide-react'
import { STAGE_LISTS } from '@/lib/brain'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from "@/lib/utils"

type UserOption = {
    id: string
    name: string
    role: string
}

type ProjectData = {
    id: string
    projectId: string
    name: string
    houseType: string
    stage: string
    status: string
    assignedToId: string | null
    startDate: Date
    targetFinish: Date
    actualFinish: Date | null
    latitude: number | null
    longitude: number | null
    notes: string | null
    isDelayed: boolean
    delayReason: string | null
    clientId: string | null
    clientName: string | null
    clientRequirements: string | null
    clientDelayDays: number | null // Added
    additionalAssignees: { id: string }[]
}


export function ProjectForm({
    project,
    users,
    currentUserRole // Passed from Parent
}: {
    project: ProjectData
    users: UserOption[]
    currentUserRole?: string
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const isAdmin = currentUserRole === 'ADMIN'

    const [formData, setFormData] = useState({
        projectId: project.projectId,
        name: project.name,
        houseType: project.houseType,
        stage: project.stage,
        status: project.status,
        assignedToId: project.assignedToId || 'unassigned',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        targetFinish: project.targetFinish ? new Date(project.targetFinish).toISOString().split('T')[0] : '',
        actualFinish: project.actualFinish ? new Date(project.actualFinish).toISOString().split('T')[0] : '',
        latitude: project.latitude?.toString() || '',
        longitude: project.longitude?.toString() || '',
        notes: project.notes || '',
        delayReason: project.delayReason || '',
        clientId: project.clientId || 'unassigned',
        clientName: project.clientName || '',
        clientRequirements: project.clientRequirements || '',
        clientDelayDays: project.clientDelayDays?.toString() || '0',
        additionalAssigneeIds: project.additionalAssignees?.map(u => u.id) || [] as string[]
    })

    // Sync state with props when project updates (essential for server action refreshes)
    React.useEffect(() => {
        setFormData({
            projectId: project.projectId,
            name: project.name,
            houseType: project.houseType,
            stage: project.stage,
            status: project.status,
            assignedToId: project.assignedToId || 'unassigned',
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
            targetFinish: project.targetFinish ? new Date(project.targetFinish).toISOString().split('T')[0] : '',
            actualFinish: project.actualFinish ? new Date(project.actualFinish).toISOString().split('T')[0] : '',
            latitude: project.latitude?.toString() || '',
            longitude: project.longitude?.toString() || '',
            notes: project.notes || '',
            delayReason: project.delayReason || '',
            clientId: project.clientId || 'unassigned',
            clientName: project.clientName || '',
            clientRequirements: project.clientRequirements || '',
            clientDelayDays: project.clientDelayDays?.toString() || '0',
            additionalAssigneeIds: project.additionalAssignees?.map(u => u.id) || [] as string[]
        })
    }, [project])


    const stages = STAGE_LISTS[formData.houseType as keyof typeof STAGE_LISTS] || STAGE_LISTS.Single

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const data = new FormData()
            // Always append ID for lookup

            // Only Append ADMIN Restricted fields if Admin
            // (Strict Security Layer also exists on Server, but UI should be smart)
            if (isAdmin) {
                data.append('projectId', formData.projectId)
                data.append('name', formData.name)
                data.append('houseType', formData.houseType)
                data.append('startDate', formData.startDate)
                data.append('targetFinish', formData.targetFinish)
                data.append('clientDelayDays', formData.clientDelayDays)

                if (formData.assignedToId && formData.assignedToId !== 'unassigned') {
                    data.append('assignedToId', formData.assignedToId)
                } else {
                    data.append('assignedToId', 'unassigned')
                }

                if (formData.clientId && formData.clientId !== 'unassigned') {
                    data.append('clientId', formData.clientId)
                } else {
                    data.append('clientId', 'unassigned')
                }

                data.append('clientName', formData.clientName || '')
                data.append('clientRequirements', formData.clientRequirements || '')

                formData.additionalAssigneeIds.forEach(id => {
                    data.append('additionalAssignees', id)
                })
            }

            // Public Fields (Allowed for Employees)
            data.append('stage', formData.stage)
            data.append('status', formData.status)
            if (formData.actualFinish) data.append('actualFinish', formData.actualFinish)
            if (formData.latitude) data.append('latitude', formData.latitude)
            if (formData.longitude) data.append('longitude', formData.longitude)
            if (formData.notes) data.append('notes', formData.notes)
            if (formData.delayReason) data.append('delayReason', formData.delayReason)

            await updateProject(project.id, data)
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Failed to update project', error)
            alert('Failed to update project')
        } finally {
            setLoading(false)
        }
    }

    const toggleAdditionalAssignee = (userId: string) => {
        if (!isAdmin) return // Lock UI interaction
        setFormData(prev => {
            const current = new Set(prev.additionalAssigneeIds)
            if (current.has(userId)) {
                current.delete(userId)
            } else {
                current.add(userId)
            }
            return { ...prev, additionalAssigneeIds: Array.from(current) }
        })
    }

    // Filtered lists
    const employeeUsers = users.filter(u => u.role === 'EMPLOYEE' || u.role === 'PROJECT_OWNER' || u.role === 'ADMIN')
    const clientUsers = users.filter(u => u.role === 'CLIENT')

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Edit Project Details</DialogTitle>
                    <DialogDescription>
                        Update project information, assignments, and schedule.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">

                    {/* SECTION: Project Identity */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            Identification
                            {!isAdmin && <Lock className="h-3 w-3 text-red-500" />}
                            <Separator className="flex-1" />
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="projectId">Project ID</Label>
                                <Input
                                    id="projectId"
                                    value={formData.projectId}
                                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                    disabled={!isAdmin}
                                    className={!isAdmin ? "bg-muted text-muted-foreground" : ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={!isAdmin}
                                    className={!isAdmin ? "bg-muted text-muted-foreground" : ""}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>House Type</Label>
                                <Select
                                    value={formData.houseType}
                                    onValueChange={(val) => setFormData({ ...formData, houseType: val, stage: '' })}
                                    disabled={!isAdmin}
                                >
                                    <SelectTrigger className={!isAdmin ? "bg-muted" : ""}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Single">Single</SelectItem>
                                        <SelectItem value="Double">Double</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Stage</Label>
                                <Select
                                    value={formData.stage}
                                    onValueChange={(val) => setFormData({ ...formData, stage: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stages.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="On Track">On Track</SelectItem>
                                        <SelectItem value="Client Delay">Client Delay</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Past Target">Past Target</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: People */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" /> Team & Client
                            {!isAdmin && <Lock className="h-3 w-3 text-red-500" />}
                            <Separator className="flex-1" />
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Primary Assignee */}
                            <div className="space-y-2">
                                <Label>Lead Assignee</Label>
                                <Select
                                    value={formData.assignedToId}
                                    onValueChange={(val) => setFormData({ ...formData, assignedToId: val })}
                                    disabled={!isAdmin}
                                >
                                    <SelectTrigger className={!isAdmin ? "bg-muted" : ""}>
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {employeeUsers.map((u) => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Additional Team (Multi-Select) */}
                            <div className="space-y-2">
                                <Label>Additional Team</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn("w-full justify-between font-normal px-3", !isAdmin && "bg-muted cursor-not-allowed opacity-70")}
                                            role="combobox"
                                            disabled={!isAdmin}
                                        >
                                            <span className="truncate">
                                                {formData.additionalAssigneeIds.length === 0
                                                    ? "Add team members..."
                                                    : `${formData.additionalAssigneeIds.length} members selected`}
                                            </span>
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[300px]" align="start">
                                        <DropdownMenuLabel>Select Team Members</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <div className="max-h-[200px] overflow-y-auto">
                                            {employeeUsers.map((user) => (
                                                <DropdownMenuCheckboxItem
                                                    key={user.id}
                                                    checked={formData.additionalAssigneeIds.includes(user.id)}
                                                    onCheckedChange={() => toggleAdditionalAssignee(user.id)}
                                                    disabled={user.id === formData.assignedToId}
                                                >
                                                    {user.name}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Client Assignment - TABBED INTERFACE */}
                            {isAdmin ? (
                                <div className="col-span-2 space-y-2">
                                    <Label>Client Management (CEO Only)</Label>
                                    <Tabs defaultValue={formData.clientId && formData.clientId !== 'unassigned' ? "user" : "manual"} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="user">Registered User</TabsTrigger>
                                            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                                        </TabsList>

                                        {/* TAB: REGISTERED USER */}
                                        <TabsContent value="user" className="space-y-2">
                                            <div className="flex flex-col space-y-2">
                                                <Label className="text-xs text-muted-foreground">Select a user who can log in</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "w-full justify-between",
                                                                !formData.clientId && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {formData.clientId && formData.clientId !== 'unassigned'
                                                                ? clientUsers.find((u) => u.id === formData.clientId)?.name
                                                                : "Select Client..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[400px] p-0" align="start">
                                                        <Command>
                                                            <CommandInput placeholder="Search clients..." />
                                                            <CommandList>
                                                                <CommandEmpty>No client found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    <CommandItem value="unassigned" onSelect={() => setFormData({ ...formData, clientId: 'unassigned' })}>
                                                                        <Check className={cn("mr-2 h-4 w-4", formData.clientId === 'unassigned' ? "opacity-100" : "opacity-0")} />
                                                                        No Client (Internal)
                                                                    </CommandItem>
                                                                    {clientUsers.map((client) => (
                                                                        <CommandItem key={client.id} value={client.name} onSelect={() => setFormData({ ...formData, clientId: client.id, clientName: '' })}>
                                                                            <Check className={cn("mr-2 h-4 w-4", formData.clientId === client.id ? "opacity-100" : "opacity-0")} />
                                                                            <div className="flex flex-col">
                                                                                <span>{client.name}</span>
                                                                                <span className="text-xs text-muted-foreground">ID: {client.id.substring(0, 8)}...</span>
                                                                            </div>
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </TabsContent>

                                        {/* TAB: MANUAL ENTRY */}
                                        <TabsContent value="manual" className="space-y-2">
                                            <div className="flex flex-col space-y-2">
                                                <Label htmlFor="clientName" className="text-xs text-muted-foreground">Enter name manually (No login access)</Label>
                                                <Input
                                                    id="clientName"
                                                    placeholder="e.g. Mr. & Mrs. Smith"
                                                    value={formData.clientName || ''}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        setFormData({ ...formData, clientName: e.target.value, clientId: 'unassigned' }) // Clear user if manual typing
                                                    }} />
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="pt-2">
                                        <Label htmlFor="clientRequirements">Client Requirements / Notes</Label>
                                        <Textarea
                                            id="clientRequirements"
                                            value={formData.clientRequirements || ''}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, clientRequirements: e.target.value })}
                                            className="h-20"
                                        />
                                    </div>
                                </div>
                            ) : (
                                // NON-ADMIN VIEW (MASKED)
                                <div className="col-span-2 space-y-2 p-3 bg-slate-100 dark:bg-slate-900 rounded border">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                        <h4 className="font-semibold text-sm">Client Information (Confidential)</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Access to full client details is restricted to Admin. Refer to Project ID <span className="font-mono text-primary">{formData.projectId}</span>.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* SECTION: Schedule & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Schedule
                                <Separator className="flex-1" />
                            </h3>
                            <div className="space-y-3">
                                {/* DYNAMIC SCHEDULING (CEO) */}
                                {isAdmin && (
                                    <div className="space-y-1 p-2 bg-blue-50 border border-blue-200 rounded">
                                        <Label className="text-xs font-semibold text-blue-900 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Client Delay (Days)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formData.clientDelayDays}
                                            onChange={(e) => {
                                                const inputValue = e.target.value
                                                const newDelay = parseInt(inputValue) || 0
                                                const oldDelay = parseInt(project.clientDelayDays?.toString() || '0')
                                                const diff = newDelay - oldDelay

                                                // Safe Date Math (noon normalized to avoid timezone rollover)
                                                // Create date from YYYY-MM-DD string to ensure local/UTC consistency
                                                const originalDateParts = project.targetFinish // Date object or string
                                                    ? new Date(project.targetFinish).toISOString().split('T')[0].split('-')
                                                    : null

                                                if (originalDateParts) {
                                                    // Explicitly construct local date at noon
                                                    const baseDate = new Date(
                                                        parseInt(originalDateParts[0]),
                                                        parseInt(originalDateParts[1]) - 1,
                                                        parseInt(originalDateParts[2]),
                                                        12, 0, 0
                                                    )

                                                    // Add Days
                                                    baseDate.setDate(baseDate.getDate() + diff)

                                                    setFormData({
                                                        ...formData,
                                                        clientDelayDays: inputValue,
                                                        targetFinish: baseDate.toISOString().split('T')[0]
                                                    })
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        clientDelayDays: inputValue
                                                    })
                                                }
                                            }}
                                            className="bg-white"
                                            placeholder="0"
                                        />
                                        <p className="text-[10px] text-blue-700">Changing this Auto-Shifts Target Date (Delta: {parseInt(formData.clientDelayDays || '0') - (project.clientDelayDays || 0)} days).</p>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <Label className="text-xs">Start Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        disabled={!isAdmin}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Target Finish</Label>
                                    <Input
                                        type="date"
                                        value={formData.targetFinish}
                                        onChange={(e) => setFormData({ ...formData, targetFinish: e.target.value })}
                                        disabled={!isAdmin}
                                    />
                                    {!isAdmin && <p className="text-[10px] text-muted-foreground">Managed by Dynamic Scheduling</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Actual Finish</Label>
                                    <Input
                                        type="date"
                                        value={formData.actualFinish}
                                        onChange={(e) => setFormData({ ...formData, actualFinish: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Location
                            </h3>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Latitude</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        placeholder="-33.8688"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Longitude</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        placeholder="151.2093"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: Notes & SLA */}
                    <div className="space-y-4">
                        <Separator />
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        {(project.isDelayed || formData.status === 'Completed') && (
                            <div className="space-y-2 p-4 bg-amber-50/50 border border-amber-200/50 rounded-lg">
                                <div className="flex items-center gap-2 text-amber-800 mb-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <Label htmlFor="delayReason" className="font-semibold cursor-pointer">
                                        Reason for Delay {project.isDelayed && '*'}
                                    </Label>
                                </div>
                                <Input
                                    id="delayReason"
                                    value={formData.delayReason}
                                    onChange={(e) => setFormData({ ...formData, delayReason: e.target.value })}
                                    placeholder={project.isDelayed ? "Required: Explanation for the delay..." : "Optional reason..."}
                                    className="bg-white"
                                    required={project.isDelayed && formData.status === 'Completed'}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}
