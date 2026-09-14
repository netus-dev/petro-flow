import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InventoryManagementModal } from "./inventory-management-modal";

describe("InventoryManagementModal", () => {
  it("renders an explicit unavailable state without visible principles", () => {
    const html = renderToStaticMarkup(
      <InventoryManagementModal principles={[]} />,
    );

    expect(html).toContain(
      "No hay principios funcionales disponibles en los activos visibles.",
    );
    expect(html).not.toContain("<form");
  });

  it("renders principle management without legacy identity controls", () => {
    const html = renderToStaticMarkup(
      <InventoryManagementModal
        principles={[{ id: "principle-a", name: "Mud Pump" }]}
      />,
    );

    expect(html).toContain("Principio funcional");
    expect(html).toContain("Mud Pump");
    expect(html).not.toContain("Alcance del inventario");
    expect(html).not.toContain("Tipo de equipo");
    expect(html).not.toContain("Por activo");
  });
});
