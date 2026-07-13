import * as Location from 'expo-location';

// ─────────────────────────────────────────────────────────────
//  PERMISOS Y UBICACIÓN DEL USUARIO
// ─────────────────────────────────────────────────────────────

/**
 * Solicita permiso de ubicación al usuario (Android/iOS).
 * Devuelve true si fue concedido, false si fue denegado.
 */
export async function solicitarPermisoUbicacion() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Obtiene la ubicación actual del dispositivo.
 * Lanza un error si el permiso no fue concedido.
 */
export async function obtenerUbicacionActual() {
  const permisoOk = await solicitarPermisoUbicacion();
  if (!permisoOk) {
    throw new Error('PERMISO_DENEGADO');
  }

  const posicion = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: posicion.coords.latitude,
    longitude: posicion.coords.longitude,
  };
}

// ─────────────────────────────────────────────────────────────
//  CÁLCULO DE DISTANCIA (fórmula de Haversine)
// ─────────────────────────────────────────────────────────────

function aRadianes(grados) {
  return (grados * Math.PI) / 180;
}

/**
 * Calcula la distancia en kilómetros entre dos coordenadas.
 */
export function calcularDistanciaKm(coordA, coordB) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = aRadianes(coordB.latitude - coordA.latitude);
  const dLon = aRadianes(coordB.longitude - coordA.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(coordA.latitude)) *
      Math.cos(aRadianes(coordB.latitude)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Recibe la ubicación del usuario y la lista de sedes,
 * devuelve las sedes ordenadas de la más cercana a la más lejana,
 * cada una con su campo `distanciaKm` agregado.
 */
export function ordenarSedesPorCercania(ubicacionUsuario, sedes) {
  return sedes
    .map((sede) => ({
      ...sede,
      distanciaKm: calcularDistanciaKm(ubicacionUsuario, sede),
    }))
    .sort((a, b) => a.distanciaKm - b.distanciaKm);
}
