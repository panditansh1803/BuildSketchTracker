'use server'

import prisma from '@/lib/prisma'

// Spec Stage Configuration (Strict Percentages)
// Spec Stage Configuration (Strict Percentages)
const STAGES = {
    Single: [
        { name: 'Project Setup', percent: 10 },
        { name: 'Architectural', percent: 20 },
        { name: 'Frames', percent: 40 },
        { name: 'Trusses', percent: 55 },
        { name: 'Steel', percent: 70 },
        { name: 'Client Check', percent: 80 },
        { name: 'Engineer Review', percent: 90 },
        { name: 'Finalisation', percent: 100 }
    ],
    Double: [
        { name: 'Project Setup', percent: 10 },
        { name: 'Architectural', percent: 20 },
        { name: 'Lower Frames', percent: 30 },
        { name: 'Floor Trusses', percent: 45 },
        { name: 'Lower Steel', percent: 55 },
        { name: 'Upper Frames', percent: 65 },
        { name: 'Roof Trusses', percent: 75 },
        { name: 'Client Check', percent: 85 },
        { name: 'Engineer Review', percent: 95 },
        { name: 'Finalisation', percent: 100 }
    ]
}

export async function seedStages() {
    console.log('Seeding stages (V2 Spec)...')

    // 1. Single
    for (const stage of STAGES.Single) {
        await prisma.stageConfig.upsert({
            where: {
                houseType_stageName: {
                    houseType: 'Single',
                    stageName: stage.name
                }
            },
            update: { percent: stage.percent },
            create: {
                houseType: 'Single',
                stageName: stage.name,
                percent: stage.percent
            }
        })
    }

    // 2. Double
    for (const stage of STAGES.Double) {
        await prisma.stageConfig.upsert({
            where: {
                houseType_stageName: {
                    houseType: 'Double',
                    stageName: stage.name
                }
            },
            update: { percent: stage.percent },
            create: {
                houseType: 'Double',
                stageName: stage.name,
                percent: stage.percent
            }
        })
    }

    // Ensure Admin User (Compatible with Supabase Auth placeholder)
    await prisma.user.upsert({
        where: { email: 'admin@buildsketch.com' },
        update: {},
        create: {
            email: 'admin@buildsketch.com',
            name: 'Admin User',
            role: 'ADMIN',
        },
    })

    console.log('Seeding complete.')
}
