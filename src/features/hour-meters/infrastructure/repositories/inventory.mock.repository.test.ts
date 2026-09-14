import { describe, expect, it } from "vitest";
import { MockInventoryRepository } from "./inventory.mock.repository";

const input = (overrides: Partial<{
  functionalPrincipleId: string;
  material: string;
  specification: string;
  quantityInStock: number;
  minimumStock: number;
}> = {}) => ({
  functionalPrincipleId: "principle-new",
  material: "Seal Kit",
  specification: "Standard",
  quantityInStock: 4,
  minimumStock: 1,
  ...overrides,
});

describe("MockInventoryRepository", () => {
  it("isolates active reads by company and visible principle", async () => {
    const repository = new MockInventoryRepository();
    await repository.create("company-two", input());

    const own = await repository.listActive("company-two", ["principle-new"]);
    const other = await repository.listActive("mock-company", ["principle-new"]);
    const hidden = await repository.listActive("company-two", ["principle-hidden"]);

    expect(own.map((item) => item.material)).toEqual(["Seal Kit"]);
    expect(other).toEqual([]);
    expect(hidden).toEqual([]);
  });

  it("rejects canonical active duplicates on create and update", async () => {
    const repository = new MockInventoryRepository();
    const existing = await repository.create("company-two", input());
    const another = await repository.create(
      "company-two",
      input({ material: "Hydraulic Oil" }),
    );

    await expect(
      repository.create("company-two", input({ material: "  SEAL\t KIT  " })),
    ).rejects.toThrow("Ya existe un material activo con ese nombre.");
    await expect(
      repository.update(
        "company-two",
        another.id,
        input({ material: existing.material }),
      ),
    ).rejects.toThrow("Ya existe un material activo con ese nombre.");
  });

  it("retains inactive rows, allows an inactive duplicate, and guards reactivation", async () => {
    const repository = new MockInventoryRepository();
    const inactive = await repository.create("company-two", input());
    await repository.deactivate("company-two", inactive.id);

    const replacement = await repository.create(
      "company-two",
      input({ material: " seal   kit " }),
    );

    expect(
      (await repository.getActiveByPrinciple("company-two", "principle-new"))
        .map((item) => item.id),
    ).toEqual([replacement.id]);
    await expect(
      repository.reactivate("company-two", inactive.id),
    ).rejects.toThrow("Ya existe un material activo con ese nombre.");
  });

  it("logically deletes without exposing the retained record", async () => {
    const repository = new MockInventoryRepository();
    const record = await repository.create("company-two", input());

    await repository.deactivate("company-two", record.id);

    expect(
      await repository.getActiveByPrinciple("company-two", "principle-new"),
    ).toEqual([]);
    await expect(repository.reactivate("company-two", record.id)).resolves.toMatchObject({
      id: record.id,
      isActive: true,
    });
  });
});
