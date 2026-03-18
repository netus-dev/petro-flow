import { Requisition, RequisitionPriority, RequisitionStatus } from '../../domain/entities/requisition';

export const mockRequisitions: Requisition[] = [
    {
        id: '1',
        folio: 'REQ-2023-0001',
        solicitanteId: 'usr-01',
        solicitanteName: 'Juan Pérez',
        rig: '702',
        areaDepartamento: 'Mantenimiento',
        prioridad: RequisitionPriority.ALTA,
        justificacion: 'Repuestos críticos para bomba centrífuga principal.',
        estado: RequisitionStatus.EN_REVISION_JEFE,
        fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
            {
                id: 'item-1',
                codigo: 'BMB-001',
                descripcion: 'Sello mecánico 2"',
                marca: 'John Crane',
                unidad: 'PZA',
                cantidad: 2,
                precioEstimado: 250,
                totalEstimado: 500,
            },
            {
                id: 'item-2',
                codigo: 'BMB-002',
                descripcion: 'Rodamiento radial',
                marca: 'SKF',
                unidad: 'PZA',
                cantidad: 4,
                precioEstimado: 120,
                totalEstimado: 480,
            }
        ],
        totalPartidas: 2,
        totalEstimado: 980,
        timeline: [
            {
                id: 'tl-1',
                status: RequisitionStatus.EN_REVISION_JEFE,
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                userId: 'usr-01',
                userName: 'Juan Pérez',
                comment: 'Solicitud creada.'
            }
        ]
    },
    {
        id: '2',
        folio: 'REQ-2023-0002',
        solicitanteId: 'usr-02',
        solicitanteName: 'Ana Gómez',
        rig: '702',
        areaDepartamento: 'Operaciones',
        prioridad: RequisitionPriority.NORMAL,
        justificacion: 'Insumos de limpieza mensual.',
        estado: RequisitionStatus.PO_ASIGNADO,
        poNumber: 'PO-2023-0050',
        fechaCreacion: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        proveedorAsignado: 'Limpieza Industrial SA',
        fechaEstimadaEntrega: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
            {
                id: 'item-3',
                codigo: 'CLN-001',
                descripcion: 'Desengrasante industrial 20L',
                marca: 'Zep',
                unidad: 'GLN',
                cantidad: 10,
                precioEstimado: 45,
                totalEstimado: 450,
            }
        ],
        totalPartidas: 1,
        totalEstimado: 450,
        timeline: [
            {
                id: 'tl-1b',
                status: RequisitionStatus.EN_REVISION_JEFE,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                userId: 'usr-02',
                userName: 'Ana Gómez',
            },
            {
                id: 'tl-2b',
                status: RequisitionStatus.PO_ASIGNADO,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                userId: 'mgr-01',
                userName: 'Carlos Ruiz',
                comment: 'PO asignada, en espera de despacho.'
            }
        ]
    },
    {
        id: '3',
        folio: 'REQ-2023-0003',
        solicitanteId: 'usr-03',
        solicitanteName: 'Luis Sánchez',
        rig: '703',
        areaDepartamento: 'Eléctrico',
        prioridad: RequisitionPriority.CRITICA,
        justificacion: 'Motores quemados en ventiladores principales.',
        estado: RequisitionStatus.EN_TRANSITO,
        poNumber: 'PO-2023-0051',
        fechaCreacion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        proveedorAsignado: 'Motores Eléctricos Global',
        fechaEstimadaEntrega: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Atrasado
        fechaInicioTransito: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
            {
                id: 'item-4',
                codigo: 'MTR-001',
                descripcion: 'Motor trifásico 50HP',
                marca: 'Siemens',
                unidad: 'PZA',
                cantidad: 2,
                precioEstimado: 3500,
                totalEstimado: 7000,
            }
        ],
        totalPartidas: 1,
        totalEstimado: 7000,
        timeline: [
            {
                id: 'tl-1c',
                status: RequisitionStatus.EN_REVISION_JEFE,
                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                userId: 'usr-03',
                userName: 'Luis Sánchez',
            },
            {
                id: 'tl-2c',
                status: RequisitionStatus.EN_TRANSITO,
                date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                userId: 'log-01',
                userName: 'María López',
                comment: 'Equipo enviado por marítimo.'
            }
        ]
    },
    {
        id: '4',
        folio: 'REQ-2023-0004',
        solicitanteId: 'usr-01',
        solicitanteName: 'Juan Pérez',
        rig: '702',
        areaDepartamento: 'Mantenimiento',
        prioridad: RequisitionPriority.NORMAL,
        justificacion: 'Filtros de aceite para generadores.',
        estado: RequisitionStatus.ENTREGADO,
        poNumber: 'PO-2023-0030',
        fechaCreacion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        proveedorAsignado: 'Filtros XYZ',
        items: [
            {
                id: 'item-5',
                codigo: 'FLT-001',
                descripcion: 'Filtro de aceite',
                marca: 'Fleetguard',
                unidad: 'PZA',
                cantidad: 20,
                precioEstimado: 15,
                totalEstimado: 300,
            }
        ],
        totalPartidas: 1,
        totalEstimado: 300,
        timeline: [
            {
                id: 'tl-1d',
                status: RequisitionStatus.EN_REVISION_JEFE,
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                userId: 'usr-01',
                userName: 'Juan Pérez',
            },
            {
                id: 'tl-2d',
                status: RequisitionStatus.ENTREGADO,
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                userId: 'alm-01',
                userName: 'José Almacén',
                comment: 'Entregado en sitio conforme.'
            }
        ]
    },
    {
        id: '5',
        folio: 'REQ-2023-0005',
        solicitanteId: 'usr-02',
        solicitanteName: 'Ana Gómez',
        rig: '703',
        areaDepartamento: 'HSE',
        prioridad: RequisitionPriority.ALTA,
        justificacion: 'EPP para cuadrilla nueva.',
        estado: RequisitionStatus.RECHAZADO,
        fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
            {
                id: 'item-6',
                codigo: 'EPP-001',
                descripcion: 'Casco de seguridad',
                marca: 'MSA',
                unidad: 'PZA',
                cantidad: 15,
                precioEstimado: 25,
                totalEstimado: 375,
            }
        ],
        totalPartidas: 1,
        totalEstimado: 375,
        timeline: [
            {
                id: 'tl-1e',
                status: RequisitionStatus.EN_REVISION_JEFE,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                userId: 'usr-02',
                userName: 'Ana Gómez',
            },
            {
                id: 'tl-2e',
                status: RequisitionStatus.RECHAZADO,
                date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                userId: 'mgr-01',
                userName: 'Carlos Ruiz',
                comment: 'Cantidades exceden el presupuesto del proyecto actual. Ajustar.'
            }
        ]
    }
];

