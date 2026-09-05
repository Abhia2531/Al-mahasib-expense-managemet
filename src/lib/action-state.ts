/**
 * Shared result type for Server Actions.
 *
 * This lives outside `actions.ts` on purpose: a `"use server"` module may only
 * export async functions, so the `idleState` object constant cannot live there.
 */

export interface ActionState {
  ok: boolean;
  error?: string;
}

export const idleState: ActionState = { ok: false };
