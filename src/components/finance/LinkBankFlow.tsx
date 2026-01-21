"use client";

/**
 * LinkBankFlow Component
 *
 * Interactive client component for the bank linking / consent flow.
 *
 * PSD2 CONCEPT: Consent UI
 * This component simulates the consent screen users would see when
 * connecting their bank via a TPP (Third Party Provider).
 *
 * FLOW:
 * 1. User sees list of available banks
 * 2. User selects a bank
 * 3. User sees consent confirmation screen
 * 4. User explicitly confirms consent
 * 5. Bank is linked, user is redirected to dashboard
 *
 * WHAT THIS SIMULATES:
 * - Bank selection from available institutions
 * - Explicit consent confirmation
 * - Success/error feedback
 *
 * WHAT THIS OMITS:
 * - OAuth redirect to bank
 * - Bank login credentials
 * - Account selection (we link all accounts for MVP)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MockBank } from "@/lib/mock/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface LinkBankFlowProps {
  /** Available banks to choose from */
  banks: MockBank[];
  /** Bank IDs that are already linked */
  linkedBankIds: string[];
}

type FlowState = "select" | "confirm" | "loading" | "success" | "error";

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function LinkBankFlow({ banks, linkedBankIds }: LinkBankFlowProps) {
  const router = useRouter();

  // Flow state
  const [state, setState] = useState<FlowState>("select");
  const [selectedBank, setSelectedBank] = useState<MockBank | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Filter out already-linked banks
  const availableBanks = banks.filter(
    (bank) => !linkedBankIds.includes(bank.bankId)
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleSelectBank = (bank: MockBank) => {
    setSelectedBank(bank);
    setState("confirm");
  };

  const handleCancelConsent = () => {
    setSelectedBank(null);
    setState("select");
  };

  const handleConfirmConsent = async () => {
    if (!selectedBank) return;

    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/link-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankId: selectedBank.bankId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to link bank");
      }

      // Success!
      setSuccessMessage(data.message);
      setState("success");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setState("error");
    }
  };

  const handleRetry = () => {
    setErrorMessage("");
    setState("confirm");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Bank Selection
  // ─────────────────────────────────────────────────────────────────────────

  if (state === "select") {
    return (
      <div className="space-y-6">
        {/* Already linked banks notice */}
        {linkedBankIds.length > 0 && (
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="pt-6">
              <p className="text-sm text-green-800 dark:text-green-200">
                You have {linkedBankIds.length} bank
                {linkedBankIds.length === 1 ? "" : "s"} linked.{" "}
                <button
                  onClick={handleGoToDashboard}
                  className="underline hover:no-underline"
                >
                  Go to Dashboard
                </button>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Available banks */}
        {availableBanks.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Select a bank to connect:
            </p>
            {availableBanks.map((bank) => (
              <Card
                key={bank.bankId}
                className="cursor-pointer transition-colors hover:border-primary hover:bg-accent/50"
                onClick={() => handleSelectBank(bank)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{bank.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {bank.country} · {bank.bic}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                All available banks are already linked.
              </p>
              <Button onClick={handleGoToDashboard} className="mt-4">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Consent Confirmation
  // ─────────────────────────────────────────────────────────────────────────

  if (state === "confirm" && selectedBank) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grant Access to {selectedBank.name}?</CardTitle>
          <CardDescription>
            You are about to connect your bank account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Consent explanation */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2">
              This will allow BetterBudget to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                View your account balances
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                View your transaction history
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Import transactions for budgeting
              </li>
            </ul>
          </div>

          {/* What we don't do */}
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">BetterBudget will NOT:</p>
            <ul className="space-y-1">
              <li>• Make any payments on your behalf</li>
              <li>• Share your data with third parties</li>
              <li>• Store your bank login credentials</li>
            </ul>
          </div>

          {/* PSD2 simulation notice */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            <p>
              <strong>Demo Note:</strong> This is a simulated PSD2 consent flow.
              In production, you would be redirected to your bank&apos;s secure
              login page.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" onClick={handleCancelConsent}>
            Cancel
          </Button>
          <Button onClick={handleConfirmConsent}>Grant Access</Button>
        </CardFooter>
      </Card>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Loading
  // ─────────────────────────────────────────────────────────────────────────

  if (state === "loading") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="text-4xl">🔗</div>
            <p className="text-muted-foreground">
              Linking {selectedBank?.name}...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Success
  // ─────────────────────────────────────────────────────────────────────────

  if (state === "success") {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardContent className="py-12 text-center">
          <div className="space-y-4">
            <div className="text-4xl">✓</div>
            <p className="font-medium text-green-800 dark:text-green-200">
              {successMessage}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Redirecting to dashboard...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Error
  // ─────────────────────────────────────────────────────────────────────────

  if (state === "error") {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <CardContent className="py-8 text-center">
          <div className="space-y-4">
            <div className="text-4xl">✕</div>
            <p className="font-medium text-red-800 dark:text-red-200">
              Failed to link bank
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {errorMessage}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="outline" onClick={handleCancelConsent}>
                Choose Different Bank
              </Button>
              <Button onClick={handleRetry}>Try Again</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
