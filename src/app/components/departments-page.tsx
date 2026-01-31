import { Cpu, Code, Zap, Cog, Laptop, FlaskConical } from 'lucide-react';

export function DepartmentsPage() {
  const departments = [
    {
      icon: <Code className="w-8 h-8" />,
      name: 'Computer Science & Engineering',
      description: 'Learn programming, algorithms, AI, machine learning, and software development',
      seats: '180 Seats',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      name: 'Electronics & Communication Engineering',
      description: 'Study circuits, communication systems, embedded systems, and VLSI design',
      seats: '120 Seats',
    },
    {
      icon: <Cog className="w-8 h-8" />,
      name: 'Mechanical Engineering',
      description: 'Focus on design, manufacturing, thermodynamics, and automotive systems',
      seats: '120 Seats',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      name: 'Electrical & Electronics Engineering',
      description: 'Explore power systems, control systems, and renewable energy technologies',
      seats: '90 Seats',
    },
    {
      icon: <FlaskConical className="w-8 h-8" />,
      name: 'Civil Engineering',
      description: 'Learn about structural design, construction management, and urban planning',
      seats: '90 Seats',
    },
    {
      icon: <Laptop className="w-8 h-8" />,
      name: 'Information Technology',
      description: 'Master web development, databases, networking, and cloud computing',
      seats: '120 Seats',
    },
  ];

  return (
    <div className="w-full">
      {/* Page Banner */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl text-primary-foreground mb-3">Our Departments</h1>
          <p className="text-primary-foreground/90">Choose Your Path to Excellence</p>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            SRIT offers undergraduate programs in various engineering disciplines, each designed to provide 
            comprehensive knowledge and practical skills for a successful career.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/50 transition-all group cursor-pointer"
              >
                <div className="w-16 h-16 bg-background border border-border rounded-lg flex items-center justify-center mb-4 group-hover:border-primary/40 transition-colors">
                  <div className="text-primary">{dept.icon}</div>
                </div>
                <h3 className="text-xl mb-3 group-hover:text-primary transition-colors">
                  {dept.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {dept.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm text-primary">{dept.seats}</span>
                  <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    Learn More →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Department Features */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">What Makes Our Departments Special</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6">
              <h4 className="mb-3">Experienced Faculty</h4>
              <p className="text-sm text-muted-foreground">
                Learn from highly qualified professors and industry experts with years of teaching experience
              </p>
            </div>

            <div className="bg-background rounded-lg p-6">
              <h4 className="mb-3">Modern Labs</h4>
              <p className="text-sm text-muted-foreground">
                Hands-on experience in well-equipped laboratories with latest equipment and software
              </p>
            </div>

            <div className="bg-background rounded-lg p-6">
              <h4 className="mb-3">Industry Connections</h4>
              <p className="text-sm text-muted-foreground">
                Strong partnerships with leading companies for internships, projects, and placements
              </p>
            </div>

            <div className="bg-background rounded-lg p-6">
              <h4 className="mb-3">Research Opportunities</h4>
              <p className="text-sm text-muted-foreground">
                Engage in cutting-edge research projects and publish papers in reputed journals
              </p>
            </div>

            <div className="bg-background rounded-lg p-6">
              <h4 className="mb-3">Project-Based Learning</h4>
              <p className="text-sm text-muted-foreground">
                Real-world projects that develop problem-solving and critical thinking skills
              </p>
            </div>

            <div className="bg-background rounded-lg p-6">
              <h4 className="mb-3">Skill Development</h4>
              <p className="text-sm text-muted-foreground">
                Additional training programs in soft skills, technical skills, and entrepreneurship
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
