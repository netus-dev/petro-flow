'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/core/presentation/components/ui/card';
import { Button } from '@/src/core/presentation/components/ui/button';
import { Input } from '@/src/core/presentation/components/ui/input';
import { Label } from '@/src/core/presentation/components/ui/label';
import { Textarea } from '@/src/core/presentation/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/core/presentation/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/core/presentation/components/ui/table';
import { Trash2, Search, PlusCircle, Save, Send } from 'lucide-react';
import { RequisitionPriority, RequisitionItem } from '../../domain/entities/requisition';
import { mockCatalogItems } from '../../infrastructure/datasources/requisition.mock.datasource';
import { RequisitionRepository } from '../../domain/repositories/requisition.repository';

interface NewRequisitionFormProps {
    repository: RequisitionRepository;
    currentUser: { id: string; name: string };
}

export const NewRequisitionForm: React.FC<NewRequisitionFormProps> = ({ repository, currentUser }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<RequisitionItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [rig, setRig] = useState('');
    const [area, setArea] = useState('');
    const [prioridad, setPrioridad] = useState<RequisitionPriority>(RequisitionPriority.NORMAL);
    const [justificacion, setJustificacion] = useState('');

    // Derived state
    const totalPartidas = items.length;
    const totalEstimado = items.reduce((sum, item) => sum + (item.totalEstimado || 0), 0);

    const searchResults = searchQuery.length > 2
        ? mockCatalogItems.filter(item =>
            item.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    const handleAddItem = (catalogItem: typeof mockCatalogItems[0]) => {
        if (items.find(i => i.codigo === catalogItem.codigo)) return; // Already exists

        const newItem: RequisitionItem = {
            id: Math.random().toString(36).substr(2, 9),
            codigo: catalogItem.codigo,
            descripcion: catalogItem.descripcion,
            marca: catalogItem.marca,
            unidad: catalogItem.unidad,
            cantidad: 1,
            precioEstimado: catalogItem.precioEstimado,
            totalEstimado: catalogItem.precioEstimado * 1,
        };

        setItems([...items, newItem]);
        setSearchQuery('');
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleQuantityChange = (id: string, qty: number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const validQty = Math.max(1, qty);
                return {
                    ...item,
                    cantidad: validQty,
                    totalEstimado: (item.precioEstimado || 0) * validQty
                };
            }
            return item;
        }));
    };

    const handleSubmit = async (isDraft: boolean) => {
        if (!rig || !area || !justificacion || items.length === 0) {
            alert("Por favor complete todos los campos y agregue al menos un item.");
            return;
        }

        setLoading(true);
        try {
            const newReq = await repository.createRequisition({
                solicitanteId: currentUser.id,
                solicitanteName: currentUser.name,
                rig,
                areaDepartamento: area,
                prioridad,
                justificacion,
                items
            });

            // In a real app we would use sonner/toast here
            router.push(`/dashboard/requisitions/${newReq.id}`);
        } catch (error) {
            console.error(error);
            alert("Error al crear la requisición");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="xl:col-span-2 space-y-6">
                {/* Header Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Solicitante</Label>
                                <Input value={currentUser.name} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de Creación</Label>
                                <Input value={new Date().toLocaleDateString()} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label>RIG <span className="text-red-500">*</span></Label>
                                <Select value={rig} onValueChange={setRig}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar RIG" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="702">RIG 702</SelectItem>
                                        <SelectItem value="703">RIG 703</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Área / Departamento <span className="text-red-500">*</span></Label>
                                <Input value={area} onChange={e => setArea(e.target.value)} placeholder="Ej. Eléctrico, Mecánico..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Prioridad</Label>
                                <Select value={prioridad} onValueChange={(val) => setPrioridad(val as RequisitionPriority)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={RequisitionPriority.NORMAL}>Normal</SelectItem>
                                        <SelectItem value={RequisitionPriority.ALTA}>Alta</SelectItem>
                                        <SelectItem value={RequisitionPriority.CRITICA}>Crítica</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Archivo Adjunto (Opcional)</Label>
                                <Input type="file" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Justificación <span className="text-red-500">*</span></Label>
                            <Textarea
                                value={justificacion}
                                onChange={e => setJustificacion(e.target.value)}
                                placeholder="Explique detalladamente el motivo de la requisición"
                                className="min-h-[100px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Items Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Partidas de Requisición</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar en catálogo Fracttal por código o descripción..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                                    {searchResults.map(item => (
                                        <div
                                            key={item.codigo}
                                            className="p-3 hover:bg-muted cursor-pointer flex justify-between items-center border-b last:border-b-0"
                                            onClick={() => handleAddItem(item)}
                                        >
                                            <div>
                                                <div className="font-medium text-sm">{item.codigo} - {item.descripcion}</div>
                                                <div className="text-xs text-muted-foreground">{item.marca} • {item.unidad} • ${item.precioEstimado}</div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                <PlusCircle className="h-4 w-4 text-primary" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border rounded-md overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-12">No.</TableHead>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>UOM</TableHead>
                                        <TableHead className="w-24">Cantidad</TableHead>
                                        <TableHead className="text-right">Total Est.</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                                No hay partidas agregadas.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="font-mono text-xs">{item.codigo}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{item.descripcion}</div>
                                                    <div className="text-xs text-muted-foreground">{item.marca}</div>
                                                </TableCell>
                                                <TableCell>{item.unidad}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.cantidad}
                                                        onChange={e => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                                        className="h-8 text-center"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ${item.totalEstimado?.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sticky Summary */}
            <div className="xl:col-span-1">
                <div className="sticky top-6">
                    <Card className="border-primary/20 shadow-md">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="text-lg">Resumen de Requisición</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-muted-foreground">Total Partidas</span>
                                <span className="font-bold text-lg">{totalPartidas}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-muted-foreground">Monto Estimado</span>
                                <span className="font-bold text-xl text-primary">${totalEstimado.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-muted-foreground">Prioridad</span>
                                <span className={`font-semibold ${prioridad === RequisitionPriority.CRITICA ? 'text-red-600' :
                                        prioridad === RequisitionPriority.ALTA ? 'text-amber-500' : 'text-blue-600'
                                    }`}>
                                    {prioridad}
                                </span>
                            </div>

                            <div className="space-y-3 pt-4">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={() => handleSubmit(false)}
                                    disabled={loading || items.length === 0}
                                >
                                    <Send className="mr-2 h-4 w-4" /> Enviar a Autorización
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleSubmit(true)}
                                    disabled={loading}
                                >
                                    <Save className="mr-2 h-4 w-4" /> Guardar Borrador
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
