"use client";

import { useState } from "react";
import { Link } from "react-router";
import AuthButton from "../../components/auth/AuthButton";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append('access_key', '910297c7-6262-4e15-873e-2fe211b767a4');
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('subject', form.subject);
      formData.append('message', form.message);
      formData.append('inquiry_type', form.inquiryType);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitStatus('success');
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: "general"
      });
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Failed to send message. Please try again or email directly at pailiaqmusic@gmail.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inquiryTypes = [
    { value: "general", label: "General Inquiry" },
    { value: "booking", label: "Booking Request" },
    { value: "mixing", label: "Mixing/Mastering Services" },
    { value: "lessons", label: "Music Production Lessons" },
    { value: "licensing", label: "Music Licensing" },
    { value: "press", label: "Press/Media" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      {/* Header */}
      <header className="relative">
        <div className="absolute top-6 left-6 z-20">
          <Link to="/" className="text-white hover:text-white/80 transition-colors">
            <img src="/pailiaq-logo-small.png" alt="pailiaq logo" className="w-12 h-12 rounded-full" />
          </Link>
        </div>
        
        <div className="absolute top-6 right-6 z-20">
          <AuthButton showRegister={true} />
        </div>

        <div className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Contact Me
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Available for bookings, mixing/mastering services, and music production lessons
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-20">
        {/* Contact Form */}
        <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
              <p className="text-green-300 text-center font-medium">
                ✅ Message sent!
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-300 text-center">
                ❌ {errorMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-white font-medium mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="inquiryType" className="block text-white font-medium mb-2">
                Inquiry Type *
              </label>
              <select
                id="inquiryType"
                name="inquiryType"
                value={form.inquiryType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-colors"
              >
                {inquiryTypes.map((type) => (
                  <option key={type.value} value={type.value} className="bg-[#1a1a2e] text-white">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-white font-medium mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
                placeholder="Brief subject line"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-white font-medium mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors resize-vertical"
                placeholder="Tell me about your project, event, or inquiry. Include relevant details like dates, budget, timeline, etc."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 border border-white/30 rounded-xl px-8 py-4 text-white font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Message...
                </span>
              ) : (
                "Send Message"
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/20 text-center">
            <p className="text-white/70 text-sm mb-2">
              Prefer direct email?
            </p>
            <a 
              href="mailto:pailiaqmusic@gmail.com"
              className="text-white hover:text-white/80 font-medium transition-colors"
            >
              pailiaqmusic@gmail.com
            </a>
          </div>
        </section>

        {/* Social Links */}
        <section className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">Connect on Social Media</h3>
          <div className="flex justify-center gap-6">
            <a 
              href="https://soundcloud.com/pailiaq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-16 h-16 flex items-center justify-center text-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
            >
              ☁️
            </a>
            <a 
              href="https://youtube.com/@pailiaq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-16 h-16 flex items-center justify-center text-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
            >
              📹
            </a>
            <a 
              href="https://patreon.com/pailiaq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-16 h-16 flex items-center justify-center text-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
            >
              💜
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-black/30 backdrop-blur-md border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-white/60 text-sm">
            © 2024 pailiaq. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}