import AsyncStorage from '@react-native-async-storage/async-storage';
import { registrarLog } from './logger';

// ─────────────────────────────────────────────────────────────
//  DOCTORES DEL SISTEMA
// ─────────────────────────────────────────────────────────────
export const DOCTORES_SISTEMA = {
  'admi@clinica.com': {
    correo: 'admi@clinica.com', password: 'admin123', rol: 'admin',
    nombre: 'Administrador', telefono: '999000001',
  },
  'pedro.gomez@clinica.com': {
    correo: 'pedro.gomez@clinica.com', password: 'pedro123', rol: 'doctor',
    nombre: 'Dr. Pedro Gómez', especialidad: 'Medicina General', cmp: '048291',
    telefono: '999001001', education: 'Universidad Nacional Mayor de San Marcos',
    experience: '8 años de experiencia en medicina clínica y prevención de enfermedades.',
    description: 'Médico compasivo dedicado al cuidado primario integral de pacientes de todas las edades.',
    fotoPerfil: null,
  },
  'maria.lopez@clinica.com': {
    correo: 'maria.lopez@clinica.com', password: 'maria123', rol: 'doctor',
    nombre: 'Dra. Maria Lopez', especialidad: 'Cardiología', cmp: '059281',
    telefono: '999001002', education: 'Universidad Cayetano Heredia',
    experience: '12 años de experiencia liderando unidades de cuidados cardiológicos.',
    description: 'Especialista en diagnóstico y tratamiento de enfermedades cardiovasculares.',
    fotoPerfil: null,
  },
  'juan.perez@clinica.com': {
    correo: 'juan.perez@clinica.com', password: 'juan123', rol: 'doctor',
    nombre: 'Dr. Juan Perez', especialidad: 'Traumatología', cmp: '038291',
    telefono: '999001003', education: 'Universidad Científica del Sur',
    experience: '10 años en atención de trauma de alta complejidad y medicina del deporte.',
    description: 'Especialista en lesiones del aparato locomotor y cirugías ortopédicas complejas.',
    fotoPerfil: null,
  },
  'alexis.bello@clinica.com': {
    correo: 'alexis.bello@clinica.com', password: 'alexis123', rol: 'doctor',
    nombre: 'Dr. Bello Sedano Alexis Gustavo', especialidad: 'Cardiología', cmp: '059000',
    telefono: '999001004', education: 'Universidad Nacional Mayor de San Marcos',
    experience: '15 años de experiencia en el tratamiento de hipertensión y cardiopatías.',
    description: 'Médico cardiólogo enfocado en cardiología clínica, ecocardiografía y arritmias.',
    fotoPerfil: null,
  },
  'josue.aliaga@clinica.com': {
    correo: 'josue.aliaga@clinica.com', password: 'josue123', rol: 'doctor',
    nombre: 'Dr. Aliaga Ramos Josue', especialidad: 'Gastroenterología', cmp: '065081',
    telefono: '999001005', education: 'Universidad Nacional de San Agustín',
    experience: '7 años de experiencia tratando reflujo y patologías gástricas.',
    description: 'Especialista en diagnóstico de enfermedades digestivas, endoscopia y hepatología.',
    fotoPerfil: null,
  },
  'maria.chavez@clinica.com': {
    correo: 'maria.chavez@clinica.com', password: 'mariach123', rol: 'doctor',
    nombre: 'Dra. Chavez Blas Maria Angelica', especialidad: 'Ginecología', cmp: '031130',
    telefono: '999001006', education: 'Universidad Cayetano Heredia',
    experience: '14 años acompañando a mujeres en todas sus etapas.',
    description: 'Dedicada al cuidado de la salud femenina, control obstétrico y cirugía ginecológica.',
    fotoPerfil: null,
  },
  'orestes.licetti@clinica.com': {
    correo: 'orestes.licetti@clinica.com', password: 'orestes123', rol: 'doctor',
    nombre: 'Dr. Licetti Alzamora Orestes Ricardo', especialidad: 'Pediatría', cmp: '013816',
    telefono: '999001007', education: 'Universidad de San Martín de Porres',
    experience: '20 años dedicados al cuidado de los más pequeños de la familia.',
    description: 'Especialista en el desarrollo integral infantil, vacunación y control de niños.',
    fotoPerfil: null,
  },
  'alberto.florian@clinica.com': {
    correo: 'alberto.florian@clinica.com', password: 'alberto123', rol: 'doctor',
    nombre: 'Dr. Florian Chachapoyas Alberto Giancarlo', especialidad: 'Urología', cmp: '005703',
    telefono: '999001008', education: 'Universidad Nacional Federico Villarreal',
    experience: '9 años tratando afecciones renales y del sistema reproductivo masculino.',
    description: 'Experto en cirugía urológica, endourología y patologías de vías urinarias.',
    fotoPerfil: null,
  },
};

