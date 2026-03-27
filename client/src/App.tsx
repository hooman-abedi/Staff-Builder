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
                                <ProtectedRoute allowedRole="employer">
                                    <EmployerHomePage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employer/employees"
                            element={
                                <ProtectedRoute allowedRole="employer">
                                    <EmployerEmployeesPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employer/training"
                            element={
                                <ProtectedRoute allowedRole="employer">
                                    <EmployerTrainingPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employer/progress"
                            element={
                                <ProtectedRoute allowedRole="employer">
                                    <EmployerProgressPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employee"
                            element={
                                <ProtectedRoute allowedRole="employee">
                                    <EmployeeDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employer/training/category/:id"
                            element={
                                <ProtectedRoute allowedRole="employer">
                                    <EmployerCategoryPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employer/training/folder/:id"
                            element={
                                <ProtectedRoute allowedRole="employer">
                                    <EmployerFolderPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/employee/category/:id"
                            element={
                                <ProtectedRoute allowedRole="employee">
                                    <EmployeeCategoryPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/employee/folder/:id"
                            element={
                                <ProtectedRoute allowedRole="employee">
                                    <EmployeeFolderPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/employee/video/:id"
                            element={
                                <ProtectedRoute allowedRole="employee">
                                    <EmployeeVideoPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/employee/quiz/:id" element={<EmployeeQuizPage />} />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute allowedRole="super_admin">
                                    <AdminHomePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/businesses"
                            element={
                                <ProtectedRoute allowedRole="super_admin">
                                    <AdminBusinessesPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute allowedRole="super_admin">
                                    <AdminUsersPage />
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