
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaBookOpen,
  FaClock,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaHistory
} from 'react-icons/fa';

import api from '../../services/api';
import './StudyHistory.css';

const getList = (data) =>
  Array.isArray(data) ? data : data?.results || [];

function StudyHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sessions, setSessions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(
    location.state?.message || ''
  );

  const getHeaders = () => ({
    Authorization: `Token ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    fetchStudyHistory();
  }, []);

  const fetchStudyHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const [sessionResponse, goalResponse] = await Promise.all([
        api.get('sessions/', { headers: getHeaders() }),
        api.get('goals/', { headers: getHeaders() })
      ]);

      const sessionList = getList(sessionResponse.data);
      const goalList = getList(goalResponse.data);

      const topicResponses = await Promise.all(
        goalList.map((goal) =>
          api.get(`goals/${goal.id}/topics/`, {
            headers: getHeaders()
          })
        )
      );

      const allTopics = topicResponses.flatMap((response) =>
        getList(response.data)
      );

      setSessions(sessionList);
      setGoals(goalList);
      setTopics(allTopics);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load study history.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getTopic = (topicId) =>
    topics.find((topic) => topic.id === topicId);

  const getGoal = (topic) =>
    goals.find((goal) => goal.id === topic?.goal);

  const handleDelete = async (session) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this study session?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setMessage('');

      await api.delete(`sessions/${session.id}/`, {
        headers: getHeaders()
      });

      setMessage('Study session deleted successfully.');
      await fetchStudyHistory();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to delete study session.'
      );
    }
  };

  const totalMinutes = sessions.reduce(
    (total, session) => total + Number(session.minutes || 0),
    0
  );

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes} min`;
    if (remainingMinutes === 0) return `${hours} hr`;

    return `${hours} hr ${remainingMinutes} min`;
  };

  if (loading) {
    return (
      <div className="study-history-loading">
        Loading study history...
      </div>
    );
  }

  return (
    <div className="study-history-page">

      <div className="study-history-header">
        <div>
          <div className="study-history-title">
            <FaHistory />
            <h2>Study History</h2>
          </div>
          <p>Review your learning activities and progress.</p>
        </div>

        <button
          className="add-study-session-button"
          onClick={() => navigate('/learner/study-session')}
        >
          <FaPlus /> Log Study Session
        </button>
      </div>

      {error && (
        <div className="history-alert error">
          {error}
        </div>
      )}

      {message && (
        <div className="history-alert success">
          {message}
        </div>
      )}

      <div className="study-history-stats">

        <div className="history-stat-card">
          <span className="history-stat-icon">
            <FaBookOpen />
          </span>
          <div>
            <p>Total Sessions</p>
            <h3>{sessions.length}</h3>
          </div>
        </div>

        <div className="history-stat-card">
          <span className="history-stat-icon">
            <FaClock />
          </span>
          <div>
            <p>Total Study Time</p>
            <h3>{formatDuration(totalMinutes)}</h3>
          </div>
        </div>

      </div>

      <div className="study-history-list-heading">
        <h3>All Study Sessions</h3>
        <span>{sessions.length} sessions recorded</span>
      </div>

      {sessions.length > 0 ? (

        <div className="study-session-list">

          {sessions.map((session) => {
            const topic = getTopic(session.topic);
            const goal = getGoal(topic);

            return (
              <div className="study-session-card" key={session.id}>

                <div className="study-session-icon">
                  <FaBookOpen />
                </div>

                <div className="study-session-content">

                  <div className="study-session-title-row">
                    <h4>{topic?.title || `Topic #${session.topic}`}</h4>

                    <span className="study-session-duration">
                      <FaClock />
                      {formatDuration(Number(session.minutes))}
                    </span>
                  </div>

                  <p className="study-session-goal">
                    Goal: {goal?.title || 'Learning Goal'}
                  </p>

                  <p className="study-session-note">
                    {session.note || 'No study notes added.'}
                  </p>

                  <div className="study-session-date">
                    <FaCalendarAlt />
                    {new Date(
                      `${session.date}T00:00:00`
                    ).toLocaleDateString()}
                  </div>

                </div>

                <div className="study-session-actions">

                  <button
                    title="Edit Session"
                    onClick={() =>
                      navigate(`/learner/study-session/${session.id}/edit`)
                    }
                  >
                    <FaEdit />
                  </button>

                  <button
                    title="Delete Session"
                    className="delete-session-button"
                    onClick={() => handleDelete(session)}
                  >
                    <FaTrash />
                  </button>

                </div>

              </div>
            );
          })}

        </div>

      ) : (

        <div className="study-history-empty">

          <FaHistory />

          <h3>No Study Sessions Yet</h3>

          <p>
            Start recording your learning activities to track your study progress.
          </p>

          <button
            onClick={() => navigate('/learner/study-session')}
          >
            <FaPlus /> Log Your First Session
          </button>

        </div>

      )}

    </div>
  );
}

export default StudyHistory;
