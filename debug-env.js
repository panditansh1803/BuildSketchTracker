const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')
const fs = require('fs')

// 1. Load ONLY .env first
const envConfig = dotenv.config({ path: '.env' })
const envUrl = process.env.DATABASE_URL
console.log('--- .env Load Check ---')
if (envConfig.error) {
    console.log('Error loading .env:', envConfig.error.message)
} else {
    console.log('.env loaded successfully.')
}
console.log(`DATABASE_URL from .env: ${maskUrl(envUrl)}`)

// 2. Load .env.local on top
const localConfig = dotenv.config({ path: '.env.local', override: true })
const finalUrl = process.env.DATABASE_URL
// const finalUrl = envUrl // Just use the one from .env

console.log('\n--- .env.local Load Check ---')
if (localConfig.error) {
    console.log('Error loading .env.local:', localConfig.error.message)
} else {
    console.log('.env.local loaded successfully.')
}
console.log(`Final DATABASE_URL: ${maskUrl(finalUrl)}`)

function maskUrl(url) {
    if (!url) return 'UNDEFINED'
    if (typeof url !== 'string') return `TYPE_ERROR (${typeof url})`

    // Check start
    const protocol = url.split('://')[0]
    const rest = url.substring(url.indexOf('://') + 3)
    const start = url.substring(0, 15)

    return `[len:${url.length}] Starts with: "${start}..." (Protocol: ${protocol})`
}

const prisma = new PrismaClient()

async function main() {
    console.log('\n--- Prisma Connection Attempt ---')
    try {
        await prisma.$connect()
        console.log('✅ Success')
    } catch (e) {
        console.log('❌ Failed')
        console.log(e.message)
    } finally {
        await prisma.$disconnect()
    }
}

// main()
console.log('--- Skip Prisma Connection ---')

