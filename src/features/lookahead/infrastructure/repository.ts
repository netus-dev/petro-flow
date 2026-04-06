/**
 * @fileoverview Singleton del repositorio Look-a-Head.
 * Exporta una instancia única que es consumida por los Use Cases
 * a través de los hooks de presentación.
 * Patrón idéntico a catalogs/infrastructure/repository.ts
 */

import { LookaheadDataSource } from "./datasources/lookahead.datasource";
import { LookaheadRepositoryImpl } from "./repositories/lookahead.repository.impl";

/** Singleton del repositorio — instanciado una sola vez con DI */
export const lookaheadRepository = new LookaheadRepositoryImpl(
  new LookaheadDataSource()
);
