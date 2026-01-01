"use client";

import { Header, Footer } from "@/components/layouts";
import Card from "@/components/ui/Card";

export default function AboutPage() {
  const stats = [
    { label: "Students", value: "10k+" },
    { label: "Instuctors", value: "100+" },
    { label: "Courses", value: "500+" },
    { label: "Countries", value: "20+" },
  ];

  const values = [
    {
      icon: "🚀",
      title: "Innovation",
      description:
        "We constantly push boundaries to provide the best learning experience.",
    },
    {
      icon: "🤝",
      title: "Community",
      description:
        "We believe learning is better together. We foster a supportive environment.",
    },
    {
      icon: "⭐",
      title: "Excellence",
      description:
        "We are committed to high-quality content and platform reliability.",
    },
    {
      icon: "🔓",
      title: "Accessibility",
      description: "Education should be accessible to everyone, everywhere.",
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-base dark:bg-base-dark">
        {/* Hero Section */}
        <section className="bg-hero text-white py-24 relative overflow-hidden transition-colors duration-200">
          <div className="container-custom relative z-10 text-center max-w-4xl mx-auto px-4">
            <span className="badge bg-white/10 text-white border border-white/20 mb-6 backdrop-blur-sm">
              Our Story
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Empowering the World to Learn
            </h1>
            <p className="text-primary-100 dark:text-neutral-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              We&apos;re on a mission to democratize education by connecting
              expert instructors with eager learners worldwide.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 -mt-16 px-4 relative z-20">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-soft-lg border border-neutral-100 dark:border-neutral-800">
              {stats.map((stat, index) => (
                <div key={index} className="text-center space-y-1">
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-4">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                  Bridging the gap between{" "}
                  <span className="text-primary-600">potential</span> and{" "}
                  <span className="text-primary-600">success</span>.
                </h2>
                <div className="space-y-4 text-neutral-600 dark:text-neutral-400 text-lg">
                  <p>
                    Founded in 2023, LMS Platform started with a simple idea:
                    quality education should be accessible to everyone. What
                    began as a small project has grew into a global community.
                  </p>
                  <p>
                    We believe that technology can transform how people learn.
                    By combining expert content with interactive tools, we help
                    individuals achieve their personal and professional goals.
                  </p>
                </div>
              </div>
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-soft-lg group">
                {/* Abstract Image Placeholder using CSS Patterns for now to ensure it works without external assets */}
                <div className="absolute inset-0 bg-primary-600 opacity-90"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white/20 font-bold text-9xl select-none">
                  LMS
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-black/80 text-white">
                  <p className="font-medium">
                    Our headquarters in Knowledge City
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-neutral-100 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800">
          <div className="container-custom px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                Our Core Values
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                These principles guide every decision we make and how we serve
                our community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((val, i) => (
                <Card
                  key={i}
                  className="p-6 hover:-translate-y-1 transition-transform duration-300 border-none shadow-soft-lg dark:shadow-none dark:bg-neutral-800/50"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/40 text-2xl flex items-center justify-center mb-4">
                    {val.icon}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                    {val.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                    {val.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Join Us CTA */}
        <section className="py-24 px-4 text-center">
          <div className="container-custom max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold text-neutral-900 dark:text-white">
              Join our growing team
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              We&apos;re always looking for talented individuals who are
              passionate about education and technology.
            </p>
            <button className="btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg rounded-full">
              View Open Positions
            </button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
