"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Spinner,
  Surface,
  Table,
  Select,
  ListBoxItem,
  Modal,
  Separator,
  useOverlayState,
} from "@heroui/react";
import { ArrowLeft, ShieldBan, ShieldCheck } from "lucide-react";
import {
  getUserDetail,
  getUserLinks,
  patchUser,
  assignRole,
  type UserItem,
  type LinkItem,
  type PaginatedResult,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusChip } from "@/lib/status-chip";
import { SimplePagination } from "@/lib/simple-pagination";

const LIMIT = 20;

const ROLE_LABELS: Record<string, string> = {
  user: "User",
  admin: "Admin",
  super_admin: "Super Admin",
};

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [userDetail, setUserDetail] = useState<UserItem | null>(null);
  const [links, setLinks] = useState<PaginatedResult<LinkItem> | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const roleModalState = useOverlayState();

  const isSuperAdmin = currentUser?.role === "super_admin";

  const fetchUser = useCallback(async () => {
    try {
      const u = await getUserDetail(id);
      setUserDetail(u);
      setSelectedRole(u.role);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load user");
    }
  }, [id]);

  const fetchLinks = useCallback(async () => {
    try {
      const result = await getUserLinks(id, { page, limit: LIMIT });
      setLinks(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load links");
    }
  }, [id, page]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  async function handleSuspendToggle() {
    if (!userDetail) return;
    setActionLoading(true);
    try {
      const newStatus = userDetail.status === "active" ? "suspended" : "active";
      await patchUser(id, { status: newStatus });
      await fetchUser();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRoleAssign() {
    setActionLoading(true);
    try {
      await assignRole(id, selectedRole);
      await fetchUser();
      roleModalState.close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign role");
    } finally {
      setActionLoading(false);
    }
  }

  const totalPages = links ? Math.ceil(links.meta.total / LIMIT) : 0;

  if (error && !userDetail) {
    return <p className="text-danger">{error}</p>;
  }

  if (!userDetail) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-2"
        onPress={() => router.push("/users")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Button>

      <Surface className="mb-6 rounded-xl border border-default-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{userDetail.email}</h1>
            <div className="mt-2 flex items-center gap-3">
              <StatusChip status={userDetail.status} />
              <span className="text-sm text-default-500">
                {ROLE_LABELS[userDetail.role] ?? userDetail.role}
              </span>
              <span className="text-sm text-default-400">
                Joined {new Date(userDetail.createdAt).toLocaleDateString()}
              </span>
              {userDetail.linkCount !== undefined && (
                <span className="text-sm text-default-400">
                  {userDetail.linkCount} links
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={userDetail.status === "active" ? "danger-soft" : "secondary"}
              isDisabled={actionLoading}
              onPress={handleSuspendToggle}
              className="gap-2"
            >
              {userDetail.status === "active" ? (
                <>
                  <ShieldBan className="h-4 w-4" /> Suspend
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Unsuspend
                </>
              )}
            </Button>
            {isSuperAdmin && (
              <Button
                size="sm"
                variant="outline"
                onPress={roleModalState.open}
              >
                Assign Role
              </Button>
            )}
          </div>
        </div>
      </Surface>

      {error && <p className="mb-4 text-danger">{error}</p>}

      <Separator className="mb-4" />
      <h2 className="mb-4 text-lg font-semibold">User Links</h2>

      {!links ? (
        <Spinner size="md" />
      ) : links.items.length === 0 ? (
        <p className="text-default-400">No links found.</p>
      ) : (
        <>
          <Table aria-label="User links">
            <Table.Header>
              <Table.Column isRowHeader>Code</Table.Column>
              <Table.Column>Original URL</Table.Column>
              <Table.Column>Clicks</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>Created</Table.Column>
            </Table.Header>
            <Table.Body items={links.items}>
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
                </Table.Row>
              )}
            </Table.Body>
          </Table>

          <div className="mt-4 flex justify-center">
            <SimplePagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}

      <Modal state={roleModalState}>
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>Assign Role</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-3 text-sm text-default-500">
                Change role for {userDetail.email}
              </p>
              <Select
                aria-label="Role"
                selectedKey={selectedRole}
                onSelectionChange={(key) => {
                  if (key) setSelectedRole(key as string);
                }}
              >
                <ListBoxItem id="user">User</ListBoxItem>
                <ListBoxItem id="admin">Admin</ListBoxItem>
                <ListBoxItem id="super_admin">Super Admin</ListBoxItem>
              </Select>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={roleModalState.close}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isDisabled={actionLoading}
                onPress={handleRoleAssign}
              >
                {actionLoading ? "Saving…" : "Save"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </div>
  );
}
