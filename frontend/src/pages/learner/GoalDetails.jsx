
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  FaArrowLeft,
  FaBookOpen,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaLock,
  FaUnlock,
  FaLink,
} from 'react-icons/fa';

import api from '../../services/api';
import './GoalDetails.css';

function GoalDetails() {
  const { goalId } = useParams();
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
  });

  const [saving, setSaving] = useState(false);

  const [selectedPrerequisiteTopic, setSelectedPrerequisiteTopic] =
    useState({});

  const [prerequisites, setPrerequisites] = useState({});
  const [expandedPrerequisite, setExpandedPrerequisite] = useState(null);

  const getHeaders = () => ({
    Authorization: `Token ${localStorage.getItem('token')}`,
  });

  const fetchGoalDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const [goalResponse, topicsResponse] = await Promise.all([
        api.get(`goals/${goalId}/`, {
          headers: getHeaders(),
        }),

        api.get(`goals/${goalId}/topics/`, {
          headers: getHeaders(),
        }),
      ]);

      setGoal(goalResponse.data);
     setTopics(
  Array.isArray(topicsResponse.data)
    ? topicsResponse.data
    : topicsResponse.data.results || []
);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load goal details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalDetails();
  }, [goalId]);

  const openCreateTopicForm = () => {
    setEditingTopic(null);
    setTopicForm({
      title: '',
      description: '',
    });
    setShowTopicForm(true);
  };

  const openEditTopicForm = (topic) => {
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title,
      description: topic.description || '',
    });
    setShowTopicForm(true);
  };

  const handleTopicChange = (e) => {
    setTopicForm({
      ...topicForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleTopicSubmit = async (e) => {
    e.preventDefault();

    if (!topicForm.title.trim()) {
      setError('Please enter a topic title.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      if (editingTopic) {
        await api.patch(
          `goals/topics/${editingTopic.id}/update/`,
          topicForm,
          { headers: getHeaders() }
        );

        setMessage('Topic updated successfully.');
      } else {
        await api.post(
          `goals/${goalId}/topics/`,
          topicForm,
          { headers: getHeaders() }
        );

        setMessage('Topic created successfully.');
      }

      setShowTopicForm(false);
      setEditingTopic(null);

      setTopicForm({
        title: '',
        description: '',
      });

      await fetchGoalDetails();
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.detail ||
        data?.title?.[0] ||
        'Unable to save topic.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTopic = async (topic) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${topic.title}"?`
    );

    if (!confirmed) return;

    try {
      setError('');
      setMessage('');

      await api.delete(
        `goals/topics/${topic.id}/delete/`,
        { headers: getHeaders() }
      );

      setMessage('Topic deleted successfully.');
      await fetchGoalDetails();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to delete topic.'
      );
    }
  };

  const handleCompletion = async (topic) => {
    try {
      setError('');
      setMessage('');

      const action = topic.is_completed ? 'reopen' : 'complete';

      const response = await api.post(
        `goals/topics/${topic.id}/${action}/`,
        {},
        { headers: getHeaders() }
      );

      if (response.data?.message) {
        setMessage(response.data.message);
      } else {
        setMessage(
          topic.is_completed
            ? 'Topic reopened successfully.'
            : 'Topic completed successfully.'
        );
      }

      await fetchGoalDetails();
    } catch (err) {
      const data = err.response?.data;

      if (data?.missing_prerequisites) {
        const names = data.missing_prerequisites
          .map((item) => item.title)
          .join(', ');

        setError(
          `Complete these prerequisite topics first: ${names}`
        );
      } else {
        setError(
          data?.error ||
          data?.detail ||
          'Unable to update topic status.'
        );
      }
    }
  };

  const fetchPrerequisites = async (topicId) => {
    try {
      const response = await api.get(
        `goals/topics/${topicId}/prerequisites/`,
        { headers: getHeaders() }
      );

      setPrerequisites((previous) => ({
  ...previous,
  [topicId]: Array.isArray(response.data)
    ? response.data
    : response.data.results || [],
}));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load prerequisites.'
      );
    }
  };

  const togglePrerequisites = async (topicId) => {
    if (expandedPrerequisite === topicId) {
      setExpandedPrerequisite(null);
      return;
    }

    setExpandedPrerequisite(topicId);

    if (!prerequisites[topicId]) {
      await fetchPrerequisites(topicId);
    }
  };

  const getPrerequisiteId = (item) => {
    if (typeof item.prerequisite === 'object') {
      return item.prerequisite.id;
    }

    return item.prerequisite;
  };

 
const getPrerequisiteTitle = (item) => {
  if (
    typeof item.prerequisite === 'object' &&
    item.prerequisite !== null
  ) {
    return item.prerequisite.title;
  }

  const prerequisiteTopic = topics.find(
    (topic) => topic.id === Number(item.prerequisite)
  );

  return (
    prerequisiteTopic?.title ||
    item.prerequisite_title ||
    item.title ||
    `Topic #${item.prerequisite}`
  );
};


  const handleAddPrerequisite = async (topicId) => {
    const prerequisiteId = selectedPrerequisiteTopic[topicId];

    if (!prerequisiteId) {
      setError('Please select a prerequisite topic.');
      return;
    }

    try {
      setError('');
      setMessage('');

      await api.post(
        `goals/topics/${topicId}/prerequisites/`,
        {
          prerequisite: Number(prerequisiteId),
        },
        { headers: getHeaders() }
      );

      setMessage('Prerequisite added successfully.');

      setSelectedPrerequisiteTopic((previous) => ({
        ...previous,
        [topicId]: '',
      }));

      await fetchPrerequisites(topicId);
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.detail ||
        data?.error ||
        data?.prerequisite?.[0] ||
        'Unable to add prerequisite.'
      );
    }
  };

  const handleDeletePrerequisite = async (topicId, linkId) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this prerequisite?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setMessage('');

      await api.delete(
        `goals/topics/${topicId}/prerequisites/${linkId}/`,
        { headers: getHeaders() }
      );

      setMessage('Prerequisite removed successfully.');
      await fetchPrerequisites(topicId);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to remove prerequisite.'
      );
    }
  };

  const getProgress = () => {
    if (!topics.length) return 0;

    const completed = topics.filter(
      (topic) => topic.is_completed
    ).length;

    return Math.round((completed / topics.length) * 100);
  };

  if (loading) {
    return (
      <div className="goal-details-loading">
        Loading goal details...
      </div>
    );
  }

  if (error && !goal) {
    return (
      <div className="goal-details-page">
        <div className="goal-details-alert error">
          {error}
        </div>

        <button
          className="back-to-goals-button"
          onClick={() => navigate('/learner/goals')}
        >
          <FaArrowLeft /> Back to Goals
        </button>
      </div>
    );
  }

  if (!goal) return null;

  const completedCount = topics.filter(
    (topic) => topic.is_completed
  ).length;

  return (
    <div className="goal-details-page">

      {/* Back Button */}
      <button
        className="back-to-goals-button"
        onClick={() => navigate('/learner/goals')}
      >
        <FaArrowLeft />
        Back to Goals
      </button>

      {/* Goal Information */}
      <div className="goal-details-card">

        <div className="goal-details-top">
          <span className="goal-details-icon">
            <FaBookOpen />
          </span>

          <span className="goal-details-date">
            Created: {new Date(goal.created_at).toLocaleDateString()}
          </span>
        </div>

        <h2>{goal.title}</h2>

        <p>
          {goal.description || 'No description added.'}
        </p>

        <div className="goal-details-progress-heading">
          <strong>Goal Progress</strong>
          <strong>{getProgress()}%</strong>
        </div>

        <div className="progress goal-details-progress">
          <div
            className="progress-bar"
            style={{ width: `${getProgress()}%` }}
          />
        </div>

        <div className="goal-details-summary">
          <span>{topics.length} Total Topics</span>
          <span>{completedCount} Completed</span>
          <span>{topics.length - completedCount} Pending</span>
        </div>

      </div>

      {error && (
        <div className="goal-details-alert error">
          {error}
        </div>
      )}

      {message && (
        <div className="goal-details-alert success">
          {message}
        </div>
      )}

      {/* Topics Heading */}
      <div className="topics-heading">
        <div>
          <h3>Learning Topics</h3>
          <p>Organize your goal into smaller learning tasks.</p>
        </div>

        <button
          className="add-topic-button"
          onClick={openCreateTopicForm}
        >
          <FaPlus />
          Add Topic
        </button>
      </div>

      {/* Topic Form */}
      {showTopicForm && (
        <div className="topic-form-card">

          <h4>
            {editingTopic ? 'Edit Topic' : 'Add New Topic'}
          </h4>

          <form onSubmit={handleTopicSubmit}>

            <div className="topic-form-group">
              <label>Topic Title</label>

              <input
                type="text"
                name="title"
                value={topicForm.title}
                onChange={handleTopicChange}
                placeholder="Example: Python Basics"
                maxLength={200}
                required
              />
            </div>

            <div className="topic-form-group">
              <label>Description</label>

              <textarea
                name="description"
                value={topicForm.description}
                onChange={handleTopicChange}
                placeholder="Describe what you will learn..."
                rows="3"
              />
            </div>

            <div className="topic-form-actions">
              <button
                type="button"
                className="topic-cancel-button"
                onClick={() => setShowTopicForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="topic-save-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingTopic
                    ? 'Update Topic'
                    : 'Add Topic'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Topics List */}
      {topics.length > 0 ? (

        <div className="topics-list">

          {topics.map((topic) => {

            const topicPrerequisites =
              prerequisites[topic.id] || [];

            const usedPrerequisiteIds = topicPrerequisites.map(
              getPrerequisiteId
            );

            const availableTopics = topics.filter(
              (item) =>
                item.id !== topic.id &&
                !usedPrerequisiteIds.includes(item.id)
            );

            return (
              <div
                className={`topic-card ${
                  topic.is_completed ? 'completed' : ''
                }`}
                key={topic.id}
              >

                <div className="topic-card-main">

                  <div className="topic-status-icon">
                    {topic.is_completed
                      ? <FaCheckCircle />
                      : <FaBookOpen />}
                  </div>

                  <div className="topic-card-content">

                    <h4>{topic.title}</h4>

                    <p>
                      {topic.description || 'No description added.'}
                    </p>

                    <span
                      className={`topic-status ${
                        topic.is_completed
                          ? 'status-completed'
                          : 'status-pending'
                      }`}
                    >
                      {topic.is_completed ? 'Completed' : 'Pending'}
                    </span>

                  </div>

                  <div className="topic-actions">

                    <button
                      title="Edit Topic"
                      onClick={() => openEditTopicForm(topic)}
                    >
                      <FaEdit />
                    </button>

                    <button
                      title="Delete Topic"
                      className="topic-delete-action"
                      onClick={() => handleDeleteTopic(topic)}
                    >
                      <FaTrash />
                    </button>

                  </div>

                </div>

                <div className="topic-card-footer">

                  <button
                    className={`topic-completion-button ${
                      topic.is_completed
                        ? 'reopen-topic-button'
                        : ''
                    }`}
                    onClick={() => handleCompletion(topic)}
                  >
                    {topic.is_completed ? (
                      <>
                        <FaUnlock />
                        Reopen Topic
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Mark as Completed
                      </>
                    )}
                  </button>

                  <button
                    className="prerequisite-toggle-button"
                    onClick={() => togglePrerequisites(topic.id)}
                  >
                    <FaLink />
                    Prerequisites
                    {expandedPrerequisite === topic.id ? ' −' : ' +'}
                  </button>

                </div>

                {expandedPrerequisite === topic.id && (

                  <div className="prerequisite-panel">

                    <h5>
                      <FaLock /> Topic Prerequisites
                    </h5>

                    {topicPrerequisites.length > 0 ? (
                      <div className="prerequisite-list">

                        {topicPrerequisites.map((item) => (
                          <div
                            className="prerequisite-item"
                            key={item.id}
                          >
                            <span>
                              {getPrerequisiteTitle(item)}
                            </span>

                            <button
                              onClick={() =>
                                handleDeletePrerequisite(
                                  topic.id,
                                  item.id
                                )
                              }
                              title="Remove prerequisite"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}

                      </div>
                    ) : (
                      <p className="no-prerequisites">
                        No prerequisites added.
                      </p>
                    )}

                    <div className="add-prerequisite-form">

                      <select
                        value={
                          selectedPrerequisiteTopic[topic.id] || ''
                        }
                        onChange={(e) =>
                          setSelectedPrerequisiteTopic(
                            (previous) => ({
                              ...previous,
                              [topic.id]: e.target.value,
                            })
                          )
                        }
                      >
                        <option value="">
                          Select a prerequisite topic
                        </option>

                        {availableTopics.map((item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.title}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() =>
                          handleAddPrerequisite(topic.id)
                        }
                        disabled={!availableTopics.length}
                      >
                        <FaPlus />
                        Add
                      </button>

                    </div>

                  </div>
                )}

              </div>
            );
          })}

        </div>

      ) : (

        <div className="topics-empty-state">
          <FaBookOpen />
          <h4>No Topics Added Yet</h4>
          <p>
            Break this goal into smaller topics to track your progress.
          </p>

          <button
            className="add-topic-button"
            onClick={openCreateTopicForm}
          >
            <FaPlus />
            Add Your First Topic
          </button>
        </div>

      )}

    </div>
  );
}

export default GoalDetails;
