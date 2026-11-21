import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './MentorLayout.css';

function MentorLayout() {
    const { user, logout } = useAuth();
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
        <div className="mentor-layout">
            <aside className="mentor-sidebar">
                <div className="mentor-brand">
                    <h2>Study Tracker</h2>
                    <p>Mentor Panel</p>
                </div>

                <div className="mentor-user">
                    <div className="mentor-avatar">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <strong>{user?.username}</strong>
                        <small>Mentor</small>
                    </div>
                </div>

                <nav className="mentor-nav">
                    <NavLink to="/mentor/dashboard">
                        <FaHome /> Dashboard
                    </NavLink>

                    <NavLink to="/mentor/students">
                        <FaUsers /> My Students
                    </NavLink>

                    <NavLink to="/mentor/settings">
                        <FaCog /> Settings
                    </NavLink>
                </nav>

                <button className="mentor-logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                </button>
            </aside>

            <main className="mentor-main">
                <Outlet />
            </main>
        </div>
    );
}

export default MentorLayout;