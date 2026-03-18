import React from 'react';
import { Badge } from '@/src/core/presentation/components/ui/badge';
import { RequisitionStatus } from '../../domain/entities/requisition';

interface RequisitionBadgeProps {
    status: RequisitionStatus;
}

export const RequisitionBadge: React.FC<RequisitionBadgeProps> = ({ status }) => {
    let label = status.replace(/_/g, ' ');
    let variantClass = '';

    switch (status) {
        case RequisitionStatus.EN_REVISION_JEFE:
        case RequisitionStatus.EN_REVISION_SUPERINTENDENTE:
        case RequisitionStatus.EN_REVISION_GERENCIA:
            variantClass = 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';
            break;
        case RequisitionStatus.PO_ASIGNADO:
            variantClass = 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200';
            break;
        case RequisitionStatus.EN_TRANSITO:
            variantClass = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200';
            break;
        case RequisitionStatus.RECIBIDO_ALMACEN:
        case RequisitionStatus.ENTREGADO:
            variantClass = 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
            break;
        case RequisitionStatus.RECHAZADO:
            variantClass = 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200';
            break;
        default:
            variantClass = 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }

    return (
        <Badge variant="outline" className={`font-medium ${variantClass}`}>
            {label}
        </Badge>
    );
};
