import { TrazabilidadLayout } from "@/src/features/trazabilidad/presentation/components/trazabilidad-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TrazabilidadLayout>{children}</TrazabilidadLayout>;
}
