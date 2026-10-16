import { describe, expect, it, vi } from "vitest";
import { GetFunctionalPrinciplesByCompanyUseCase } from "./functional-principle.usecase";
import { IFunctionalPrincipleRepository } from "../../domain/repositories/functional-principle.repository";

describe("GetFunctionalPrinciplesByCompanyUseCase", () => {
  it("retorna error si el companyId está vacío", async () => {
    const mockRepo: IFunctionalPrincipleRepository = {
      listByCompany: vi.fn(),
    };
    const useCase = new GetFunctionalPrinciplesByCompanyUseCase(mockRepo);

    const result = await useCase.execute("   ");

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.message).toBe("El identificador de empresa es requerido.");
    }
    expect(mockRepo.listByCompany).not.toHaveBeenCalled();
  });

  it("retorna la lista de principios cuando el repositorio responde exitosamente", async () => {
    const mockData = [{ id: "fp-1", name: "Motor" }];
    const mockRepo: IFunctionalPrincipleRepository = {
      listByCompany: vi.fn().mockResolvedValue(mockData),
    };
    const useCase = new GetFunctionalPrinciplesByCompanyUseCase(mockRepo);

    const result = await useCase.execute("company-123");

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual(mockData);
    }
    expect(mockRepo.listByCompany).toHaveBeenCalledWith("company-123");
  });
});
