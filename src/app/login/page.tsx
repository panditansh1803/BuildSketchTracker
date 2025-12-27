'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import AnoAI from '@/components/ui/animated-shader-background'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            setError(error.message)
            setLoading(false)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            })

            if (error) throw error

            setSuccess('Check your email for the confirmation link!')
            setLoading(false)
        } catch (error: any) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black font-sans selection:bg-white/20">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                <AnoAI />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl animate-[float_6s_ease-in-out_infinite]">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 shadow-lg">
                            <Image 
                                src="/logo.png" 
                                alt="BuildSketch Logo" 
                                fill 
                                className="object-cover"
                                priority
                            />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-white mb-2">BuildSketch Tracker</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Project Management for Modern Builders
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Tabs defaultValue="signin" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 mb-6">
                                <TabsTrigger value="signin" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400">
                                    Sign In
                                </TabsTrigger>
                                <TabsTrigger value="signup" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400">
                                    Sign Up
                                </TabsTrigger>
                            </TabsList>

                            {/* SIGN IN TAB */}
                            <TabsContent value="signin">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email-signin" className="text-zinc-300">Email</Label>
                                        <Input
                                            id="email-signin"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 focus:ring-0 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password-signin" className="text-zinc-300">Password</Label>
                                        <Input
                                            id="password-signin"
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 focus:ring-0 transition-all"
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full mt-2 bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold"
                                    >
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {loading ? 'Signing In...' : 'Sign In'}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* SIGN UP TAB */}
                            <TabsContent value="signup">
                                <form onSubmit={handleSignUp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email-signup" className="text-zinc-300">Email</Label>
                                        <Input
                                            id="email-signup"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 focus:ring-0 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password-signup" className="text-zinc-300">Password</Label>
                                        <Input
                                            id="password-signup"
                                            type="password"
                                            placeholder="Choose a strong password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 focus:ring-0 transition-all"
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-200 text-sm animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {success && (
                                        <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-200 text-sm animate-in fade-in slide-in-from-top-1">
                                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                                            <span>{success}</span>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full mt-2 bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold"
                                    >
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="justify-center pt-0 pb-6">
                        <p className="text-xs text-zinc-500">
                            Secured by Supabase & Next.js
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
