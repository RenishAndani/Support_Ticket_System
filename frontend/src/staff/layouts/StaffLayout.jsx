import { Outlet, Link, useLocation } from "react-router-dom";

const StaffLayout = () => {
  const location = useLocation();

  // Menu items array
  const menuItems = [
    { name: "DashBoard", path: "/staff" },
    { name: "AssignedTicket", path: "/staff/assigned-tickets" },
  ];

  return (
    <div className='flex flex-col h-screen bg-gray-100 font-sans'>
      {/* Header */}
      <header className='h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm z-10'>
        <h1 className='text-xl font-bold text-gray-800'>My Dashboard</h1>
      </header>

      {/* Main Container (Sidebar + Content Area) */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar */}
        <aside className='w-64 bg-white border-r border-gray-200 flex flex-col p-4'>
          <nav className='space-y-1'>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Content Area (React Router Outlet) */}
        <main className='flex-1 overflow-y-auto p-6 bg-gray-50'>
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className='h-12 bg-white border-t border-gray-200 flex items-center justify-center text-xs text-gray-500 shadow-inner'>
        <p>&copy; 2026 My App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StaffLayout;
