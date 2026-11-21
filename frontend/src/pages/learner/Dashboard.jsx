
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MyMentor from './MyMentor';
import {
  FaBullseye,
  FaBookOpen,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaHourglassHalf,
  FaPlus,
  FaListAlt,
  FaPlay,
  FaHistory,
} from 'react-icons/fa';

import api from '../../services/api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await api.get('goals/dashboard/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        setStats(response.data);
      } catch (err) {
        setError('Unable to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = stats
    ? [
        {
          title: 'Total Goals',
          value: stats.total_goals,
          icon: <FaBullseye />,
          color: 'purple',
        },
        {
          title: 'Total Topics',
          value: stats.total_topics,
          icon: <FaBookOpen />,
          color: 'blue',
        },
        {
          title: 'Completed Topics',
          value: stats.completed_topics,
          icon: <FaCheckCircle />,
          color: 'green',
        },
        {
          title: 'Pending Topics',
          value: stats.pending_topics,
          icon: <FaHourglassHalf />,
          color: 'orange',
        },
        {
          title: 'Completion',
          value: `${stats.completion_percentage}%`,
          icon: <FaChartLine />,
          color: 'pink',
        },
        {
          title: 'Study Time',
          value: `${stats.total_study_minutes} min`,
          icon: <FaClock />,
          color: 'teal',
        },
      ]
    : [];

  if (loading) {
    return <p>Loading your dashboard...</p>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="learner-dashboard">

      {/* Dashboard Welcome */}
      <div className="dashboard-welcome">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Track your goals and keep moving forward.</p>
        </div>
      </div>
            {/* Assigned Mentor Information */}
      <MyMentor />

      {/* Statistics Cards */}
      <div className="dashboard-stats">
        {cards.map((card) => (
          <div className="dashboard-stat-card" key={card.title}>
            <div className={`stat-icon ${card.color}`}>
              {card.icon}
            </div>

            <div>
              <p>{card.title}</p>
              <h3>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Learning Progress */}
      <div className="dashboard-progress-card">
        <div className="progress-heading">
          <h5>Overall Learning Progress</h5>
          <strong>{stats.completion_percentage}%</strong>
        </div>

        <div className="progress dashboard-progress">
          <div
            className="progress-bar"
            role="progressbar"
            style={{
              width: `${stats.completion_percentage}%`,
            }}
            aria-valuenow={stats.completion_percentage}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>

        <p>
          You have completed {stats.completed_topics} out of{' '}
          {stats.total_topics} topics.
        </p>
      </div>

      {/* Recent Goals */}
      <div className="recent-goals-section">
        <div className="recent-goals-heading">
          <div>
            <h4>Recent Goals</h4>
            <p>Your latest learning goals</p>
          </div>
        </div>

        {stats.recent_goals && stats.recent_goals.length > 0 ? (
          <div className="recent-goals-list">
            {stats.recent_goals.map((goal) => {
              const percentage =
                goal.total_topics > 0
                  ? Math.round(
                      (goal.completed_topics / goal.total_topics) * 100
                    )
                  : 0;

              return (
                <div className="recent-goal-card" key={goal.id}>
                  <div className="recent-goal-top">
                    <div>
                      <h5>{goal.title}</h5>
                      <p>
                        {goal.description || 'No description added.'}
                      </p>
                    </div>

                    <span className="recent-goal-icon">
                      <FaBullseye />
                    </span>
                  </div>

                  <div className="recent-goal-details">
                    <span>{goal.total_topics} Topics</span>
                    <span>{goal.completed_topics} Completed</span>
                    <span>{percentage}% Progress</span>
                  </div>

                  <div className="progress recent-goal-progress">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${percentage}%` }}
                      aria-valuenow={percentage}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>

                  <small className="recent-goal-date">
                    Created:{' '}
                    {new Date(goal.created_at).toLocaleDateString()}
                  </small>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="recent-goals-empty">
            <FaBullseye className="empty-goal-icon" />
            <h5>No Goals Yet</h5>
            <p>
              You haven't created any goals yet.
              Start by creating your first learning goal.
            </p>
          </div>
        )}
      </div>

      {/* Recent Study Sessions */}
      <div className="recent-sessions-section">
        <div className="recent-sessions-heading">
          <div>
            <h4>Recent Study Sessions</h4>
            <p>Your latest learning activities</p>
          </div>
        </div>

        {stats.recent_study_sessions &&
        stats.recent_study_sessions.length > 0 ? (
          <div className="recent-sessions-list">
            {stats.recent_study_sessions.map((session, index) => (
              <div
  className="recent-session-card"
  key={session.id || `${session.date}-${session.topic_title}-${index}`}
>
                <div className="session-icon">
                  <FaBookOpen />
                </div>

                <div className="session-content">
                  <h5>{session.topic_title}</h5>

                  <p className="session-goal">
                    Goal: {session.goal_title}
                  </p>

                  <div className="session-details">
                    <span>
                      <FaClock />
                      {session.minutes} minutes
                    </span>

                    <span>
                      {new Date(
                        session.date + 'T00:00:00'
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  {session.note && (
                    <p className="session-note">{session.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="recent-sessions-empty">
            <FaClock className="empty-session-icon" />
            <h5>No Study Sessions Yet</h5>
            <p>
              You haven't recorded any study sessions yet.
              Start tracking your learning time!
            </p>
          </div>
        )}
      </div>

     
      </div>

    
  );
}

export default Dashboard;
