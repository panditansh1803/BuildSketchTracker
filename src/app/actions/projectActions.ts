'use server'

import 'server-only'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { updateProjectBrain } from '@/lib/brain'
import { ProjectUpdateSchema } from '@/lib/constants'
import { Prisma } from '@prisma/client'
import { deleteFile } from '@/lib/storage'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

// Schema for Create Project
const CreateProjectSchema = z.object({
    projectId: z.string().min(1),
    name: z.string().min(1),
    houseType: z.enum(['Single', 'Double']),
    targetFinish: z.coerce.date(),
    // We can add other fields if form expands
})

export async function createProject(formData: FormData) {
    // 1. Auth Check (STRICT CEO ONLY)
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Only Admin/CEO can create projects.')
    }

    const rawData = {
        projectId: formData.get('projectId'),
        name: formData.get('name'),
        houseType: formData.get('houseType'),
        targetFinish: formData.get('targetFinish'),
    }

    const val = CreateProjectSchema.safeParse(rawData)
    if (!val.success) {
        throw new Error('Invalid form data: ' + val.error.toString())
    }
    const { projectId, name, houseType, targetFinish } = val.data

    // Default to first stage
    const initialStage = 'Project Setup'
    const stageConfig = await prisma.stageConfig.findUnique({
        where: { houseType_stageName: { houseType, stageName: initialStage } }
    })
    const percentComplete = stageConfig?.percent ?? 0

    const project = await prisma.project.create({
        data: {
            projectId,
            name,
            houseType,
            stage: initialStage,
            percentComplete,
            targetFinish,
            originalTarget: targetFinish, // SLA Baseline
            startDate: new Date(),
            createdById: user.id, // Use actual user ID
            status: 'On Track'
        }
    })

    revalidatePath('/dashboard')
    revalidatePath('/projects')
    redirect(`/projects/${project.id}`)
}

export async function updateProject(projectId: string, formData: FormData) {
    // 0. Auth & Role Check
    const user = await getCurrentUser()
    if (!user) throw new Error('User not found')

    // 1. Extract & Zod Parse
    const rawData: Record<string, any> = {}

    // Keys that everyone MIGHT be able to send (but stripped later if unauthorized)
    const keys = ['stage', 'status', 'address', 'latitude', 'longitude', 'houseType', 'assignedToId', 'clientId', 'targetFinish', 'actualFinish', 'notes', 'delayReason', 'clientName', 'clientRequirements', 'clientDelayDays']
    keys.forEach(k => {
        const v = formData.get(k)
        if (v !== null) {
            if (v === 'unassigned' || v === '') {
                rawData[k] = null
            } else {
                rawData[k] = v
            }
        }
    })

    // Arrays
    const additionalAssignees = formData.getAll('additionalAssignees')
    if (additionalAssignees.length > 0) {
        const cleanAssignees = additionalAssignees.map(v => v.toString()).filter(v => v !== '')
        if (cleanAssignees.length > 0) {
            rawData.additionalAssigneeIds = cleanAssignees
        }
    }

    // Coerce clientDelayDays (Handling "0" explicitly)
    if (rawData.clientDelayDays !== null && rawData.clientDelayDays !== undefined) {
        rawData.clientDelayDays = parseInt(rawData.clientDelayDays)
    }


    // 2. STRICT SECURITY FILTER (RBAC)
    // If NOT Admin, remove restricted fields from the payload.
    // They cannot update assignment, dates (Target), client details.
    if (user.role !== 'ADMIN') {
        const RESTRICTED_FIELDS = [
            'assignedToId',
            'clientId',
            'clientName',
            'clientRequirements',
            'clientDelayDays',
            'targetFinish', // Calculated field, never manual for employees
            'projectId',    // ID is immutable usually anyway
            'name',         // Project Name
            'additionalAssigneeIds'
        ]

        RESTRICTED_FIELDS.forEach(field => {
            if (rawData[field] !== undefined) {
                console.warn(`[Security] Unauthorized edit attempt by ${user.name} on field: ${field}`)
                delete rawData[field]
            }
        })
    }

    const val = ProjectUpdateSchema.safeParse(rawData)

    if (!val.success) {
        console.error("Validation Failed", val.error)
        throw new Error("Validation Failed")
    }

    // 3. Call Brain
    await updateProjectBrain(projectId, val.data, user.id, user.name)

    revalidatePath(`/projects/${projectId}`)
    revalidatePath('/dashboard')
    revalidatePath('/projects')
}

export async function deleteProject(projectId: string) {
    console.log(`[DELETE] Attempting to delete: ${projectId}`)

    // 1. Auth Check (STRICT CEO ONLY)
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Only Admin/CEO can delete projects.')
    }

    // Fetch file URLs BEFORE deleting from DB
    const docs = await prisma.document.findMany({ where: { projectId }, select: { url: true } })
    const photos = await prisma.sitePhoto.findMany({ where: { projectId }, select: { url: true } })

    await prisma.$transaction(async (tx) => {
        await tx.projectHistory.deleteMany({ where: { projectId } })
        await tx.document.deleteMany({ where: { projectId } })
        await tx.sitePhoto.deleteMany({ where: { projectId } })
        await tx.project.delete({ where: { id: projectId } })
    })

    // Delete files from Supabase storage AFTER successful DB transaction
    const fileUrls = [...docs.map(d => d.url), ...photos.map(p => p.url)]
    await Promise.allSettled(fileUrls.map(url => deleteFile(url)))

    revalidatePath('/dashboard')
    revalidatePath('/projects')
}

