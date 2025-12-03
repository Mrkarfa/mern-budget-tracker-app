import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Use hardcoded userId for testing
    const userId = 'user-1';

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const transaction = await db.select()
        .from(transactions)
        .where(and(
          eq(transactions.id, parseInt(id)),
          eq(transactions.userId, userId)
        ))
        .limit(1);

      if (transaction.length === 0) {
        return NextResponse.json({ 
          error: 'Transaction not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(transaction[0], { status: 200 });
    }

    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 1000);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const conditions = [eq(transactions.userId, userId)];

    if (type) {
      conditions.push(eq(transactions.type, type));
    }

    if (category) {
      conditions.push(eq(transactions.category, category));
    }

    if (dateFrom) {
      conditions.push(gte(transactions.date, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(transactions.date, dateTo));
    }

    const results = await db.select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use hardcoded userId for testing
    const userId = 'user-1';

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { type, amount, category, description, date } = body;

    if (!type || (type !== 'income' && type !== 'expense')) {
      return NextResponse.json({ 
        error: "Type is required and must be 'income' or 'expense'",
        code: "INVALID_TYPE" 
      }, { status: 400 });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ 
        error: "Amount is required and must be a positive number",
        code: "INVALID_AMOUNT" 
      }, { status: 400 });
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return NextResponse.json({ 
        error: "Category is required and must be a non-empty string",
        code: "INVALID_CATEGORY" 
      }, { status: 400 });
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json({ 
        error: "Date is required and must be a valid ISO timestamp",
        code: "INVALID_DATE" 
      }, { status: 400 });
    }

    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ 
          error: "Date must be a valid ISO timestamp",
          code: "INVALID_DATE_FORMAT" 
        }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ 
        error: "Date must be a valid ISO timestamp",
        code: "INVALID_DATE_FORMAT" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const newTransaction = await db.insert(transactions)
      .values({
        userId,
        type: type.trim(),
        amount,
        category: category.trim(),
        description: description ? description.trim() : null,
        date,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newTransaction[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Use hardcoded userId for testing
    const userId = 'user-1';

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(transactions)
      .where(and(
        eq(transactions.id, parseInt(id)),
        eq(transactions.userId, userId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const { type, amount, category, description, date } = body;
    const updates: Record<string, any> = {};

    if (type !== undefined) {
      if (type !== 'income' && type !== 'expense') {
        return NextResponse.json({ 
          error: "Type must be 'income' or 'expense'",
          code: "INVALID_TYPE" 
        }, { status: 400 });
      }
      updates.type = type.trim();
    }

    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ 
          error: "Amount must be a positive number",
          code: "INVALID_AMOUNT" 
        }, { status: 400 });
      }
      updates.amount = amount;
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim() === '') {
        return NextResponse.json({ 
          error: "Category must be a non-empty string",
          code: "INVALID_CATEGORY" 
        }, { status: 400 });
      }
      updates.category = category.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (date !== undefined) {
      if (typeof date !== 'string') {
        return NextResponse.json({ 
          error: "Date must be a valid ISO timestamp",
          code: "INVALID_DATE" 
        }, { status: 400 });
      }
      try {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json({ 
            error: "Date must be a valid ISO timestamp",
            code: "INVALID_DATE_FORMAT" 
          }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ 
          error: "Date must be a valid ISO timestamp",
          code: "INVALID_DATE_FORMAT" 
        }, { status: 400 });
      }
      updates.date = date;
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db.update(transactions)
      .set(updates)
      .where(and(
        eq(transactions.id, parseInt(id)),
        eq(transactions.userId, userId)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Use hardcoded userId for testing
    const userId = 'user-1';

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existing = await db.select()
      .from(transactions)
      .where(and(
        eq(transactions.id, parseInt(id)),
        eq(transactions.userId, userId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(transactions)
      .where(and(
        eq(transactions.id, parseInt(id)),
        eq(transactions.userId, userId)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Transaction deleted successfully',
      transaction: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}