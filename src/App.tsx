import { Routes, Route, Navigate } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import StaffGuard from "./components/StaffGuard";
import ErrorBoundary from "./components/ErrorBoundary";
import HomePage from "./pages/wegn/HomePage";
import ProductsPage from "./pages/wegn/ProductsPage";
import QRWegnProductPage from "./pages/wegn/products/QRWegnProductPage";
import WegnStoreProductPage from "./pages/wegn/products/WegnStoreProductPage";
import QRBookerProductPage from "./pages/wegn/products/QRBookerProductPage";
import IndustriesPage from "./pages/wegn/IndustriesPage";
import WegnPricingPage from "./pages/wegn/PricingPage";
import PartnersPage from "./pages/wegn/PartnersPage";
import ContactPage from "./pages/wegn/ContactPage";
import AboutPage from "./pages/wegn/AboutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import ScanPage from "./pages/ScanPage";
import ScanLandingPage from "./pages/ScanLandingPage";
import SuccessPage from "./pages/SuccessPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import StaffLoginPage from "./pages/StaffLoginPage";
import StaffFloorPage from "./pages/StaffFloorPage";
import CashierPage from "./pages/CashierPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SupportRequestPage from "./pages/SupportRequestPage";
import DemoDashboardPage from "./pages/DemoDashboardPage";

// Placeholders — replace with real pages as they are built
const Placeholder = ({ name }: { name: string }) => (
  <div style={{ background: "#080808", minHeight: "100vh", color: "#666", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", fontSize: 14 }}>
    {name} — coming soon
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Public — WEGN marketing site */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/qrwegn" element={<QRWegnProductPage />} />
      <Route path="/products/wegn-store" element={<WegnStoreProductPage />} />
      <Route path="/products/qrbooker" element={<QRBookerProductPage />} />
      <Route path="/industries" element={<IndustriesPage />} />
      <Route path="/pricing" element={<WegnPricingPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Public — QRWegn product */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/staff-login" element={<StaffLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/support-request" element={<SupportRequestPage />} />
      <Route path="/onboarding" element={<Placeholder name="OnboardingPage" />} />
      <Route path="/onboarding-complete" element={<Placeholder name="OnboardingComplete" />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/help" element={<Placeholder name="HelpPage" />} />
      <Route path="/terms" element={<Placeholder name="TermsPage" />} />
      <Route path="/privacy" element={<Placeholder name="PrivacyPage" />} />
      <Route path="/cookies" element={<Placeholder name="CookiePolicyPage" />} />
      <Route path="/acceptable-use" element={<Placeholder name="AcceptableUsePage" />} />
      <Route path="/accessibility" element={<Placeholder name="AccessibilityPage" />} />
      <Route path="/scan/:bizSlug" element={<ScanLandingPage />} />
      <Route path="/scan/:bizId/:locationId" element={<ScanPage />} />
      <Route path="/book/:slug" element={<Placeholder name="BookingPage" />} />
      <Route path="/demo" element={<DemoDashboardPage />} />

      {/* Owner-protected */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <ErrorBoundary>
              <DashboardPage />
            </ErrorBoundary>
          </AuthGuard>
        }
      />
      <Route
        path="/admin"
        element={
          <AuthGuard>
            <AdminPage />
          </AuthGuard>
        }
      />
      <Route
        path="/settings"
        element={
          <AuthGuard>
            <Placeholder name="SettingsPage" />
          </AuthGuard>
        }
      />
      <Route
        path="/qr"
        element={
          <AuthGuard>
            <Placeholder name="QRGeneratorPage" />
          </AuthGuard>
        }
      />
      <Route
        path="/menu"
        element={
          <AuthGuard>
            <Placeholder name="MenuPage" />
          </AuthGuard>
        }
      />

      {/* Staff-protected */}
      <Route
        path="/staff"
        element={
          <StaffGuard>
            <StaffDashboardPage />
          </StaffGuard>
        }
      />
      <Route
        path="/staff/floor"
        element={
          <StaffGuard>
            <StaffFloorPage />
          </StaffGuard>
        }
      />
      <Route
        path="/cashier"
        element={
          <StaffGuard>
            <CashierPage />
          </StaffGuard>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}