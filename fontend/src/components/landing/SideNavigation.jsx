import "../../css/SideNavigation.css";
const menuItems = [
  {
    id: "hero",
    title: "Home",
    icon: "🏠",
  },
  {
    id: "story",
    title: "Discover",
    icon: "🔍",
  },
  {
    id: "whyus",
    title: "Why Us",
    icon: "⭐",
  },
  {
    id: "services",
    title: "Services",
    icon: "🛠",
  },
  {
    id: "workflow",
    title: "How It Works",
    icon: "📖",
  },
  {
    id: "features",
    title: "HVAC SaaS",
    icon: "⚙️",
  },
  {
    id: "dispatch",
    title: "Dispatch",
    icon: "🚀",
  },
  {
    id: "reports",
    title: "Reports",
    icon: "📈",
  },
  {
    id: "contact",
    title: "Contact",
    icon: "📞",
  },
];

const SideNavigation = ({ onLogin }) => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="landing-sidebar">

      <div className="sidebar-logo">
        HVAC
        <span>Connect</span>
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

    </div>
  );
};

export default SideNavigation;