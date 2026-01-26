export default function StudentDashboard() {
  const cards = [
    "Profile",
    "Attendance",
    "Marks",
    "Fees",
    "Timetable",
    "Remarks",
  ];

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Student Area</p>
        <h1 className="portal-page-title">Dashboard</h1>
        <p className="portal-page-subtitle">
          Quick access to upcoming student features in the SRIT portal.
        </p>
      </div>
      <div className="portal-grid">
        {cards.map((title) => (
          <div key={title} className="portal-card">
            <h3>{title}</h3>
            <p className="portal-card-note">Coming in Phase 3</p>
          </div>
        ))}
      </div>
    </div>
  );
}
