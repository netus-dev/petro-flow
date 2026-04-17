# Phase 1: Quickstart

## Integración del Soporte de Temas

A continuación una breve guía de consumo para los desarrolladores cuando esta característica sea implementada.

### Consumo vía UI Components (Zustand + next-themes)

Los componentes React de la capa de presentación consumirán nuestro Zustand unificado para modificar el tema y evitar lógicas dispersas, permitiendo reaccionar incluso a si el 'system' subyacente es oscuro o claro.

```tsx
import { useThemeStore } from '@/application/stores/useThemeStore'

export const ThemeToggle = () => {
  const { preferredTheme, setTheme } = useThemeStore()

  return (
    <div className="flex options gap-2">
      <button 
        onClick={() => setTheme('light')}
        className={preferredTheme === 'light' ? 'active' : ''}
      >
        Light
      </button>
      <button 
        onClick={() => setTheme('dark')}
        className={preferredTheme === 'dark' ? 'active' : ''}
      >
        Dark
      </button>
    </div>
  )
}
```

### Notas Importantes
No se deben inyectar manualmente atributos `class="dark"` desde componentes arbitrarios. `next-themes` manejará el DOM automáticamente para coincidir con la variable que modifiquemos vía Zustand. Tailwind se apoyará de la directiva `darkMode: 'class'` para reaccionar a la aserción de `next-themes`.
