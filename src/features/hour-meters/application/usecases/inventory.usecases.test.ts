import { describe, expect, it } from "vitest";
import {
  canonicalizeInventoryMaterial,
  GetFunctionalPrincipleInventoryUseCase,
  ManageInventoryUseCase,
} from "./inventory.usecases";
import { MockInventoryRepository } from "../../infrastructure/repositories/inventory.mock.repository";

describe("functional-principle inventory use cases", () => {
  it("canonicalizes material using trim, collapsed ASCII whitespace, and lowercase", () => {
    expect(canonicalizeInventoryMaterial("  FILTRO\t  DE\nACEITE  ")).toBe(
      "filtro de aceite",
    );
    expect(canonicalizeInventoryMaterial("Seal Kit")).toBe("seal kit");
  });

  it("fails closed when a stable functional principle is missing", async () => {
    const useCase = new GetFunctionalPrincipleInventoryUseCase({
      getActiveByPrinciple: async () => {
        throw new Error("repository must not be called");
      },
    });

    const missing = await useCase.execute("mock-company", undefined);
    const whitespace = await useCase.execute("mock-company", "   ");

    expect(missing.isLeft() && missing.value.message).toBe(
      "El principio funcional no está disponible.",
    );
    expect(whitespace.isLeft() && whitespace.value.message).toBe(
      "El principio funcional no está disponible.",
    );
  });

  it("returns the same active records for assets that share a principle", async () => {
    const repository = new MockInventoryRepository();
    const useCase = new GetFunctionalPrincipleInventoryUseCase(repository);

    const first = await useCase.execute("mock-company", "principle-generator");
    const second = await useCase.execute("mock-company", "principle-generator");

    expect(first.isRight() && first.value.map((item) => item.id)).toEqual([
      "inv-001",
      "inv-002",
    ]);
    expect(second.isRight() && second.value).toEqual(
      first.isRight() ? first.value : [],
    );
  });

  it("rejects missing principles and invalid stock before persistence", async () => {
    const useCase = new ManageInventoryUseCase(new MockInventoryRepository());
    const base = {
      functionalPrincipleId: "",
      material: "Filter",
      specification: "OF-240",
      quantityInStock: 1,
      minimumStock: 0,
    };

    const missingPrinciple = await useCase.create("mock-company", base);
    const invalidStock = await useCase.create("mock-company", {
      ...base,
      functionalPrincipleId: "principle-new",
      quantityInStock: -1,
    });

    expect(missingPrinciple.isLeft() && missingPrinciple.value.message).toBe(
      "Selecciona un principio funcional.",
    );
    expect(invalidStock.isLeft() && invalidStock.value.message).toBe(
      "Las cantidades deben ser enteros iguales o mayores que cero.",
    );
  });

  it("returns repository duplicate failures through Either", async () => {
    const useCase = new ManageInventoryUseCase(new MockInventoryRepository());
    const input = {
      functionalPrincipleId: "principle-new",
      material: "Seal Kit",
      specification: "Standard",
      quantityInStock: 1,
      minimumStock: 0,
    };

    const created = await useCase.create("mock-company", input);
    const duplicate = await useCase.create("mock-company", {
      ...input,
      material: " seal   KIT ",
    });

    expect(created.isRight()).toBe(true);
    expect(duplicate.isLeft() && duplicate.value.message).toBe(
      "Ya existe un material activo con ese nombre.",
    );
  });
});
