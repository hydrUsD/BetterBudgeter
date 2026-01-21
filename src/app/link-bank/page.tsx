/**
 * BetterBudget Link Bank Page
 *
 * This page implements the PSD2-style bank linking flow for MVP.
 *
 * PSD2 CONCEPT: Account Access Consent
 * In real PSD2, users grant explicit consent via OAuth redirect to their bank.
 * For this MVP, we simulate the consent flow with a simplified UI.
 *
 * FLOW:
 * 1. User arrives at /link-bank (must be authenticated)
 * 2. User sees list of available banks
 * 3. User selects a bank to connect
 * 4. User confirms consent explicitly
 * 5. Bank accounts are created in database (= consent persisted)
 * 6. User is redirected to dashboard
 *
 * WHAT THIS SIMULATES:
 * - Bank selection from available institutions
 * - Explicit consent confirmation
 * - Consent persistence via database
 *
 * WHAT THIS OMITS:
 * - OAuth redirect to bank
 * - Bank login credentials
 * - Per-account consent (all accounts are linked for MVP)
 *
 * @see docs/PSD2_MOCK_STRATEGY.md Section 5
 */

import { generateMetadata } from "@/lib/head";
import { requireUser } from "@/lib/auth";
import { getLinkedBankIds } from "@/lib/db/accounts";
import { MOCK_BANKS } from "@/lib/mock";
import { LinkBankFlow } from "@/components/finance/LinkBankFlow";

export const metadata = generateMetadata({
  title: "Link Bank Account",
});

export default async function LinkBankPage() {
  // Require authentication — redirects to /login if not logged in
  await requireUser("/link-bank");

  // Get list of already-linked bank IDs for this user
  // This is used to show which banks are already connected
  const linkedBankIds = await getLinkedBankIds();

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

        {/* Bank Linking Flow (Client Component) */}
        <LinkBankFlow banks={MOCK_BANKS} linkedBankIds={linkedBankIds} />

        {/* Info Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-2">
          <p>
            Your data is protected by Row Level Security. Only you can access
            your financial information.
          </p>
          <p>
            <strong>Note:</strong> This is a demo using mock bank data. No real
            bank connections are made.
          </p>
        </div>
      </div>
    </main>
  );
}