// ─────────────────────────────────────────────────────────────
//  USUARIOS DEL SISTEMA ELIMINADOS
//  DOCTORES_SISTEMA está hardcodeado en el código, así que para
//  poder "eliminar" a alguno de esos usuarios (doctores fijos o el
//  admin original) guardamos su correo en una lista de exclusión.
// ─────────────────────────────────────────────────────────────
export const getEliminadosSistema = async () => {
  try { const j = await AsyncStorage.getItem('sistema_eliminados'); return j ? JSON.parse(j) : []; }
  catch { return []; }
};
export const saveEliminadosSistema = async (lista) =>
  AsyncStorage.setItem('sistema_eliminados', JSON.stringify(lista));

export const eliminarUsuarioSistema = async (correo) => {
  const lista = await getEliminadosSistema();
  if (!lista.includes(correo)) {
    lista.push(correo);
    await saveEliminadosSistema(lista);
  }
};

export const restaurarUsuarioSistema = async (correo) => {
  const lista = await getEliminadosSistema();
  await saveEliminadosSistema(lista.filter(c => c !== correo));
};

/**
 * Devuelve los datos completos (nombre, correo, rol) de los usuarios
 * del sistema que fueron eliminados, para poder mostrarlos y restaurarlos.
 */
export const getEliminadosSistemaDetalle = async () => {
  const eliminados = await getEliminadosSistema();
  return eliminados
    .filter(correo => DOCTORES_SISTEMA[correo])
    .map(correo => DOCTORES_SISTEMA[correo]);
};

/**
 * Devuelve DOCTORES_SISTEMA filtrando los correos que el admin eliminó.
 */
const getSistemaActivo = async () => {
  const eliminados = await getEliminadosSistema();
  const activo = {};
  for (const [correo, datos] of Object.entries(DOCTORES_SISTEMA)) {
    if (!eliminados.includes(correo)) activo[correo] = datos;
  }
  return activo;
};

// ─────────────────────────────────────────────────────────────
//  PACIENTES
// ─────────────────────────────────────────────────────────────
export const getPacientes = async () => {
  try { const j = await AsyncStorage.getItem('pacientes'); return j ? JSON.parse(j) : {}; }
  catch { return {}; }
};
export const savePacientes = async (p) => AsyncStorage.setItem('pacientes', JSON.stringify(p));

/**
 * Crea un paciente manualmente (usado por el rol Administrador).
 * Devuelve { ok, msg } para que la pantalla muestre el resultado.
 */
export const crearPacienteManual = async ({ nombre, correo, password, telefono }) => {
  const c = correo.trim().toLowerCase();
  const eliminadosSistema = await getEliminadosSistema();

  if (DOCTORES_SISTEMA[c] && !eliminadosSistema.includes(c)) {
    return { ok: false, msg: 'Ese correo ya está registrado como administrador o doctor' };
  }
  const extraDoc = await getDoctoresExtra();
  if (extraDoc[c]) return { ok: false, msg: 'Ese correo ya está registrado como doctor' };
  const extraAdmin = await getAdminsExtra();
  if (extraAdmin[c]) return { ok: false, msg: 'Ese correo ya está registrado como administrador' };

  const pacientes = await getPacientes();
  if (pacientes[c]) return { ok: false, msg: 'Ya existe un paciente con ese correo' };

  pacientes[c] = {
    correo: c,
    password,
    rol: 'paciente',
    nombre: nombre.trim(),
    telefono: telefono?.trim() || '',
    fechaRegistro: new Date().toLocaleDateString('es-PE'),
    fotoPerfil: null,
  };
  await savePacientes(pacientes);
  return { ok: true };
};

