"use client";

import { Modal, Button, useOverlayState } from "@heroui/react";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const state = useOverlayState({ isOpen, onOpenChange: (open) => { if (!open) onClose(); } });

  useEffect(() => {
    if (isOpen) state.open();
    else state.close();
  }, [isOpen]);

  return (
    <Modal state={state}>
      <Modal.Backdrop />
      <Modal.Container>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p>{message}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onPress={onClose}>
              Cancel
            </Button>
            <Button
              variant={confirmVariant}
              onPress={onConfirm}
              isDisabled={isLoading}
            >
              {isLoading ? "Loading…" : confirmLabel}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}
