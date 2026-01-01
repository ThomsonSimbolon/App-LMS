"use client";

import React, { useState } from "react";
import { Header, Footer } from "@/components/layouts";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for getting started with learning.",
      features: [
        "Access to free courses",
        "Basic progress tracking",
        "Community support",
        "Mobile access",
      ],
      notIncluded: [
        "Certificates of completion",
        "Offline viewing",
        "Instructor feedback",
        "Premium course access",
      ],
      buttonText: "Get Started",
      variant: "outline" as const,
    },
    {
      name: "Pro",
      price: annual ? 12 : 15,
      description: "Everything you need to master new skills.",
      popular: true,
      features: [
        "Access to ALL courses",
        "Unlimited certificates",
        "Offline viewing",
        "Priority support",
        "Advanced analytics",
        "Instructor Q&A",
      ],
      buttonText: "Start Free Trial",
      variant: "primary" as const,
    },
    {
      name: "Team",
      price: annual ? 49 : 59,
      description: "For small teams and organizations.",
      features: [
        "Everything in Pro",
        "Up to 5 team members",
        "Team progress dashboard",
        "Assign courses",
        "SSO Integration",
        "Dedicated success manager",
      ],
      buttonText: "Contact Sales",
      variant: "outline" as const,
    },
  ];

  const faqs = [
    {
      q: "Can I cancel anytime?",
      a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
    },
    {
      q: "Do you offer student discounts?",
      a: "Yes! Students with a valid .edu email address get 50% off the Pro plan.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards (Visa, Mastercard, Amex) and PayPal.",
    },
    {
      q: "Can I switch plans later?",
      a: "Absolutely. You can upgrade or downgrade your plan at any time from your account settings.",
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center">
          <div className="container-custom max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto">
              Choose the plan that&apos;s right for you. No hidden fees, cancel
              anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span
                className={cn(
                  "text-sm font-medium",
                  !annual
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500"
                )}
              >
                Monthly
              </span>
              <button
                onClick={() => setAnnual(!annual)}
                className="relative w-14 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Toggle billing cycle"
              >
                <div
                  className={cn(
                    "w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200",
                    annual ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </button>
              <span
                className={cn(
                  "text-sm font-medium",
                  annual
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500"
                )}
              >
                Yearly{" "}
                <span className="text-primary-600 text-xs font-bold ml-1">
                  (Save 20%)
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20 px-4">
          <div className="container-custom">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={cn(
                    "p-8 relative flex flex-col",
                    plan.popular
                      ? "border-primary-500 ring-1 ring-primary-500 shadow-soft-lg scale-105 z-10"
                      : "hover:shadow-soft-lg transition-shadow"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 h-10">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                        ${plan.price}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-neutral-500">
                          /{annual ? "mo" : "mo"}
                        </span>
                      )}
                    </div>
                    {annual && plan.price > 0 && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Billed ${plan.price * 12} yearly
                      </p>
                    )}
                  </div>

                  <div className="flex-1 mb-8">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300"
                        >
                          <span className="text-green-500 flex-shrink-0">
                            ✓
                          </span>
                          {feature}
                        </li>
                      ))}
                      {plan.notIncluded &&
                        plan.notIncluded.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm text-neutral-400 dark:text-neutral-600"
                          >
                            <span className="flex-shrink-0">×</span>
                            {feature}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <Button variant={plan.variant} className="w-full">
                    {plan.buttonText}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <div className="container-custom max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map((faq, i) => (
                <div key={i} className="space-y-2">
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                    {faq.q}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary-600 relative overflow-hidden">
          <div className="container-custom text-center relative z-10 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to start your learning journey?
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students already learning on our platform today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-primary-600 hover:bg-neutral-100 border-none">
                Get Started for Free
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-primary-700"
              >
                View All Courses
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
