/**
 * Clase que representa un valor de error o fallo en una operación asíncrona o de negocio.
 * Por convención, Left representa el fallo.
 * @template L Tipo del valor izquierdo (Fallo/Error).
 * @template R Tipo del valor derecho (Éxito).
 */
export class Left<L, R> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  /**
   * Determina si el resultado es un Left (Fallo).
   * @returns true si es Left, false en caso contrario.
   */
  isLeft(): this is Left<L, R> {
    return true;
  }

  /**
   * Determina si el resultado es un Right (Éxito).
   * @returns false dado que es Left.
   */
  isRight(): this is Right<L, R> {
    return false;
  }
}

/**
 * Clase que representa un valor de éxito en una operación.
 * Por convención, Right representa el éxito.
 * @template L Tipo del valor izquierdo (Fallo/Error).
 * @template R Tipo del valor derecho (Éxito).
 */
export class Right<L, R> {
  readonly value: R;

  constructor(value: R) {
    this.value = value;
  }

  /**
   * Determina si el resultado es un Left (Fallo).
   * @returns false dado que es Right.
   */
  isLeft(): this is Left<L, R> {
    return false;
  }

  /**
   * Determina si el resultado es un Right (Éxito).
   * @returns true si es Right, false en caso contrario.
   */
  isRight(): this is Right<L, R> {
    return true;
  }
}

/**
 * Representa el resultado de una operación que puede fallar.
 * Puede ser una instancia de Left (Error/Fallo) o Right (Éxito).
 * @template L Tipo del fallo.
 * @template R Tipo del éxito.
 */
export type Either<L, R> = Left<L, R> | Right<L, R>;

/**
 * Función helper para instanciar un fallo (Left).
 * @template L Tipo del valor izquierdo.
 * @template R Tipo del valor derecho.
 * @param value Valor de error.
 * @returns Instancia de Left.
 */
export const left = <L, R>(value: L): Either<L, R> => new Left(value);

/**
 * Función helper para instanciar un éxito (Right).
 * @template L Tipo del valor izquierdo.
 * @template R Tipo del valor derecho.
 * @param value Valor de éxito.
 * @returns Instancia de Right.
 */
export const right = <L, R>(value: R): Either<L, R> => new Right(value);
