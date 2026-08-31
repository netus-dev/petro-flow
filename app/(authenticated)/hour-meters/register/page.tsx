import { RegisterHourMeterForm } from "@/src/features/hour-meters/presentation/components/register-hour-meter-form";
import { ClientBrandHeader } from "@/src/features/hour-meters/presentation/components/client-brand-header";

export default function RegisterHourMeterPage() {
  return <main className="mx-auto max-w-xl space-y-6 p-6"><header className="space-y-5"><ClientBrandHeader /><div><h1 className="text-2xl font-bold">Registrar lectura del horómetro</h1><p className="text-muted-foreground">Captura una lectura manual en campo.</p></div></header><RegisterHourMeterForm /></main>;
}
