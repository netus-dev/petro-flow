import { Requisition, RequisitionStatus } from '../../domain/entities/requisition';
import { RequisitionFilters, RequisitionMetrics, RequisitionRepository } from '../../domain/repositories/requisition.repository';
import { mockRequisitions } from '../datasources/requisition.mock.datasource';

export class RequisitionRepositoryImpl implements RequisitionRepository {
    private data: Requisition[] = [...mockRequisitions];

    async getRequisitions(filters?: RequisitionFilters): Promise<Requisition[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let filtered = [...this.data];

        if (filters) {
            if (filters.status && filters.status.length > 0) {
                filtered = filtered.filter(req => filters.status!.includes(req.estado));
            }
            if (filters.hasPo !== undefined) {
                filtered = filtered.filter(req => filters.hasPo ? !!req.poNumber : !req.poNumber);
            }
            if (filters.solicitanteId) {
                filtered = filtered.filter(req => req.solicitanteId === filters.solicitanteId);
            }
            if (filters.rig) {
                filtered = filtered.filter(req => req.rig === filters.rig);
            }
            if (filters.search) {
                const term = filters.search.toLowerCase();
                filtered = filtered.filter(req =>
                    req.folio.toLowerCase().includes(term) ||
                    (req.poNumber && req.poNumber.toLowerCase().includes(term)) ||
                    req.justificacion.toLowerCase().includes(term)
                );
            }
        }

        // Ordenar de más reciente a más antigua
        return filtered.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
    }

    async getRequisitionById(id: string): Promise<Requisition | null> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.data.find(r => r.id === id) || null;
    }

    async createRequisition(requisitionParams: Omit<Requisition, 'id' | 'folio' | 'fechaCreacion' | 'estado' | 'timeline' | 'totalPartidas' | 'totalEstimado'>): Promise<Requisition> {
        await new Promise(resolve => setTimeout(resolve, 800));

        const totalPartidas = requisitionParams.items.length;
        const totalEstimado = requisitionParams.items.reduce((sum, item) => sum + (item.totalEstimado || 0), 0);

        const newReq: Requisition = {
            ...requisitionParams,
            id: Math.random().toString(36).substr(2, 9),
            folio: `REQ-${new Date().getFullYear()}-${String(this.data.length + 1).padStart(4, '0')}`,
            fechaCreacion: new Date().toISOString(),
            estado: RequisitionStatus.EN_REVISION_JEFE,
            totalPartidas,
            totalEstimado,
            timeline: [
                {
                    id: Math.random().toString(36).substr(2, 9),
                    status: RequisitionStatus.EN_REVISION_JEFE,
                    date: new Date().toISOString(),
                    userId: requisitionParams.solicitanteId,
                    userName: requisitionParams.solicitanteName,
                    comment: 'Requisición creada.'
                }
            ]
        };

        this.data.unshift(newReq);
        return newReq;
    }

    async updateRequisitionStatus(id: string, newStatus: RequisitionStatus, userId: string, userName: string, comment?: string, metadata?: any): Promise<Requisition> {
        await new Promise(resolve => setTimeout(resolve, 600));

        const idx = this.data.findIndex(r => r.id === id);
        if (idx === -1) throw new Error('Requisition not found');

        const req = this.data[idx];
        req.estado = newStatus;

        if (metadata?.poNumber) {
            req.poNumber = metadata.poNumber;
        }

        req.timeline.push({
            id: Math.random().toString(36).substr(2, 9),
            status: newStatus,
            date: new Date().toISOString(),
            userId,
            userName,
            comment
        });

        return req;
    }

    async getMetrics(): Promise<RequisitionMetrics> {
        await new Promise(resolve => setTimeout(resolve, 400));

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        let enRevision = 0;
        let esperaPo = 0;
        let enTransito = 0;
        let rechazadas = 0;
        let creadasSemana = 0;

        let sumaDiasAutorizacion = 0;
        let countAutorizadas = 0;

        const porRig: { [rig: string]: number } = {};

        this.data.forEach(req => {
            // Counters
            if (req.estado === RequisitionStatus.EN_REVISION_JEFE ||
                req.estado === RequisitionStatus.EN_REVISION_SUPERINTENDENTE ||
                req.estado === RequisitionStatus.EN_REVISION_GERENCIA) {
                enRevision++;
            } else if (req.estado === RequisitionStatus.PO_ASIGNADO) {
                esperaPo++;
            } else if (req.estado === RequisitionStatus.EN_TRANSITO) {
                enTransito++;
            } else if (req.estado === RequisitionStatus.RECHAZADO) {
                rechazadas++;
            }

            if (new Date(req.fechaCreacion) > oneWeekAgo) {
                creadasSemana++;
            }

            porRig[req.rig] = (porRig[req.rig] || 0) + 1;

            // Calcular tiempo de autorización si ya pasó de la fase de revisión
            if (req.estado === RequisitionStatus.PO_ASIGNADO || req.estado === RequisitionStatus.EN_TRANSITO || req.estado === RequisitionStatus.RECIBIDO_ALMACEN || req.estado === RequisitionStatus.ENTREGADO) {
                const poAsignadoEvent = req.timeline.find(t => t.status === RequisitionStatus.PO_ASIGNADO);
                if (poAsignadoEvent) {
                    const diffMs = new Date(poAsignadoEvent.date).getTime() - new Date(req.fechaCreacion).getTime();
                    sumaDiasAutorizacion += diffMs / (1000 * 60 * 60 * 24);
                    countAutorizadas++;
                }
            }
        });

        const tiempoPromedioDias = countAutorizadas > 0 ? (sumaDiasAutorizacion / countAutorizadas) : 0;

        return {
            creadasSemana,
            enRevision,
            esperaPo,
            enTransito,
            rechazadas,
            tiempoPromedioDias: Number(tiempoPromedioDias.toFixed(1)),
            porRig
        };
    }
}
