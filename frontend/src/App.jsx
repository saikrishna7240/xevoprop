import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Search from "./pages/Search";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Developers from "./pages/Developers";

// Protected pages
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import MyEnquiries from "./pages/MyEnquiries";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

import ListProperty from "./pages/ListProperty";
import MyProperties from "./pages/MyProperties";
import EditProperty from "./pages/EditProperty";

import SellerEnquiries from "./pages/SellerEnquiries";
import SellerVisits from "./pages/SellerVisits";
import MyVisits from "./pages/MyVisits";
import EnquiryChat from "./pages/EnquiryChat";
import Leads from "./pages/Leads";

import MyProjects from "./pages/MyProjects";
import AddProject from "./pages/AddProject";
import EditProject from "./pages/EditProject";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/properties"
          element={<Properties />}
        />

        <Route
          path="/properties/:id"
          element={<PropertyDetails />}
        />

        <Route
          path="/search"
          element={<Search />}
        />

        <Route
          path="/projects"
          element={<Projects />}
        />

        <Route
          path="/projects/:id"
          element={<ProjectDetails />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/developers"
          element={<Developers />}
        />


        {/* =====================================================
            GENERAL AUTHENTICATED ROUTES
        ===================================================== */}

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


        {/* =====================================================
            BUYER ROUTES
        ===================================================== */}

        <Route
          path="/favorites"
          element={
            <ProtectedRoute allowedRoles={["Buyer"]}>
              <Favorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-enquiries"
          element={
            <ProtectedRoute allowedRoles={["Buyer"]}>
              <MyEnquiries />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-visits"
          element={
            <ProtectedRoute allowedRoles={["Buyer"]}>
              <MyVisits />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            SELLER ROUTES
        ===================================================== */}

        <Route
          path="/list-property"
          element={
            <ProtectedRoute allowedRoles={["Seller"]}>
              <ListProperty />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-properties"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Seller",
                "Developer",
              ]}
            >
              <MyProperties />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-property/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Seller",
                "Developer",
              ]}
            >
              <EditProperty />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller-enquiries"
          element={
            <ProtectedRoute allowedRoles={["Seller"]}>
              <SellerEnquiries />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller-visits"
          element={
            <ProtectedRoute allowedRoles={["Seller"]}>
              <SellerVisits />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            ENQUIRY CHAT
        ===================================================== */}

        <Route
          path="/enquiries/:id/chat"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Buyer",
                "Seller",
              ]}
            >
              <EnquiryChat />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            SELLER / DEVELOPER LEADS
        ===================================================== */}

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


        {/* =====================================================
            DEVELOPER ROUTES
        ===================================================== */}

        <Route
          path="/my-projects"
          element={
            <ProtectedRoute allowedRoles={["Developer"]}>
              <MyProjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-project"
          element={
            <ProtectedRoute allowedRoles={["Developer"]}>
              <AddProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-project/:id"
          element={
            <ProtectedRoute allowedRoles={["Developer"]}>
              <EditProject />
            </ProtectedRoute>
          }
        />

      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;