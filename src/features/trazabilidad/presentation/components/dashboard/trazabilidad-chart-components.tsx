'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LabelList
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/src/core/presentation/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/core/presentation/components/ui/select'
import { Skeleton } from '@/src/core/presentation/components/ui/skeleton'
import { 
  FunctionalPrincipleCatalog, 
  AssetLocationStat 
} from '../../../domain/entities'

/**
 * Selector component for functional principles.
 */
export function FunctionalPrincipleSelector({
  principles,
  selectedId,
  onChange,
  disabled
}: {
  principles: FunctionalPrincipleCatalog[]
  selectedId: string | null
  onChange: (id: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-muted-foreground">Principio Funcional</label>
      <Select 
        value={selectedId || ''} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Seleccionar principio..." />
        </SelectTrigger>
        <SelectContent>
          {principles.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/**
 * Custom Tooltip for the BarChart.
 */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as AssetLocationStat
    const typeLabel = data.location_type === 'rig' ? 'RIG' : 'Base de Proveedor'
    
    return (
      <div className="bg-popover border-border rounded-lg border p-3 shadow-md">
        <p className="text-sm font-bold">{label}</p>
        <div className="mt-1 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">
            Tipo: <span className="text-foreground font-medium">{typeLabel}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Activos: <span className="text-primary font-bold">{data.total_assets}</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

/**
 * Horizontal Bar Chart showing asset distribution.
 */
export function AssetLocationChart({
  data,
  isLoading,
  principles,
  selectedId,
  onChange
}: {
  data: AssetLocationStat[]
  isLoading?: boolean
  principles: FunctionalPrincipleCatalog[]
  selectedId: string | null
  onChange: (id: string) => void
}) {
  if (isLoading) return <DashboardSkeleton />
  
  if (data.length === 0) {
    return (
      <Card className="flex h-[320px] items-center justify-center border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground text-sm italic">No hay existencias para este principio funcional.</p>
        </div>
      </Card>
    )
  }

  // Map to distinct colors
  const COLORS: Record<string, string> = {
    rig: '#6366f1', // Indigo 500
    operating_base: '#f43f5e', // Rose 500
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold">Distribución por principio funcional</CardTitle>
          <CardDescription>Cantidad de activos agrupados por equipo o base</CardDescription>
        </div>
        <FunctionalPrincipleSelector 
          principles={principles}
          selectedId={selectedId}
          onChange={onChange}
          disabled={isLoading}
        />
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 40, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
              <XAxis 
                type="number" 
                hide 
              />
              <YAxis 
                dataKey="location_name" 
                type="category" 
                axisLine={false}
                tickLine={false}
                width={120}
                tick={{ fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar 
                dataKey="total_assets" 
                radius={[0, 4, 4, 0]} 
                barSize={24}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.location_type] || COLORS.operating_base} 
                  />
                ))}
                <LabelList 
                  dataKey="total_assets" 
                  position="right" 
                  offset={10}
                  className="fill-muted-foreground text-[10px] font-bold"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-6">
           <div className="flex items-center gap-2">
             <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.rig }} />
             <span className="text-muted-foreground text-xs font-medium">RIG</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.operating_base }} />
             <span className="text-muted-foreground text-xs font-medium">Base de Proveedor</span>
           </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading skeleton for the dashboard components.
 */
export function DashboardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="h-[320px] space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
