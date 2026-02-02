'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock, StopCircle, PlayCircle } from 'lucide-react'
import { clockIn, clockOut, getActiveSession, getProjectsForDropdown } from '@/app/actions/time-tracking'

export function TimeTracker() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeSession, setActiveSession] = useState<any>(null)
    const [projects, setProjects] = useState<any[]>([])
    const [selectedProject, setSelectedProject] = useState<string>('')
    const [description, setDescription] = useState('')
    const [elapsed, setElapsed] = useState(0)

    useEffect(() => {
        loadSession()
        loadProjects()
    }, [])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (activeSession) {
            // Calculate initial elapsed based on startTime
            const start = new Date(activeSession.startTime).getTime()
            setElapsed(Math.floor((Date.now() - start) / 1000))

            timer = setInterval(() => {
                setElapsed(Math.floor((Date.now() - start) / 1000))
            }, 1000)
        } else {
            setElapsed(0)
        }
        return () => clearInterval(timer)
    }, [activeSession])

    const loadSession = async () => {
        try {
            const session = await getActiveSession()
            setActiveSession(session)
        } catch (error) {
            console.error('Failed to load session:', error)
        }
    }

    const loadProjects = async () => {
        try {
            const data = await getProjectsForDropdown()
            setProjects(data)
        } catch (error) {
            console.error('Failed to load projects:', error)
        }
    }

    const handleClockIn = async () => {
        try {
            await clockIn(selectedProject || undefined)
            setIsOpen(false)
            await loadSession()
        } catch (error) {
            console.error(error)
            alert('Failed to clock in')
        }
    }

    const handleClockOut = async () => {
        try {
            await clockOut(description)
            setIsOpen(false)
            setDescription('')
            await loadSession()
        } catch (error) {
            console.error(error)
            alert('Failed to clock out')
        }
    }

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    if (activeSession) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 shadow-sm transition-all duration-300">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="font-mono font-bold tracking-wider">{formatTime(elapsed)}</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Stop Timer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">Current Session</p>
                                <p className="text-sm text-muted-foreground">
                                    Started at {new Date(activeSession.startTime).toLocaleTimeString()}
                                </p>
                                {activeSession.project && (
                                    <p className="text-xs text-primary">{activeSession.project.name}</p>
                                )}
                            </div>
                            <div className="font-mono text-xl font-bold">
                                {formatTime(elapsed)}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description (Optional)</Label>
                            <Input
                                placeholder="What did you work on?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleClockOut}>Clock Out</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/10 dark:text-green-400">
                    <PlayCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Clock In</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start Timer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Project (Optional)</Label>
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.projectId} - {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleClockIn}>Start Clock</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
