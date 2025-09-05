/**
 * Terms of Service Page
 * 
 * Legal terms and conditions for the Pailiaq Music Training Platform
 */

import { Link } from "react-router";
import AuthButton from "../../components/auth/AuthButton";
import LiveStreamBanner from "../../components/LiveStreamBanner";
import '../global.css';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      {/* YouTube Live Stream Banner */}
      <LiveStreamBanner />
      
      {/* Navigation Header */}
      <header className="relative py-6">
        <div className="absolute top-6 right-6 z-20 flex items-center gap-8">
          <nav className="flex items-center gap-1 bg-black/20 backdrop-blur-md rounded-lg px-1 py-1 border border-white/10">
            <Link 
              to="/about" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              About
            </Link>
            <span className="text-white/30">•</span>
            <Link 
              to="/blog" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              Blog
            </Link>
            <span className="text-white/30">•</span>
            <Link 
              to="/store" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              Store
            </Link>
            <span className="text-white/30">•</span>
            <Link 
              to="/dashboard" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              Dashboard
            </Link>
            <span className="text-white/30">•</span>
            <Link 
              to="/contact" 
              className="text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-md hover:bg-white/10"
            >
              Contact
            </Link>
          </nav>
          <AuthButton showRegister={true} />
        </div>
      </header>

      {/* Terms of Service Content */}
      <main className="max-w-4xl mx-auto p-6 pb-16">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 lg:p-12">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-6"
            >
              ← Back to Home
            </Link>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-white/70">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-lg prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-white/80 leading-relaxed">
                By accessing and using the Pailiaq Music Training Platform ("Service," "Platform," or "we"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                Pailiaq Music Training Platform is an interactive web-based music education service that provides:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2">
                <li>Ear training exercises and transcription practice</li>
                <li>Music theory instruction and chord construction training</li>
                <li>Counterpoint composition practice and validation</li>
                <li>Progress tracking and performance analytics</li>
                <li>Community features including leaderboards and competitions</li>
                <li>Educational content including blog articles and tutorials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts and Registration</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                To access certain features of our Service, you must register for an account. When you create an account, you agree to:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and identification</li>
                <li>Accept all risks of unauthorized access to your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Subscription and Payment Terms</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Free and Premium Services</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                We offer both free and premium subscription tiers. Premium features may include advanced training modules, detailed analytics, priority support, and exclusive content.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Payment and Billing</h3>
              <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">
                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                <li>Payment processing is handled securely through Stripe</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We reserve the right to change subscription pricing with 30 days notice</li>
                <li>Failed payments may result in account suspension until payment is resolved</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Cancellation</h3>
              <p className="text-white/80 leading-relaxed">
                You may cancel your subscription at any time through your account settings. Your subscription will remain active until the end of the current billing period, after which you will lose access to premium features but retain access to free features and your account data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. User Conduct and Acceptable Use</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                You agree to use our Service responsibly and not to:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2">
                <li>Violate any applicable local, state, national, or international law</li>
                <li>Transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
                <li>Impersonate or attempt to impersonate the company, employees, another user, or any other person or entity</li>
                <li>Engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
                <li>Use any automated system or software to extract data from the Service for commercial purposes</li>
                <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service</li>
                <li>Share your account credentials with others or maintain multiple accounts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property Rights</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Our Content</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of Pailiaq and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">User Content</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                You retain ownership of any content you create or upload to the Service ("User Content"). However, by uploading User Content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your User Content in connection with the Service.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Educational Use</h3>
              <p className="text-white/80 leading-relaxed">
                Our training exercises and educational content are provided for personal, non-commercial educational use only. You may not redistribute, sell, or use our content for commercial purposes without explicit written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Privacy and Data Protection</h2>
              <p className="text-white/80 leading-relaxed">
                Your privacy is important to us. Please review our <Link to="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>, which also governs your use of the Service, to understand our practices regarding the collection and use of your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimers and Limitation of Liability</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Service Availability</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                We strive to provide uninterrupted access to our Service, but we cannot guarantee 100% uptime. We reserve the right to suspend or terminate the Service for maintenance, upgrades, or other operational reasons.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Educational Disclaimer</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                Our Service is designed to supplement, not replace, traditional music education. While we strive for accuracy in our educational content, we make no warranties about the completeness or accuracy of the information provided.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h3>
              <p className="text-white/80 leading-relaxed">
                To the fullest extent permitted by law, Pailiaq shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Indemnification</h2>
              <p className="text-white/80 leading-relaxed">
                You agree to defend, indemnify, and hold harmless Pailiaq and its affiliates from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="text-white/80 leading-relaxed">
                Upon termination, your right to use the Service will cease immediately. If you wish to delete your account, you may do so through your account settings or by contacting us directly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Governing Law and Dispute Resolution</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which Pailiaq operates, without regard to its conflict of law provisions.
              </p>
              <p className="text-white/80 leading-relaxed">
                Any disputes arising from these Terms or your use of the Service will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except where prohibited by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Changes to Terms</h2>
              <p className="text-white/80 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will provide notice of significant changes by email or through the Service. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Severability</h2>
              <p className="text-white/80 leading-relaxed">
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Contact Information</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <p className="text-white/80">
                  <strong>Email:</strong> legal@pailiaq.com<br/>
                  <strong>Website:</strong> <Link to="/contact" className="text-blue-400 hover:text-blue-300">Contact Form</Link>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Entire Agreement</h2>
              <p className="text-white/80 leading-relaxed">
                These Terms of Service, together with our Privacy Policy and any other legal notices published by us on the Service, constitute the entire agreement between you and Pailiaq concerning the Service and supersede all prior or contemporaneous communications and proposals.
              </p>
            </section>

            <div className="mt-12 p-6 bg-blue-600/20 border border-blue-500/30 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-2">
                Thank you for using Pailiaq Music Training Platform
              </h3>
              <p className="text-white/80 text-sm">
                We're committed to providing you with the best possible music education experience while protecting your rights and privacy. 
                If you have any questions about these terms, please don't hesitate to <Link to="/contact" className="text-blue-400 hover:text-blue-300">contact us</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}