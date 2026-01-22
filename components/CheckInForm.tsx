'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Mood = 'positive' | 'neutral' | 'negative';

interface CheckInData {
  energyLevel: number;
  sleepQuality: number;
  stressLevel: number;
  mood: Mood;
}

interface CheckInResponse {
  id: string;
  capacityScore: number;
  mode: string;
  energyLevel: number;
  sleepQuality: number;
  stressLevel: number;
  mood: string;
}

export default function CheckInForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<CheckInData>({
    energyLevel: 5,
    sleepQuality: 5,
    stressLevel: 5,
    mood: 'neutral',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSliderChange = (field: keyof Omit<CheckInData, 'mood'>, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMoodChange = (mood: Mood) => {
    setFormData((prev) => ({ ...prev, mood }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit check-in');
      }

      const data: CheckInResponse = await response.json();
      
      // Redirect to dashboard with success message
      router.push(`/dashboard?checkin=success&score=${data.capacityScore}&mode=${data.mode}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-8">
      {/* Energy Level */}
      <div className="space-y-3">
        <label htmlFor="energy" className="block text-lg font-medium text-gray-900">
          Energy Level
          <span className="ml-3 text-2xl font-bold text-emerald-600">
            {formData.energyLevel}
          </span>
        </label>
        <input
          id="energy"
          type="range"
          min="1"
          max="10"
          value={formData.energyLevel}
          onChange={(e) => handleSliderChange('energyLevel', parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>Low (1)</span>
          <span>High (10)</span>
        </div>
      </div>

      {/* Sleep Quality */}
      <div className="space-y-3">
        <label htmlFor="sleep" className="block text-lg font-medium text-gray-900">
          Sleep Quality
          <span className="ml-3 text-2xl font-bold text-emerald-600">
            {formData.sleepQuality}
          </span>
        </label>
        <input
          id="sleep"
          type="range"
          min="1"
          max="10"
          value={formData.sleepQuality}
          onChange={(e) => handleSliderChange('sleepQuality', parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>Poor (1)</span>
          <span>Excellent (10)</span>
        </div>
      </div>

      {/* Stress Level */}
      <div className="space-y-3">
        <label htmlFor="stress" className="block text-lg font-medium text-gray-900">
          Stress Level
          <span className="ml-3 text-2xl font-bold text-red-600">
            {formData.stressLevel}
          </span>
        </label>
        <input
          id="stress"
          type="range"
          min="1"
          max="10"
          value={formData.stressLevel}
          onChange={(e) => handleSliderChange('stressLevel', parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>Low (1)</span>
          <span>High (10)</span>
        </div>
      </div>

      {/* Mood Selector */}
      <div className="space-y-3">
        <label className="block text-lg font-medium text-gray-900">Mood</label>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleMoodChange('positive')}
            className={`py-4 px-6 rounded-lg border-2 transition-all ${
              formData.mood === 'positive'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400'
            }`}
          >
            <div className="text-3xl mb-1">😊</div>
            <div className="text-sm font-medium">Positive</div>
          </button>
          <button
            type="button"
            onClick={() => handleMoodChange('neutral')}
            className={`py-4 px-6 rounded-lg border-2 transition-all ${
              formData.mood === 'neutral'
                ? 'border-gray-600 bg-gray-50 text-gray-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-3xl mb-1">😐</div>
            <div className="text-sm font-medium">Neutral</div>
          </button>
          <button
            type="button"
            onClick={() => handleMoodChange('negative')}
            className={`py-4 px-6 rounded-lg border-2 transition-all ${
              formData.mood === 'negative'
                ? 'border-orange-600 bg-orange-50 text-orange-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-orange-400'
            }`}
          >
            <div className="text-3xl mb-1">😔</div>
            <div className="text-sm font-medium">Negative</div>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Complete Check-In'}
      </button>
    </form>
  );
}
