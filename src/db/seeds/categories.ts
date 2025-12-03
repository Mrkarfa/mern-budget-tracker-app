import { db } from '@/db';
import { categories } from '@/db/schema';

async function main() {
    const sampleCategories = [
        {
            userId: 'user-1',
            name: 'Salary',
            type: 'income',
            color: '#10B981',
            icon: '💼',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Freelance',
            type: 'income',
            color: '#8B5CF6',
            icon: '💻',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Investments',
            type: 'income',
            color: '#F59E0B',
            icon: '📈',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Business',
            type: 'income',
            color: '#3B82F6',
            icon: '🏢',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Other Income',
            type: 'income',
            color: '#14B8A6',
            icon: '💰',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Food & Dining',
            type: 'expense',
            color: '#EF4444',
            icon: '🍔',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Transportation',
            type: 'expense',
            color: '#F97316',
            icon: '🚗',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Shopping',
            type: 'expense',
            color: '#EC4899',
            icon: '🛍️',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Entertainment',
            type: 'expense',
            color: '#A855F7',
            icon: '🎬',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Bills & Utilities',
            type: 'expense',
            color: '#6366F1',
            icon: '💡',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Healthcare',
            type: 'expense',
            color: '#06B6D4',
            icon: '🏥',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Education',
            type: 'expense',
            color: '#8B5CF6',
            icon: '📚',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Travel',
            type: 'expense',
            color: '#0EA5E9',
            icon: '✈️',
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user-1',
            name: 'Other Expenses',
            type: 'expense',
            color: '#64748B',
            icon: '📦',
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(categories).values(sampleCategories);
    
    console.log('✅ Categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});