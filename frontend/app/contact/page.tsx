'use client';

import React, { useState } from 'react';
import { Header, Footer } from '@/components/layouts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { Mail, MapPin, Phone, Map } from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert('Message sent successfully! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        
        {/* Hero Section */}
        {/* Hero Section */}
        <section className="bg-primary-600 dark:bg-neutral-900 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="container-custom relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Get in Touch</h1>
            <p className="text-primary-100 dark:text-neutral-400 text-lg max-w-2xl mx-auto">
              Have questions about our courses or platform? We're here to help. Reach out to our team.
            </p>
          </div>
        </section>

        <section className="py-20 px-4 -mt-10">
          <div className="container-custom max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Contact Info Cards */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1">Email</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Our friendly team is here to help.</p>
                    <a href="mailto:support@lms-platform.com" className="text-primary-600 font-medium hover:underline">
                      support@lms-platform.com
                    </a>
                  </div>
                </Card>

                <Card className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1">Office</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Come say hello at our office HQ.</p>
                    <p className="text-neutral-900 dark:text-white text-sm font-medium">
                      123 Learning Street<br />
                      Knowledge City, KC 45678
                    </p>
                  </div>
                </Card>

                <Card className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1">Phone</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Mon-Fri from 8am to 5pm.</p>
                    <a href="tel:+15551234567" className="text-primary-600 font-medium hover:underline">
                      +1 (555) 123-4567
                    </a>
                  </div>
                </Card>
              </div>

              {/* Contact Form */}
              <Card className="lg:col-span-2 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Your Name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <Input
                    label="Subject"
                    name="subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={6}
                      className={cn(
                        "w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm",
                        "placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                        "dark:text-white resize-none"
                      )}
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={loading} className="w-full md:w-auto">
                      Send Message
                    </Button>
                  </div>
                </form>
              </Card>

            </div>
          </div>
        </section>

        {/* Map Section (Optional visual) */}
        <div className="h-96 bg-neutral-200 dark:bg-neutral-800 w-full relative">
           <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
             <div className="text-center flex flex-col items-center">
               <Map className="w-10 h-10 mb-2" />
               <p>Interactive Map Component Would Go Here</p>
             </div>
           </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
