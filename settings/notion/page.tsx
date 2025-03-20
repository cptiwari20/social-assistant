import NotionConnect from "@/app/components/NotionConnect";
import NotionDatabaseSelector from "@/app/components/NotionDatabaseSelector";

export default function NotionSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Notion Settings</h1>
      <div className="space-y-8">
        <NotionConnect />
        <NotionDatabaseSelector />
      </div>
    </div>
  );
} 