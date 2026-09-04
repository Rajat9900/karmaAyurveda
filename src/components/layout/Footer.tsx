import React from "react";
import Link from "next/link";
import BookingForm from "@/components/home/BookingForm";

export default function Footer() {
  return (
    <>
      <footer className="bg-[#0f2c1f] text-gray-300 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* About */}
          <div>
            <div className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-3xl">🌿</span>
              Karma Ayurveda
            </div>

            <p className="text-sm leading-relaxed mb-4">
              Karma Ayurveda is India&apos;s No. 1 Integrated Healthcare
              Hospital offering holistic treatment for kidney, liver, cancer,
              and lifestyle diseases through traditional Ayurveda and modern
              diagnostics.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <span className="text-sm">FB</span>
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <span className="text-sm">IG</span>
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <span className="text-sm">YT</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              Quick Links
            </h3>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-green-400 transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="hover:text-green-400 transition-colors"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/media"
                  className="hover:text-green-400 transition-colors"
                >
                  Media
                </Link>
              </li>

              <li>
                <Link
                  href="/research-articles"
                  className="hover:text-green-400 transition-colors"
                >
                  Research &amp; Articles
                </Link>
              </li>

              <li>
                <Link
                  href="/faqs"
                  className="hover:text-green-400 transition-colors"
                >
                  FAQs
                </Link>
              </li>

              <li>
                <Link
                  href="/our-courses"
                  className="hover:text-green-400 transition-colors"
                >
                  Our Courses
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="hover:text-green-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Diseases */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              Top Diseases
            </h3>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/kidney"
                  className="hover:text-green-400 transition-colors"
                >
                  Kidney Disease
                </Link>
              </li>

              <li>
                <Link
                  href="/cancer"
                  className="hover:text-green-400 transition-colors"
                >
                  Cancer Treatment
                </Link>
              </li>

              <li>
                <Link
                  href="/liver"
                  className="hover:text-green-400 transition-colors"
                >
                  Liver Cirrhosis
                </Link>
              </li>

              <li>
                <Link
                  href="/psoriasis"
                  className="hover:text-green-400 transition-colors"
                >
                  Psoriasis
                </Link>
              </li>

              <li>
                <Link
                  href="/parkinson"
                  className="hover:text-green-400 transition-colors"
                >
                  Parkinson&apos;s Disease
                </Link>
              </li>

              <li>
                <Link
                  href="/diabetes"
                  className="hover:text-green-400 transition-colors"
                >
                  Diabetes Reversal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              Contact Us
            </h3>

            <ul className="space-y-4 text-sm">

              {/* Address */}
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>

                <span>
                  Neta Ji Subhash Place, Pitampura, New Delhi - 110034
                </span>
              </li>

              {/* Phone */}
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-green-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a2 2 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>

                <a
                  href="tel:9971928080"
                  className="hover:text-white transition-colors"
                >
                  99719-28080
                </a>
              </li>

              {/* Email */}
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-green-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>

                <a
                  href="mailto:info@karmaayurveda.com"
                  className="hover:text-white transition-colors"
                >
                  info@karmaayurveda.com
                </a>
              </li>

            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="container mx-auto px-4 mt-12 pt-6 border-t border-white/10 text-center text-xs">
          <p>
            &copy; {new Date().getFullYear()} Karma Ayurveda. All rights
            reserved.
          </p>
        </div>
      </footer>

      {/* Booking Form */}
      <BookingForm />
    </>
  );
}

