import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import RouteErrorBoundary from "./components/error/RouteErrorBoundary";
import store from "./store";
import { Toaster } from "react-hot-toast"; 

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <RouteErrorBoundary>
          <AuthProvider>
            <AppRoutes />
            <Toaster position="top-right" reverseOrder={false} /> 
          </AuthProvider>
        </RouteErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
