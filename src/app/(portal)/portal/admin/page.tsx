export default function AdminDashboard() {
  const cards = ["Departments", "Users"];

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
        {cards.map((title) => (
          <div key={title} className="portal-card">
            <h3>{title}</h3>
            <p className="portal-card-note">Planned for Phase 2</p>
          </div>
        ))}
      </div>
    </div>
  );
}
