import AdminLayout from "./admin/layouts/AdminLayout";
import DashBoard from "./admin/pages/DashBoard";
import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthPage from "./AuthPage";
import Users from "./admin/pages/UserPage";
import Staff from "./admin/pages/Staff";
import Ticket from "./admin/pages/Ticket";
import EditTicket from "./admin/pages/EditTicket";
import AddTicket from "./admin/pages/AddTicket";
import StaffLayout from "./staff/layouts/StaffLayout";
import StaffDashBoard from "./staff/pages/StaffDashBoard";
import AssignedTickets from "./staff/pages/AssignedTickets";
import UserLayout from "./user/layouts/UserLayout";
import UserDashBoard from "./user/pages/UserDashBoard";
import MyTickets from "./user/pages/MyTicket";
import TicketForm from "./user/pages/TicketForm";

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
            <Route path='tickets' element={<Ticket />} />
            <Route path='users' element={<Users />} />
            <Route path='edit-ticket/:id' element={<EditTicket />} />
            <Route path='add-ticket' element={<AddTicket />} />
          </Route>

          {/* =================STAFF=============== */}
          <Route path='/staff' element={<StaffLayout />}>
            <Route index element={<StaffDashBoard />} replace />
            <Route path='assigned-tickets' element={<AssignedTickets />} />
          </Route>

          {/* =====================USER=================== */}
          <Route path='/user' element={<UserLayout />}>
            <Route index element={<UserDashBoard />} replace />
            <Route path='my-tickets' element={<MyTickets />} />
            <Route path='ticket-form/:id?' element={<TicketForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
