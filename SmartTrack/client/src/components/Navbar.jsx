import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Briefcase, User } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-darkLight border-b border-gray-900 px-6 py-4 flex justify-between items-center shadow-md">
      <Link
        to="/"
        className="flex items-center space-x-2 text-2xl font-bold text-white hover:text-gray-200 transition-colors"
      >
        <Briefcase className="w-8 h-8 text-emerald-400" />
        <span>SmartTrack</span>
      </Link>

      <div className="flex items-center space-x-6">
        {user ? (
          <>
            <Link
              to="/profile"
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            <span className="text-gray-300 font-medium">
              Hello, {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div className="space-x-4">
            <Link
              to="/login"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/30 font-medium"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
