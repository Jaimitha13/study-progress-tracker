import { useEffect, useState } from 'react';
import { FaUserTie } from 'react-icons/fa';
import api from '../../services/api';

function MyMentor() {
    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('accounts/profile/');
                setMentor(response.data.mentor);
            } catch (error) {
                console.error('Unable to load mentor information:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return null;

    return (
        <div className="my-mentor-card">
            <div className="my-mentor-icon">
                <FaUserTie />
            </div>

            <div>
                <h3>My Mentor</h3>

                {mentor ? (
                    <>
                        <strong>{mentor.username}</strong>
                        <p>{mentor.email || 'No email provided'}</p>
                    </>
                ) : (
                    <p>No mentor assigned yet.</p>
                )}
            </div>
        </div>
    );
}

export default MyMentor;