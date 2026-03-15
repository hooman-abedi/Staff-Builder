import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/employer" element={<EmployerDashboard />} />
                <Route path="/employee" element={<EmployeeDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;