import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import MapView from './pages/MapView';
import Hospitals from './pages/Hospitals';
import Teams from './pages/Teams';
import AdminDashboard from './pages/AdminDashboard';
import DemoControls from './pages/DemoControls';
import FieldTasks from './pages/FieldTasks';
import IncidentReports from './pages/IncidentReports';
import Dams from './pages/Dams';
import MobileResponderPage from './pages/MobileResponderPage';
import ResQCopilot from './components/AICopilot/ResQCopilot';
import CriticalDisasterAlert from './components/CriticalDisasterAlert';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mobile" element={<MobileResponderPage />} />
            <Route path="/responder" element={<MobileResponderPage />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/tasks" element={<FieldTasks />} />
            <Route path="/field-tasks" element={<FieldTasks />} />
            <Route path="/missions" element={<FieldTasks />} />
            <Route path="/dams" element={<Dams />} />
            <Route path="/reports" element={<IncidentReports />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/demo" element={<DemoControls />} />
            {/* Redirect any legacy telemetry or business URLs directly to active operations */}
            <Route path="/telemetry" element={<Navigate to="/dams" replace />} />
            <Route path="/business" element={<Navigate to="/reports" replace />} />
            <Route path="/impact" element={<Navigate to="/reports" replace />} />
          </Routes>
          <CriticalDisasterAlert />
        </Layout>
        <ResQCopilot />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
