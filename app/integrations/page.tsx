'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { CheckCircle2, XCircle, Calendar, CheckSquare, BarChart3, Zap } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Integration {
  platform: string;
}

interface User {
  integrations: Integration[];
  checkIns: Array<{ capacityScore: number }>;
}

interface AIStatus {
  gemini: { configured: boolean; status: string };
  opik: { configured: boolean; status: string };
}

export default function IntegrationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchUserData();
      fetchAIStatus();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/integrations');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIStatus = async () => {
    try {
      const response = await fetch('/api/ai/status');
      if (response.ok) {
        const data = await response.json();
        setAiStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch AI status:', error);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const todoistIntegration = user?.integrations.find((i) => i.platform === 'todoist');
  const calendarIntegration = user?.integrations.find((i) => i.platform === 'google_calendar');
  const capacityScore = user?.checkIns[0]?.capacityScore;

  const integrations = [
    {
      id: 'todoist',
      name: 'Todoist',
      description: 'Sync your tasks and get AI-powered prioritization',
      icon: CheckSquare,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      connected: !!todoistIntegration,
      connectUrl: '/api/integrations/todoist/connect',
      disconnectUrl: '/api/integrations/todoist/disconnect',
      features: [
        'Automatic task import',
        'Two-way sync',
        'Priority-based scheduling',
        'Due date tracking',
      ],
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Auto-schedule tasks as calendar events',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      connected: !!calendarIntegration,
      connectUrl: '/api/integrations/google-calendar/connect',
      disconnectUrl: '/api/integrations/google-calendar/disconnect',
      features: [
        'Automatic time blocking',
        'Smart scheduling',
        'Conflict detection',
        'Calendar sync',
      ],
    },
    {
      id: 'gemini',
      name: 'Gemini AI',
      description: 'AI-powered task prioritization and planning',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      connected: aiStatus?.gemini?.configured ?? false,
      features: [
        'Intelligent task ordering',
        'Capacity-aware scheduling',
        'Reasoning explanations',
        'Adaptive recommendations',
      ],
      isBuiltIn: true,
    },
    {
      id: 'opik',
      name: 'Opik Tracking',
      description: 'Track AI performance and decision quality',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      connected: aiStatus?.opik?.configured ?? false,
      features: [
        'AI decision logging',
        'Performance metrics',
        'Reasoning quality tracking',
        'Capacity accuracy analysis',
      ],
      isBuiltIn: true,
    },
  ];

  return (
    <DashboardLayout user={session.user} capacityScore={capacityScore}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
            <p className="text-gray-600">
              Connect your favorite tools to supercharge your productivity
            </p>
          </div>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              
              return (
                <div
                  key={integration.id}
                  className={`bg-white rounded-xl border-2 ${
                    integration.connected ? integration.borderColor : 'border-gray-200'
                  } p-6 hover:shadow-lg transition-all`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${integration.bgColor}`}>
                        <Icon className={`w-6 h-6 ${integration.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{integration.name}</h3>
                        {integration.isBuiltIn && (
                          <span className="text-xs text-gray-500">Built-in</span>
                        )}
                      </div>
                    </div>
                    {integration.connected ? (
                      <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Connected
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Not Connected
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">{integration.description}</p>

                  {/* Features */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Features</p>
                    <ul className="space-y-1">
                      {integration.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  {!integration.isBuiltIn && (
                    <div>
                      {integration.connected ? (
                        <button
                          onClick={async () => {
                            if (confirm(`Disconnect ${integration.name}?`)) {
                              try {
                                const response = await fetch(integration.disconnectUrl!, {
                                  method: 'DELETE',
                                });
                                if (response.ok) {
                                  window.location.reload();
                                } else {
                                  alert('Failed to disconnect. Please try again.');
                                }
                              } catch (error) {
                                alert('Failed to disconnect. Please try again.');
                              }
                            }
                          }}
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <Link
                          href={integration.connectUrl!}
                          className="block w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all text-center text-sm font-medium shadow-md hover:shadow-lg"
                        >
                          Connect {integration.name}
                        </Link>
                      )}
                    </div>
                  )}

                  {integration.isBuiltIn && (
                    <div className="text-center text-sm text-gray-500">
                      {integration.connected ? 'Active and ready to use' : 'Configure in environment variables'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">🚀 How Integrations Work</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>1. Connect your tools:</strong> Link Todoist for tasks and Google Calendar for scheduling
              </p>
              <p>
                <strong>2. Complete daily check-in:</strong> Tell us your energy, sleep, and stress levels
              </p>
              <p>
                <strong>3. Get AI-powered plan:</strong> Gemini AI creates an optimized schedule based on your capacity
              </p>
              <p>
                <strong>4. Auto-schedule:</strong> Tasks are automatically added to your Google Calendar
              </p>
              <p>
                <strong>5. Track & improve:</strong> Opik monitors AI decisions to continuously improve recommendations
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
