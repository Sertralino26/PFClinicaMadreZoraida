import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Warning esperado en Expo Go (SDK 53+): las notificaciones push remotas
// no están disponibles ahí, pero nosotros solo usamos notificaciones locales.
// Se silencia para que no dispare el overlay rojo (LogBox) y el parpadeo visual.
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications (remote notifications)',
]);

// ── AUTENTICACIÓN ──────────────────────────────────────────────
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

// ── PACIENTE ───────────────────────────────────────────────────
import HomeScreen from './screens/HomeScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import AppointmentScreen from './screens/AppointmentScreen';
import MyAppointmentsScreen from './screens/MyAppointmentsScreen';
import DoctorsScreen from './screens/DoctorsScreen';
import DoctorProfileScreen from './screens/DoctorProfileScreen';
import SedesScreen from './screens/SedesScreen';
import SedeDetalleScreen from './screens/SedeDetalleScreen';

// ── DOCTOR ─────────────────────────────────────────────────────
import DoctorHomeScreen from './screens/doctor/DoctorHomeScreen';
import DoctorPerfilScreen from './screens/doctor/DoctorPerfilScreen';

// ── ADMINISTRADOR ──────────────────────────────────────────────
import AdminHomeScreen from './screens/admin/AdminHomeScreen';
import AdminPacientesScreen from './screens/admin/AdminPacientesScreen';
import AdminDoctoresScreen from './screens/admin/AdminDoctoresScreen';
import AdminCitasScreen from './screens/admin/AdminCitasScreen';
import AdminAdministradoresScreen from './screens/admin/AdminAdministradoresScreen';
import AdminPapeleraScreen from './screens/admin/AdminPapeleraScreen';
import AdminLogsScreen from './screens/admin/AdminLogsScreen';
import AdminEstadisticasScreen from './screens/admin/AdminEstadisticasScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>

        {/* AUTENTICACIÓN */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* PACIENTE */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="Appointment" component={AppointmentScreen} />
        <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
        <Stack.Screen name="Doctors" component={DoctorsScreen} />
        <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
        <Stack.Screen name="Sedes" component={SedesScreen} />
        <Stack.Screen name="SedeDetalle" component={SedeDetalleScreen} />

        {/* DOCTOR */}
        <Stack.Screen name="DoctorHome" component={DoctorHomeScreen} />
        <Stack.Screen name="DoctorPerfil" component={DoctorPerfilScreen} />

        {/* ADMINISTRADOR */}
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        <Stack.Screen name="AdminPacientes" component={AdminPacientesScreen} />
        <Stack.Screen name="AdminDoctores" component={AdminDoctoresScreen} />
        <Stack.Screen name="AdminCitas" component={AdminCitasScreen} />
        <Stack.Screen name="AdminAdministradores" component={AdminAdministradoresScreen} />
        <Stack.Screen name="AdminPapelera" component={AdminPapeleraScreen} />
        <Stack.Screen name="AdminLogs" component={AdminLogsScreen} />
        <Stack.Screen name="AdminEstadisticas" component={AdminEstadisticasScreen} />

      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
