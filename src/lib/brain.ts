import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
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

/**
 * SLA CHECKER (Rule A & B)
 * Call this periodically or on dashboard load.
 */
export async function checkSlaCompliance(projectId: string) {
    return await prisma.$transaction(async (tx) => {
        const project = await tx.project.findUniqueOrThrow({ where: { id: projectId } })

        if (project.status === 'Completed') return null

        const now = new Date()
        const startTime = project.startDate
        const diffHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60)

        // Rule A: 24-Hour Monitor (Initial Delay Flag)
        if (diffHours > 24) {
            let needsUpdate = false
            const updates: any = {}

            if (!project.isDelayed) {
                updates.isDelayed = true
                needsUpdate = true

                // History
                await tx.projectHistory.create({
                    data: { projectId, changedBy: 'System (SLA)', fieldName: 'isDelayed', oldValue: 'false', newValue: 'true' }
                })
            }

            // Rule B: Rolling Deadline (SLA System Delay)
            const originalTarget = project.originalTarget
            const diffTime = now.getTime() - originalTarget.getTime()
            const calculatedSystemDelay = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            let newSystemDelay = project.delayDays

            // Only increase system delay if we are actually past the target
            if (calculatedSystemDelay > project.delayDays && calculatedSystemDelay > 0) {
                newSystemDelay = calculatedSystemDelay
                updates.delayDays = newSystemDelay
                needsUpdate = true
            }

            // DYNAMIC SCHEDULING FORMULA:
            // Final = Original + System(SLA) + Client(CEO)
            const totalDelay = newSystemDelay + project.clientDelayDays

            // Calculate new target base
            const newTargetTime = originalTarget.getTime() + (totalDelay * 24 * 60 * 60 * 1000)
            const newTargetDate = new Date(newTargetTime)

            // Check if target actually changed from what is stored
            if (newTargetDate.getTime() !== project.targetFinish.getTime()) {
                updates.targetFinish = newTargetDate
                needsUpdate = true

                await tx.projectHistory.create({
                    data: {
                        projectId,
                        changedBy: 'System (Auto-Shift)',
                        fieldName: 'targetFinish',
                        oldValue: project.targetFinish.toISOString(),
                        newValue: newTargetDate.toISOString(),
                    }
                })
            }

            if (needsUpdate) {
                await tx.project.update({ where: { id: projectId }, data: updates })
            }
        }
    })
}

/**
 * CORE BUSINESS LOGIC ("THE BRAIN")
 * Master Spec Rules:
 * - Validation: Zod (caller should handle, but we enforce types here)
 * - Transactional Integrity: STRICT
 * - Stage Automation: Query StageConfig, Update Percent, Auto-Complete
 */
