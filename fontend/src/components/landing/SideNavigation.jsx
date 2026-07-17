import { useState } from "react";
import "../../css/SideNavigation.css";

const menuItems = [
  { id: "hero", title: "Home", icon: "🏠" },
  { id: "story", title: "Discover", icon: "🔍" },
  { id: "whyus", title: "Why Us", icon: "⭐" },
  { id: "services", title: "Services", icon: "🛠" },
  { id: "workflow", title: "How It Works", icon: "📖" },
  { id: "features", title: "HVAC SaaS", icon: "⚙️" },
  { id: "dispatch", title: "Dispatch", icon: "🚀" },
  { id: "reports", title: "Reports", icon: "📈" },
  { id: "contact", title: "Contact", icon: "📞" },
];

const SideNavigation = ({ onLogin }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // Close drawer after navigation
    setMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>

        <div className="mobile-logo">
          HVAC<span>Connect</span>
        </div>

        <button
          className="mobile-login-btn"
          onClick={onLogin}
        >
          Login
        </button>
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`landing-sidebar ${menuOpen ? "open" : ""}`}>
        <button
          className="close-sidebar"
          onClick={() => setMenuOpen(false)}
        >
          ✕
        </button>

        <div className="sidebar-logo">
          HVAC<span>Connect</span>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="sidebar-item"
              onClick={() => scrollToSection(item.id)}
            >
              <span>{item.icon}</span>
              {item.title}
            </button>
          ))}
        </div>

        <button
          className="staff-login-btn"
          onClick={onLogin}
        >
          Staff Login
        </button>
      </aside>
    </>
  );
};

export default SideNavigation;