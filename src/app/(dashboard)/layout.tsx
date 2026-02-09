import { ErrorBoundary } from '@/components/ui/error-boundary';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    return (
        <div className="flex h-screen md:h-[100dvh] overflow-hidden bg-transparent">
            {/* Pass user role to Client Component Sidebar */}
            <ErrorBoundary fallback={<div className="w-64 bg-sidebar border-r" />}>
                <Sidebar
                    className="hidden md:flex"
                    userRole={user?.role}
                    userName={user?.name}
                    userEmail={user?.email}
                />
            </ErrorBoundary>
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto bg-muted/10 p-6 pb-20">
                    {children}
                </main>
            </div>
        </div>
    );
}