export async function updateProjectBrain(projectId: string, rawData: ProjectUpdateData, userId: string, userName: string) {
    // Validate (double check)
    const newData = ProjectUpdateSchema.parse(rawData)

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Fetch old project to compare
        const oldProject = await tx.project.findUniqueOrThrow({ where: { id: projectId } })

        // Rule C: Accountability (Reason)
        if (oldProject.isDelayed || newData.isDelayed) {
            const isCompleting = (newData.status === 'Completed') || (oldProject.status !== 'Completed' && newData.status === 'Completed')
            const hasReason = newData.delayReason && newData.delayReason.trim().length > 0
            const existingReason = oldProject.delayReason

            if (isCompleting && !hasReason && !existingReason) {
                throw new Error("SLA Violation: You must provide a 'Reason for Delay' before completing a delayed project.")
            }
        }

        const changes: Record<string, any> = {}
        const historyEntries: {
            projectId: string
            changedBy: string
            fieldName: string
            oldValue: string | null
            newValue: string | null
        }[] = []

        const logChange = (field: string, oldVal: unknown, newVal: unknown) => {
            // Strict inequality check
            if (oldVal !== newVal) {
                historyEntries.push({
                    projectId,
                    changedBy: userName,
                    fieldName: field,
                    oldValue: String(oldVal ?? 'null'),
                    newValue: String(newVal ?? 'null')
                })
            }
        }

        // 2. Logic & Comparisons

        // A. Identity & Core Fields (Manual Updates)
        if (newData.projectId !== undefined && newData.projectId !== oldProject.projectId) {
            changes.projectId = newData.projectId
            logChange('projectId', oldProject.projectId, newData.projectId)
        }
        if (newData.name !== undefined && newData.name !== oldProject.name) {
            changes.name = newData.name
            logChange('name', oldProject.name, newData.name)
        }
        if (newData.houseType !== undefined && newData.houseType !== oldProject.houseType) {
            changes.houseType = newData.houseType
            logChange('houseType', oldProject.houseType, newData.houseType)
        }

        // B. General Fields
        if (newData.notes !== undefined && newData.notes !== oldProject.notes) {
            changes.notes = newData.notes
            logChange('notes', oldProject.notes, newData.notes)
        }

        // Manual Client Details
        if (newData.clientName !== undefined && newData.clientName !== oldProject.clientName) {
            changes.clientName = newData.clientName
            logChange('clientName', oldProject.clientName, newData.clientName)
        }
        if (newData.clientRequirements !== undefined && newData.clientRequirements !== oldProject.clientRequirements) {
            changes.clientRequirements = newData.clientRequirements
            logChange('clientRequirements', oldProject.clientRequirements, newData.clientRequirements)
        }

        // SLA: Delay Reason update
        if (newData.delayReason !== undefined && newData.delayReason !== oldProject.delayReason) {
            changes.delayReason = newData.delayReason
            logChange('delayReason', oldProject.delayReason, newData.delayReason)
        }

        // Manual Status Override (Spec allows "On Track", "Client Delay", etc)
        if (newData.status !== undefined && newData.status !== oldProject.status) {
            changes.status = newData.status
            logChange('status', oldProject.status, newData.status)
        }

        // Client Delay Logic (Values)
        if (newData.clientDelayDays !== undefined && newData.clientDelayDays !== oldProject.clientDelayDays) {
            changes.clientDelayDays = newData.clientDelayDays
            logChange('clientDelayDays', oldProject.clientDelayDays, newData.clientDelayDays)

            // DYNAMIC SCHEDULING TRIGGER
            // Formulas: T_Final = T_Original + D_System + D_Client
            const originalTarget = oldProject.originalTarget
            const systemDelay = oldProject.delayDays // Don't change system delay here
            const clientDelay = newData.clientDelayDays

            const totalDelay = systemDelay + clientDelay
            // Calculate new target base
            const newTargetTime = originalTarget.getTime() + (totalDelay * 24 * 60 * 60 * 1000)
            const newTargetDate = new Date(newTargetTime)

            changes.targetFinish = newTargetDate
            logChange('targetFinish (Auto-Shift)', oldProject.targetFinish.toISOString(), newTargetDate.toISOString())
        }

        // C. Stage Automation
        if (newData.stage && newData.stage !== oldProject.stage) {
            changes.stage = newData.stage
            logChange('stage', oldProject.stage, newData.stage)

            // Dynamic Stage Config Lookup
            const currentHouseType = changes.houseType || oldProject.houseType
            const stageConfig = await tx.stageConfig.findUnique({
                where: {
                    houseType_stageName: {
                        houseType: currentHouseType,
                        stageName: newData.stage
                    }
                }
            })

            if (stageConfig) {
                const newPercent = stageConfig.percent
                if (newPercent !== oldProject.percentComplete) {
                    changes.percentComplete = newPercent
                    logChange('percentComplete', oldProject.percentComplete, newPercent)
                }

                // Completion Rule: 100% AND actualFinish is null -> Set Now
                if (newPercent === 100 && !oldProject.actualFinish) {
                    changes.actualFinish = new Date()
                    logChange('actualFinish', 'null', changes.actualFinish.toISOString())
                }
            }
        }

        // D. Dates
        if (newData.startDate && newData.startDate.getTime() !== oldProject.startDate.getTime()) {
            changes.startDate = newData.startDate
            logChange('startDate', oldProject.startDate.toISOString(), newData.startDate.toISOString())
        }

        // Target Finish Update (Manual Override vs Logic)
        // If client delay triggered a change, we already set targetFinish logic above.
        // If Manual update calculates same date, fine.
        // But if Admin manually sets a date that CONTRADICTS logic?
        // Spec says: "If CEO updates D... T_final must update". 
        // Logic: Allow calculation to verify manual input? 
        // Rule: Calculation Wins. If CEO changes Date, we might need to reverse calc delay? 
        // For now, simplify: Date is result of delays. Don't let users edit Target Finish directly if logic active?
        // Allow strict logic. If newTarget set by logic, ignore manual input if different? 
        // Let's assume Form Logic dictates. We prioritize the calculated value if delay changed.

        if (newData.targetFinish && !changes.targetFinish) {
            // Only process manual date change if we didn't just auto-calculate it
            if (newData.targetFinish.getTime() !== oldProject.targetFinish.getTime()) {
                changes.targetFinish = newData.targetFinish
                logChange('targetFinish', oldProject.targetFinish.toISOString(), newData.targetFinish.toISOString())
            }
        }


        // Manual Actual Finish Override
        if (newData.actualFinish !== undefined) {
            const oldTime = oldProject.actualFinish?.getTime()
            const newTime = newData.actualFinish?.getTime()

            if (oldTime !== newTime) {
                changes.actualFinish = newData.actualFinish
                logChange('actualFinish', oldProject.actualFinish?.toISOString(), newData.actualFinish?.toISOString())
            }
        }

        // E. Assignment
        if (newData.assignedToId !== undefined && newData.assignedToId !== oldProject.assignedToId) {
            changes.assignedToId = newData.assignedToId
            logChange('assignedToId', oldProject.assignedToId, newData.assignedToId)
        }

        // F. Client Assignment
        if (newData.clientId !== undefined && newData.clientId !== oldProject.clientId) {
            changes.clientId = newData.clientId
            logChange('clientId', oldProject.clientId, newData.clientId)
        }

        // G. Additional Assignees (Direct Set)
        if (newData.additionalAssigneeIds !== undefined) {
            changes.additionalAssignees = { set: newData.additionalAssigneeIds.map(id => ({ id })) }
        }



        // E. Status Automation (Delay Calculation)
        // Default to "On Track". Logic evaluates Delay days vs Status overrides.

        const effectiveTarget = changes.targetFinish || oldProject.targetFinish
        const effectiveActual = changes.actualFinish || oldProject.actualFinish
        const effectivePercent = changes.percentComplete ?? oldProject.percentComplete

        const now = new Date()
        const compareDate = effectiveActual || now
        compareDate.setHours(12, 0, 0, 0)
        const targetDate = new Date(effectiveTarget)
        targetDate.setHours(12, 0, 0, 0)

        const diffMs = compareDate.getTime() - targetDate.getTime()
        const delayDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        // Automation Rule: 
        // If Percent 100 -> Completed (Overrides everything)
        // Else if Manual Status is "Client Delay", KEEP IT (Don't auto-reset to On Track).
        // Else if Delay > 0 -> "Past Target".
        // Else -> "On Track".

        // Logic:
        // 1. Determine "Auto Status"
        let autoStatus = 'On Track'
        if (effectivePercent === 100) autoStatus = 'Completed'
        else if (delayDays > 0) autoStatus = 'Past Target'

        // 2. Apply rules against Current Status
        const currentStatus = changes.status || oldProject.status

        // SLA Logic:
        // If the project is flagged as delayed via SLA rules, force status to 'Past Target' 
        // unless it is already 'Completed'. This ensures visibility of SLA breaches.

        if (oldProject.isDelayed || newData.isDelayed) {
            if (autoStatus !== 'Completed') {
                autoStatus = 'Past Target' // SLA Override
            }
        }

        if (changes.status) {
            // User manually changed it. Trust them. 
        } else {
            // No manual change. Run automation.
            if (autoStatus === 'Completed') {
                if (currentStatus !== 'Completed') {
                    changes.status = 'Completed'
                    logChange('status', currentStatus, 'Completed')
                }
            } else if (currentStatus !== 'Client Delay') {
                // Only touch if not Client Delay
                if (currentStatus !== autoStatus) {
                    changes.status = autoStatus
                    logChange('status', currentStatus, autoStatus)
                }
            }
        }

        if (Object.keys(changes).length > 0) {
            await tx.project.update({
                where: { id: projectId },
                data: changes
            })
        }

        if (historyEntries.length > 0) {
            await tx.projectHistory.createMany({
                data: historyEntries
            })
        }

        return { ...oldProject, ...changes }
    })
}

// Helper for Dashboard (Exported)
export function getPercentComplete(houseType: string, stage: string): number {
    return 0
}
