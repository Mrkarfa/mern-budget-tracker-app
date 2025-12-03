import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Use hardcoded userId for testing
    const userId = 'user-1';

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Validate date formats if provided
    if (dateFrom && isNaN(Date.parse(dateFrom))) {
      return NextResponse.json({ 
        error: 'Invalid dateFrom format. Use ISO date format.',
        code: 'INVALID_DATE_FORMAT'
      }, { status: 400 });
    }

    if (dateTo && isNaN(Date.parse(dateTo))) {
      return NextResponse.json({ 
        error: 'Invalid dateTo format. Use ISO date format.',
        code: 'INVALID_DATE_FORMAT'
      }, { status: 400 });
    }

    // Build where conditions
    const conditions = [eq(transactions.userId, userId)];
    
    if (dateFrom) {
      conditions.push(gte(transactions.date, dateFrom));
    }
    
    if (dateTo) {
      conditions.push(lte(transactions.date, dateTo));
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get all transactions for the user with date filters
    const userTransactions = await db.select()
      .from(transactions)
      .where(whereCondition);

    // Calculate summary statistics
    const totalIncome = userTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = userTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;
    const transactionCount = userTransactions.length;

    // Calculate category breakdown using SQL aggregation
    const categoryBreakdownQuery = db.select({
      category: transactions.category,
      type: transactions.type,
      total: sql<number>`SUM(${transactions.amount})`,
      count: sql<number>`COUNT(*)`
    })
      .from(transactions)
      .where(whereCondition)
      .groupBy(transactions.category, transactions.type);

    const categoryBreakdown = await categoryBreakdownQuery;

    // Format the response
    const summary = {
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      balance: Number(balance.toFixed(2)),
      transactionCount,
      categoryBreakdown: categoryBreakdown.map(item => ({
        category: item.category,
        type: item.type,
        total: Number(Number(item.total).toFixed(2)),
        count: Number(item.count)
      }))
    };

    return NextResponse.json(summary, { status: 200 });

  } catch (error) {
    console.error('GET /api/transactions/summary error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}