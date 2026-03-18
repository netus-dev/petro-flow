import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { RequisitionStatus, RequisitionTimelineEvent } from '../../domain/entities/requisition';

interface RequisitionTimelineProps {
    currentStatus: RequisitionStatus;
    events: RequisitionTimelineEvent[];
}

const steps = [
    { id: RequisitionStatus.EN_REVISION_JEFE, label: 'Jefe Inmediato' },
    { id: RequisitionStatus.EN_REVISION_SUPERINTENDENTE, label: 'Superintendente' },
    { id: RequisitionStatus.EN_REVISION_GERENCIA, label: 'Gerencia' },
    { id: RequisitionStatus.PO_ASIGNADO, label: 'Asignación PO' },
    { id: RequisitionStatus.EN_TRANSITO, label: 'En Tránsito' },
    { id: RequisitionStatus.RECIBIDO_ALMACEN, label: 'Recibido Almacén' },
    { id: RequisitionStatus.ENTREGADO, label: 'Entregado en Sitio' },
];

export const RequisitionTimeline: React.FC<RequisitionTimelineProps> = ({ currentStatus, events }) => {
    const isRejected = currentStatus === RequisitionStatus.RECHAZADO;

    const currentStepIndex = isRejected
        ? steps.findIndex(s => events.some(e => e.status === s.id)) // Find latest reached before rejection
        : steps.findIndex(s => s.id === currentStatus);

    // If status is not in the linear path (e.g. EN_REVISION_JEFE is index 0), 
    // we assume it's currently at that index, so everything before is checked.

    return (
        <div className="py-6 w-full overflow-x-auto">
            <div className="flex items-center justify-between min-w-[800px] px-4 relative">
                {/* Background Line */}
                <div className="absolute top-5 left-10 right-10 h-1 bg-muted rounded"></div>

                {/* Active Line Progress */}
                <div
                    className={`absolute top-5 left-10 h-1 rounded transition-all duration-500 ${isRejected ? 'bg-red-500' : 'bg-primary'}`}
                    style={{ width: `${Math.max(0, (Math.min(currentStepIndex < 0 ? steps.length : currentStepIndex, steps.length - 1)) / (steps.length - 1) * 85)}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex || currentStatus === RequisitionStatus.ENTREGADO;
                    const isActive = index === currentStepIndex && !isRejected;
                    const isFailed = isRejected && index === currentStepIndex;

                    const eventForStep = events.find(e => e.status === step.id);

                    return (
                        <div key={step.id} className="relative flex flex-col items-center group z-10 w-24">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-background transition-colors
                  ${isCompleted ? 'border-primary text-primary' :
                                        isActive ? 'border-primary ring-4 ring-primary/20 text-primary' :
                                            isFailed ? 'border-red-500 text-red-500 bg-red-50' :
                                                'border-muted-foreground text-muted-foreground'}`}
                            >
                                {isCompleted ? <CheckCircle className="w-5 h-5" /> :
                                    isFailed ? <XCircle className="w-5 h-5" /> :
                                        isActive ? <Clock className="w-5 h-5 animate-pulse" /> :
                                            <AlertCircle className="w-5 h-5 opacity-50" />}
                            </div>

                            <div className="text-center mt-3">
                                <p className={`text-xs font-medium leading-tight ${isActive || isCompleted ? 'text-foreground' :
                                        isFailed ? 'text-red-500 font-bold' : 'text-muted-foreground'
                                    }`}>
                                    {step.label}
                                </p>

                                {eventForStep && (
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {new Date(eventForStep.date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
