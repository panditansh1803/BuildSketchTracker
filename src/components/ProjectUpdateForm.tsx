'use client'

import { updateProject } from '@/app/actions/projectActions'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

import { STAGE_LISTS } from '@/lib/brain'

export function ProjectUpdateForm({
    projectId,
    currentStage,
    houseType
}: {
    projectId: string
    currentStage: string
    houseType: string
}) {
    const [loading, setLoading] = useState(false)

    const stages = STAGE_LISTS[houseType as keyof typeof STAGE_LISTS] || STAGE_LISTS.Single

    async function handleStageChange(value: string) {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('stage', value)
            await updateProject(projectId, formData)
        } catch (error) {
            console.error('Failed to update stage', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Update Stage</label>
            <Select defaultValue={currentStage} onValueChange={handleStageChange} disabled={loading}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {stages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                            {stage}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
