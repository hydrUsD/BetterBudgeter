/**
 * BetterBudget Link Bank Page
 *
 * This page simulates a PSD2-style bank linking flow.
 * Users will "connect" their bank account via a mock API.
 *
 * Current status: SKELETON — no linking logic implemented yet.
 *
 * TODO (Task 3+):
 * - Display list of mock banks to choose from
 * - Implement mock OAuth consent flow
 * - Store linked account in database
 * - Handle success/error states
 * - Redirect to dashboard after linking
 */

import { generateMetadata } from "@/lib/head";

export const metadata = generateMetadata({
  title: "Link Bank Account",
});

export default function LinkBankPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-lg w-full space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Link Your Bank Account</h1>
          <p className="text-muted-foreground mt-2">
            Connect your bank to automatically import transactions
          </p>
        </div>

        {/* Placeholder for Bank Selection */}
        <div className="border border-dashed border-muted-foreground/50 rounded-lg p-8">
          <p className="text-muted-foreground text-center mb-4">
            Bank selection will appear here
          </p>

          {/* Mock bank list preview */}
          <div className="space-y-2">
            {["Demo Bank", "Test Credit Union", "Fake Finance Co."].map(
              (bank) => (
                <div
                  key={bank}
                  className="p-3 border border-muted rounded-md opacity-50 cursor-not-allowed"
                >
                  {bank}
                </div>
              )
            )}
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium">Coming soon:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>PSD2-style mock consent flow</li>
            <li>Deterministic transaction generation</li>
            <li>Account linking persistence</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
