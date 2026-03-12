import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Zap, Settings } from 'lucide-react';
import AgentLauncher from '@/components/AgentLauncher';
import AgentDashboard from '@/components/AgentDashboard';

export default function Agent() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Zap className="w-10 h-10 text-blue-400" />
                AI Agent Control Center
              </h1>
              <p className="text-slate-300">
                Autonomous development system powered by Mossbot
              </p>
            </div>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>

          {/* Info Banner */}
          <Card className="bg-blue-900/30 border-blue-700 mb-6">
            <CardContent className="pt-6 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-200 font-semibold">Autonomous Development Enabled</p>
                <p className="text-blue-300 text-sm mt-1">
                  The AI agent can work on your Galaxy History Simulator project 24/7, implementing features, fixing bugs, and generating documentation. Start the agent below to begin autonomous development.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Agent Launcher */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Agent Control</CardTitle>
              </CardHeader>
              <CardContent>
                <AgentLauncher />
              </CardContent>
            </Card>
          </div>

          {/* Right: Agent Dashboard */}
          <div className="lg:col-span-2">
            <AgentDashboard />
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Max Concurrent Tasks
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      defaultValue="3"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Task Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      defaultValue="30"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Retry Policy
                    </label>
                    <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                      <option>Aggressive (3 retries)</option>
                      <option>Moderate (2 retries)</option>
                      <option>Conservative (1 retry)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Workflow Priority
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Feature Development
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Bug Fixes
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input type="checkbox" className="rounded" />
                        Documentation
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-slate-300">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Send notifications on task completion</span>
                    </label>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Capabilities Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Agent Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">Feature Development</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                <ul className="space-y-2">
                  <li>• Analyze requirements</li>
                  <li>• Design architecture</li>
                  <li>• Implement features</li>
                  <li>• Write tests</li>
                  <li>• Create documentation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">Bug Fixes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                <ul className="space-y-2">
                  <li>• Reproduce issues</li>
                  <li>• Analyze root causes</li>
                  <li>• Implement fixes</li>
                  <li>• Validate solutions</li>
                  <li>• Commit changes</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                <ul className="space-y-2">
                  <li>• Generate README</li>
                  <li>• API documentation</li>
                  <li>• Architecture guides</li>
                  <li>• Code comments</li>
                  <li>• User guides</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
