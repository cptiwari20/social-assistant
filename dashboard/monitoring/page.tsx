import JobMonitoringDashboard from '@/app/components/jobs/JobMonitoringDashboard';

export default function MonitoringPage() {
  return (
    <div className="max-w-7xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Job Monitoring</h1>
      <JobMonitoringDashboard />
    </div>
  );
} 