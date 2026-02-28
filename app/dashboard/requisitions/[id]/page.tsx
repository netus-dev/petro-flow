import { RequisitionDetail } from '@/src/features/requisitions/presentation/components/requisition-detail';
import { RequisitionRepositoryImpl } from '@/src/features/requisitions/infrastructure/repositories/requisition.repository.impl';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const repository = new RequisitionRepositoryImpl();

export default function RequisitionDetailPage({ params }: { params: { id: string } }) {
    // Para la demo asumimos un gerente
    const currentUser = { id: 'mgr-01', name: 'Carlos Ruiz', role: 'Gerente' };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 max-w-[1600px] mx-auto">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/dashboard/requisitions/list" className="text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Requisición</h2>
            </div>

            <RequisitionDetail repository={repository} requisitionId={params.id} currentUser={currentUser} />
        </div>
    );
}
