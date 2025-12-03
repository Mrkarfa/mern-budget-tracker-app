"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet, Plus, TrendingUp, TrendingDown, DollarSign, LogOut,
  Trash2, Edit, Calendar, ArrowUpRight, ArrowDownRight, PieChart,
  BarChart3, Loader2, RefreshCw, Menu, X
} from "lucide-react";
import {
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area
} from "recharts";
import { ThemeToggle } from "@/components/theme-toggle";

interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string | null;
  date: string;
}

interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
  color: string | null;
  icon: string | null;
}

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  categoryBreakdown: Array<{
    category: string;
    type: string;
    total: number;
    count: number;
  }>;
}

const CHART_COLORS = [
  "#10B981", "#8B5CF6", "#F59E0B", "#3B82F6", "#EC4899",
  "#EF4444", "#06B6D4", "#F97316", "#A855F7", "#6366F1"
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading, refetch } = useSession();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Form states
  const [formType, setFormType] = useState<"income" | "expense">("expense");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login");
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transRes, catRes, sumRes] = await Promise.all([
        fetch("/api/transactions", { headers: getAuthHeaders() }),
        fetch("/api/categories", { headers: getAuthHeaders() }),
        fetch("/api/transactions/summary", { headers: getAuthHeaders() }),
      ]);

      if (transRes.ok) setTransactions(await transRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (sumRes.ok) setSummary(await sumRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token");
    await authClient.signOut({
      fetchOptions: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
    localStorage.removeItem("bearer_token");
    refetch();
    router.push("/");
  };

  const resetForm = () => {
    setFormType("expense");
    setFormAmount("");
    setFormCategory("");
    setFormDescription("");
    setFormDate(new Date().toISOString().split("T")[0]);
  };

  const handleAddTransaction = async () => {
    if (!formAmount || !formCategory) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: formType,
          amount: parseFloat(formAmount),
          category: formCategory,
          description: formDescription || null,
          date: new Date(formDate).toISOString(),
        }),
      });

      if (res.ok) {
        await fetchData();
        setIsAddOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to add transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTransaction = async () => {
    if (!editingTransaction || !formAmount || !formCategory) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/transactions?id=${editingTransaction.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: formType,
          amount: parseFloat(formAmount),
          category: formCategory,
          description: formDescription || null,
          date: new Date(formDate).toISOString(),
        }),
      });

      if (res.ok) {
        await fetchData();
        setIsEditOpen(false);
        setEditingTransaction(null);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to update transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormType(transaction.type);
    setFormAmount(transaction.amount.toString());
    setFormCategory(transaction.category);
    setFormDescription(transaction.description || "");
    setFormDate(transaction.date.split("T")[0]);
    setIsEditOpen(true);
  };

  const filteredCategories = categories.filter((c) => c.type === formType);

  const expenseBreakdown = summary?.categoryBreakdown
    .filter((c) => c.type === "expense")
    .map((c, i) => ({
      name: c.category,
      value: c.total,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })) || [];

  const incomeBreakdown = summary?.categoryBreakdown
    .filter((c) => c.type === "income")
    .map((c, i) => ({
      name: c.category,
      value: c.total,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })) || [];

  // Group transactions by date for area chart
  const last30Days = [...Array(30)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split("T")[0];
  });

  const chartData = last30Days.map((date) => {
    const dayTransactions = transactions.filter((t) => t.date.split("T")[0] === date);
    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      income: dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
      expense: dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    };
  });

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                BudgetFlow
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Welcome, {session.user.name}
              </span>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="border-slate-200 dark:border-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-slate-600 hover:text-red-600 dark:text-slate-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400 px-2">
                  Welcome, {session.user.name}
                </span>
                <div className="flex items-center gap-2 px-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Theme:</span>
                  <ThemeToggle />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchData}
                  className="justify-start"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="justify-start text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white shadow-lg shadow-emerald-500/25">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Balance</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 bg-emerald-400/50 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold mt-1">
                      ${summary?.balance.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Income</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      +${summary?.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Expenses</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                      -${summary?.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <ArrowDownRight className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Transactions</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {summary?.transactionCount || 0}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Income vs Expenses Over Time */}
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Income vs Expenses (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10B981"
                      strokeWidth={2}
                      fill="url(#incomeGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#EF4444"
                      strokeWidth={2}
                      fill="url(#expenseGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="w-5 h-5 text-violet-500" />
                Expense Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : expenseBreakdown.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {expenseBreakdown.slice(0, 6).map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-600 dark:text-slate-400">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  No expense data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
                  onClick={() => {
                    resetForm();
                    setIsAddOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                  <DialogDescription>
                    Record a new income or expense
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Tabs value={formType} onValueChange={(v) => setFormType(v as "income" | "expense")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="expense" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
                        <TrendingDown className="w-4 h-4 mr-2" />
                        Expense
                      </TabsTrigger>
                      <TabsTrigger value="income" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Income
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formCategory} onValueChange={setFormCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            <span className="flex items-center gap-2">
                              {cat.icon} {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Input
                      placeholder="What was this for?"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddTransaction}
                    disabled={isSubmitting || !formAmount || !formCategory}
                    className={formType === "income" 
                      ? "bg-emerald-500 hover:bg-emerald-600" 
                      : "bg-red-500 hover:bg-red-600"}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add Transaction"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No transactions yet</p>
                <p className="text-sm">Add your first transaction to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        transaction.type === "income"
                          ? "bg-emerald-100 dark:bg-emerald-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}>
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {transaction.description || transaction.category}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category}
                          </Badge>
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${
                        transaction.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}$
                        {transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-slate-600"
                          onClick={() => openEditDialog(transaction)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Update the transaction details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Tabs value={formType} onValueChange={(v) => setFormType(v as "income" | "expense")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expense" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Expense
                  </TabsTrigger>
                  <TabsTrigger value="income" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Income
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        <span className="flex items-center gap-2">
                          {cat.icon} {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="What was this for?"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEditTransaction}
                disabled={isSubmitting || !formAmount || !formCategory}
                className={formType === "income" 
                  ? "bg-emerald-500 hover:bg-emerald-600" 
                  : "bg-red-500 hover:bg-red-600"}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}