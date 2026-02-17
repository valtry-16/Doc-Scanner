'use client';

import { useEffect, useState } from 'react';

interface FeatureSelectorProps {
  feature: 'compress' | 'convert';
  onOptionsChange: (options: any) => void;
}

export default function FeatureSelector({ feature, onOptionsChange }: FeatureSelectorProps) {
  const [selectedFormat, setSelectedFormat] = useState('jpg');
  const [quality, setQuality] = useState(85);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [resizePreset, setResizePreset] = useState('custom');
  const [resizeWidth, setResizeWidth] = useState<number | ''>('');
  const [resizeHeight, setResizeHeight] = useState<number | ''>('');
  const [keepAspect, setKeepAspect] = useState(true);

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
  };

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    onOptionsChange({ quality: newQuality });
  };

  useEffect(() => {
    if (feature !== 'convert') return;

    onOptionsChange({
      targetFormat: selectedFormat,
      resizeEnabled,
      resizeWidth: resizeWidth === '' ? null : resizeWidth,
      resizeHeight: resizeHeight === '' ? null : resizeHeight,
      keepAspect,
    });
  }, [feature, selectedFormat, resizeEnabled, resizeWidth, resizeHeight, keepAspect, onOptionsChange]);

  const handlePresetChange = (preset: string) => {
    setResizePreset(preset);
    if (preset === '512') {
      setResizeWidth(512);
      setResizeHeight(512);
    } else if (preset === '1024') {
      setResizeWidth(1024);
      setResizeHeight(1024);
    }
  };

  const handleWidthChange = (value: string) => {
    const next = value === '' ? '' : Math.max(1, parseInt(value));
    setResizeWidth(Number.isNaN(next as number) ? '' : next);
    setResizePreset('custom');
  };

  const handleHeightChange = (value: string) => {
    const next = value === '' ? '' : Math.max(1, parseInt(value));
    setResizeHeight(Number.isNaN(next as number) ? '' : next);
    setResizePreset('custom');
  };

  if (feature === 'convert') {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Conversion Options</h3>
        <p className="text-sm text-gray-600 mb-4">
          📷 Convert between formats:
        </p>
        <ul className="text-sm text-gray-600 mb-4 space-y-1 list-disc list-inside">
          <li>Image → Image (JPG, PNG, WebP)</li>
          <li>Images → PDF (combine multiple images)</li>
          <li>PDF → Images (extract each page)</li>
        </ul>
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

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={resizeEnabled}
              onChange={(e) => setResizeEnabled(e.target.checked)}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Resize images</span>
          </label>

          {resizeEnabled && (
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Preset size:</span>
                <select
                  value={resizePreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="custom">Custom</option>
                  <option value="512">512 x 512</option>
                  <option value="1024">1024 x 1024</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Width (px)</span>
                  <input
                    type="number"
                    min="1"
                    value={resizeWidth}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Height (px)</span>
                  <input
                    type="number"
                    min="1"
                    value={resizeHeight}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={keepAspect}
                  onChange={(e) => setKeepAspect(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Lock aspect ratio</span>
              </label>

              <p className="text-xs text-gray-500">
                Resize applies to images and PDF pages when converting to image formats.
              </p>
            </div>
          )}
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
