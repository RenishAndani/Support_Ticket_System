import AdminLayout from "./admin/layouts/AdminLayout";
import DashBoard from "./admin/pages/DashBoard";
import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthPage from "./AuthPage";
import Users from "./admin/pages/UserPage";
import Staff from "./admin/pages/Staff";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AuthPage />} />

          {/* =========ADMIN============= */}
          <Route path='/admin' element={<AdminLayout />}>
            <Route index element={<DashBoard />} replace />
            <Route path='staff' element={<Staff />} />

            <Route path='users' element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
