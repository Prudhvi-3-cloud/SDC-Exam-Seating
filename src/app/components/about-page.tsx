import { Target, Eye, Users, Building2 } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="w-full">
      {/* Page Banner */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl text-primary-foreground mb-3">About SRIT</h1>
          <p className="text-primary-foreground/90">Excellence in Education Since 1997</p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-accent rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl">Our Vision</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To be a globally recognized institution of higher learning, empowering students with knowledge, 
                skills, and values to excel in their chosen fields and contribute meaningfully to society. 
                We aspire to foster innovation, research, and entrepreneurship that addresses real-world challenges.
              </p>
            </div>

            <div className="bg-accent rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl">Our Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To provide quality technical education through innovative teaching methodologies, state-of-the-art 
                infrastructure, and industry collaboration. We are committed to nurturing ethical, competent, and 
                socially responsible professionals who can lead in an ever-evolving technological landscape.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Leadership & Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6 text-center shadow-sm">
              <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl mb-2">Dr. R. Kumar</h3>
              <p className="text-primary mb-2">Principal</p>
              <p className="text-sm text-muted-foreground">
                Ph.D. in Computer Science with 25+ years of academic experience
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 text-center shadow-sm">
              <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl mb-2">Dr. S. Patel</h3>
              <p className="text-primary mb-2">Vice Principal</p>
              <p className="text-sm text-muted-foreground">
                Ph.D. in Electronics with expertise in curriculum development
              </p>
            </div>

            <div className="bg-background rounded-lg p-6 text-center shadow-sm">
              <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl mb-2">Prof. M. Sharma</h3>
              <p className="text-primary mb-2">Dean - Academics</p>
              <p className="text-sm text-muted-foreground">
                M.Tech with 20 years of experience in academic administration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Infrastructure Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-accent rounded-lg p-6">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h4 className="mb-2">Modern Classrooms</h4>
              <p className="text-sm text-muted-foreground">
                Smart classrooms equipped with audio-visual aids and comfortable seating
              </p>
            </div>

            <div className="bg-accent rounded-lg p-6">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h4 className="mb-2">Advanced Laboratories</h4>
              <p className="text-sm text-muted-foreground">
                Well-equipped labs for practical learning in all engineering disciplines
              </p>
            </div>

            <div className="bg-accent rounded-lg p-6">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h4 className="mb-2">Central Library</h4>
              <p className="text-sm text-muted-foreground">
                Extensive collection of books, journals, and digital resources
              </p>
            </div>

            <div className="bg-accent rounded-lg p-6">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h4 className="mb-2">Sports Facilities</h4>
              <p className="text-sm text-muted-foreground">
                Indoor and outdoor sports facilities for overall development
              </p>
            </div>

            <div className="bg-accent rounded-lg p-6">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h4 className="mb-2">Hostels</h4>
              <p className="text-sm text-muted-foreground">
                Separate hostels for boys and girls with modern amenities
              </p>
            </div>

            <div className="bg-accent rounded-lg p-6">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h4 className="mb-2">Cafeteria</h4>
              <p className="text-sm text-muted-foreground">
                Hygienic food court serving nutritious meals and snacks
              </p>
            </div>

            <div className="bg-accent rounded-lg p-6">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h4 className="mb-2">Medical Facility</h4>
              <p className="text-sm text-muted-foreground">
                24/7 medical support with experienced healthcare professionals
              </p>
            </div>

            <div className="bg-accent rounded-lg p-6">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h4 className="mb-2">Transport</h4>
              <p className="text-sm text-muted-foreground">
                Comprehensive bus service covering major routes in the city
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
