"use client";

import { Chip } from "@heroui/react";

const STATUS_MAP: Record<string, { color: "success" | "danger" | "warning" | "default"; label: string }> = {
  active: { color: "success", label: "Active" },
  disabled: { color: "danger", label: "Disabled" },
  expired: { color: "warning", label: "Expired" },
  suspended: { color: "danger", label: "Suspended" },
};

export function StatusChip({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { color: "default" as const, label: status };
  return (
    <Chip color={cfg.color} size="sm" variant="soft">
      {cfg.label}
    </Chip>
  );
}
