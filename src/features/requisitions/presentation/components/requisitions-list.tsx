'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/src/core/presentation/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/core/presentation/components/ui/tabs';
import { Input } from '@/src/core/presentation/components/ui/input';
import { Button } from '@/src/core/presentation/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/core/presentation/components/ui/table';
import { Search, Download, Eye, Loader2 } from 'lucide-react';
import { Requisition } from '../../domain/entities/requisition';
import { RequisitionRepository } from '../../domain/repositories/requisition.repository';
import { RequisitionBadge } from './requisition-badge';
import Link from 'next/link';

interface RequisitionsListProps {
    repository: RequisitionRepository;
    currentUserId: string; // To filter "Mis Solicitudes"
}

export const RequisitionsList: React.FC<RequisitionsListProps> = ({ repository, currentUserId }) => {
    const [data, setData] = useState<Requisition[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async (userIdFilter?: string) => {
        setLoading(true);
        const filters = { search: searchTerm, solicitanteId: userIdFilter };
        const reqs = await repository.getRequisitions(filters);
        setData(reqs);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [searchTerm]);

    const handleTabChange = (val: string) => {
        if (val === 'mine') {
            loadData(currentUserId);
        } else {
            loadData();
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por PO, folio o descripción..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Exportar
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/requisitions/new">
                            Nueva Requisición
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
                        <div className="border-b px-6 py-2">
                            <TabsList className="bg-transparent space-x-2">
                                <TabsTrigger value="all" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-md">
                                    Todas las Solicitudes
                                </TabsTrigger>
                                <TabsTrigger value="mine" className="data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-md">
                                    Mis Solicitudes
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-0">
                            {loading ? (
                                <div className="flex justify-center items-center h-48">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead>Folio</TableHead>
                                                <TableHead>Solicitante</TableHead>
                                                <TableHead>RIG</TableHead>
                                                <TableHead>Descripción Breve</TableHead>
                                                <TableHead className="text-right">Partidas</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>PO</TableHead>
                                                <TableHead>Fecha Creación</TableHead>
                                                <TableHead className="text-center">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                                        No se encontraron requisiciones.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                data.map((req) => (
                                                    <TableRow key={req.id} className="hover:bg-muted/30">
                                                        <TableCell className="font-medium">{req.folio}</TableCell>
                                                        <TableCell>{req.solicitanteName}</TableCell>
                                                        <TableCell>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                                {req.rig}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px] truncate" title={req.justificacion}>
                                                            {req.justificacion}
                                                        </TableCell>
                                                        <TableCell className="text-right">{req.totalPartidas}</TableCell>
                                                        <TableCell>
                                                            <RequisitionBadge status={req.estado} />
                                                        </TableCell>
                                                        <TableCell>
                                                            {req.poNumber ? (
                                                                <span className="font-mono text-sm">{req.poNumber}</span>
                                                            ) : (
                                                                <span className="text-muted-foreground text-sm">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{new Date(req.fechaCreacion).toLocaleDateString()}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <Link href={`/dashboard/requisitions/${req.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};
