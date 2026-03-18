import { Requisition, RequisitionStatus } from '../../domain/entities/requisition';
import { RequisitionFilters, RequisitionMetrics, RequisitionRepository } from '../../domain/repositories/requisition.repository';

export class RequisitionUseCases {
    constructor(private repository: RequisitionRepository) { }

    async getDashboardMetrics(): Promise<RequisitionMetrics> {
        return this.repository.getMetrics();
    }

    async getRequisitionsList(filters?: RequisitionFilters): Promise<Requisition[]> {
        return this.repository.getRequisitions(filters);
    }

    async getRequisitionDetail(id: string): Promise<Requisition | null> {
        return this.repository.getRequisitionById(id);
    }

    async createRequisition(requisition: Omit<Requisition, 'id' | 'folio' | 'fechaCreacion' | 'estado' | 'timeline' | 'totalPartidas' | 'totalEstimado'>): Promise<Requisition> {
        return this.repository.createRequisition(requisition);
    }

    async updateRequisitionStatus(id: string, status: RequisitionStatus, userId: string, userName: string, comment?: string, metadata?: any): Promise<Requisition> {
        return this.repository.updateRequisitionStatus(id, status, userId, userName, comment, metadata);
    }
}
