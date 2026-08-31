import { enforceCapability } from "@/src/features/authorization/infrastructure/server/authorization-session";
import { AccessControlPanel } from "./access-control-panel";

export default async function AccessControlPage() {
  await enforceCapability({ action: "manage", resource: "access-control" });
  return (
    <main className="space-y-6 p-6">
      <div>
        <p className="text-sm text-muted-foreground">Developer administration</p>
        <h1 className="text-2xl font-semibold">Access control</h1>
      </div>
      <AccessControlPanel />
    </main>
  );
}
