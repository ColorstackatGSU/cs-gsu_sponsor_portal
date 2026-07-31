import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Activate from './pages/Activate';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="activate" element={<Activate />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/:invoiceNumber" element={<InvoiceDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
