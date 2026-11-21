import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaBookOpen,
  FaThLarge,
  FaBullseye,
  FaClock,
  FaUser,
  FaUserCircle,
  FaSignOutAlt,
} from 'react-icons/fa';
 
import './LearnerLayout.css';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
function LearnerLayout() {
const { logout, user } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
    try {
        await api.post('accounts/logout/');
    } catch (error) {
        console.error('Logout request failed:', error);
    } finally {
        logout();
        navigate('/login', { replace: true });
    }
};
  return (
    <div className="learner-layout">
      <aside className="learner-sidebar">
        <div className="sidebar-brand">
          <FaBookOpen />
          <span>StudyTracker</span>
        </div>

        <p className="sidebar-label">MENU</p>

        <nav className="sidebar-nav">
          <NavLink to="/learner/dashboard">
            <FaThLarge /> Dashboard
          </NavLink>

          <NavLink to="/learner/goals">
            <FaBullseye /> My Goals
          </NavLink>

         <NavLink to="/learner/study-session">
  <FaClock /> Study Sessions
</NavLink>
<NavLink to="/learner/profile">
  <FaUser />
  My Profile
</NavLink>
          
        </nav>

        <div className="sidebar-footer">
          
        <button type="button" onClick={handleLogout} className="sidebar-logout">
    <FaSignOutAlt />
    <span>Logout</span>
</button>
        </div>
      </aside>

      <main className="learner-main">
      <header className="learner-header">
  <div>
    <h4>My Learning Space</h4>
    <span>Stay focused. Keep learning.</span>
  </div>

  <NavLink to="/learner/profile" className="header-profile">
    <FaUserCircle />
    <span>{user?.username || 'Learner'}</span>
  </NavLink>
</header>

        <section className="learner-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default LearnerLayout;

