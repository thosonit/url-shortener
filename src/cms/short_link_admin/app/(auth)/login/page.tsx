"use client";

import { useActionState } from "react";
import { Button, Input, Label, Surface, TextField } from "@heroui/react";
import { loginAction, type LoginResult } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginResult, FormData>(
    loginAction,
    {}
  );

  return (
    <div className="flex min-h-dvh items-center justify-center bg-default-50 px-4">
      <Surface className="w-full max-w-sm rounded-2xl border border-default-200 p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">ShortLink</h1>
          <p className="mt-1 text-sm text-default-500">Admin Panel</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <TextField name="email" isRequired>
            <Label>Email</Label>
            <Input type="email" autoFocus />
          </TextField>
          <TextField name="password" isRequired>
            <Label>Password</Label>
            <Input type="password" />
          </TextField>

          {state.error && (
            <p className="text-sm text-danger">{state.error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="mt-2 w-full"
            isDisabled={isPending}
          >
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Surface>
    </div>
  );
}
