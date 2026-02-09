import { z } from 'zod'

// UI Helper: Stage Lists (UI needs order)
export const STAGE_LISTS = {
    Single: [
        'Project Setup', 'Architectural', 'Frames', 'Trusses', 'Steel', 'Client Check', 'Engineer Review', 'Finalisation'
    ],
    Double: [
        'Project Setup', 'Architectural', 'Lower Frames', 'Floor Trusses', 'Lower Steel', 'Upper Frames', 'Roof Trusses', 'Client Check', 'Engineer Review', 'Finalisation'
    ]
}

// 1. Zod Schemas (Master Spec)
export const ProjectUpdateSchema = z.object({
    projectId: z.string().optional(), // Added manual update support
    name: z.string().optional(),      // Added manual update support
    stage: z.string().optional(),
    houseType: z.enum(['Single', 'Double']).optional(),
    startDate: z.coerce.date().optional(), // Added manual update support
    targetFinish: z.coerce.date().optional(),
    actualFinish: z.coerce.date().nullable().optional(),
    assignedToId: z.string().nullable().optional(),
    clientId: z.string().nullable().optional(), // Added for Client Support
    // New Manual Client Fields
    clientName: z.string().nullable().optional(),
    clientRequirements: z.string().nullable().optional(),
    clientDelayDays: z.number().int().optional(), // CEO Manual Delay

    additionalAssigneeIds: z.array(z.string()).optional(), // Added for Multi-Assignee
    latitude: z.number().optional(),  // Restored
    longitude: z.number().optional(), // Restored
    status: z.string().optional(),
    delayReason: z.string().optional(),
    isDelayed: z.boolean().optional(),
    notes: z.string().optional(),
})

export type ProjectUpdateData = z.infer<typeof ProjectUpdateSchema>
