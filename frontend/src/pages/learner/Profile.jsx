
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaUser, FaIdBadge } from 'react-icons/fa';
import './Profile.css';

function Profile() {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <h2>My Profile</h2>
        <p>View your account information.</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <FaUserCircle />
        </div>

        <h3>{user?.username}</h3>
        <span className="profile-role">Learner</span>

        <div className="profile-details">
          <div className="profile-detail-item">
            <FaUser />
            <div>
              <small>Username</small>
              <p>{user?.username}</p>
            </div>
          </div>

          <div className="profile-detail-item">
            <FaIdBadge />
            <div>
              <small>User ID</small>
              <p>{user?.user_id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
