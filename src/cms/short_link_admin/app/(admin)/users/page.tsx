"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Spinner, Table, SearchField } from "@heroui/react";
import { ShieldBan, ShieldCheck, Eye } from "lucide-react";
import { getUsers, patchUser, type UserItem, type PaginatedResult } from "@/lib/api";
import { useDebounce } from "@/lib/use-debounce";
import { StatusChip } from "@/lib/status-chip";
import { SimplePagination } from "@/lib/simple-pagination";
import { ConfirmModal } from "@/lib/confirm-modal";

const LIMIT = 20;

const ROLE_LABELS: Record<string, string> = {
  user: "User",
  admin: "Admin",
  super_admin: "Super Admin",
};

export default function UsersPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResult<UserItem> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    id: string;
    action: "suspend" | "unsuspend";
    email: string;
  } | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const fetchUsers = useCallback(async () => {
    try {
      const result = await getUsers({
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
      });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  async function handleAction() {
    if (!confirmModal) return;
    setActionLoading(confirmModal.id);
    try {
      await patchUser(confirmModal.id, {
        status: confirmModal.action === "suspend" ? "suspended" : "active",
      });
      await fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  }

  const totalPages = data ? Math.ceil(data.meta.total / LIMIT) : 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>

      <div className="mb-4">
        <SearchField
          aria-label="Search users"
          value={search}
          onChange={setSearch}
          className="w-72"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search by email…" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </div>

      {error && <p className="mb-4 text-danger">{error}</p>}

      {!data ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <Table aria-label="Users table">
            <Table.Header>
              <Table.Column isRowHeader>Email</Table.Column>
              <Table.Column>Role</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>Joined</Table.Column>
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body items={data.items}>
              {(user) => (
                <Table.Row key={user.id} id={user.id}>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    <span className="text-sm">{ROLE_LABELS[user.role] ?? user.role}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusChip status={user.status} />
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-default-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        isIconOnly
                        aria-label="View details"
                        onPress={() => router.push(`/users/${user.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user.status === "active" ? (
                        <Button
                          size="sm"
                          variant="danger-soft"
                          isIconOnly
                          aria-label="Suspend user"
                          onPress={() =>
                            setConfirmModal({ id: user.id, action: "suspend", email: user.email })
                          }
                        >
                          <ShieldBan className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          aria-label="Unsuspend user"
                          onPress={() =>
                            setConfirmModal({ id: user.id, action: "unsuspend", email: user.email })
                          }
                        >
                          <ShieldCheck className="h-4 w-4" />
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
        message={
          confirmModal?.action === "suspend"
            ? `Suspend ${confirmModal.email}? They will not be able to create or claim links.`
            : confirmModal
              ? `Unsuspend ${confirmModal.email}? Their account will be restored.`
              : ""
        }
        confirmVariant={confirmModal?.action === "suspend" ? "danger" : "primary"}
        isLoading={!!actionLoading}
      />
    </div>
  );
}
