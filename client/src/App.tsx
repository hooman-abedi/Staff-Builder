import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import SetPasswordPage from "./pages/SetPasswordPage";

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
                                    <EmployerDashboard />
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
                    </Routes>
                </main>

                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;