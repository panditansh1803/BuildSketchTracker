'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function VerifyEnvPage() {
    const [status, setStatus] = useState<any>({ loading: true })

    useEffect(() => {
        const check = async () => {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

            const results: any = {
                timestamp: new Date().toISOString(),
                env: {
                    NEXT_PUBLIC_SUPABASE_URL: url ? `${url.substring(0, 10)}...` : 'MISSING',
                    NEXT_PUBLIC_SUPABASE_ANON_KEY: key ? 'PRESENT (Hidden)' : 'MISSING'
                }
            }

            if (!url || !key) {
                results.error = "Missing Environment Variables in Client Bundle"
            } else {
                try {
                    const supabase = createClient()
                    const { data, error } = await supabase.auth.getSession()
                    if (error) throw error
                    results.connection = "Success"
                    results.session = data.session ? "Active Session Found" : "No Active Session"
                } catch (e: any) {
                    results.connection = "Failed"
                    results.error = e.message || e.toString()
                }
            }
            setStatus(results)
        }
        check()
    }, [])

    return (
        <div className="p-8 font-mono text-sm max-w-2xl mx-auto min-h-screen bg-black text-white">
            <h1 className="text-xl font-bold mb-4 text-green-400">Environment Verification</h1>
            <div className="p-4 border border-zinc-800 rounded mb-6">
                <pre className="whitespace-pre-wrap text-zinc-300">
                    {JSON.stringify(status, null, 2)}
                </pre>
            </div>

            <div className="space-y-2 text-zinc-400">
                <p>
                    <strong className="text-white">Diagnosis Guide:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>
                        If <span className="text-red-400">MISSING</span>: Your <code>.env.local</code> file is not being loaded by the client.
                        Ensure variables start with <code>NEXT_PUBLIC_</code> and you have restarted the dev server.
                    </li>
                    <li>
                        If <span className="text-red-400">Failed</span> to fetch: Check if your Supabase Project is paused or if the URL is missing <code>https://</code>.
                    </li>
                </ul>
            </div>
        </div>
    )
}
