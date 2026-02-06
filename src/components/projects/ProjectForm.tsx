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
import { Pencil, AlertTriangle, Users, Calendar, MapPin, ChevronDown, Check, ChevronsUpDown, User, Mail } from 'lucide-react'
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
    additionalAssignees: { id: string }[]
}


export function ProjectForm({
    project,
    users
}: {
    project: ProjectData
    users: UserOption[]
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

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
        additionalAssigneeIds: project.additionalAssignees?.map(u => u.id) || [] as string[]
    })


    const stages = STAGE_LISTS[formData.houseType as keyof typeof STAGE_LISTS] || STAGE_LISTS.Single

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const data = new FormData()
            data.append('projectId', formData.projectId)
            data.append('name', formData.name)
            data.append('houseType', formData.houseType)
            data.append('stage', formData.stage)
            data.append('status', formData.status)

            if (formData.assignedToId && formData.assignedToId !== 'unassigned') {
                data.append('assignedToId', formData.assignedToId)
            } else {
                // Explicitly send 'unassigned' so action knows to nullify it
                data.append('assignedToId', 'unassigned')
            }

            if (formData.startDate) data.append('startDate', formData.startDate)
            if (formData.targetFinish) data.append('targetFinish', formData.targetFinish)
            if (formData.actualFinish) data.append('actualFinish', formData.actualFinish)
            if (formData.latitude) data.append('latitude', formData.latitude)
            if (formData.longitude) data.append('longitude', formData.longitude)
            if (formData.notes) data.append('notes', formData.notes)
            if (formData.delayReason) data.append('delayReason', formData.delayReason)

            // Client
            if (formData.clientId && formData.clientId !== 'unassigned') {
                data.append('clientId', formData.clientId)
            } else {
                // Explicitly send 'unassigned' so action knows to nullify it
                data.append('clientId', 'unassigned')
            }
            // Always append manual client fields (even if empty, to allow clearing)
            data.append('clientName', formData.clientName || '')
            data.append('clientRequirements', formData.clientRequirements || '')


            // Append array
            formData.additionalAssigneeIds.forEach(id => {
                data.append('additionalAssignees', id)
            })

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
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
                            <Separator className="flex-1" />
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="projectId">Project ID</Label>
                                <Input
                                    id="projectId"
                                    value={formData.projectId}
                                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>House Type</Label>
                                <Select
                                    value={formData.houseType}
                                    onValueChange={(val) => setFormData({ ...formData, houseType: val, stage: '' })}
                                >
                                    <SelectTrigger>
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
                            <Separator className="flex-1" />
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Primary Assignee */}
                            <div className="space-y-2">
                                <Label>Lead Assignee</Label>
                                <Select
                                    value={formData.assignedToId}
                                    onValueChange={(val) => setFormData({ ...formData, assignedToId: val })}
                                >
                                    <SelectTrigger>
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
                                        <Button variant="outline" className="w-full justify-between font-normal px-3" role="combobox">
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
                                                    // Disable if primary assignee
                                                    disabled={user.id === formData.assignedToId}
                                                >
                                                    {user.name}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                            {employeeUsers.length === 0 && (
                                                <div className="p-2 text-sm text-muted-foreground text-center">No employees found.</div>
                                            )}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {formData.additionalAssigneeIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {formData.additionalAssigneeIds.map(id => {
                                            const user = users.find(u => u.id === id)
                                            return user ? (
                                                <Badge key={id} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                                    {user.name}
                                                </Badge>
                                            ) : null
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Client Assignment - TABBED INTERFACE */}
                            <div className="col-span-2 space-y-2">
                                <Label>Client Management</Label>
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
                                                                <CommandItem
                                                                    value="unassigned"
                                                                    onSelect={() => {
                                                                        setFormData({ ...formData, clientId: 'unassigned' })
                                                                    }}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", formData.clientId === 'unassigned' ? "opacity-100" : "opacity-0")} />
                                                                    No Client (Internal)
                                                                </CommandItem>
                                                                {clientUsers.map((client) => (
                                                                    <CommandItem
                                                                        key={client.id}
                                                                        value={client.name}
                                                                        onSelect={() => {
                                                                            setFormData({ ...formData, clientId: client.id, clientName: '' }) // Clear manual name if user selected
                                                                        }}
                                                                    >
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

                                            {/* Registered User Preview */}
                                            {formData.clientId && formData.clientId !== 'unassigned' && (
                                                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-md flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-blue-900">
                                                            {clientUsers.find(u => u.id === formData.clientId)?.name}
                                                        </p>
                                                        <p className="text-xs text-blue-700">Registered Account</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* TAB: MANUAL ENTRY */}
                                    <TabsContent value="manual" className="space-y-2">
                                        <div className="flex flex-col space-y-2">
                                            <Label htmlFor="clientName" className="text-xs text-muted-foreground">Enter name manually (No login access)</Label>
                                            <Input
                                                id="clientName"
                                                placeholder="e.g. Mr. & Mrs. Smith"
                                                value={formData.clientName}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, clientName: e.target.value, clientId: 'unassigned' }) // Clear user if manual typing
                                                }}
                                            />
                                            {formData.clientName && (
                                                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-md flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                        <Pencil className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-amber-900">{formData.clientName}</p>
                                                        <p className="text-xs text-amber-700">Manual Record (Offline)</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* Common Requirements Field */}
                                <div className="pt-2">
                                    <Label htmlFor="clientRequirements">Client Requirements / Notes</Label>
                                    <Textarea
                                        id="clientRequirements"
                                        placeholder="Specific requests, color choices, contact preferences..."
                                        className="h-20 mt-1 resize-none"
                                        value={formData.clientRequirements}
                                        onChange={(e) => setFormData({ ...formData, clientRequirements: e.target.value })}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* SECTION: Schedule & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Schedule
                            </h3>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Start Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Target Finish</Label>
                                    <Input
                                        type="date"
                                        value={formData.targetFinish}
                                        onChange={(e) => setFormData({ ...formData, targetFinish: e.target.value })}
                                    />
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
