'use client'

import { Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from '@/components/layout/Sidebar'
import { TimeTracker } from '@/components/time-tracking/TimeTracker'

export function Topbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
                <div className="hidden md:block">
                    {/* Add TimeTracker here for desktop, or maybe in the right action bar */}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <TimeTracker />
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600" />
                </Button>
            </div>
        </header>
    )
}
