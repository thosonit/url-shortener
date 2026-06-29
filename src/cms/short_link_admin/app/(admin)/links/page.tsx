"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Input,
  Spinner,
  Table,
  Select,
  ListBoxItem,
  Label,
  SearchField,
} from "@heroui/react";
import { Ban, Play, Timer } from "lucide-react";
import { getLinks, patchLink, type LinkItem, type PaginatedResult } from "@/lib/api";
import { useDebounce } from "@/lib/use-debounce";
import { StatusChip } from "@/lib/status-chip";
import { SimplePagination } from "@/lib/simple-pagination";
import { ConfirmModal } from "@/lib/confirm-modal";

const LIMIT = 20;

export default function LinksPage() {
  const [data, setData] = useState<PaginatedResult<LinkItem> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    id: string;
    action: "disable" | "enable" | "forceExpire";
  } | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const fetchLinks = useCallback(async () => {
    try {
      const result = await getLinks({
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load links");
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  async function handleAction() {
    if (!confirmModal) return;
    setActionLoading(confirmModal.id);
    try {
      if (confirmModal.action === "forceExpire") {
        await patchLink(confirmModal.id, { forceExpire: true });
      } else {
        await patchLink(confirmModal.id, {
          status: confirmModal.action === "disable" ? "disabled" : "active",
        });
      }
      await fetchLinks();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  }

  const totalPages = data ? Math.ceil(data.meta.total / LIMIT) : 0;

  const confirmMessages: Record<string, string> = {
    disable: "Disable this link? It will return 404 on redirect.",
    enable: "Re-enable this link?",
    forceExpire: "Force-expire this link? It will return 410 Gone on redirect.",
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Link Management</h1>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <SearchField
          aria-label="Search links"
          value={search}
          onChange={setSearch}
          className="w-72"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search by code, URL, or email…" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <Select
          className="w-40"
          aria-label="Filter by status"
          placeholder="All statuses"
          selectedKey={statusFilter || null}
          onSelectionChange={(key) => setStatusFilter(key as string ?? "")}
        >
          <ListBoxItem id="active">Active</ListBoxItem>
          <ListBoxItem id="disabled">Disabled</ListBoxItem>
          <ListBoxItem id="expired">Expired</ListBoxItem>
        </Select>

        {statusFilter && (
          <Button size="sm" variant="ghost" onPress={() => setStatusFilter("")}>
            Clear
          </Button>
        )}
      </div>

      {error && <p className="mb-4 text-danger">{error}</p>}

      {!data ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <Table aria-label="Links table">
            <Table.Header>
              <Table.Column isRowHeader>Code</Table.Column>
              <Table.Column>Original URL</Table.Column>
              <Table.Column>Owner</Table.Column>
              <Table.Column>Clicks</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>Created</Table.Column>
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body items={data.items}>
              {(link) => (
                <Table.Row key={link.id} id={link.id}>
                  <Table.Cell>
                    <span className="font-mono text-sm">{link.code}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="block max-w-xs truncate text-sm" title={link.originalUrl}>
                      {link.originalUrl}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-default-500">
                      {link.ownerEmail ?? "anonymous"}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="tabular-nums">{link.clickCount.toLocaleString()}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusChip status={link.status} />
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-default-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-1">
                      {link.status === "active" && (
                        <Button
                          size="sm"
                          variant="danger-soft"
                          isIconOnly
                          aria-label="Disable link"
                          onPress={() => setConfirmModal({ id: link.id, action: "disable" })}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      {link.status === "disabled" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Enable link"
                          isIconOnly
                          onPress={() => setConfirmModal({ id: link.id, action: "enable" })}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {link.status !== "expired" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          aria-label="Force expire"
                          onPress={() => setConfirmModal({ id: link.id, action: "forceExpire" })}
                        >
                          <Timer className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>

          <div className="mt-4 flex justify-center">
            <SimplePagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleAction}
        title="Confirm Action"
        message={confirmModal ? confirmMessages[confirmModal.action] : ""}
        confirmVariant={confirmModal?.action === "enable" ? "primary" : "danger"}
        isLoading={!!actionLoading}
      />
    </div>
  );
}
