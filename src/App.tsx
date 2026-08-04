import { Routes, Route, Navigate } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import StaffGuard from "./components/StaffGuard";
import ErrorBoundary from "./components/ErrorBoundary";

import HomePage from "./pages/wegn/HomePage";
import ProductsPage from "./pages/wegn/ProductsPage";
import WegnRestaurantsProductPage from "./pages/wegn/products/WegnRestaurantsProductPage";
import WegnStoreProductPage from "./pages/wegn/products/WegnStoreProductPage";
import WegnAppointmentsProductPage from "./pages/wegn/products/WegnAppointmentsProductPage";
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

import PrivacyPolicyPage from "./pages/wegn/legal/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/wegn/legal/TermsOfServicePage";
import CookiePolicyPage from "./pages/wegn/legal/CookiePolicyPage";
import AcceptableUsePage from "./pages/wegn/legal/AcceptableUsePage";
import AccessibilityStatementPage from "./pages/wegn/legal/AccessibilityStatementPage";

const Placeholder = ({ name }: { name: string }) => (
  <div
    style={{
      background: "#080808",
      minHeight: "100vh",
      color: "#666",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      fontSize: 14,
    }}
  >
    {name} — coming soon
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Public — WEGN ecosystem marketing site */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route
        path="/products/wegn-restaurants"
        element={<WegnRestaurantsProductPage />}
      />
      <Route
        path="/products/qrwegn"
        element={<Navigate to="/products/wegn-restaurants" replace />}
      />
      <Route
        path="/products/wegn-store"
        element={<WegnStoreProductPage />}
      />
      <Route
        path="/products/wegn-appointments"
        element={<WegnAppointmentsProductPage />}
      />
      <Route
        path="/products/qrbooker"
        element={<Navigate to="/products/wegn-appointments" replace />}
      />
      <Route path="/industries" element={<IndustriesPage />} />
      <Route path="/pricing" element={<WegnPricingPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Public — WEGN Restaurants */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/staff-login" element={<StaffLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/support-request" element={<SupportRequestPage />} />
      <Route
        path="/onboarding"
        element={<Placeholder name="OnboardingPage" />}
      />
      <Route
        path="/onboarding-complete"
        element={<Placeholder name="OnboardingComplete" />}
      />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/help" element={<Placeholder name="HelpPage" />} />
      <Route path="/scan/:bizSlug" element={<ScanLandingPage />} />
      <Route path="/scan/:bizId/:locationId" element={<ScanPage />} />
      <Route path="/demo" element={<DemoDashboardPage />} />

      {/* Legal */}
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/cookies" element={<CookiePolicyPage />} />
      <Route path="/acceptable-use" element={<AcceptableUsePage />} />
      <Route
        path="/accessibility"
        element={<AccessibilityStatementPage />}
      />

      {/* Future WEGN Appointments booking route */}
      <Route path="/book/:slug" element={<Placeholder name="BookingPage" />} />

      {/* Owner-protected — WEGN Restaurants */}
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

      {/* Staff-protected — WEGN Restaurants */}
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