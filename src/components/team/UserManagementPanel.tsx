'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, ShieldAlert, ShieldCheck, User } from 'lucide-react'
import { promoteUser, demoteUser, removeUser } from '@/app/actions/team'
import { Trash2 } from 'lucide-react'

interface User {
    id: string
    name: string
    email: string
    role: string
}

interface UserManagementPanelProps {
    initialUsers: User[]
    currentUser: {
        id: string
        email: string
        role: string
    }
}

const MAIN_ADMIN_EMAIL = 'admin@buildsketch.com'

export function UserManagementPanel({ initialUsers, currentUser }: UserManagementPanelProps) {
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

    const handleRemove = async (userId: string) => {
        if (!confirm('Are you sure you want to PERMANENTLY remove this user? This action cannot be undone.')) return

        setLoading(userId)
        try {
            const res = await removeUser(userId)
            if (res?.error) {
                alert(res.error)
            } else {
                setUsers(users.filter(u => u.id !== userId))
                router.refresh()
                alert('User removed successfully.')
            }
        } catch (error: any) {
            console.error(error)
            alert(error.message || 'Failed to remove user.')
        } finally {
            setLoading(null)
        }
    }

    // RBAC Helper
    const canRemove = (targetUser: User) => {
        const mainAdmin = MAIN_ADMIN_EMAIL.toLowerCase()
        const currentEmail = currentUser.email.toLowerCase()
        const targetEmail = targetUser.email.toLowerCase()

        if (currentEmail === mainAdmin) return true
        if (currentUser.role !== 'ADMIN') return false

        // Regular Admin cannot remove Main Admin or other Admins
        if (targetEmail === mainAdmin) return false
        if (targetUser.role === 'ADMIN') return false

        return true
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

                                {user.id !== currentUser.id && (
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


                                        {canRemove(user) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemove(user.id)}
                                                disabled={loading === user.id}
                                                title="Remove User"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {/* Client Toggle */}
                                        {user.role !== 'ADMIN' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={user.role === 'CLIENT'
                                                    ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                                    : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
                                                }
                                                onClick={async () => {
                                                    setLoading(user.id)
                                                    try {
                                                        const { toggleClientRole } = await import('@/app/actions/team')
                                                        const res = await toggleClientRole(user.id)
                                                        setUsers(users.map(u => u.id === user.id ? { ...u, role: res.newRole } : u))
                                                        router.refresh()
                                                    } catch (e) {
                                                        alert('Failed to update role')
                                                    } finally {
                                                        setLoading(null)
                                                    }
                                                }}
                                                disabled={loading === user.id}
                                                title={user.role === 'CLIENT' ? "Make Employee" : "Make Client"}
                                            >
                                                {user.role === 'CLIENT' ? <User className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
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
