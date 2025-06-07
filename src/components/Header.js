import { useAuth } from "../context/AuthContext";
import "./Header.css";

const Header = ({ user }) => {
  const { logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>Invoice Manager</h1>
        </div>
        <div className="header-right">
          <span className="user-info">Welcome, {user?.username}</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
