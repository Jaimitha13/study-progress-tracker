
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCog,
  FaSave,
  FaArrowLeft,
  FaSyncAlt
} from 'react-icons/fa';

import api from '../../services/api';
import './MentorSettings.css';

function MentorSettings() {
  const [settings, setSettings] = useState({
    min_session_minutes: '',
    max_session_minutes: '',
    max_prerequisites: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // GET settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await api.get('core/settings/');

      setSettings({
        min_session_minutes: response.data.min_session_minutes,
        max_session_minutes: response.data.max_session_minutes,
        max_prerequisites: response.data.max_prerequisites
      });

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load settings. Please check your login.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings(prev => ({
      ...prev,
      [name]: value
    }));

    setError('');
    setSuccess('');
  };

  // PATCH settings
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const min = Number(settings.min_session_minutes);
    const max = Number(settings.max_session_minutes);
    const prerequisites = Number(settings.max_prerequisites);

    if (
      settings.min_session_minutes === '' ||
      settings.max_session_minutes === '' ||
      settings.max_prerequisites === ''
    ) {
      setError('All fields are required.');
      return;
    }

    if (
      !Number.isInteger(min) ||
      !Number.isInteger(max) ||
      !Number.isInteger(prerequisites) ||
      min < 1 ||
      max < 1 ||
      prerequisites < 1
    ) {
      setError('Please enter positive whole numbers.');
      return;
    }

    if (max < min) {
      setError('Maximum session duration cannot be less than minimum duration.');
      return;
    }

    try {
      setSaving(true);

      const response = await api.patch('core/settings/', {
        min_session_minutes: min,
        max_session_minutes: max,
        max_prerequisites: prerequisites
      });

      setSettings({
        min_session_minutes: response.data.min_session_minutes,
        max_session_minutes: response.data.max_session_minutes,
        max_prerequisites: response.data.max_prerequisites
      });

      setSuccess('Settings updated successfully!');

    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(' ')
              : typeof value === 'object'
                ? JSON.stringify(value)
                : String(value);

            return `${field}: ${message}`;
          })
          .join(' | ');

        setError(messages || 'Unable to update settings.');
      } else {
        setError('Unable to update settings.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mentor-settings-page">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="mentor-settings-page">

      <Link to="/mentor/dashboard" className="settings-back">
        <FaArrowLeft /> Back to Dashboard
      </Link>

      <div className="settings-heading">
        <div className="settings-icon">
          <FaCog />
        </div>

        <div>
          <h2>App Settings</h2>
          <p>Manage learning rules and application limits.</p>
        </div>
      </div>

      <form className="settings-card" onSubmit={handleSubmit}>

        <div className="settings-card-heading">
          <h3>Learning Configuration</h3>
          <p>Configure study session and topic settings.</p>
        </div>

        <div className="settings-field">
          <label htmlFor="min_session_minutes">
            Minimum Study Session Duration (Minutes)
          </label>

          <input
            id="min_session_minutes"
            type="number"
            name="min_session_minutes"
            min="1"
            step="1"
            value={settings.min_session_minutes}
            onChange={handleChange}
            required
          />

          <small>
            Minimum duration allowed for a study session.
          </small>
        </div>

        <div className="settings-field">
          <label htmlFor="max_session_minutes">
            Maximum Study Session Duration (Minutes)
          </label>

          <input
            id="max_session_minutes"
            type="number"
            name="max_session_minutes"
            min="1"
            step="1"
            value={settings.max_session_minutes}
            onChange={handleChange}
            required
          />

          <small>
            Maximum duration allowed for a study session.
          </small>
        </div>

        <div className="settings-field">
          <label htmlFor="max_prerequisites">
            Maximum Prerequisites Per Topic
          </label>

          <input
            id="max_prerequisites"
            type="number"
            name="max_prerequisites"
            min="1"
            step="1"
            value={settings.max_prerequisites}
            onChange={handleChange}
            required
          />

          <small>
            Maximum prerequisite topics allowed per topic.
          </small>
        </div>

        {error && (
          <div className="settings-message settings-error">
            {error}
          </div>
        )}

        {success && (
          <div className="settings-message settings-success">
            {success}
          </div>
        )}

        <div className="settings-actions">

          <button
            type="button"
            className="settings-reset"
            onClick={fetchSettings}
            disabled={saving}
          >
            <FaSyncAlt /> Reload
          </button>

          <button
            type="submit"
            className="settings-save"
            disabled={saving}
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

        </div>

      </form>
    </div>
  );
}

export default MentorSettings;
