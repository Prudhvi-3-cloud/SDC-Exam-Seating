import { Phone, Mail, User, LogIn, Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full">
      {/* Top Utility Bar */}
      <div className="bg-muted py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>+91 123 456 7890</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>info@srit.edu.in</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#login"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Student Login</span>
            </a>
            <a
              href="#login"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Faculty Login</span>
            </a>
            <a
              href="/admin/login"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Login</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and College Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <span className="text-2xl text-primary-foreground">SR</span>
              </div>
              <div>
                <h1 className="text-2xl text-primary">SRIT</h1>
                <p className="text-sm text-muted-foreground">Srinivasa Ramanujan Institute of Technology</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-8">
              <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">About Us</a>
              <a href="#admissions" className="text-foreground hover:text-primary transition-colors">Admissions</a>
              <a href="#academics" className="text-foreground hover:text-primary transition-colors">Academics</a>
              <a href="#departments" className="text-foreground hover:text-primary transition-colors">Departments</a>
              <a href="#placements" className="text-foreground hover:text-primary transition-colors">Placements</a>
              <a href="#campus" className="text-foreground hover:text-primary transition-colors">Campus Life</a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
