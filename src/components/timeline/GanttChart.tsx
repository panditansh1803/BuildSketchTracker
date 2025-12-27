'use client'

import React, { useState } from 'react'
import { format, differenceInDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Project = {
    id: string
    name: string
    projectId: string
    startDate: Date
    targetFinish: Date
    actualFinish: Date | null
    status: string
    isDelayed: boolean
}

interface GanttChartProps {
    projects: Project[]
}

export function GanttChart({ projects }: GanttChartProps) {
    const [viewStartDate, setViewStartDate] = useState(startOfWeek(new Date()))
    const daysToShow = 14 // 2 Weeks view

    const viewEndDate = addDays(viewStartDate, daysToShow - 1)
    const days = eachDayOfInterval({ start: viewStartDate, end: viewEndDate })

    const handlePrev = () => setViewStartDate(d => addDays(d, -7))
    const handleNext = () => setViewStartDate(d => addDays(d, 7))
    const handleToday = () => setViewStartDate(startOfWeek(new Date()))

    const getStatusColor = (status: string, isDelayed: boolean) => {
        if (status === 'Completed') return 'bg-blue-500'
        if (isDelayed || status === 'Past Target') return 'bg-red-500'
        if (status === 'Client Delay') return 'bg-amber-500'
        return 'bg-emerald-500'
    }

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-lg">Project Timeline</CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrev}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleToday}>
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNext}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-x-auto pb-6">
                <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-[200px_1fr] border-b">
                        <div className="p-2 font-semibold text-sm text-muted-foreground border-r bg-muted/20">
                            Project
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${daysToShow}, 1fr)` }}>
                            {days.map(day => (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        "p-2 text-xs text-center border-r last:border-r-0",
                                        isSameDay(day, new Date()) ? "bg-primary/10 font-bold text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    <div className="font-medium">{format(day, 'MMM')}</div>
                                    <div>{format(day, 'd')}</div>
                                    <div className="text-[10px] opacity-70">{format(day, 'EEE')}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Project Rows */}
                    <div className="divide-y">
                        {projects.map(project => {
                            // Calculate Bar Position
                            const start = project.startDate
                            const end = project.actualFinish || project.targetFinish

                            // Clip to view
                            let visibleStart = start < viewStartDate ? viewStartDate : start
                            let visibleEnd = end > viewEndDate ? viewEndDate : end

                            // If completely out of view
                            if (end < viewStartDate || start > viewEndDate) {
                                // Still render row name, but empty track?
                                // Or maybe render a small indicator arrow?
                            }

                            const totalDays = differenceInDays(end, start) + 1

                            // Calculate CSS Grid Column Span
                            // We need to map dates to 1..14 index
                            const startOffset = differenceInDays(start, viewStartDate)
                            const endOffset = differenceInDays(end, viewStartDate)

                            // Valid range for grid is 1 to 14
                            const gridStart = Math.max(0, startOffset) + 1
                            const gridEnd = Math.min(daysToShow - 1, endOffset) + 2
                            const gridSpan = gridEnd - gridStart

                            const isVisible = endOffset >= 0 && startOffset < daysToShow

                            return (
                                <div key={project.id} className="grid grid-cols-[200px_1fr] hover:bg-muted/5 group">
                                    <div className="p-2 border-r text-sm font-medium flex flex-col justify-center truncate">
                                        <Link href={`/projects/${project.id}`} className="hover:underline truncate">
                                            {project.name}
                                        </Link>
                                        <span className="text-xs text-muted-foreground font-normal">{project.projectId}</span>
                                    </div>
                                    <div className="relative grid" style={{ gridTemplateColumns: `repeat(${daysToShow}, 1fr)` }}>
                                        {/* Grid Lines */}
                                        {Array.from({ length: daysToShow }).map((_, i) => (
                                            <div key={i} className="border-r last:border-r-0 h-full w-full" />
                                        ))}

                                        {/* The Bar */}
                                        {isVisible && (
                                            <div
                                                className={cn(
                                                    "absolute top-3 h-8 rounded-md shadow-sm border border-white/10 flex items-center px-2 text-xs text-white overflow-hidden whitespace-nowrap transition-all hover:brightness-110",
                                                    getStatusColor(project.status, project.isDelayed)
                                                )}
                                                style={{
                                                    gridColumnStart: gridStart,
                                                    gridColumnEnd: gridEnd
                                                }}
                                                title={`${format(start, 'MMM d')} - ${format(end, 'MMM d')}`}
                                            >
                                                {gridSpan > 2 && (
                                                    <span>{project.status}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                        {projects.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                No projects found.
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
