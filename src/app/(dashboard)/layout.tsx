import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { getCurrentUser } from '@/lib/auth';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
            {/* Pass user role to Client Component Sidebar */}
            <Sidebar
                className="hidden md:flex"
                userRole={user?.role}
                userName={user?.name}
                userEmail={user?.email}
            />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
