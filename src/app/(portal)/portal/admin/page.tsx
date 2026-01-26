export default function AdminDashboard() {
  const cards = [
    { title: "Departments", href: "/portal/admin/departments" },
    { title: "Students", href: "/portal/admin/users/students" },
    { title: "Faculty", href: "/portal/admin/users/faculty" },
    { title: "Exam Planning", href: "/portal/admin/examplanning" },
  ];

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Admin Area</p>
        <h1 className="portal-page-title">Dashboard</h1>
        <p className="portal-page-subtitle">
          Administration tools will appear here once Phase 2 is ready.
        </p>
      </div>
      <div className="portal-grid">
        {cards.map((card) => (
          <a key={card.title} className="portal-card" href={card.href}>
            <h3>{card.title}</h3>
            <p className="portal-card-note">Manage {card.title.toLowerCase()} in the portal.</p>
          </a>
        ))}
      </div>
    </div>
  );
}
