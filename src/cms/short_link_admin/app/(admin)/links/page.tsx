"use client";

import { useEffect, useState, useCallback } from "react";
import { Button, Spinner, Table, SearchField } from "@heroui/react";
import { Ban, ExternalLink, Pencil, Play, Timer, Trash2 } from "lucide-react";
import {
  deleteLink,
  getLinks,
  patchLink,
  updateLink,
  type LinkRow,
  type PaginatedLinks,
} from "@/lib/actions/links";
import { useDebounce } from "@/lib/use-debounce";
import { StatusChip } from "@/lib/status-chip";
import { SimplePagination } from "@/lib/simple-pagination";
import { ConfirmModal } from "@/lib/confirm-modal";
import { EditLinkModal } from "@/lib/edit-link-modal";

const LIMIT = 20;
const SHORT_BASE = process.env.NEXT_PUBLIC_SHORT_BASE_URL ?? "http://localhost:8080";

export default function LinksPage() {
  const [data, setData] = useState<PaginatedLinks | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    id: string;
    action: "disable" | "enable" | "forceExpire" | "delete";
  } | null>(null);
  const [editingLink, setEditingLink] = useState<LinkRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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
      if (confirmModal.action === "delete") {
        await deleteLink(confirmModal.id);
      } else if (confirmModal.action === "forceExpire") {
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

  async function handleEditSave(originalUrl: string, expiresAt: string | null) {
    if (!editingLink) return;
    setEditLoading(true);
    try {
      await updateLink(editingLink.id, { originalUrl, expiresAt });
      await fetchLinks();
      setEditingLink(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setEditLoading(false);
    }
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  const confirmMessages: Record<string, string> = {
    disable: "Disable this link? It will return 404 on redirect.",
    enable: "Re-enable this link?",
    forceExpire: "Force-expire this link? It will return 410 Gone on redirect.",
    delete: "Permanently delete this link? This cannot be undone.",
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

        <select
          className="h-9 rounded-lg border border-default-300 bg-default-50 px-3 text-sm"
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="expired">Expired</option>
        </select>

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
          <Table>
            <Table.Content aria-label="Links table">
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
                {(link: LinkRow) => (
                  <Table.Row key={link.id} id={link.id}>
                    <Table.Cell>
                      <a
                        href={`${SHORT_BASE}/${link.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-sm text-primary hover:underline"
                      >
                        {link.code}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Table.Cell>
                    <Table.Cell>
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block max-w-xs truncate text-sm text-primary hover:underline"
                        title={link.originalUrl}
                      >
                        {link.originalUrl}
                      </a>
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
                            isIconOnly
                            aria-label="Enable link"
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
                        <Button
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          aria-label="Edit link"
                          onPress={() => setEditingLink(link)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger-soft"
                          isIconOnly
                          aria-label="Delete link"
                          onPress={() => setConfirmModal({ id: link.id, action: "delete" })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
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

      <EditLinkModal
        link={editingLink}
        onClose={() => setEditingLink(null)}
        onSave={handleEditSave}
        isLoading={editLoading}
      />
    </div>
  );
}
