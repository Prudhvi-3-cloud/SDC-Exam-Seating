import { Calendar, FileText, CheckCircle, Download, FileCheck } from 'lucide-react';

export function AdmissionsPage() {
  return (
    <div className="w-full">
      {/* Page Banner */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl text-primary-foreground mb-3">Admissions 2025-26</h1>
          <p className="text-primary-foreground/90">Join SRIT and Shape Your Future</p>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Admission Process</h2>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center text-primary font-semibold">
                    1
                  </div>
                </div>
                <div className="flex-1 bg-background border border-border rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-6 h-6 text-primary" />
                    <h3 className="text-xl">Online Application</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fill out the online application form on our admissions portal with accurate personal 
                    and academic details. Upload required documents including 10th and 12th mark sheets.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center text-primary font-semibold">
                    2
                  </div>
                </div>
                <div className="flex-1 bg-background border border-border rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <FileCheck className="w-6 h-6 text-primary" />
                    <h3 className="text-xl">Document Verification</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Submit original documents for verification along with photocopies. Ensure all certificates 
                    are attested and meet the eligibility criteria mentioned.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center text-primary font-semibold">
                    3
                  </div>
                </div>
                <div className="flex-1 bg-background border border-border rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-6 h-6 text-primary" />
                    <h3 className="text-xl">Counseling & Seat Allocation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Attend the counseling session based on your entrance exam rank. Choose your preferred 
                    branch and get seat allocation confirmation.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center text-primary font-semibold">
                    4
                  </div>
                </div>
                <div className="flex-1 bg-background border border-border rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <h3 className="text-xl">Confirmation & Fee Payment</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pay the admission fee to confirm your seat. Complete all formalities including hostel 
                    allocation and medical checkup if required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Important Dates</h2>

          <div className="max-w-3xl mx-auto bg-background rounded-lg overflow-hidden shadow-sm">
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-6 hover:bg-muted/60 transition-colors">
                <div>
                  <h4 className="mb-1">Application Start Date</h4>
                  <p className="text-sm text-muted-foreground">Begin your application process</p>
                </div>
                <div className="text-primary">March 1, 2025</div>
              </div>

              <div className="flex items-center justify-between p-6 hover:bg-muted/60 transition-colors">
                <div>
                  <h4 className="mb-1">Application End Date</h4>
                  <p className="text-sm text-muted-foreground">Last date for submission</p>
                </div>
                <div className="text-primary">May 31, 2025</div>
              </div>

              <div className="flex items-center justify-between p-6 hover:bg-muted/60 transition-colors">
                <div>
                  <h4 className="mb-1">Entrance Exam</h4>
                  <p className="text-sm text-muted-foreground">State/National level entrance exam</p>
                </div>
                <div className="text-primary">April 15-30, 2025</div>
              </div>

              <div className="flex items-center justify-between p-6 hover:bg-muted/60 transition-colors">
                <div>
                  <h4 className="mb-1">Counseling Dates</h4>
                  <p className="text-sm text-muted-foreground">Attend counseling session</p>
                </div>
                <div className="text-primary">June 10-20, 2025</div>
              </div>

              <div className="flex items-center justify-between p-6 hover:bg-muted/60 transition-colors">
                <div>
                  <h4 className="mb-1">Classes Commence</h4>
                  <p className="text-sm text-muted-foreground">Academic year begins</p>
                </div>
                <div className="text-primary">July 1, 2025</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-background border border-border rounded-lg p-12 text-center shadow-sm">
            <h2 className="text-3xl mb-4">Ready to Apply?</h2>
            <p className="mb-8 text-muted-foreground max-w-2xl mx-auto">
              Take the first step towards your engineering career. Apply now and join SRIT's community of 
              excellence.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg transition-colors flex items-center gap-2">
                Apply Now
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary/10 px-8 py-3 rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
