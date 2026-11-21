import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaUserGraduate } from 'react-icons/fa';
import api from '../../services/api';
import './MentorPages.css';

function MentorStudents() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.get('accounts/learners/');
                setStudents(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.detail ||
                    'Unable to load students.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const filteredStudents = students.filter((student) =>
        `${student.username} ${student.email}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    if (loading) return <p>Loading students...</p>;
    if (error) return <p className="mentor-error">{error}</p>;

    return (
        <div className="mentor-page">
            <div className="mentor-page-heading">
                <div>
                    <h1>My Students</h1>
                    <p>View and monitor your assigned learners.</p>
                </div>
                <div className="mentor-count">
                    <FaUserGraduate /> {students.length} Students
                </div>
            </div>

            <div className="mentor-search">
                <FaSearch />
                <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {filteredStudents.length === 0 ? (
                <div className="mentor-overview-card mentor-empty">
                    {students.length === 0
                        ? 'No learners have been assigned to you yet.'
                        : 'No students match your search.'}
                </div>
            ) : (
                <div className="mentor-student-grid">
                    {filteredStudents.map((student) => (
                        <div className="mentor-student-card" key={student.id}>
                            <div className="mentor-student-avatar">
                                {student.username.charAt(0).toUpperCase()}
                            </div>

                            <h3>{student.username}</h3>
                            <p>{student.email || 'No email provided'}</p>

                            <Link
                                to={`/mentor/students/${student.id}`}
                                className="mentor-primary-btn"
                            >
                                View Progress
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MentorStudents;