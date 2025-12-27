'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, ShieldAlert, ShieldCheck, User } from 'lucide-react'
import { promoteUser, demoteUser } from '@/app/actions/team'

interface User {
    id: string
    name: string
    email: string
    role: string
}

interface UserManagementPanelProps {
    initialUsers: User[]
    currentUserId: string
}

export function UserManagementPanel({ initialUsers, currentUserId }: UserManagementPanelProps) {
    const [users, setUsers] = useState(initialUsers)
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    const handlePromote = async (userId: string) => {
        setLoading(userId)
        try {
            await promoteUser(userId)
            setUsers(users.map(u => u.id === userId ? { ...u, role: 'ADMIN' } : u))
            router.refresh()
            alert('User promoted to Admin successfully.')
        } catch (error) {
            console.error(error)
            alert('Failed to promote user.')
        } finally {
            setLoading(null)
        }
    }

    const handleDemote = async (userId: string) => {
        if (!confirm('Are you sure you want to remove Admin privileges from this user?')) return

        setLoading(userId)
        try {
            await demoteUser(userId)
            setUsers(users.map(u => u.id === userId ? { ...u, role: 'PROJECT_OWNER' } : u))
            router.refresh()
            alert('User demoted successfully.')
        } catch (error) {
            console.error(error)
            alert('Failed to demote user.')
        } finally {
            setLoading(null)
        }
    }

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Shield className="h-5 w-5 text-primary" />
                    Access Control
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 mx-1 gap-4">
                            <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                                <div className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {user.role === 'ADMIN' ? <ShieldCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="font-medium text-foreground truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate block w-full">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                                    {user.role}
                                </Badge>

                                {user.id !== currentUserId && (
                                    <>
                                        {user.role === 'ADMIN' ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                onClick={() => handleDemote(user.id)}
                                                disabled={loading === user.id}
                                            >
                                                {loading === user.id ? '...' : <ShieldAlert className="h-4 w-4" />}
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                                onClick={() => handlePromote(user.id)}
                                                disabled={loading === user.id}
                                            >
                                                {loading === user.id ? '...' : <ShieldCheck className="h-4 w-4" />}
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
