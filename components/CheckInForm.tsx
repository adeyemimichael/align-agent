'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Meh, Frown, Zap, Moon, Brain, Loader2 } from 'lucide-react';

type Mood = 'positive' | 'neutral' | 'negative';

interface CheckInData {
  energy: number;
  sleep: number;
  stress: number;
  mood: Mood;
}

interface CheckInResponse {
  id: string;
  capacityScore: number;
  mode: string;
  energy: number;
  sleep: number;
  stress: number;
  mood: string;
}

export default function CheckInForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<CheckInData>({
    energy: 5,
    sleep: 5,
    stress: 5,
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

  const getSliderColor = (field: keyof Omit<CheckInData, 'mood'>, value: number) => {
    if (field === 'stress') {
      // Stress: higher is worse (red)
      if (value >= 7) return 'from-red-500 to-red-600';
      if (value >= 4) return 'from-orange-500 to-orange-600';
      return 'from-green-500 to-green-600';
    } else {
      // Energy/Sleep: higher is better (green)
      if (value >= 7) return 'from-green-500 to-green-600';
      if (value >= 4) return 'from-yellow-500 to-yellow-600';
      return 'from-red-500 to-red-600';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8">
      {/* Energy Level */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <label htmlFor="energy" className="text-lg font-semibold text-gray-900">
              Energy Level
            </label>
          </div>
          <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${getSliderColor('energy', formData.energy)} text-white font-bold text-xl`}>
            {formData.energy}
          </div>
        </div>
        <input
          id="energy"
          type="range"
          min="1"
          max="10"
          value={formData.energy}
          onChange={(e) => handleSliderChange('energy', parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          style={{
            background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${(formData.energy - 1) * 11.11}%, rgb(229, 231, 235) ${(formData.energy - 1) * 11.11}%, rgb(229, 231, 235) 100%)`
          }}
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>Low</span>
          <span>High</span>
        </div>
      </motion.div>

      {/* Sleep Quality */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Moon className="w-5 h-5 text-purple-600" />
            </div>
            <label htmlFor="sleep" className="text-lg font-semibold text-gray-900">
              Sleep Quality
            </label>
          </div>
          <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${getSliderColor('sleep', formData.sleep)} text-white font-bold text-xl`}>
            {formData.sleep}
          </div>
        </div>
        <input
          id="sleep"
          type="range"
          min="1"
          max="10"
          value={formData.sleep}
          onChange={(e) => handleSliderChange('sleep', parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          style={{
            background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${(formData.sleep - 1) * 11.11}%, rgb(229, 231, 235) ${(formData.sleep - 1) * 11.11}%, rgb(229, 231, 235) 100%)`
          }}
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </motion.div>

      {/* Stress Level */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Brain className="w-5 h-5 text-orange-600" />
            </div>
            <label htmlFor="stress" className="text-lg font-semibold text-gray-900">
              Stress Level
            </label>
          </div>
          <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${getSliderColor('stress', formData.stress)} text-white font-bold text-xl`}>
            {formData.stress}
          </div>
        </div>
        <input
          id="stress"
          type="range"
          min="1"
          max="10"
          value={formData.stress}
          onChange={(e) => handleSliderChange('stress', parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
          style={{
            background: `linear-gradient(to right, rgb(249, 115, 22) 0%, rgb(249, 115, 22) ${(formData.stress - 1) * 11.11}%, rgb(229, 231, 235) ${(formData.stress - 1) * 11.11}%, rgb(229, 231, 235) 100%)`
          }}
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>Low</span>
          <span>High</span>
        </div>
      </motion.div>

      {/* Mood Selector */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="space-y-4"
      >
        <label className="text-lg font-semibold text-gray-900 block">How are you feeling?</label>
        <div className="grid grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => handleMoodChange('positive')}
            className={`relative py-6 px-4 rounded-xl border-2 transition-all ${
              formData.mood === 'positive'
                ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Smile className={`w-10 h-10 ${formData.mood === 'positive' ? 'text-emerald-600' : 'text-gray-400'}`} />
              <div className={`text-sm font-semibold ${formData.mood === 'positive' ? 'text-emerald-700' : 'text-gray-600'}`}>
                Positive
              </div>
            </div>
            {formData.mood === 'positive' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full"
              />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => handleMoodChange('neutral')}
            className={`relative py-6 px-4 rounded-xl border-2 transition-all ${
              formData.mood === 'neutral'
                ? 'border-gray-500 bg-gray-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Meh className={`w-10 h-10 ${formData.mood === 'neutral' ? 'text-gray-600' : 'text-gray-400'}`} />
              <div className={`text-sm font-semibold ${formData.mood === 'neutral' ? 'text-gray-700' : 'text-gray-600'}`}>
                Neutral
              </div>
            </div>
            {formData.mood === 'neutral' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-3 h-3 bg-gray-500 rounded-full"
              />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => handleMoodChange('negative')}
            className={`relative py-6 px-4 rounded-xl border-2 transition-all ${
              formData.mood === 'negative'
                ? 'border-orange-500 bg-orange-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Frown className={`w-10 h-10 ${formData.mood === 'negative' ? 'text-orange-600' : 'text-gray-400'}`} />
              <div className={`text-sm font-semibold ${formData.mood === 'negative' ? 'text-orange-700' : 'text-gray-600'}`}>
                Negative
              </div>
            </div>
            {formData.mood === 'negative' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full"
              />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
          >
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          'Complete Check-In'
        )}
      </motion.button>
    </form>
  );
}
