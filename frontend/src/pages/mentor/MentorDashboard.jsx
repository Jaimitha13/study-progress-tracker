import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaUsers,
    FaBullseye,
    FaBookOpen,
    FaCheckCircle,
    FaClock,
} from 'react-icons/fa';
import api from '../../services/api';
import './MentorPages.css';

function MentorDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('accounts/mentor/dashboard/');
                setData(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.detail ||
                    'Unable to load mentor dashboard.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) return <p>Loading mentor dashboard...</p>;
    if (error) return <p className="mentor-error">{error}</p>;

    const summary = data.summary;

    const cards = [
        {
            title: 'My Students',
            value: summary.total_learners,
            icon: <FaUsers />,
        },
        {
            title: 'Total Goals',
            value: summary.total_goals,
            icon: <FaBullseye />,
        },
        {
            title: 'Total Topics',
            value: summary.total_topics,
            icon: <FaBookOpen />,
        },
        {
            title: 'Completed Topics',
            value: summary.completed_topics,
            icon: <FaCheckCircle />,
        },
        {
            title: 'Study Hours',
            value: (summary.total_study_minutes / 60).toFixed(1),
            icon: <FaClock />,
        },
    ];

    return (
        <div className="mentor-page">
            <div className="mentor-page-heading">
                <div>
                    <h1>Mentor Dashboard</h1>
                    <p>Welcome, {data.mentor.username}. Track your learners' progress.</p>
                </div>

                <Link to="/mentor/students" className="mentor-primary-btn">
                    View Students
                </Link>
            </div>

            <div className="mentor-stat-grid">
                {cards.map((card) => (
                    <div className="mentor-stat-card" key={card.title}>
                        <div className="mentor-stat-icon">{card.icon}</div>
                        <div>
                            <p>{card.title}</p>
                            <h2>{card.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mentor-overview-card">
                <h3>Overall Learning Progress</h3>

                <div className="mentor-progress-info">
                    <span>Completed topics</span>
                    <strong>{summary.completion_percentage}%</strong>
                </div>

                <div className="mentor-progress-track">
                    <div
                        className="mentor-progress-fill"
                        style={{
                            width: `${summary.completion_percentage}%`,
                        }}
                    />
                </div>

                <div className="mentor-progress-bottom">
                    <span>{summary.completed_topics} completed</span>
                    <span>{summary.pending_topics} pending</span>
                </div>
            </div>

            <div className="mentor-overview-card">
                <div className="mentor-section-heading">
                    <h3>My Students</h3>
                    <Link to="/mentor/students">View all</Link>
                </div>

                {data.students.length === 0 ? (
                    <p className="mentor-empty">
                        No learners have been assigned to you yet.
                    </p>
                ) : (
                    <div className="mentor-table-wrapper">
                        <table className="mentor-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Goals</th>
                                    <th>Topics</th>
                                    <th>Completed</th>
                                    <th>Progress</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.students.slice(0, 5).map((student) => (
                                    <tr key={student.id}>
                                        <td>
                                            <strong>{student.username}</strong>
                                            <small>{student.email}</small>
                                        </td>
                                        <td>{student.total_goals}</td>
                                        <td>{student.total_topics}</td>
                                        <td>{student.completed_topics}</td>
                                        <td>{student.completion_percentage}%</td>
                                        <td>
                                            <Link
                                                to={`/mentor/students/${student.id}`}
                                                className="mentor-view-link"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MentorDashboard;