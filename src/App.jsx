import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import RouteErrorBoundary from "./components/error/RouteErrorBoundary";

function App() {
  return (
    <BrowserRouter>
      <RouteErrorBoundary>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
