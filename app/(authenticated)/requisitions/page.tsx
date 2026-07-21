import { RequisitionsDashboard } from '@/src/features/requisitions/presentation/components/requisitions-dashboard';
import Link from 'next/link';

export default function RequisitionsDashboardPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard de Requisiciones</h2>
                <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
                    <Link href="/dashboard/requisitions" className="px-3 py-1 bg-background shadow-sm rounded-md text-sm font-medium">Dashboard</Link>
                    <Link href="/dashboard/requisitions/list" className="px-3 py-1 text-muted-foreground hover:text-foreground text-sm font-medium">Listado</Link>
                </div>
            </div>
            <RequisitionsDashboard />
        </div>
    );
}
