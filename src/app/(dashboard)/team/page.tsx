import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTeamStats, getRecentActivity, getAllUsers } from '@/app/actions/team'
import { EmployeeCard } from '@/components/team/EmployeeCard'
import { ActivityFeed } from '@/components/team/ActivityFeed'
import { UserManagementPanel } from '@/components/team/UserManagementPanel'

import { UserWorkLog } from '@/components/admin/UserWorkLog'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
    const user = await getCurrentUser()

    // 1. Double Security Layer
    if (!user || user.role !== 'ADMIN') {
        redirect('/')
    }

    // 2. Data Fetching
    const [stats, activity, allUsers] = await Promise.all([
        getTeamStats(),
        getRecentActivity(),
        getAllUsers()
    ])

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Command Center
                </h1>
                <p className="text-muted-foreground">
                    Real-time performance tracking and activity monitoring.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Grid: Employees */}
                <div className="lg:col-span-3 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        Team Performance
                        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                            {stats.length} Active
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.map(employee => (
                            <EmployeeCard key={employee.id} stats={employee} />
                        ))}
                    </div>

                    <div className="pt-8">
                        <UserWorkLog />
                    </div>
                </div>

                {/* Sidebar: Feed & Management */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="space-y-4">
                        <UserManagementPanel initialUsers={allUsers} currentUserId={user.id} />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Live Pulse</h2>
                        <ActivityFeed activities={activity} />
                    </div>
                </div>
            </div>
        </div>
    )
}
