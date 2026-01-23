import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* College Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xl text-primary-foreground">SR</span>
              </div>
              <h3 className="text-lg">SRIT</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering Knowledge, Building Futures
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#home" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
              <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#admissions" className="text-muted-foreground hover:text-primary transition-colors">Admissions</a></li>
              <li><a href="#placements" className="text-muted-foreground hover:text-primary transition-colors">Placements</a></li>
            </ul>
          </div>

          {/* Academics */}
          <div>
            <h4 className="mb-4">Academics</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#departments" className="text-muted-foreground hover:text-primary transition-colors">Departments</a></li>
              <li><a href="#programs" className="text-muted-foreground hover:text-primary transition-colors">Programs</a></li>
              <li><a href="#research" className="text-muted-foreground hover:text-primary transition-colors">Research</a></li>
              <li><a href="#library" className="text-muted-foreground hover:text-primary transition-colors">Library</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>SRIT Campus, Ananthapuramu, Andhra Pradesh - 515001</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+91 123 456 7890</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@srit.edu.in</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Srinivasa Ramanujan Institute of Technology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
