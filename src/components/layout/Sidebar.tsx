'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    FolderOpen,
    Map,
    Users,
    Settings,
    CalendarClock,
    KanbanSquare,
    LogOut,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Timeline', href: '/timeline', icon: CalendarClock },
    { name: 'Workflow', href: '/kanban', icon: KanbanSquare },
    { name: 'Project Map', href: '/map', icon: Map },
    { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
    className?: string
    userRole?: string
    userName?: string
    userEmail?: string
}

export function Sidebar({ className, userRole, userName, userEmail }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    // RBAC: Filter items or add Team items
    let visibleItems = [...navItems]

    // Security: Filter items for GUEST
    if (userRole === 'GUEST') {
        visibleItems = visibleItems.filter(item => item.name === 'Dashboard')
    } else if (userRole === 'ADMIN') {
        // Insert Team link after Dashboard
        visibleItems.splice(1, 0, { name: 'Team', href: '/team', icon: Users })
    }

    return (
        <div className={cn("flex h-full w-64 flex-col border-r bg-sidebar backdrop-blur-md text-sidebar-foreground", className)}>
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-3 font-bold text-xl overflow-hidden">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-white/10 shadow-sm">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <span className="text-primary">Build</span>Sketch
                    </div>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {visibleItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="border-t p-4 space-y-2">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                            {userRole === 'ADMIN' ? 'AD' : 'US'}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-foreground">
                            {userName || (userRole === 'ADMIN' ? 'Administrator' : 'User')}
                        </span>
                        <span className="text-xs">
                            {userEmail || (userRole === 'ADMIN' ? 'admin@buildsketch.com' : 'Staff Member')}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
