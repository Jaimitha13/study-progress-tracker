
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBookOpen,
  FaCalendarAlt,
  FaClock,
  FaSave
} from 'react-icons/fa';

import api from '../../services/api';
import './StudySessionForm.css';

const getList = (data) =>
  Array.isArray(data) ? data : data?.results || [];

function StudySessionForm() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const isEditing = Boolean(sessionId);

  const [goals, setGoals] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toLocaleDateString('en-CA');

  const [form, setForm] = useState({
    goal: '',
    topic: '',
    date: today,
    minutes: '',
    note: ''
  });

  const getHeaders = () => ({
    Authorization: `Token ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    loadFormData();
  }, [sessionId]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      setError('');

      const goalsResponse = await api.get('goals/', {
        headers: getHeaders()
      });

      const goalList = getList(goalsResponse.data);
      setGoals(goalList);

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

      setTopics(allTopics);

      if (isEditing) {
        const sessionResponse = await api.get(
          `sessions/${sessionId}/`,
          { headers: getHeaders() }
        );

        const session = sessionResponse.data;
        const selectedTopic = allTopics.find(
          (topic) => topic.id === session.topic
        );

        setForm({
          goal: selectedTopic ? String(selectedTopic.goal) : '',
          topic: String(session.topic),
          date: session.date,
          minutes: String(session.minutes),
          note: session.note || ''
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load study session details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const availableTopics = topics.filter(
    (topic) => String(topic.goal) === form.goal
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'goal' ? { topic: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!form.goal || !form.topic || !form.date || !form.minutes) {
      setError('Please fill in all required fields.');
      return;
    }

    if (Number(form.minutes) <= 0) {
      setError('Study minutes must be greater than zero.');
      return;
    }

    const payload = {
      topic: Number(form.topic),
      date: form.date,
      minutes: Number(form.minutes),
      note: form.note
    };

    try {
      setSaving(true);

      if (isEditing) {
        await api.patch(
          `sessions/${sessionId}/`,
          payload,
          { headers: getHeaders() }
        );
      } else {
        await api.post(
          'sessions/',
          payload,
          { headers: getHeaders() }
        );
      }

      navigate('/learner/study-history', {
        state: {
          message: isEditing
            ? 'Study session updated successfully.'
            : 'Study session created successfully.'
        }
      });
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.detail ||
        data?.topic?.[0] ||
        data?.date?.[0] ||
        data?.minutes?.[0] ||
        'Unable to save study session. Please check your details.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="session-loading">
        Loading study session...
      </div>
    );
  }

  return (
    <div className="session-form-page">

      <button
        className="session-back-button"
        onClick={() => navigate('/learner/study-history')}
      >
        <FaArrowLeft /> Back to Study History
      </button>

      <div className="session-form-heading">
        <div className="session-heading-icon">
          <FaBookOpen />
        </div>

        <div>
          <h2>{isEditing ? 'Edit Study Session' : 'Log Study Session'}</h2>
          <p>Record and track your learning activities.</p>
        </div>
      </div>

      {error && (
        <div className="session-alert error">
          {error}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="session-empty-message">
          <h4>No learning goals found</h4>
          <p>Create a goal and add topics before recording a study session.</p>
          <button onClick={() => navigate('/learner/goals')}>
            Go to My Goals
          </button>
        </div>
      ) : (
        <form className="session-form-card" onSubmit={handleSubmit}>

          <div className="session-form-group">
            <label>Learning Goal *</label>

            <select
              name="goal"
              value={form.goal}
              onChange={handleChange}
              required
            >
              <option value="">Select a goal</option>

              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>

          <div className="session-form-group">
            <label>Study Topic *</label>

            <select
              name="topic"
              value={form.topic}
              onChange={handleChange}
              disabled={!form.goal}
              required
            >
              <option value="">Select a topic</option>

              {availableTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>

            {form.goal && availableTopics.length === 0 && (
              <small>No topics available for this goal.</small>
            )}
          </div>

          <div className="session-form-row">

            <div className="session-form-group">
              <label>
                <FaCalendarAlt /> Study Date *
              </label>

              <input
                type="date"
                name="date"
                value={form.date}
                max={today}
                onChange={handleChange}
                required
              />
            </div>

            <div className="session-form-group">
              <label>
                <FaClock /> Duration (Minutes) *
              </label>

              <input
                type="number"
                name="minutes"
                value={form.minutes}
                onChange={handleChange}
                placeholder="Example: 60"
                min="1"
                required
              />
            </div>

          </div>

          <div className="session-form-group">
            <label>Study Notes</label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="What did you learn during this session?"
              rows="5"
            />
          </div>

          <div className="session-form-actions">

            <button
              type="button"
              className="session-cancel-button"
              onClick={() => navigate('/learner/study-history')}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="session-save-button"
              disabled={saving}
            >
              <FaSave />
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Update Session'
                  : 'Save Session'}
            </button>

          </div>

        </form>
      )}

    </div>
  );
}

export default StudySessionForm;
