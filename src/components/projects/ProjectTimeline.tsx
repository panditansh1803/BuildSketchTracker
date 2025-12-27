import { CheckCircle2, Circle, CircleDot } from 'lucide-react'
import { cn } from '@/lib/utils'

type Stage = {
    name: string
    percent: number
    status: 'completed' | 'current' | 'upcoming'
}

import { STAGE_LISTS } from '@/lib/brain'

export function ProjectTimeline({ currentStage, houseType }: { currentStage: string, houseType: string }) {
    const stagesList = STAGE_LISTS[houseType as keyof typeof STAGE_LISTS] || STAGE_LISTS.Single

    let foundCurrent = false
    const stages: Stage[] = stagesList.map(name => {
        if (name === currentStage) {
            foundCurrent = true
            return { name, percent: 0, status: 'current' }
        }
        return { name, percent: 0, status: foundCurrent ? 'upcoming' : 'completed' }
    })

    return (
        <div className="space-y-6">
            <h3 className="font-semibold text-lg">Progress Timeline</h3>
            <div className="relative space-y-0">
                {stages.map((stage, index) => (
                    <div key={stage.name} className="flex gap-4 pb-8 last:pb-0 relative">
                        {/* Vertical Line */}
                        {index !== stages.length - 1 && (
                            <div className={cn(
                                "absolute left-2.5 top-6 bottom-0 w-0.5",
                                stage.status === 'completed' ? "bg-primary" : "bg-muted"
                            )} />
                        )}

                        <div className="relative z-10">
                            {stage.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                            {stage.status === 'current' && <CircleDot className="h-5 w-5 text-primary fill-primary/20" />}
                            {stage.status === 'upcoming' && <Circle className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div className="pt-0.5">
                            <p className={cn(
                                "text-sm font-medium leading-none",
                                stage.status === 'current' ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {stage.name}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
