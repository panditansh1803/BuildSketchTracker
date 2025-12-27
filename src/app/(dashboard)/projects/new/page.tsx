'use client'

import { createProject } from '@/app/actions/projectActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Creating...' : 'Create Project'}
        </Button>
    )
}

export default function NewProjectPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Project</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createProject} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="projectId">Project ID</Label>
                            <Input id="projectId" name="projectId" placeholder="e.g. PROJ-001" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Smith Residence" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="houseType">House Type</Label>
                            <Select name="houseType" required defaultValue="Single">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Single">Single Stage</SelectItem>
                                    <SelectItem value="Double">Double Stage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetFinish">Target Finish Date</Label>
                            <Input id="targetFinish" name="targetFinish" type="date" required />
                        </div>

                        <div className="pt-4">
                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
