import fs from 'fs'

// IP form of aws-1-ap-southeast-1.pooler.supabase.com
const ip = "3.1.167.181"
const pass = "rCh4Y8oOPE2IvN3f"
// Using port 5432 for session mode which is more stable for push
// Added sslmode=no-verify to allow IP usage
const url = `postgresql://postgres.rvmotuudiikorokdbloa:${pass}@${ip}:5432/postgres?sslmode=no-verify`

const content = `DATABASE_URL="${url}"
DIRECT_URL="${url}"
`

fs.writeFileSync('.env', content, { encoding: 'utf-8' })
console.log('.env set to IP Mode')
