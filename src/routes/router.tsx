import { createHashRouter, RouterProvider } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import BiblePage from '../pages/Bible/BiblePage';
import SongsPage from '../pages/Songs/SongsPage';
import PlannerPage from '../pages/Planner/PlannerPage';
import SettingsPage from '../pages/Settings/SettingsPage';
import PresenterConsole from '../components/presentation/PresenterConsole';
import PresentationDisplay from '../components/presentation/PresentationDisplay';

const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'bible', element: <BiblePage /> },
      { path: 'songs', element: <SongsPage /> },
      { path: 'planner', element: <PlannerPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  },
  {
    // Main window: presenter's control console (current/next preview, controls, keyboard shortcuts)
    path: '/presenter',
    element: <PresenterConsole />
  },
  {
    // Secondary display window only: pure audience-facing output, no controls
    path: '/presentation',
    element: <PresentationDisplay />
  }
]);

export function Router() {
  return <RouterProvider router={router} />;
}
