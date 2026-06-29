import { Surface } from "@heroui/react";
import { Link2, MousePointerClick, Users, CalendarPlus } from "lucide-react";
import { getStats } from "@/lib/actions/stats";

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  colorClass: string;
}

function KpiCard({ label, value, icon: Icon, colorClass }: KpiCardProps) {
  return (
    <Surface className="flex items-center gap-4 rounded-xl border border-default-200 p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${colorClass}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-default-500">{label}</p>
      </div>
    </Surface>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Links"
          value={stats.totalLinks.toLocaleString()}
          icon={Link2}
          colorClass="bg-accent"
        />
        <KpiCard
          label="Links Today"
          value={stats.linksToday.toLocaleString()}
          icon={CalendarPlus}
          colorClass="bg-success"
        />
        <KpiCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          colorClass="bg-secondary"
        />
        <KpiCard
          label="Total Clicks"
          value={stats.totalClicks.toLocaleString()}
          icon={MousePointerClick}
          colorClass="bg-warning"
        />
      </div>
    </div>
  );
}
