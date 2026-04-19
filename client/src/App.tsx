import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import SetPasswordPage from "./pages/SetPasswordPage";
import EmployerHomePage from "./pages/employer/EmployerHomePage";
import EmployerEmployeesPage from "./pages/employer/EmployerEmployeesPage";
import EmployerTrainingPage from "./pages/employer/EmployerTrainingPage";
import EmployerProgressPage from "./pages/employer/EmployerProgressPage";
import EmployerFolderPage from "./pages/employer/EmployerFolderPage";
import EmployerCategoryPage from "./pages/employer/EmployerCategoryPage";
import EmployeeCategoryPage from "./pages/employee/EmployeeCategoryPage";
import EmployeeFolderPage from "./pages/employee/EmployeeFolderPage";
import EmployeeVideoPage from "./pages/employee/EmployeeVideoPage";
import EmployeeQuizPage from "./pages/employee/EmployeeQuizPage";
import AdminHomePage from "./pages/admin/AdminHomePage";
import AdminBusinessesPage from "./pages/admin/AdminBusinessesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSearchPage from "./pages/admin/AdminSearchPage";
import AdminBusinessDetailPage from "./pages/admin/AdminBusinessDetailPage";
import AdminSubscriptionRequestsPage from "./pages/admin/AdminSubscriptionRequestsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminActiveUsersPage from "./pages/admin/AdminActiveUsersPage";
import AdminInactiveUsersPage from "./pages/admin/AdminInactiveUsersPage";
import SupportPage from "./pages/SupportPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AdminCreateSupportAdminPage from "./pages/admin/AdminCreateSupportAdminPage";

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-950 text-white">
                <Navbar />

                <main>
                    <Routes>
                        <Route path="/" element={<WelcomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/set-password/:token" element={<SetPasswordPage />} />

                        <Route
                            path="/employer"
                            element={
                                <ProtectedRoute allowedRoles={["employer"]}>
                                    <EmployerHomePage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employer/employees"
                            element={
                                <ProtectedRoute allowedRoles={["employer"]}>
                                    <EmployerEmployeesPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employer/training"
                            element={
                                <ProtectedRoute allowedRoles={["employer"]}>
                                    <EmployerTrainingPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employer/progress"
                            element={
                                <ProtectedRoute allowedRoles={["employer"]}>
                                    <EmployerProgressPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employee"
                            element={
                                <ProtectedRoute allowedRoles={["employee"]}>
                                    <EmployeeDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employer/training/category/:id"
                            element={
                                <ProtectedRoute allowedRoles={["employer"]}>
                                    <EmployerCategoryPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employer/training/folder/:id"
                            element={
                                <ProtectedRoute allowedRoles={["employer"]}>
                                    <EmployerFolderPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/employee/category/:id"
                            element={
                                <ProtectedRoute allowedRoles={["employee"]}>
                                    <EmployeeCategoryPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employee/folder/:id"
                            element={
                                <ProtectedRoute allowedRoles={["employee"]}>
                                    <EmployeeFolderPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/employee/video/:id"
                            element={
                                <ProtectedRoute allowedRoles={["employee"]}>
                                    <EmployeeVideoPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/employee/quiz/:id" element={<EmployeeQuizPage />} />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute allowedRoles={["super_admin", "support_admin"]}>
                                    <AdminHomePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/businesses"
                            element={
                                <ProtectedRoute allowedRoles={["super_admin", "support_admin"]}>
                                    <AdminBusinessesPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute allowedRoles={["super_admin", "support_admin"]}>
                                    <AdminUsersPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/admin/search" element={<AdminSearchPage />} />

                        <Route
                            path="/admin/businesses/:id"
                            element={
                                <ProtectedRoute allowedRoles={["super_admin", "support_admin"]}>
                                    <AdminBusinessDetailPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/search"
                            element={
                                <ProtectedRoute allowedRoles={["super_admin", "support_admin"]}>
                                    <AdminSearchPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/subscription-requests"
                            element={
                                <ProtectedRoute allowedRoles={["super_admin", "support_admin"]}>
                                    <AdminSubscriptionRequestsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route
                            path="/admin/users/active"
                            element={
                                <ProtectedRoute allowedRoles={["super_admin", "support_admin"]}>
                                    <AdminActiveUsersPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/users/inactive"
                            element={
                                <ProtectedRoute allowedRoles={["super_admin", "support_admin"]}>
                                    <AdminInactiveUsersPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/support" element={<SupportPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route
                            path="/admin/create-admin"
                            element={
                                <ProtectedRoute allowedRoles={["super_admin"]}>
                                    <AdminCreateSupportAdminPage />
                                </ProtectedRoute>
                            }
                        />

                    </Routes>


                </main>

                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;