import { Stack } from 'expo-router';
import { Colors } from '../../constants/colors';
import AdminGate from '../../components/admin/AdminGate';

export default function AdminLayout() {
  return (
    <AdminGate>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.navy } }} />
    </AdminGate>
  );
}