// ─────────────────────────────────────────────────────────────
//  DOCTORES EXTRA
// ─────────────────────────────────────────────────────────────
export const getDoctoresExtra = async () => {
  try { const j = await AsyncStorage.getItem('doctores_extra'); return j ? JSON.parse(j) : {}; }
  catch { return {}; }
};
export const saveDoctoresExtra = async (d) => AsyncStorage.setItem('doctores_extra', JSON.stringify(d));

export const getTodosDoctores = async () => {
  const extra = await getDoctoresExtra();
  const sistemaActivo = await getSistemaActivo();
  const sistema = Object.values(sistemaActivo).filter(u => u.rol === 'doctor');
  return [...sistema, ...Object.values(extra)];
};

// ─────────────────────────────────────────────────────────────
//  ADMINISTRADORES EXTRA
//  (El admin "admi@clinica.com" viene hardcodeado en DOCTORES_SISTEMA;
//   estos son los administradores adicionales creados desde la app)
// ─────────────────────────────────────────────────────────────
export const getAdminsExtra = async () => {
  try { const j = await AsyncStorage.getItem('admins_extra'); return j ? JSON.parse(j) : {}; }
  catch { return {}; }
};
export const saveAdminsExtra = async (a) => AsyncStorage.setItem('admins_extra', JSON.stringify(a));

export const getTodosAdmins = async () => {
  const extra = await getAdminsExtra();
  const sistemaActivo = await getSistemaActivo();
  const sistema = Object.values(sistemaActivo).filter(u => u.rol === 'admin');
  return [...sistema, ...Object.values(extra)];
};

/**
 * Crea un nuevo administrador.
 */
export const crearAdminManual = async ({ nombre, correo, password, telefono }) => {
  const c = correo.trim().toLowerCase();
  const eliminadosSistema = await getEliminadosSistema();

  if (DOCTORES_SISTEMA[c] && !eliminadosSistema.includes(c)) {
    return { ok: false, msg: 'Ese correo ya está registrado en el sistema' };
  }
  const extraDoc = await getDoctoresExtra();
  if (extraDoc[c]) return { ok: false, msg: 'Ese correo ya está registrado como doctor' };
  const pacientes = await getPacientes();
  if (pacientes[c]) return { ok: false, msg: 'Ese correo ya está registrado como paciente' };
  const extraAdmin = await getAdminsExtra();
  if (extraAdmin[c]) return { ok: false, msg: 'Ya existe un administrador con ese correo' };

  extraAdmin[c] = {
    correo: c,
    password,
    rol: 'admin',
    nombre: nombre.trim(),
    telefono: telefono?.trim() || '',
  };
  await saveAdminsExtra(extraAdmin);
  return { ok: true };
};

export const eliminarAdminExtra = async (correo) => {
  const extra = await getAdminsExtra();
  delete extra[correo];
  await saveAdminsExtra(extra);
};

// ─────────────────────────────────────────────────────────────
//  PERFIL DOCTOR LOCAL
// ─────────────────────────────────────────────────────────────
export const getPerfilDoctor = async (correo) => {
  try { const j = await AsyncStorage.getItem(`perfil_doctor_${correo}`); return j ? JSON.parse(j) : null; }
  catch { return null; }
};
export const savePerfilDoctor = async (correo, datos) =>
  AsyncStorage.setItem(`perfil_doctor_${correo}`, JSON.stringify(datos));

// ─────────────────────────────────────────────────────────────
//  CITAS
// ─────────────────────────────────────────────────────────────
export const getCitas = async () => {
  try { const j = await AsyncStorage.getItem('citas_global'); return j ? JSON.parse(j) : []; }
  catch { return []; }
};
export const saveCitas = async (c) => AsyncStorage.setItem('citas_global', JSON.stringify(c));
export const agregarCita = async (cita) => {
  const citas = await getCitas();
  const nueva = { id: String(Date.now()), ...cita, estado: 'pendiente', notificationId: null };
  await saveCitas([...citas, nueva]);
  return nueva;
};

