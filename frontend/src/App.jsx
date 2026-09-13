import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import MyEnquiries from "./pages/MyEnquiries";
import Notifications from "./pages/Notifications";

import ListProperty from "./pages/ListProperty";
import MyProperties from "./pages/MyProperties";
import Leads from "./pages/Leads";

import MyProjects from "./pages/MyProjects";
import AddProject from "./pages/AddProject";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import EditProperty from "./pages/EditProperty"; 
import SellerEnquiries from "./pages/SellerEnquiries";
import SellerVisits from "./pages/SellerVisits";
import MyVisits from "./pages/MyVisits";
import EnquiryChat from "./pages/EnquiryChat";
import Search from "./pages/Search";
import ProjectDetails from "./pages/ProjectDetails";
import EditProject from "./pages/EditProject";
import Projects from "./pages/Projects";

function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route path="/seller-enquiries" element={<ProtectedRoute allowedRoles={["Seller"]}><SellerEnquiries /></ProtectedRoute>} />
        <Route
  path="/edit-property/:id"
  element={
    <ProtectedRoute
      allowedRoles={["Seller"]}
    >
      <EditProperty />
    </ProtectedRoute>
  }
/>

<Route path="/enquiries/:id/chat" element={<ProtectedRoute allowedRoles={["Buyer","Seller"]}><EnquiryChat /></ProtectedRoute>} />
        <Route path="/search" element={<Search />} />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route path="/my-visits" element={<ProtectedRoute allowedRoles={["Buyer"]}><MyVisits /></ProtectedRoute>} />

        <Route
          path="/properties"
          element={<Properties />}
        />

        <Route path="/seller-visits" element={<ProtectedRoute allowedRoles={["Seller"]}><SellerVisits /></ProtectedRoute>} />

        <Route
          path="/properties/:id"
          element={<PropertyDetails />}
        />


        {/* =========================
            LOGGED-IN USERS
        ========================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* =========================
            BUYER
        ========================= */}

        <Route
          path="/favorites"
          element={
            <ProtectedRoute
              allowedRoles={["Buyer"]}
            >
              <Favorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-enquiries"
          element={
            <ProtectedRoute
              allowedRoles={["Buyer"]}
            >
              <MyEnquiries />
            </ProtectedRoute>
          }
        />


        {/* =========================
            SELLER
        ========================= */}

        <Route
          path="/list-property"
          element={
            <ProtectedRoute
              allowedRoles={["Seller"]}
            >
              <ListProperty />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-properties"
          element={
            <ProtectedRoute
              allowedRoles={["Seller"]}
            >
              <MyProperties />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leads"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Seller",
                "Developer",
              ]}
            >
              <Leads />
            </ProtectedRoute>
          }
        />


        {/* =========================
            DEVELOPER
        ========================= */}

        <Route
          path="/my-projects"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Developer",
              ]}
            >
              <MyProjects />
            </ProtectedRoute>
          }
        />

        <Route path="/projects/:id" element={<ProtectedRoute allowedRoles={["Developer"]}><ProjectDetails /></ProtectedRoute>} />
        <Route path="/edit-project/:id" element={<ProtectedRoute allowedRoles={["Developer"]}><EditProject /></ProtectedRoute>} />

        <Route
          path="/add-project"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Developer",
              ]}
            >
              <AddProject />
            </ProtectedRoute>
          }
        />
        <Route
  path="/projects"
  element={<Projects />}
/>


      </Routes>
      <Footer/>

    </BrowserRouter>
  );
}

export default App;