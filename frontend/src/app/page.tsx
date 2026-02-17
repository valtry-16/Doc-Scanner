'use client';

import Link from 'next/link';
import { Minimize2, FileType, GitMerge, ScanText } from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: 'Compress',
      description: 'Reduce file sizes for images and PDFs without losing quality',
      icon: Minimize2,
      href: '/compress',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Convert',
      description: 'Transform images between JPG, PNG, and WebP formats',
      icon: FileType,
      href: '/convert',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Merge',
      description: 'Combine multiple PDFs into a single document',
      icon: GitMerge,
      href: '/merge',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'OCR',
      description: 'Extract text from images and scanned documents',
      icon: ScanText,
      href: '/ocr',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Document Processing Made Simple
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Free, open-source platform to compress, convert, and manipulate your PDFs and images.
          No signup required, process files directly in your browser.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.title}
              href={feature.href}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`${feature.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose DocProcessor?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🔒 Secure & Private</h3>
            <p className="text-gray-600 text-sm">
              Files are automatically deleted after 30 minutes. No permanent storage.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">⚡ Fast Processing</h3>
            <p className="text-gray-600 text-sm">
              Powered by efficient backend workers for quick file processing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🆓 Completely Free</h3>
            <p className="text-gray-600 text-sm">
              Open-source and free to use. No hidden fees or subscriptions.
            </p>
          </div>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="mt-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Supported Formats</h3>
        <p className="text-gray-600">
          <span className="font-medium">Images:</span> JPG, PNG, WebP •{' '}
          <span className="font-medium">Documents:</span> PDF, DOCX, TXT, HTML
        </p>
      </div>
    </div>
  );
}
