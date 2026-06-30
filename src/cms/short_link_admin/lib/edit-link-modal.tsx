"use client";

import { Modal, Button, Input, Label, TextField, useOverlayState } from "@heroui/react";
import { useEffect, useState } from "react";
import { type LinkRow } from "./actions/links";

interface EditLinkModalProps {
  link: LinkRow | null;
  onClose: () => void;
  onSave: (originalUrl: string, expiresAt: string | null) => void;
  isLoading?: boolean;
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

interface EditLinkFormProps {
  link: LinkRow;
  isOpen: boolean;
  onClose: () => void;
  onSave: (originalUrl: string, expiresAt: string | null) => void;
  isLoading: boolean;
}

function EditLinkForm({ link, isOpen, onClose, onSave, isLoading }: EditLinkFormProps) {
  const [originalUrl, setOriginalUrl] = useState(link.originalUrl);
  const [expiresAt, setExpiresAt] = useState(toDatetimeLocal(link.expiresAt));

  const state = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });

  useEffect(() => {
    if (isOpen) state.open();
    else state.close();
  }, [isOpen]);

  function handleSave() {
    onSave(originalUrl, expiresAt ? new Date(expiresAt).toISOString() : null);
  }

  return (
    <Modal state={state}>
      <Modal.Backdrop />
      <Modal.Container>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Edit Link</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col gap-4">
              <TextField value={originalUrl} onChange={setOriginalUrl} isRequired>
                <Label>Original URL</Label>
                <Input type="url" />
              </TextField>
              <label className="flex flex-col gap-1 text-sm">
                <span>Expires at</span>
                <input
                  type="datetime-local"
                  className="h-9 rounded-lg border border-default-300 bg-default-50 px-3 text-sm"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onPress={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onPress={handleSave} isDisabled={isLoading || !originalUrl}>
              {isLoading ? "Saving…" : "Save"}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}

export function EditLinkModal({ link, onClose, onSave, isLoading = false }: EditLinkModalProps) {
  if (!link) {
    return null;
  }

  return (
    <EditLinkForm
      key={link.id}
      link={link}
      isOpen={!!link}
      onClose={onClose}
      onSave={onSave}
      isLoading={isLoading}
    />
  );
}
