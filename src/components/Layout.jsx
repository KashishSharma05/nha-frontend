import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/layout.css";

function Layout({ children }) {
    const location = useLocation();

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

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: "📊",
        },
        {
            name: "Upload",
            path: "/upload",
            icon: "📤",
        },
        {
            name: "Claim Details",
            path: "/claim-details",
            icon: "📄",
        },
        {
            name: "Timeline",
            path: "/timeline",
            icon: "🕒",
        },
        {
            name: "Compliance",
            path: "/compliance",
            icon: "✅",
        },
        {
            name: "Decision",
            path: "/decision",
            icon: "⚡",
        },
        {
            name: "Reports",
            path: "/reports",
            icon: "📑",
        },
    ];

    return (
        <div className="layout">

            {/* SIDEBAR */}
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

            </aside>

            {/* MAIN */}
            <div className="main-layout">

                {/* TOPBAR */}
                <header className="topbar">

                    <input
                        type="text"
                        placeholder="Search claims..."
                    />

                    <div className="topbar-right">

                        {/* DARK MODE BUTTON */}
                        <button
                            onClick={() =>
                                setDarkMode(!darkMode)
                            }
                        >
                            {darkMode ? "☀️" : "🌙"}
                        </button>

                        {/* NOTIFICATION */}
                        <button>🔔</button>

                        {/* PROFILE */}
                        <button>👤</button>

                    </div>

                </header>

                {/* PAGE CONTENT */}
                <main className="page-content">
                    {children}
                </main>

            </div>

        </div>
    );
}

export default Layout;