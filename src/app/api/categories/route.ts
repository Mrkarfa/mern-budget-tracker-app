import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

// Helper function to validate hex color
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

export async function GET(request: NextRequest) {
  try {
    // Use hardcoded userId for testing
    const userId = 'user-1';

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 500);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Single category by ID
    if (id) {
      const categoryId = parseInt(id);
      if (isNaN(categoryId)) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const category = await db.select()
        .from(categories)
        .where(and(
          eq(categories.id, categoryId),
          eq(categories.userId, userId)
        ))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json({ 
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(category[0]);
    }

    // List categories with optional type filter
    let query = db.select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.name));

    // Apply type filter if provided
    if (type) {
      if (type !== 'income' && type !== 'expense') {
        return NextResponse.json({ 
          error: 'Type must be either "income" or "expense"',
          code: 'INVALID_TYPE' 
        }, { status: 400 });
      }

      query = db.select()
        .from(categories)
        .where(and(
          eq(categories.userId, userId),
          eq(categories.type, type)
        ))
        .orderBy(asc(categories.name));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);

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

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { name, type, color, icon } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Name is required and must be a non-empty string',
        code: 'INVALID_NAME' 
      }, { status: 400 });
    }

    if (!type || (type !== 'income' && type !== 'expense')) {
      return NextResponse.json({ 
        error: 'Type is required and must be either "income" or "expense"',
        code: 'INVALID_TYPE' 
      }, { status: 400 });
    }

    // Validate optional color field
    if (color !== undefined && color !== null) {
      if (typeof color !== 'string' || !isValidHexColor(color)) {
        return NextResponse.json({ 
          error: 'Color must be a valid hex color code (e.g., #FF5733)',
          code: 'INVALID_COLOR' 
        }, { status: 400 });
      }
    }

    // Validate optional icon field
    if (icon !== undefined && icon !== null && typeof icon !== 'string') {
      return NextResponse.json({ 
        error: 'Icon must be a string',
        code: 'INVALID_ICON' 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData: {
      userId: string;
      name: string;
      type: string;
      createdAt: string;
      color?: string;
      icon?: string;
    } = {
      userId,
      name: name.trim(),
      type,
      createdAt: new Date().toISOString()
    };

    // Add optional fields if provided
    if (color !== undefined && color !== null) {
      insertData.color = color;
    }

    if (icon !== undefined && icon !== null) {
      insertData.icon = icon;
    }

    // Insert category
    const newCategory = await db.insert(categories)
      .values(insertData)
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const categoryId = parseInt(id);

    // Check if category exists and belongs to user
    const existing = await db.select()
      .from(categories)
      .where(and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete category
    const deleted = await db.delete(categories)
      .where(and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId)
      ))
      .returning();

    return NextResponse.json({
      message: 'Category deleted successfully',
      category: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}