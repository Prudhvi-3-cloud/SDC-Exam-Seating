import { BookOpen, ClipboardList, GraduationCap, FlaskConical, CalendarDays, Award } from 'lucide-react';

export function AcademicsPage() {
  return (
    <div className="w-full">
      {/* Page Banner */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl text-primary-foreground mb-3">Academics</h1>
          <p className="text-primary-foreground/90">Outcome-based education with strong industry alignment</p>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Programs Offered</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-background border border-border rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Undergraduate (B.Tech)</h3>
              <p className="text-sm text-muted-foreground">
                Strong core in engineering fundamentals with specialization tracks and project-based learning.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-background border border-border rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Postgraduate (M.Tech)</h3>
              <p className="text-sm text-muted-foreground">
                Advanced curriculum with research focus, electives, and industry-collaborative projects.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-background border border-border rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Value-Added Courses</h3>
              <p className="text-sm text-muted-foreground">
                Certifications in AI, data analytics, cloud, and full-stack development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum & Learning */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Curriculum & Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <ClipboardList className="w-6 h-6 text-primary" />
                <h3 className="text-xl">Outcome-Based Curriculum</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Structured outcomes, continuous assessment, and industry-relevant electives.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <FlaskConical className="w-6 h-6 text-primary" />
                <h3 className="text-xl">Labs & Research</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern labs, mini-projects each semester, and faculty-led research groups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Calendar */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl mb-4">Academic Calendar</h2>
              <p className="text-muted-foreground mb-6">
                Clear schedules for semesters, examinations, and project reviews to help students plan ahead.
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CalendarDays className="w-5 h-5 text-primary" />
                <span>Semester I & II timelines, internal assessments, and holidays</span>
              </div>
            </div>
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <h3 className="text-xl mb-3">Quick Highlights</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Regular internal assessments and lab evaluations</li>
                <li>Industry guest lectures each semester</li>
                <li>Capstone projects with faculty mentoring</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
