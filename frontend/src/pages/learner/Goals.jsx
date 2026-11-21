
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBullseye,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
} from 'react-icons/fa';

import api from '../../services/api';
import './Goals.css';

function Goals() {
  const navigate = useNavigate();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [saving, setSaving] = useState(false);

  const getHeaders = () => ({
    Authorization: `Token ${localStorage.getItem('token')}`,
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('goals/', {
        headers: getHeaders(),
      });

      setGoals(
  Array.isArray(response.data)
    ? response.data
    : response.data.results || []
);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load your goals. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateForm = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
    });
    setMessage('');
    setShowForm(true);
  };

  const openEditForm = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
    });
    setMessage('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Please enter a goal title.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      if (editingGoal) {
        await api.patch(
          `goals/${editingGoal.id}/update/`,
          formData,
          { headers: getHeaders() }
        );

        setMessage('Goal updated successfully.');
      } else {
        await api.post(
          'goals/',
          formData,
          { headers: getHeaders() }
        );

        setMessage('Goal created successfully.');
      }

      setShowForm(false);
      setEditingGoal(null);

      setFormData({
        title: '',
        description: '',
      });

      await fetchGoals();
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.detail ||
        data?.title?.[0] ||
        data?.description?.[0] ||
        'Unable to save goal. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (goal) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${goal.title}"? Its associated topics may also be deleted.`
    );

    if (!confirmed) return;

    try {
      setError('');
      setMessage('');

      await api.delete(`goals/${goal.id}/delete/`, {
        headers: getHeaders(),
      });

      setMessage('Goal deleted successfully.');
      await fetchGoals();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to delete goal.'
      );
    }
  };

  if (loading) {
    return (
      <div className="goals-loading">
        Loading your goals...
      </div>
    );
  }

  return (
    <div className="goals-page">

      {/* Page Heading */}
      <div className="goals-page-heading">
        <div>
          <h2>My Learning Goals</h2>
          <p>Create and manage your learning goals.</p>
        </div>

        <button
          className="create-goal-button"
          onClick={openCreateForm}
        >
          <FaPlus />
          Create Goal
        </button>
      </div>

      {error && (
        <div className="goals-alert error">
          {error}
        </div>
      )}

      {message && (
        <div className="goals-alert success">
          {message}
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="goal-form-card">

          <div className="goal-form-heading">
            <h4>
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h4>

            <button
              type="button"
              className="close-goal-form"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="goal-form-group">
              <label htmlFor="goal-title">
                Goal Title
              </label>

              <input
                id="goal-title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Learn Python"
                maxLength={200}
                required
              />
            </div>

            <div className="goal-form-group">
              <label htmlFor="goal-description">
                Description
              </label>

              <textarea
                id="goal-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what you want to achieve..."
                rows="4"
              />
            </div>

            <div className="goal-form-actions">
              <button
                type="button"
                className="goal-cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="goal-save-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingGoal
                    ? 'Update Goal'
                    : 'Create Goal'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="goals-list-heading">
        <h4>All Goals</h4>
        <span>{goals.length} Goals</span>
      </div>

      {goals.length > 0 ? (

        <div className="goals-grid">

          {goals.map((goal) => (

            <div className="goal-card" key={goal.id}>

              <div className="goal-card-top">

                <span className="goal-card-icon">
                  <FaBullseye />
                </span>

                <div className="goal-card-actions">

                  <button
                    title="View Goal"
                    onClick={() =>
                      navigate(`/learner/goals/${goal.id}`)
                    }
                  >
                    <FaEye />
                  </button>

                  <button
                    title="Edit Goal"
                    onClick={() => openEditForm(goal)}
                  >
                    <FaEdit />
                  </button>

                  <button
                    title="Delete Goal"
                    className="delete-goal-action"
                    onClick={() => handleDelete(goal)}
                  >
                    <FaTrash />
                  </button>

                </div>

              </div>

              <h5>{goal.title}</h5>

              <p className="goal-card-description">
                {goal.description || 'No description added.'}
              </p>

              <small>
                Created:{' '}
                {new Date(goal.created_at).toLocaleDateString()}
              </small>

              <button
                className="view-goal-button"
                onClick={() =>
                  navigate(`/learner/goals/${goal.id}`)
                }
              >
                View Topics
              </button>

            </div>

          ))}

        </div>

      ) : (

        <div className="goals-empty-state">
          <FaBullseye />
          <h4>No Goals Created Yet</h4>
          <p>
            Start planning your learning journey by creating
            your first goal.
          </p>

          <button
            className="create-goal-button"
            onClick={openCreateForm}
          >
            <FaPlus />
            Create Your First Goal
          </button>
        </div>

      )}

    </div>
  );
}

export default Goals;
