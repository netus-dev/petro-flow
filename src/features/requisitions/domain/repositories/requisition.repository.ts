import { Requisition, RequisitionStatus } from '../entities/requisition';

export interface RequisitionFilters {
    status?: RequisitionStatus[];
    hasPo?: boolean;
    solicitanteId?: string;
    rig?: string;
    search?: string; // para buscar por PO, folio o descripción
}

export interface RequisitionMetrics {
    creadasSemana: number;
    enRevision: number;
    esperaPo: number;
    enTransito: number;
    rechazadas: number;
    tiempoPromedioDias: number;
    porRig: { [rig: string]: number };
}

export interface RequisitionRepository {
    getRequisitions(filters?: RequisitionFilters): Promise<Requisition[]>;
    getRequisitionById(id: string): Promise<Requisition | null>;
    createRequisition(requisition: Omit<Requisition, 'id' | 'folio' | 'fechaCreacion' | 'estado' | 'timeline' | 'totalPartidas' | 'totalEstimado'>): Promise<Requisition>;
    updateRequisitionStatus(id: string, newStatus: RequisitionStatus, userId: string, userName: string, comment?: string, metadata?: any): Promise<Requisition>;
    getMetrics(): Promise<RequisitionMetrics>;
}
