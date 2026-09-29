"use client";

export default function Error({ reset }: { reset: () => void }) {
  return <div className="p-6 text-sm text-destructive">No se pudo cargar la información. <button onClick={reset} className="underline">Reintentar</button></div>;
}
