import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import "../styles/layout.css";
import { searchClaims } from "../services/claimsService";
import { getNotifications } from "../services/reportsService";
import { useAuth } from "../context/AuthContext";

function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Dark mode
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    // Search
    const [searchQuery, setSearchQuery]       = useState("");
    const [searchResults, setSearchResults]   = useState([]);
    const [searchOpen, setSearchOpen]         = useState(false);
    const [searchLoading, setSearchLoading]   = useState(false);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    // Close search dropdown on outside click + cleanup debounce
    useEffect(() => {
        const handleClick = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            clearTimeout(debounceRef.current);
        };
    }, []);

    const handleSearchChange = useCallback((e) => {
        const q = e.target.value;

        // Limit search query length to prevent abuse
        if (q.length > 100) {
            setSearchQuery(q.slice(0, 100));
            return;
        }

        setSearchQuery(q);

        if (!q.trim()) {
            setSearchResults([]);
            setSearchOpen(false);
            return;
        }

        // Debounce — wait 400ms after typing stops
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const data = await searchClaims(q.trim());
                const list = Array.isArray(data)
                    ? data
                    : data.results ?? data.claims ?? [];
                setSearchResults(list.slice(0, 6));
                setSearchOpen(true);
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
    }, [setSearchQuery, setSearchResults, setSearchOpen, setSearchLoading]);

    const handleSearchResultClick = (claim) => {
        setSearchOpen(false);
        setSearchQuery("");
        navigate(`/claim-details?id=${claim.id}`);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            setSearchOpen(false);
            navigate(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
        }
        if (e.key === "Escape") setSearchOpen(false);
    };

    // Notifications
    const [notifications, setNotifications]   = useState([]);
    const [notifOpen, setNotifOpen]           = useState(false);
    const [notifLoading, setNotifLoading]     = useState(false);
    const [notifCount, setNotifCount]         = useState(0);
    const notifRef = useRef(null);

    // Close notif dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Fetch notifications count on mount (silently)
    useEffect(() => {
        getNotifications()
            .then((data) => {
                const list = Array.isArray(data)
                    ? data
                    : data.results ?? data.notifications ?? [];
                setNotifCount(list.length);
                setNotifications(list);
            })
            .catch(() => {}); // silent fail — don't break layout
    }, []);

    const handleNotifToggle = async () => {
        if (notifOpen) {
            setNotifOpen(false);
            return;
        }
        setNotifOpen(true);
        setNotifLoading(true);
        try {
            const data = await getNotifications();
            const list = Array.isArray(data)
                ? data
                : data.results ?? data.notifications ?? [];
            setNotifications(list);
            setNotifCount(0); // mark as read
        } catch {
            // keep existing list
        } finally {
            setNotifLoading(false);
        }
    };

    // Sidebar items
    const menuItems = [
        { name: "Dashboard",    path: "/dashboard",    icon: "📊" },
        { name: "Upload",       path: "/upload",       icon: "📤" },
        { name: "Claim Details",path: "/claim-details",icon: "📄" },
        { name: "Timeline",     path: "/timeline",     icon: "🕒" },
        { name: "Compliance",   path: "/compliance",   icon: "✅" },
        { name: "Decision",     path: "/decision",     icon: "⚡" },
        { name: "Reports",      path: "/reports",      icon: "📑" },
    ];

    // Logout
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="layout">

            <aside className="sidebar">

                <div className="brand">
                    Claim VerifiAI
                </div>

                <nav className="sidebar-menu">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={
                                location.pathname === item.path
                                    ? "active-link"
                                    : ""
                            }
                        >
                            <span>{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    🚪 Logout
                </button>

            </aside>

            <div className="main-layout">

                <header className="topbar">

                    <div className="search-wrapper" ref={searchRef}>
                        <input
                            type="text"
                            placeholder="Search claims..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                        />

                        {searchOpen && (
                            <div className="search-dropdown">
                                {searchLoading ? (
                                    <div className="search-item search-loading">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((claim, i) => (
                                        <div
                                            key={claim.id ?? i}
                                            className="search-item"
                                            onClick={() => handleSearchResultClick(claim)}
                                        >
                                            <span className="search-item-name">
                                                {claim.patient_name ?? claim.patientName ?? claim.name ?? `Claim #${claim.id}`}
                                            </span>
                                            <span className={`search-item-status status-${(claim.status ?? "").toLowerCase()}`}>
                                                {claim.status ?? "—"}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="search-item search-empty">No claims found</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="topbar-right">

                        <button
                            title={darkMode ? "Light mode" : "Dark mode"}
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            {darkMode ? "☀️" : "🌙"}
                        </button>

                        <div className="notif-wrapper" ref={notifRef}>
                            <button
                                className="notif-btn"
                                title="Notifications"
                                onClick={handleNotifToggle}
                            >
                                🔔
                                {notifCount > 0 && (
                                    <span className="notif-badge">{notifCount > 9 ? "9+" : notifCount}</span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="notif-dropdown">
                                    <div className="notif-header">
                                        <h4>Notifications</h4>
                                    </div>

                                    <div className="notif-list">
                                        {notifLoading ? (
                                            <div className="notif-item">Loading...</div>
                                        ) : notifications.length > 0 ? (
                                            notifications.slice(0, 8).map((n, i) => (
                                                <div key={n.id ?? i} className="notif-item">
                                                    <p>{n.message ?? n.title ?? n.text ?? "Notification"}</p>
                                                    <span>{n.time ?? n.timestamp ?? n.created_at ?? ""}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="notif-item notif-empty">
                                                No new notifications
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            title={user?.name ?? user?.email ?? "Profile"}
                            onClick={() => navigate("/profile")}
                            style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "0.5px" }}
                        >
                            {user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
                        </button>

                    </div>

                </header>

                <main className="page-content">
                    {children}
                </main>

            </div>

        </div>
    );
}

export default Layout;