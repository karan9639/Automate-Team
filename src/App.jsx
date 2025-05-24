import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import RouteErrorBoundary from "./components/error/RouteErrorBoundary";
import store from "./store";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <RouteErrorBoundary>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </RouteErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
