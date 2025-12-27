"use client"

import AnoAI from "./animated-shader-background"

export default function GlobalBackground() {
    return (
        <div className="fixed inset-0 -z-50 h-full w-full bg-black">
            <AnoAI />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" /> {/* User theme adjustment: Subtle overlay */}
        </div>
    )
}
