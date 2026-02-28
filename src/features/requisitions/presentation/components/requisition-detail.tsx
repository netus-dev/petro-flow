'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/core/presentation/components/ui/card';
import { Button } from '@/src/core/presentation/components/ui/button';
import { Badge } from '@/src/core/presentation/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/core/presentation/components/ui/table';
import { Textarea } from '@/src/core/presentation/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/src/core/presentation/components/ui/dialog';
import { Input } from '@/src/core/presentation/components/ui/input';
import { Check, X, FileText, Package, Truck, Calendar, MapPin, User, AlertTriangle } from 'lucide-react';
import { Requisition, RequisitionStatus } from '../../domain/entities/requisition';
import { RequisitionRepository } from '../../domain/repositories/requisition.repository';
import { RequisitionBadge } from './requisition-badge';

// En un entorno real, RequisitionTimeline sería importado. Para simplificar lo pondremos como prop o hijo, 
// o lo importaremos directamente.
import { RequisitionTimeline } from './requisition-timeline';
import { requisitionRepository } from '../../infrastructure/repositories/requisition.repository.impl';

interface RequisitionDetailProps {
    requisitionId: string;
    currentUser: { id: string; name: string; role: string };
}

export const RequisitionDetail: React.FC<RequisitionDetailProps> = ({ requisitionId, currentUser }) => {
    const [data, setData] = useState<Requisition | null>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [poNumber, setPoNumber] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const req = await requisitionRepository.getRequisitionById(requisitionId);
        setData(req);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [requisitionId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) {
        return <div className="text-center p-12">Requisición no encontrada.</div>;
    }

    const handleStatusUpdate = async (newStatus: RequisitionStatus, metadata?: any) => {
        if (newStatus === RequisitionStatus.RECHAZADO && !comment) {
            alert("Debe incluir un comentario para rechazar.");
            return;
        }

        if (newStatus === RequisitionStatus.PO_ASIGNADO && !poNumber) {
            alert("Debe ingresar un número de PO.");
            return;
        }

        setIsUpdating(true);
        try {
            const updated = await requisitionRepository.updateRequisitionStatus(
                data.id,
                newStatus,
                currentUser.id,
                currentUser.name,
                comment,
                metadata
            );
            setData(updated);
            setComment('');
            setPoNumber('');
        } catch (error) {
            console.error(error);
            alert("Error actualizando el estado.");
        } finally {
            setIsUpdating(false);
        }
    };

    const isPendingApproval =
        data.estado === RequisitionStatus.EN_REVISION_JEFE ||
        data.estado === RequisitionStatus.EN_REVISION_SUPERINTENDENTE ||
        data.estado === RequisitionStatus.EN_REVISION_GERENCIA;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-6 rounded-lg border">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight">{data.folio}</h1>
                        <RequisitionBadge status={data.estado} />
                        {data.prioridad === 'Crítica' && (
                            <Badge variant="destructive" className="ml-2 gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3" /> Crítica
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground max-w-2xl">{data.justificacion}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {/* Action Buttons purely mock logic for the demo */}
                    {isPendingApproval && (
                        <>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                                        <X className="mr-2 h-4 w-4" /> Rechazar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Rechazar Requisición {data.folio}</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Textarea
                                            placeholder="Motivo del rechazo..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => handleStatusUpdate(RequisitionStatus.RECHAZADO)} disabled={isUpdating}>
                                            Confirmar Rechazo
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button onClick={() => handleStatusUpdate(
                                data.estado === RequisitionStatus.EN_REVISION_JEFE ? RequisitionStatus.EN_REVISION_SUPERINTENDENTE :
                                    data.estado === RequisitionStatus.EN_REVISION_SUPERINTENDENTE ? RequisitionStatus.EN_REVISION_GERENCIA :
                                        RequisitionStatus.PO_ASIGNADO // If Gerencia approves, it waits for PO or goes to PO directly
                            )} disabled={isUpdating}>
                                <Check className="mr-2 h-4 w-4" /> Aprobar Siguiente Nivel
                            </Button>
                        </>
                    )}

                    {data.estado === RequisitionStatus.EN_REVISION_GERENCIA && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-purple-600 hover:bg-purple-700">
                                    Asignar PO
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Asignar Purchase Order</DialogTitle>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                    <Input
                                        placeholder="Número de PO (Ej. PO-2023-XXXX)"
                                        value={poNumber}
                                        onChange={(e) => setPoNumber(e.target.value)}
                                    />
                                    <Textarea
                                        placeholder="Comentarios adicionales (Opcional)..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => handleStatusUpdate(RequisitionStatus.PO_ASIGNADO, { poNumber })} disabled={isUpdating}>
                                        Confirmar y Asignar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {data.estado === RequisitionStatus.PO_ASIGNADO && (
                        <Button onClick={() => handleStatusUpdate(RequisitionStatus.EN_TRANSITO, {})} disabled={isUpdating} className="bg-yellow-600 hover:bg-yellow-700">
                            <Truck className="mr-2 h-4 w-4" /> Marcar En Tránsito
                        </Button>
                    )}

                    {data.estado === RequisitionStatus.EN_TRANSITO && (
                        <Button onClick={() => handleStatusUpdate(RequisitionStatus.RECIBIDO_ALMACEN, {})} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700">
                            <Package className="mr-2 h-4 w-4" /> Recibir en Almacén
                        </Button>
                    )}

                    {data.estado === RequisitionStatus.RECIBIDO_ALMACEN && (
                        <Button onClick={() => handleStatusUpdate(RequisitionStatus.ENTREGADO, {})} disabled={isUpdating} className="bg-green-600 hover:bg-green-700">
                            <Check className="mr-2 h-4 w-4" /> Confirmar Entrega en Sitio
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Línea de Vida</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* The horizontal stepper */}
                        <div className="w-full overflow-hidden">
                            <RequisitionTimeline currentStatus={data.estado} events={data.timeline} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Detalles Operativos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="text-muted-foreground block text-xs">Solicitante</span>
                                <span className="font-medium">{data.solicitanteName}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="text-muted-foreground block text-xs">RIG & Área</span>
                                <span className="font-medium">{data.rig} - {data.areaDepartamento}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <span className="text-muted-foreground block text-xs">Fecha Creación</span>
                                <span className="font-medium">{new Date(data.fechaCreacion).toLocaleDateString()}</span>
                            </div>
                        </div>
                        {data.poNumber && (
                            <div className="pt-2 border-t flex items-center gap-2">
                                <FileText className="h-4 w-4 text-purple-600" />
                                <div>
                                    <span className="text-muted-foreground block text-xs">PO Asignado</span>
                                    <span className="font-mono font-medium text-purple-700">{data.poNumber}</span>
                                </div>
                            </div>
                        )}
                        {data.proveedorAsignado && (
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <span className="text-muted-foreground block text-xs">Proveedor</span>
                                    <span className="font-medium">{data.proveedorAsignado}</span>
                                </div>
                            </div>
                        )}
                        {data.fechaEstimadaEntrega && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <span className="text-muted-foreground block text-xs">Entrega Estimada</span>
                                    <span className="font-medium text-amber-600">{new Date(data.fechaEstimadaEntrega).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Partidas Solicitadas ({data.totalPartidas})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-12">No.</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Descripción / Marca</TableHead>
                                    <TableHead>Unidad</TableHead>
                                    <TableHead className="text-right">Cantidad</TableHead>
                                    <TableHead className="text-right">Precio Est.</TableHead>
                                    <TableHead className="text-right">Total Est.</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.items.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-mono text-xs">{item.codigo}</TableCell>
                                        <TableCell>
                                            <div className="font-medium text-sm">{item.descripcion}</div>
                                            <div className="text-xs text-muted-foreground">{item.marca}</div>
                                        </TableCell>
                                        <TableCell>{item.unidad}</TableCell>
                                        <TableCell className="text-right font-bold">{item.cantidad}</TableCell>
                                        <TableCell className="text-right">${item.precioEstimado?.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-medium text-primary">
                                            ${item.totalEstimado?.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <div className="text-right bg-muted/30 p-4 rounded-lg border">
                            <span className="text-muted-foreground mr-4">Total Estimado General:</span>
                            <span className="text-2xl font-bold">${data.totalEstimado?.toLocaleString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Eventos (Audit Trail)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.timeline.map((event) => (
                            <div key={event.id} className="flex gap-4 p-4 border rounded-lg bg-muted/10">
                                <div className="mt-1">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {event.userName.charAt(0)}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold">{event.userName}</span>
                                        <span className="text-xs text-muted-foreground">({event.userId})</span>
                                        <span className="text-xs text-muted-foreground ml-auto">
                                            {new Date(event.date).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        Cambió el estado a: <RequisitionBadge status={event.status} />
                                    </div>
                                    {event.comment && (
                                        <div className="text-sm bg-background p-3 rounded border italic">
                                            "{event.comment}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