/**
 * Guarda el ID de la notificación programada (recordatorio) asociada a una cita.
 */
export const guardarNotificationIdCita = async (id, notificationId) => {
  const citas = await getCitas();
  const idx = citas.findIndex(c => c.id === id);
  if (idx !== -1) { citas[idx].notificationId = notificationId; await saveCitas(citas); }
};

export const actualizarEstadoCita = async (id, estado) => {
  const citas = await getCitas();
  const idx = citas.findIndex(c => c.id === id);
  if (idx !== -1) { citas[idx].estado = estado; await saveCitas(citas); }
};
export const eliminarCita = async (id) => {
  const citas = await getCitas();
  const cita = citas.find(c => c.id === id);
  await saveCitas(citas.filter(c => c.id !== id));
  return cita; // se devuelve para poder cancelar su notificación desde la pantalla
};

// ─────────────────────────────────────────────────────────────
//  SESIÓN
// ─────────────────────────────────────────────────────────────
export const setSesion = async (u) => AsyncStorage.setItem('sesion_usuario', JSON.stringify(u));
export const getSesion = async () => {
  try { const j = await AsyncStorage.getItem('sesion_usuario'); return j ? JSON.parse(j) : null; }
  catch { return null; }
};
export const cerrarSesion = async () => AsyncStorage.removeItem('sesion_usuario');

// ─────────────────────────────────────────────────────────────
//  LOGIN UNIFICADO
// ─────────────────────────────────────────────────────────────
export const login = async (correo, password) => {
  const c = correo.trim().toLowerCase();

  // 1. Admin y doctores del sistema (si no fueron eliminados por otro admin)
  const eliminadosSistema = await getEliminadosSistema();
  if (DOCTORES_SISTEMA[c] && !eliminadosSistema.includes(c)) {
    const u = DOCTORES_SISTEMA[c];
    if (u.password !== password) return { ok: false, msg: 'Contraseña incorrecta' };
    const perfilLocal = await getPerfilDoctor(c);
    return { ok: true, usuario: perfilLocal ? { ...u, ...perfilLocal } : { ...u } };
  }

  // 2. Doctores extra
  const extra = await getDoctoresExtra();
  if (extra[c]) {
    const u = extra[c];
    if (u.password !== password) return { ok: false, msg: 'Contraseña incorrecta' };
    const perfilLocal = await getPerfilDoctor(c);
    return { ok: true, usuario: perfilLocal ? { ...u, ...perfilLocal } : { ...u } };
  }

  // 2b. Administradores extra (creados desde la app)
  const adminsExtra = await getAdminsExtra();
  if (adminsExtra[c]) {
    const u = adminsExtra[c];
    if (u.password !== password) return { ok: false, msg: 'Contraseña incorrecta' };
    return { ok: true, usuario: { ...u } };
  }

  // 3. Pacientes — lógica dual: AsyncStorage primero, Firebase para detectar reset
  const pacientes = await getPacientes();
  if (!pacientes[c]) return { ok: false, msg: 'Este correo no está registrado' };

  // 3a. Si la contraseña coincide con AsyncStorage → login directo sin tocar Firebase
  if (pacientes[c].password === password) {
    return { ok: true, usuario: { ...pacientes[c] } };
  }

  // 3b. La contraseña NO coincide con AsyncStorage → puede que la haya cambiado
  //     via Firebase (recuperación). Verificar con Firebase Auth.
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { auth } = await import('./firebase');
    await signInWithEmailAndPassword(auth, c, password);

    // Firebase aceptó la contraseña nueva → sincronizar en AsyncStorage
    pacientes[c].password = password;
    await savePacientes(pacientes);
    return { ok: true, usuario: { ...pacientes[c] } };
  } catch (firebaseError) {
    // Firebase también la rechazó → contraseña realmente incorrecta
    await registrarLog('storage.login', `Intento de login fallido (Firebase) para ${c}`, 'advertencia', firebaseError.code);
    return { ok: false, msg: 'Contraseña incorrecta' };
  }
};
