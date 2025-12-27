'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { updateProjectStage } from '@/app/actions/kanbanActions'
import { STAGE_LISTS } from '@/lib/brain'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Project = {
    id: string
    projectId: string
    name: string
    stage: string
    status: string
    percentComplete: number
    houseType: string
}

interface KanbanBoardProps {
    projects: Project[]
}

export function KanbanBoard({ projects: initialProjects }: KanbanBoardProps) {
    const [projects, setProjects] = useState(initialProjects)
    const [activeType, setActiveType] = useState<string>('Double') // Default to Double as user has Double projects

    const columns = STAGE_LISTS[activeType as keyof typeof STAGE_LISTS] || STAGE_LISTS.Single

    // Filter projects to only show those matching the active house type
    // This avoids confusion where a 'Double' project shows in a 'Single' board but in the wrong column or hidden
    const visibleProjects = projects.filter(p => p.houseType === activeType)

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return
        }

        const newStage = destination.droppableId

        // Optimistic Update
        const updatedProjects = projects.map(p =>
            p.id === draggableId
                ? { ...p, stage: newStage }
                : p
        )
        setProjects(updatedProjects)

        try {
            await updateProjectStage(draggableId, newStage)
        } catch (error) {
            console.error("Failed to update stage:", error)
            setProjects(initialProjects)
        }
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center space-x-4 px-1">
                <Tabs value={activeType} onValueChange={setActiveType} className="w-[400px]">
                    <TabsList>
                        <TabsTrigger value="Single">Single Storey</TabsTrigger>
                        <TabsTrigger value="Double">Double Storey</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="text-sm text-muted-foreground">
                    Showing {visibleProjects.length} projects
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex h-full gap-4 overflow-x-auto pb-4">
                    {columns.map(columnId => (
                        <div key={columnId} className="w-[300px] flex-shrink-0 flex flex-col">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase">{columnId}</h3>
                                <Badge variant="secondary" className="text-xs">
                                    {visibleProjects.filter(p => p.stage === columnId).length}
                                </Badge>
                            </div>

                            <Droppable droppableId={columnId}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={cn(
                                            "flex-1 bg-muted/50 rounded-lg p-2 space-y-3 min-h-[150px]",
                                            snapshot.isDraggingOver ? "bg-muted" : ""
                                        )}
                                    >
                                        {visibleProjects
                                            .filter(p => p.stage === columnId)
                                            .map((project, index) => (
                                                <Draggable key={project.id} draggableId={project.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <Card className={cn(
                                                                "cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
                                                                snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20 rotate-1" : ""
                                                            )}>
                                                                <CardHeader className="p-3 pb-0 space-y-1">
                                                                    <div className="flex justify-between items-start">
                                                                        <span className="font-mono text-xs text-muted-foreground">
                                                                            {project.projectId}
                                                                        </span>
                                                                        <Badge variant={project.status === 'On Track' ? 'secondary' : 'destructive'} className="text-[10px] px-1 py-0 h-5">
                                                                            {project.status}
                                                                        </Badge>
                                                                    </div>
                                                                    <CardTitle className="text-sm font-medium leading-tight">
                                                                        <Link href={`/projects/${project.id}`} className="hover:underline">
                                                                            {project.name}
                                                                        </Link>
                                                                    </CardTitle>
                                                                </CardHeader>
                                                                <CardContent className="p-3 pt-2">
                                                                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="bg-primary h-full transition-all"
                                                                            style={{ width: `${project.percentComplete}%` }}
                                                                        />
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    )
}
