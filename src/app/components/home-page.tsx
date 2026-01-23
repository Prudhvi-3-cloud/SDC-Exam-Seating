import { Award, Users, Building2, TrendingUp, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/flagged/photo-1580408453889-ed5e1b51924a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzY5MDQ4NTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="SRIT Campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <h1 className="text-5xl mb-4">Srinivasa Ramanujan Institute of Technology</h1>
          <p className="text-2xl mb-8">Empowering Knowledge, Building Futures</p>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg transition-colors">
            Admissions 2025
          </button>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl">NBA Accredited</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                National Board of Accreditation approved programs ensuring quality education
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl">NAAC A Grade</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Recognized for excellence in education with A Grade accreditation
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl">Autonomous Status</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Autonomous institution with flexible curriculum and examination system
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Placements Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3">Placements 2024-25</h2>
            <p className="text-muted-foreground">Our students excel in their careers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <div className="text-4xl text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Placement Rate</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <div className="text-4xl text-primary mb-2">200+</div>
              <div className="text-sm text-muted-foreground">Partner Companies</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <div className="text-4xl text-primary mb-2">850+</div>
              <div className="text-sm text-muted-foreground">Students Placed</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <div className="text-4xl text-primary mb-2">₹12 LPA</div>
              <div className="text-sm text-muted-foreground">Highest Package</div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl">Latest Announcements</h2>
            <a href="#" className="text-primary hover:underline">View All</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background rounded-lg p-6 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="mb-2">Admissions Open for Academic Year 2025-26</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Applications are now being accepted for B.Tech programs in various specializations.
                  </p>
                  <p className="text-xs text-muted-foreground">Posted on: January 20, 2025</p>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-lg p-6 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="mb-2">Semester Examination Schedule Released</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    The examination schedule for the current semester has been published. Check your portal.
                  </p>
                  <p className="text-xs text-muted-foreground">Posted on: January 18, 2025</p>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-lg p-6 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="mb-2">Tech Fest 2025 Registrations Open</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Join us for our annual tech fest featuring workshops, competitions, and guest lectures.
                  </p>
                  <p className="text-xs text-muted-foreground">Posted on: January 15, 2025</p>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-lg p-6 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="mb-2">Campus Recruitment Drive - Multiple Companies</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Leading tech companies will be visiting campus for recruitment in February 2025.
                  </p>
                  <p className="text-xs text-muted-foreground">Posted on: January 12, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
