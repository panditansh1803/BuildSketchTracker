import dotenv from 'dotenv'
import fs from 'fs'
import net from 'net'
import { URL } from 'url'

// Load .env
const envConfig = dotenv.parse(fs.readFileSync('.env'))
const dbUrl = envConfig.DATABASE_URL
const directUrl = envConfig.DIRECT_URL

async function log(msg: string) {
    console.log(msg)
    fs.appendFileSync('debug_log.txt', msg + '\n')
}

async function checkConnection(connectionString: string, label: string) {
    if (!connectionString) {
        await log(`[${label}] No connection string found.`)
        return
    }

    try {
        const url = new URL(connectionString)
        const host = url.hostname
        const port = parseInt(url.port || '5432')

        await log(`[${label}] Checking ${host}:${port}...`)

        return new Promise<void>((resolve) => {
            const socket = new net.Socket()
            const timer = setTimeout(() => {
                log(`[${label}] ❌ Timeout connecting to ${host}:${port}`)
                socket.destroy()
                resolve()
            }, 5000)

            socket.connect(port, host, () => {
                log(`[${label}] ✅ Successfully connected to ${host}:${port}`)
                clearTimeout(timer)
                socket.destroy()
                resolve()
            })

            socket.on('error', (err) => {
                log(`[${label}] ❌ Error connecting to ${host}:${port}: ${err.message}`)
                clearTimeout(timer)
                resolve()
            })
        })

    } catch (e) {
        await log(`[${label}] Invalid URL structure`)
    }
}

async function run() {
    fs.writeFileSync('debug_log.txt', 'Starting Debug\n')
    await checkConnection(dbUrl, 'DATABASE_URL')
    await checkConnection(directUrl, 'DIRECT_URL')
}

run()
