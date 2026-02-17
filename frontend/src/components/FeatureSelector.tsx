'use client';

import { useState } from 'react';

interface FeatureSelectorProps {
  feature: 'compress' | 'convert';
  onOptionsChange: (options: any) => void;
}

export default function FeatureSelector({ feature, onOptionsChange }: FeatureSelectorProps) {
  const [selectedFormat, setSelectedFormat] = useState('jpg');
  const [quality, setQuality] = useState(85);

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
    onOptionsChange({ targetFormat: format });
  };

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    onOptionsChange({ quality: newQuality });
  };

  if (feature === 'convert') {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Conversion Options</h3>
        <p className="text-sm text-gray-600 mb-4">
          📷 Convert images to JPG, PNG, WebP, or PDF
        </p>
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Target Format:</span>
            <select
              value={selectedFormat}
              onChange={(e) => handleFormatChange(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
              <option value="pdf">PDF</option>
            </select>
          </label>
        </div>
      </div>
    );
  }

  if (feature === 'compress') {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Compression Options</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Compression Quality:</span>
              <span className="text-sm font-semibold text-primary-600">{quality}%</span>
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={quality}
              onChange={(e) => handleQualityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Higher quality (90-100%) = larger files with better image quality.
              Lower quality (50-70%) = smaller files with some quality loss.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
