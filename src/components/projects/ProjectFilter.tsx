'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'

export function ProjectFilter() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleFilter = (status: string) => {
        const params = new URLSearchParams(searchParams)
        if (status && status !== 'ALL') {
            params.set('status', status)
        } else {
            params.delete('status')
        }
        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <Select
            defaultValue={searchParams.get('status') || 'ALL'}
            onValueChange={handleFilter}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DELAYED">Delayed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
        </Select>
    )
}