export const mockCatalogItems = [
    { codigo: 'BMB-001', descripcion: 'Sello mecánico 2"', marca: 'John Crane', unidad: 'PZA', precioEstimado: 250 },
    { codigo: 'BMB-002', descripcion: 'Rodamiento radial', marca: 'SKF', unidad: 'PZA', precioEstimado: 120 },
    { codigo: 'CLN-001', descripcion: 'Desengrasante industrial 20L', marca: 'Zep', unidad: 'GLN', precioEstimado: 45 },
    { codigo: 'MTR-001', descripcion: 'Motor trifásico 50HP', marca: 'Siemens', unidad: 'PZA', precioEstimado: 3500 },
    { codigo: 'FLT-001', descripcion: 'Filtro de aceite', marca: 'Fleetguard', unidad: 'PZA', precioEstimado: 15 },
    { codigo: 'EPP-001', descripcion: 'Casco de seguridad', marca: 'MSA', unidad: 'PZA', precioEstimado: 25 },
    { codigo: 'EPP-002', descripcion: 'Guantes de impacto', marca: 'HexArmor', unidad: 'PAR', precioEstimado: 35 },
    { codigo: 'HER-001', descripcion: 'Llave stilson 24"', marca: 'Ridgid', unidad: 'PZA', precioEstimado: 85 },
    { codigo: 'ELC-001', descripcion: 'Cable eléctrico calibre 10', marca: 'Condumex', unidad: 'MTS', precioEstimado: 5 },
    { codigo: 'TUB-001', descripcion: 'Tubo de acero al carbón sch 40 4"', marca: 'Tubac', unidad: 'MTS', precioEstimado: 60 }
];
