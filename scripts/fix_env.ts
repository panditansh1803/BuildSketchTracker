import fs from 'fs'

const content = `DATABASE_URL="postgresql://postgres.rvmotuudiikorokdbloa:rCh4Y8oOPE2IvN3f@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.rvmotuudiikorokdbloa:rCh4Y8oOPE2IvN3f@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
`

fs.writeFileSync('.env', content, { encoding: 'utf-8' })
console.log('.env fixed')
