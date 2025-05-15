import { BrowserRouter } from "react-router-dom";
import AppRoutes from "../routes/AppRoutes";
import { AuthProvider } from "../contexts/AuthContext";
import RouteErrorBoundary from "../components/error/RouteErrorBoundary";

/**
 * Main router component that wraps the entire application
 * Provides routing context and error handling
 */
const Router = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteErrorBoundary>
          <AppRoutes />
        </RouteErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
