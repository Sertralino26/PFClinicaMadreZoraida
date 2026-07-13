import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

// ─────────────────────────────────────────────────────────────
//  HOOK: useAcelerometro
//  Lee el acelerómetro del dispositivo y detecta movimiento.
//  Útil, por ejemplo, para saber si el paciente está en reposo
//  o en movimiento mientras usa la app.
// ─────────────────────────────────────────────────────────────

// Umbral simple para considerar que hay "movimiento brusco".
// (suma de aceleración en los 3 ejes, restando la gravedad ~1g)
const UMBRAL_MOVIMIENTO = 0.35;

export function useAcelerometro({ activo = true, intervaloMs = 500 } = {}) {
  const [datos, setDatos] = useState({ x: 0, y: 0, z: 0 });
  const [enMovimiento, setEnMovimiento] = useState(false);
  const suscripcion = useRef(null);

  useEffect(() => {
    if (!activo) {
      suscripcion.current?.remove();
      return;
    }

    Accelerometer.setUpdateInterval(intervaloMs);

    suscripcion.current = Accelerometer.addListener(({ x, y, z }) => {
      setDatos({ x, y, z });

      const magnitud = Math.sqrt(x * x + y * y + z * z);
      // En reposo, magnitud ≈ 1 (gravedad). Si se aleja mucho de 1, hay movimiento.
      setEnMovimiento(Math.abs(magnitud - 1) > UMBRAL_MOVIMIENTO);
    });

    return () => {
      suscripcion.current?.remove();
    };
  }, [activo, intervaloMs]);

  return { datos, enMovimiento };
}

/**
 * Verifica si el sensor de acelerómetro está disponible en el dispositivo.
 */
export async function acelerometroDisponible() {
  return await Accelerometer.isAvailableAsync();
}
