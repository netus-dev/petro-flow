import { NewRequisitionForm } from '@/src/features/requisitions/presentation/components/new-requisition-form';
import { RequisitionRepositoryImpl } from '@/src/features/requisitions/infrastructure/repositories/requisition.repository.impl';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const repository = new RequisitionRepositoryImpl();

export default function NewRequisitionPage() {
    const currentUser = { id: 'usr-01', name: 'Juan Pérez' };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/dashboard/requisitions/list" className="text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Nueva Requisición</h2>
            </div>

            <NewRequisitionForm repository={repository} currentUser={currentUser} />
        </div>
    );
}
