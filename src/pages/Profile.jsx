import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

function Profile() {
    const { user, logout } = useAuth();

    return (
        <Layout>
            <div className="profile-page">
                <div className="profile-header">
                    <h1>User Profile</h1>
                    <p>Manage your account settings and preferences</p>
                </div>

                <div className="profile-content">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            {user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
                        </div>
                        
                        <div className="profile-info">
                            <div className="info-group">
                                <label>Full Name</label>
                                <h3>{user?.name || "Professional User"}</h3>
                            </div>

                            <div className="info-group">
                                <label>Email Address</label>
                                <h3>{user?.email || "user@example.com"}</h3>
                            </div>

                            <div className="info-group">
                                <label>Hospital / Organization</label>
                                <h3>{user?.hospital || "Healthcare Institution"}</h3>
                            </div>

                            <div className="info-group">
                                <label>Account Status</label>
                                <span className="status-badge active">Active Verified</span>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button className="edit-btn" disabled>
                                Edit Profile
                            </button>
                            <button className="logout-btn-large" onClick={logout}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Profile;
