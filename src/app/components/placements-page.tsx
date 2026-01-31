import { Building2, Briefcase, Users, TrendingUp, Award, Target } from 'lucide-react';

export function PlacementsPage() {
  return (
    <div className="w-full">
      {/* Page Banner */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl text-primary-foreground mb-3">Placements</h1>
          <p className="text-primary-foreground/90">Career readiness through training, internships, and recruitment</p>
        </div>
      </section>

      {/* Placement Snapshot */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Placement Snapshot</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center bg-background border border-border rounded-lg p-6 shadow-sm">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl text-primary mb-1">95%</div>
              <div className="text-sm text-muted-foreground">Placement Rate</div>
            </div>
            <div className="text-center bg-background border border-border rounded-lg p-6 shadow-sm">
              <Building2 className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl text-primary mb-1">200+</div>
              <div className="text-sm text-muted-foreground">Recruiters</div>
            </div>
            <div className="text-center bg-background border border-border rounded-lg p-6 shadow-sm">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl text-primary mb-1">850+</div>
              <div className="text-sm text-muted-foreground">Students Placed</div>
            </div>
            <div className="text-center bg-background border border-border rounded-lg p-6 shadow-sm">
              <Award className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl text-primary mb-1">12 LPA</div>
              <div className="text-sm text-muted-foreground">Highest Package</div>
            </div>
          </div>
        </div>
      </section>

      {/* Training */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Training & Career Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Briefcase className="w-6 h-6 text-primary" />
                <h3 className="text-xl">Aptitude & Soft Skills</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Weekly sessions on aptitude, communication, and interview readiness.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6 text-primary" />
                <h3 className="text-xl">Technical Bootcamps</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Domain-specific training in AI, cloud, cybersecurity, and full-stack development.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl">Internships & Mentoring</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Internships with industry partners and mentorship from alumni professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiters */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Top Recruiters</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['TCS', 'Infosys', 'Wipro', 'Cognizant', 'HCL', 'Tech Mahindra', 'Capgemini', 'Amazon'].map((company) => (
              <div key={company} className="bg-background border border-border rounded-lg p-4 text-center text-sm text-muted-foreground shadow-sm">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
