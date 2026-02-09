export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const requiredEnvVars = [
            'DATABASE_URL',
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            // 'AWS_ACCESS_KEY_ID', // Optional if using Supabase Storage only
            // 'AWS_SECRET_ACCESS_KEY',
            // 'AWS_REGION',
            // 'AWS_BUCKET_NAME',
        ];

        const missing = requiredEnvVars.filter((key) => !process.env[key]);

        if (missing.length > 0) {
            console.error(
                '❌ Critical Error: Missing environment variables:\n' +
                missing.map((key) => `   - ${key}`).join('\n')
            );
            // In production, we might want to exit. In dev, just warn.
            if (process.env.NODE_ENV === 'production') {
                throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
            }
        } else {
            console.log('✅ Environment variables validated.');
        }
    }
}
