import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Charter } from "./pages/Charter";
import { Announcements } from "./pages/Announcements";
import { Activities } from "./pages/Activities";
import { Assessment } from "./pages/Assessment";
import { MemberRegistry } from "./pages/MemberRegistry";
import { UserCenter } from "./pages/UserCenter";
import { AdminPanel } from "./pages/AdminPanel";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/charter" element={<Charter />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/members" element={<MemberRegistry />} />
            <Route path="/user-center" element={<UserCenter />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
