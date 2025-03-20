"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface JobMetrics {
  name: string;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  waiting: number;
}

interface FailedJob {
  id: string;
  queue: string;
  failedReason: string;
  attemptsMade: number;
  timestamp: string;
  data: any;
}

export default function JobMonitoringDashboard() {
  const [metrics, setMetrics] = useState<JobMetrics[]>([]);
  const [failedJobs, setFailedJobs] = useState<FailedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [metricsResponse, failedJobsResponse] = await Promise.all([
        fetch('/api/jobs/metrics'),
        fetch('/api/jobs/failed')
      ]);

      const metricsData = await metricsResponse.json();
      const failedJobsData = await failedJobsResponse.json();

      setMetrics(metricsData);
      setFailedJobs(failedJobsData);
    } catch (error) {
      setError('Failed to fetch job data');
    } finally {
      setLoading(false);
    }
  };

  const retryJob = async (jobId: string, queue: string) => {
    try {
      await fetch(`/api/jobs/${queue}/${jobId}/retry`, {
        method: 'POST'
      });
      await fetchData(); // Refresh data
    } catch (error) {
      setError('Failed to retry job');
    }
  };

  const retryAllFailed = async (queue: string) => {
    try {
      await fetch(`/api/jobs/${queue}/retry-all`, {
        method: 'POST'
      });
      await fetchData(); // Refresh data
    } catch (error) {
      setError('Failed to retry jobs');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Queue Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">{metric.name}</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-sm text-gray-500">Active:</span>
                  <span className="ml-2">{metric.active}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Failed:</span>
                  <span className="ml-2 text-red-600">{metric.failed}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Waiting:</span>
                  <span className="ml-2">{metric.waiting}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Completed:</span>
                  <span className="ml-2 text-green-600">{metric.completed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Failed Jobs</h2>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Queue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failed At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {failedJobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{job.queue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(job.timestamp), 'PPpp')}
                  </td>
                  <td className="px-6 py-4">{job.failedReason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{job.attemptsMade}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => retryJob(job.id, job.queue)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 