/**
 * Privacy Policy Page
 * 
 * GDPR-compliant privacy policy for the Pailiaq Music Training Platform
 */

import { Link } from "react-router";
import AuthButton from "../../components/auth/AuthButton";
import LiveStreamBanner from "../../components/LiveStreamBanner";
import '../global.css';

export default function PrivacyPolicyPage() {
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

      {/* Privacy Policy Content */}
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
              Privacy Policy
            </h1>
            <p className="text-white/70">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-lg prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="text-white/80 leading-relaxed">
                Welcome to Pailiaq Music Training Platform ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our music training services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2 mb-6">
                <li>Create an account and register for our services</li>
                <li>Subscribe to our newsletter or blog</li>
                <li>Purchase premium subscriptions or products</li>
                <li>Contact us through our contact forms or email</li>
                <li>Participate in interactive features such as leaderboards</li>
              </ul>

              <p className="text-white/80 leading-relaxed mb-4">
                This information may include:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2">
                <li>Name and email address</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Profile information and preferences</li>
                <li>Learning progress and performance data</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2">
                <li>Provide, operate, and maintain our music training platform</li>
                <li>Process your transactions and manage your subscriptions</li>
                <li>Send you technical notices, updates, and security alerts</li>
                <li>Respond to your comments, questions, and provide customer support</li>
                <li>Track your learning progress and provide personalized experiences</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our services and develop new features</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2">
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers (such as Stripe for payments, Supabase for data storage) who assist us in operating our platform</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests</li>
                <li><strong>Safety and Security:</strong> We may share information to protect the safety, rights, or property of our users or others</li>
                <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger, sale, or other business transaction</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
              <p className="text-white/80 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2 mt-4">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure password hashing using industry-standard algorithms</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication measures</li>
                <li>CSRF protection and rate limiting</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights (GDPR)</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                If you are a resident of the European Union, you have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2">
                <li><strong>Right of Access:</strong> Request information about the personal data we hold about you</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to Restrict Processing:</strong> Request limitation of processing your data</li>
                <li><strong>Right to Data Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Right to Object:</strong> Object to processing of your personal data for marketing purposes</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Cookies and Tracking</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2">
                <li>Remember your login status and preferences</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Provide personalized content and experiences</li>
                <li>Improve our services and troubleshoot issues</li>
              </ul>
              <p className="text-white/80 leading-relaxed mt-4">
                You can control cookie settings through your browser preferences. However, disabling cookies may limit some functionality of our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
              <p className="text-white/80 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Account data is typically retained for the duration of your account plus a reasonable period thereafter for legal and business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
              <p className="text-white/80 leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe we have collected information about your child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. International Data Transfers</h2>
              <p className="text-white/80 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and provide appropriate safeguards for your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-white/80 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Significant changes will be communicated via email or prominent notice on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
              </p>
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <p className="text-white/80">
                  <strong>Email:</strong> privacy@pailiaq.com<br/>
                  <strong>Website:</strong> <Link to="/contact" className="text-blue-400 hover:text-blue-300">Contact Form</Link>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Legal Basis for Processing (GDPR)</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                We process your personal data on the following legal bases:
              </p>
              <ul className="list-disc list-inside text-white/80 space-y-2">
                <li><strong>Contract Performance:</strong> To provide our music training services</li>
                <li><strong>Legitimate Interests:</strong> To improve our services, prevent fraud, and ensure security</li>
                <li><strong>Consent:</strong> For marketing communications and optional features</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}