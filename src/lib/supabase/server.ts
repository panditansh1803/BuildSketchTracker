import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    // Note: In Next.js Server Components, we cannot set cookies directly.
                    // This method is mainly for Server Actions/Route Handlers.
                    // We wrap in try/catch to avoid errors in Server Components.
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // Check if we are in a context where we can set cookies
                    }
                },
                remove(name: string, options: any) {
                    try {
                        cookieStore.set({ name, value: "", ...options })
                    } catch (error) {
                        // check context
                    }
                },
            },
        }
    )
}
