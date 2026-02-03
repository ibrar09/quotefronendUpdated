// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";


// 🔹 Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

// 🔹 Lazy Load Pages for Performance
const DashboardLayout = lazy(() => import("./pages/Dashboard"));
const Dashboard = lazy(() => import("./pages/Dashboardcom"));
const NewQuotation = lazy(() => import("./modules/Quotations/NewQuotation"));
const QuotationList = lazy(() => import("./modules/Quotations/QuotationList"));
const SendQuotation = lazy(() => import("./modules/Quotations/SendQuotation"));
const QuotationIntake = lazy(() => import("./modules/Quotations/QuotationIntake"));
const IntakeList = lazy(() => import("./modules/Quotations/IntakeList"));
const WorkList = lazy(() => import("./modules/Work/WorkList"));
const QuotationPrintView = lazy(() => import("./modules/Quotations/QuotationPrintView"));
const DataSync = lazy(() => import("./modules/Admin/DataSync"));
const MasterData = lazy(() => import("./modules/Admin/MasterData"));
const PriceList = lazy(() => import("./modules/Admin/PriceList"));
const CustomPriceList = lazy(() => import("./modules/Admin/CustomPriceList"));
const CustomStores = lazy(() => import("./modules/Admin/CustomStores"));
const UserManagement = lazy(() => import("./modules/Admin/UserManagement"));
const RecycleBin = lazy(() => import("./pages/RecycleBin"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard")); // [NEW]
const ProfilePage = lazy(() => import("./pages/ProfilePage")); // [NEW]
const UserLayout = lazy(() => import("./modules/UserPortal/layouts/UserLayout"));
const FieldDashboard = lazy(() => import("./modules/UserPortal/pages/FieldDashboard"));
const FieldJobList = lazy(() => import("./modules/UserPortal/pages/FieldJobList"));
const FieldJobDetail = lazy(() => import("./modules/UserPortal/pages/FieldJobDetail"));
const FieldChat = lazy(() => import("./modules/UserPortal/pages/FieldChat"));
const FieldProfile = lazy(() => import("./modules/UserPortal/pages/FieldProfile"));
const HumanResourcesRoutes = lazy(() => import("./modules/HumanResources/Routes"));
const FieldOperationsRoutes = lazy(() => import("./modules/FieldOperations/Routes")); // [NEW] Field Ops Module
const ModuleSelection = lazy(() => import("./pages/ModuleSelection"));
const EmployeHome = lazy(() => import("./modules/Employes/pages/EmployeHome"));

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/selection" element={
                <ProtectedRoute>
                  <ModuleSelection />
                </ProtectedRoute>
              } />


              {/* Standalone PDF View (No Sidebar) - Protected? Yes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/quotations/print-view/:id" element={<QuotationPrintView />} />
              </Route>

              {/* Dashboard Layout - Protected */}
              <Route path="/" element={<ProtectedRoute />}>

                {/* Dashboard Routes - require view_dashboard permission */}
                <Route element={<ProtectedRoute requiredPermission="view_dashboard" />}>
                  <Route element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                  </Route>
                </Route>

                {/* Quotation Routes - require view_quote permission */}
                <Route element={<ProtectedRoute requiredPermission="view_quote" />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="quotations/list" element={<QuotationList />} />
                    <Route path="quotations/new" element={<QuotationIntake />} />
                    <Route path="quotations/intakes" element={<IntakeList />} />
                    <Route path="quotations/new-quotation" element={<NewQuotation />} />
                    <Route path="quotations/send/:id" element={<SendQuotation />} />
                    <Route path="work/list" element={<WorkList />} />
                  </Route>
                </Route>

                {/* Admin Routes - require manage_users permission */}
                <Route element={<ProtectedRoute requiredPermission="manage_users" />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="admin/data-sync" element={<DataSync />} />
                    <Route path="admin/users" element={<UserManagement />} />
                    <Route path="admin/custom-stores" element={<CustomStores />} />
                    <Route path="admin/custom-pricelist" element={<CustomPriceList />} />
                    <Route path="master-data" element={<MasterData />} />
                    <Route path="rate-card" element={<PriceList />} />
                  </Route>
                </Route>

                {/* Recycle Bin - require delete_quote permission */}
                <Route element={<ProtectedRoute requiredPermission="delete_quote" />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="recycle-bin" element={<RecycleBin />} />
                  </Route>
                </Route>

                {/* Employee Routes - require view_employees permission */}
                <Route element={<ProtectedRoute requiredPermission="view_employees" />}>
                  <Route path="employes/*" element={<EmployeHome />} />
                </Route>

                {/* Field Operations Routes - require view_field_ops permission */}
                <Route element={<ProtectedRoute requiredPermission="view_field_ops" />}>
                  <Route path="field-ops/*" element={<FieldOperationsRoutes />} />
                </Route>

                {/* User Portal Routes - require access_portal permission */}
                <Route element={<ProtectedRoute requiredPermission="access_portal" />}>
                  <Route path="user" element={<UserLayout />}>
                    <Route index element={<FieldDashboard />} />
                    <Route path="dashboard" element={<FieldDashboard />} />
                    <Route path="home" element={<FieldDashboard />} />
                    <Route path="jobs" element={<FieldJobList />} />
                    <Route path="jobs/:id" element={<FieldJobDetail />} />
                    <Route path="hr/*" element={<HumanResourcesRoutes />} />
                    <Route path="chat" element={<FieldChat />} />
                    <Route path="profile" element={<FieldProfile />} />
                  </Route>
                </Route>

              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </Router >
  );
}

export default App;
