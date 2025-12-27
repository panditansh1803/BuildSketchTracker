import fs from 'fs'

// Add sslmode=no-verify and connect_timeout=60
const suffix = "?sslmode=no-verify&connect_timeout=60"

// Base strings (WITHOUT query params initially to avoid duplication if I appended simple strings)
// Re-constructing from known values
const pass = "rCh4Y8oOPE2IvN3f"
const host = "aws-1-ap-southeast-1.pooler.supabase.com"
const db = "postgres"

const sessionUrl = `postgresql://postgres.rvmotuudiikorokdbloa:${pass}@${host}:5432/${db}${suffix}`
// Transaction url needs pgbouncer=true too
const transactionUrl = `postgresql://postgres.rvmotuudiikorokdbloa:${pass}@${host}:6543/${db}${suffix}&pgbouncer=true`

const content = `DATABASE_URL="${transactionUrl}"
DIRECT_URL="${sessionUrl}"
`

fs.writeFileSync('.env', content, { encoding: 'utf-8' })
console.log('.env updated with sslmode=no-verify')
