'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
import { updateProject } from '@/app/actions/projectActions'
import { Pencil, AlertTriangle } from 'lucide-react'
import { STAGE_LISTS } from '@/lib/brain'

type UserOption = {
    id: string
    name: string
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

    // Form State
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
        delayReason: project.delayReason || ''
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
            }
            if (formData.startDate) data.append('startDate', formData.startDate)
            if (formData.targetFinish) data.append('targetFinish', formData.targetFinish)
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Project Details</DialogTitle>
                    <DialogDescription>
                        Manually update project information.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    {/* SLA Warning */}
                    {project.isDelayed && (
                        <div className="col-span-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <div className="text-sm">
                                <span className="font-semibold">SLA Warning:</span> This project is overdue.
                                <br />
                                You must provide a <strong>Reason for Delay</strong> to complete it.
                            </div>
                        </div>
                    )}

                    {/* Identity */}
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

                    {/* Configuration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>House Type</Label>
                            <Select
                                value={formData.houseType}
                                onValueChange={(val) => setFormData({ ...formData, houseType: val, stage: '' })} // Reset stage on type change
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
                    </div>

                    {/* Assignment & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Assigned To</Label>
                            <Select
                                value={formData.assignedToId}
                                onValueChange={(val) => setFormData({ ...formData, assignedToId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {users.map((u) => (
                                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
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

                    {/* SLA: Reason for Delay (Conditional) */}
                    {(project.isDelayed || formData.status === 'Completed') && (
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="delayReason" className={project.isDelayed ? "text-amber-700 font-semibold" : ""}>
                                Reason for Delay {project.isDelayed && '*'}
                            </Label>
                            <Input
                                id="delayReason"
                                value={formData.delayReason}
                                onChange={(e) => setFormData({ ...formData, delayReason: e.target.value })}
                                placeholder={project.isDelayed ? "Required: Explanation for the delay..." : "Optional reason..."}
                                className={project.isDelayed ? "border-amber-300 focus:ring-amber-500" : ""}
                                required={project.isDelayed && formData.status === 'Completed'}
                            />
                        </div>
                    )}


                    {/* Location */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Latitude</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                placeholder="-33.8688"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Longitude</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                placeholder="151.2093"
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Target Finish</Label>
                            <Input
                                type="date"
                                value={formData.targetFinish}
                                onChange={(e) => setFormData({ ...formData, targetFinish: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Actual Finish</Label>
                            <Input
                                type="date"
                                value={formData.actualFinish}
                                onChange={(e) => setFormData({ ...formData, actualFinish: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}
