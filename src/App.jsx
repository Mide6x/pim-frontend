import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Register from "./Auth/Register";
import Login from "./Auth/Login";
import Dashboard from "./pages/Dashboard";
import ProductDetails from "./pages/details/ProductDetails";
import useAuth from "./contexts/useAuth";
import UploadTab from "./pages/UploadTab";
import Approval from "./pages/Approval";
import Images from "./pages/Images";
import MngManufacturers from "./pages/MngManufacturers";
import ManufacturerDetails from "./pages/details/ManufacturerDetails";
import Categories from "./pages/Categories";
import CategoryDetails from "./pages/details/CategoryDetails";
import Variants from "./pages/Variants";
import Sidebar from "./pages/sidebar/Sidebar";
import Topbar from "./pages/sidebar/Topbar";

const App = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/";

  return (
     <div className={isAuthPage ? "authbody" : "container"}>
      {!isAuthPage && <Sidebar />}
      <div className={isAuthPage ? "" : "fullcontent"}>
        {!isAuthPage && <Topbar />}
        <div className={isAuthPage ? "" : "content"}>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
              }
            />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
              path="/dashboard/*"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
            />
             <Route
              path="/products/:id"
              element={isAuthenticated ? <ProductDetails /> : <Navigate to="/" />}
            />
            <Route
              path="/uploadtab/*"
              element={isAuthenticated ? <UploadTab /> : <Navigate to="/" />}
            />
            <Route
              path="/categories/*"
              element={isAuthenticated ? <Categories /> : <Navigate to="/" />}
            />
            <Route
              path="/categories/:id"
              element={isAuthenticated ? <CategoryDetails /> : <Navigate to="/" />}
            />
            <Route
              path="/approval/*"
              element={isAuthenticated ? <Approval /> : <Navigate to="/" />}
            />
            <Route
              path="/mngmanufacturers/*"
              element={isAuthenticated ? <MngManufacturers /> : <Navigate to="/" />}
            />
            <Route
              path="/manufacturers/:id"
              element={isAuthenticated ? <ManufacturerDetails /> : <Navigate to="/" />}
            />
            <Route
              path="/images/*"
              element={isAuthenticated ? <Images /> : <Navigate to="/" />}
            />
            <Route
              path="/variants/*"
              element={isAuthenticated ? <Variants /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
