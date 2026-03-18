export enum RequisitionStatus {
    EN_REVISION_JEFE = 'EN_REVISION_JEFE',
    EN_REVISION_SUPERINTENDENTE = 'EN_REVISION_SUPERINTENDENTE',
    EN_REVISION_GERENCIA = 'EN_REVISION_GERENCIA',
    PO_ASIGNADO = 'PO_ASIGNADO',
    EN_TRANSITO = 'EN_TRANSITO',
    RECIBIDO_ALMACEN = 'RECIBIDO_ALMACEN',
    ENTREGADO = 'ENTREGADO',
    RECHAZADO = 'RECHAZADO'
}

export enum RequisitionPriority {
    NORMAL = 'Normal',
    ALTA = 'Alta',
    CRITICA = 'Crítica'
}

export interface RequisitionItem {
    id: string; // representa la partida
    codigo: string;
    descripcion: string;
    marca: string;
    unidad: string;
    cantidad: number;
    precioEstimado?: number; // mock
    totalEstimado?: number;
    estadoEntrega?: string;
}

export interface RequisitionTimelineEvent {
    id: string;
    status: RequisitionStatus;
    date: string; // ISO string
    userId: string;
    userName: string;
    comment?: string;
}

export interface Requisition {
    id: string;
    folio: string; // e.g. REQ-2023-0001
    solicitanteId: string;
    solicitanteName: string;
    rig: string; // 702 or 703
    areaDepartamento: string;
    prioridad: RequisitionPriority;
    justificacion: string;
    archivoAdjunto?: string;
    items: RequisitionItem[];

    estado: RequisitionStatus;
    poNumber?: string;
    fechaCreacion: string; // ISO string

    totalPartidas: number;
    totalEstimado: number;

    // Para control de tránsito y proveedor
    proveedorAsignado?: string;
    fechaEstimadaEntrega?: string; // ISO string
    fechaInicioTransito?: string; // ISO string

    timeline: RequisitionTimelineEvent[];
}
