import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    FaBullseye,
    FaBookOpen,
    FaCheckCircle,
    FaClock,
} from 'react-icons/fa';
import api from '../../services/api';
import './MentorPages.css';

function MentorStudentDetails() {
    const { studentId } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const response = await api.get(
                    `accounts/learners/${studentId}/progress/`
                );
                setData(response.data);
            } catch (err) {
    console.error('Learner Progress API Error:', err);
    console.error('Backend Response:', err.response?.data);

    setError(
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        err.message ||
        'Unable to load learner progress.'
    );
}finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [studentId]);

    if (loading) return <p>Loading learner progress...</p>;
    if (error) return <p className="mentor-error">{error}</p>;

    const { student, summary, goals, study_sessions } = data;

    return (
        <div className="mentor-page">
            <Link to="/mentor/students" className="mentor-back-link">
                ← Back to Students
            </Link>

            <div className="mentor-page-heading">
                <div>
                    <h1>{student.username}</h1>
                    <p>{student.email || 'No email provided'}</p>
                </div>
                <div className="mentor-count">Learner Progress</div>
            </div>

            <div className="mentor-stat-grid">
                <div className="mentor-stat-card">
                    <FaBullseye />
                    <div>
                        <p>Total Goals</p>
                        <h2>{summary.total_goals}</h2>
                    </div>
                </div>

                <div className="mentor-stat-card">
                    <FaBookOpen />
                    <div>
                        <p>Total Topics</p>
                        <h2>{summary.total_topics}</h2>
                    </div>
                </div>

                <div className="mentor-stat-card">
                    <FaCheckCircle />
                    <div>
                        <p>Completed</p>
                        <h2>{summary.completed_topics}</h2>
                    </div>
                </div>

                <div className="mentor-stat-card">
                    <FaClock />
                    <div>
                        <p>Study Hours</p>
                        <h2>{(summary.total_study_minutes / 60).toFixed(1)}</h2>
                    </div>
                </div>
            </div>

            <div className="mentor-overview-card">
                <h3>Learning Completion</h3>

                <div className="mentor-progress-info">
                    <span>Overall progress</span>
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
                <h3>Learning Goals and Topics</h3>

                {goals.length === 0 ? (
                    <p className="mentor-empty">
                        This learner has not created any goals yet.
                    </p>
                ) : (
                    goals.map((goal) => (
                        <div className="mentor-goal" key={goal.id}>
                            <h4>{goal.title}</h4>
                            <p>{goal.description || 'No description'}</p>

                            {goal.topics.length === 0 ? (
                                <small>No topics added.</small>
                            ) : (
                                <div className="mentor-topic-list">
                                    {goal.topics.map((topic) => (
                                        <div
                                            className="mentor-topic"
                                            key={topic.id}
                                        >
                                            <div>
                                                <strong>{topic.title}</strong>
                                                {topic.description && (
                                                    <small>{topic.description}</small>
                                                )}
                                            </div>

                                            <span className={
                                                topic.is_completed
                                                    ? 'topic-completed'
                                                    : 'topic-pending'
                                            }>
                                                {topic.is_completed
                                                    ? 'Completed'
                                                    : 'Pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="mentor-overview-card">
                <h3>Study History</h3>

                {study_sessions.length === 0 ? (
                    <p className="mentor-empty">
                        No study sessions recorded yet.
                    </p>
                ) : (
                    <div className="mentor-table-wrapper">
                        <table className="mentor-table">
                            <thead>
                                <tr>
                                    <th>Topic</th>
                                    <th>Goal</th>
                                    <th>Date</th>
                                    <th>Duration</th>
                                    <th>Note</th>
                                </tr>
                            </thead>

                            <tbody>
                                {study_sessions.map((session) => (
                                    <tr key={session.id}>
                                       <td>{session.topic_title}</td>
                                       <td>{session.goal_title}</td>
                                        <td>{session.date}</td>
                                        <td>{session.minutes} min</td>
                                        <td>{session.note || '-'}</td>
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

export default MentorStudentDetails;