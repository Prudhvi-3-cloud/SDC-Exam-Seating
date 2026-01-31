import { Music, Trophy, Building2, Users, HeartHandshake, Sparkles } from 'lucide-react';

export function CampusLifePage() {
  return (
    <div className="w-full">
      {/* Page Banner */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl text-primary-foreground mb-3">Campus Life</h1>
          <p className="text-primary-foreground/90">A vibrant community that supports learning beyond classrooms</p>
        </div>
      </section>

      {/* Student Life */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Student Life</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-background border border-border rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Clubs & Societies</h3>
              <p className="text-sm text-muted-foreground">
                Technical clubs, cultural groups, and entrepreneurship cells to explore interests.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-background border border-border rounded-lg flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Cultural Events</h3>
              <p className="text-sm text-muted-foreground">
                Annual fests, competitions, and celebrations that bring the campus together.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-background border border-border rounded-lg flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Sports & Fitness</h3>
              <p className="text-sm text-muted-foreground">
                Indoor and outdoor sports facilities with inter-college tournaments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Facilities & Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-6 h-6 text-primary" />
                <h3 className="text-xl">Hostels</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Comfortable accommodation with study halls, dining, and secure access.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl">Student Services</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Counseling, career guidance, and grievance support for student wellbeing.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <HeartHandshake className="w-6 h-6 text-primary" />
                <h3 className="text-xl">Community Outreach</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                NSS and service initiatives that encourage social responsibility.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
