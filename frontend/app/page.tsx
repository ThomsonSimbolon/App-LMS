import { Header, Footer } from '@/components/layouts';

export default function Home() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container-custom py-20">
        {/* Hero Section */}
        <div className="text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex">
            <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2">
              🚀 Now in Beta
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
            <span className="gradient-text">Learn, Grow,</span>
            <br />
            <span className="text-neutral-900 dark:text-white">Get Certified</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Modern Learning Management System with integrated certification.
            Build skills, track progress, and earn recognized certificates.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <button className="btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg focus:ring-primary-500">
              Get Started
            </button>
            <button className="btn bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 px-8 py-3 text-lg focus:ring-neutral-500">
              Explore Courses
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto">
            {[
              { label: 'Active Students', value: '10k+' },
              { label: 'Courses', value: '500+' },
              { label: 'Instructors', value: '100+' },
              { label: 'Certificates', value: '5k+' },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center space-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          {[
            {
              icon: '🎓',
              title: 'Quality Courses',
              description: 'Learn from expert instructors with structured, high-quality content'
            },
            {
              icon: '📊',
              title: 'Track Progress',
              description: 'Monitor your learning journey with detailed analytics and insights'
            },
            {
              icon: '🏆',
              title: 'Earn Certificates',
              description: 'Get verified certificates upon course completion with QR verification'
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="card card-hover p-6 space-y-4 animate-scale-in"
              style={{ animationDelay: `${index * 100 + 200}ms` }}
            >
              <div className="text-4xl">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Status Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 card px-6 py-3">
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Platform Status: <span className="font-semibold text-accent-600 dark:text-accent-400">All Systems Operational</span>
            </span>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
