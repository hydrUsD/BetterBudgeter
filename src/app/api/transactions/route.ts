/*
 *   Copyright (c) 2025 Laith Alkhaddam aka Iconical or Sleepyico.
 *   All rights reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * Transactions API Route
 *
 * Handles CRUD operations for transactions. Uses Supabase Auth for authentication.
 *
 * Auth: Requires valid Supabase session (checked via createServerSupabaseClient)
 *
 * Endpoints:
 * - GET: Fetch all transactions for authenticated user
 * - POST: Create new transaction
 * - PATCH: Update existing transaction
 * - DELETE: Remove transaction
 */

import { db } from "@/lib/db";
import { transactions } from "@/schema/dbSchema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { expenseCategories, incomeCategories } from "@/lib/categories";
import { selectTransactionType } from "@/schema/transactionForm";
import { createServerSupabaseClient } from "@/lib/db/supabaseServer";

/**
 * Verify user is authenticated via Supabase Auth.
 *
 * Uses the server-side Supabase client which reads session from cookies.
 * Returns the authenticated user or an error response.
 */
async function verifyAuth() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        authorized: false,
        error: "Unauthorized - please log in",
        user: null,
      };
    }

    return { authorized: true, user, error: null };
  } catch (err) {
    return {
      authorized: false,
      error: `Auth error: ${(err as Error).message}`,
      user: null,
    };
  }
}

export async function GET() {
  const { authorized, error } = await verifyAuth();
  if (!authorized) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  try {
    const transactionsList = await db.select().from(transactions);
    return NextResponse.json({
      transactions: transactionsList,
    });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to fetch transactions",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { authorized, user, error } = await verifyAuth();

  if (!authorized) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  try {
    const {
      type,
      amount,
      original_amount,
      original_currency,
      description,
      date,
      category,
      is_actual,
      recurring_parent_id,
      is_recurring,
      frequency,
      is_consistent_amount,
      status,
    } = await req.json();

    const validCategories =
      type === "income" ? incomeCategories : expenseCategories;
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { message: `Invalid category for type '${type}'` },
        { status: 400 }
      );
    }

    const newTransaction = await db
      .insert(transactions)
      .values({
        type,
        amount,
        original_amount,
        original_currency,
        description: description || "",
        date,
        category,
        is_actual,
        recurring_parent_id,
        is_recurring,
        frequency,
        is_consistent_amount,
        status,
      })
      .returning();

    return NextResponse.json(
      {
        user,
        message: "Transaction added",
        transaction: newTransaction[0],
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to add transaction", error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { authorized, user, error } = await verifyAuth();

  if (!authorized) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    const transactionToDelete = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));

    if (!transactionToDelete.length) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    await db.delete(transactions).where(eq(transactions.id, id));

    return NextResponse.json(
      {
        user,
        message: "Transaction deleted successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to delete transaction",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { authorized, user, error } = await verifyAuth();

  if (!authorized) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  try {
    const { id, amount, description, category, is_actual } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Missing transaction ID" },
        { status: 400 }
      );
    }

    const updateData: Partial<selectTransactionType> = {};

    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (is_actual !== undefined) updateData.is_actual = is_actual;

    await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id));

    return NextResponse.json({
      user,
      message: "Transaction updated successfully",
      updatedTransaction: updateData,
    });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to update transaction",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
