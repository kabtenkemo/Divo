import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
const Scan = lazy(() => import('./pages/Scan'));
const GuestScan = lazy(() => import('./pages/GuestScan'));
import Admins from './pages/Admins';
import QrCards from './pages/QrCards';

function Loader() {
  return (
    <div className="empty">
      <span className="big">⏳</span> جارٍ تحميل صفحة المسح…
    </div>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/guest"
        element={
          <Suspense fallback={<Loader />}>
            <GuestScan />
          </Suspense>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route
          path="scan"
          element={
            <Suspense fallback={<Loader />}>
              <Scan />
            </Suspense>
          }
        />
        <Route path="admins" element={<Admins />} />
        <Route path="qrcards" element={<QrCards />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}