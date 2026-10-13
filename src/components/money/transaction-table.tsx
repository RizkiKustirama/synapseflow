"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Search,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah, formatDate, cn } from "@/lib/utils";
import { StoredTransaction, deleteTransaction } from "@/actions/money.actions";
import { TransactionDetailDialog } from "@/components/money/transaction-detail-dialog";

interface TransactionTableProps {
  data: StoredTransaction[];
  onRefresh: () => void;
}

export function TransactionTable({ data, onRefresh }: TransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [selectedTransaction, setSelectedTransaction] = useState<StoredTransaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Filtered dataset based on type
  const filteredData = useMemo(() => {
    if (typeFilter === "ALL") return data;
    return data.filter((item) => item.type === typeFilter);
  }, [data, typeFilter]);

  const handleDelete = useCallback(
    async (id: string, description: string) => {
      if (confirm(`Hapus transaksi "${description}"?`)) {
        await deleteTransaction(id);
        onRefresh();
      }
    },
    [onRefresh]
  );

  const columns = useMemo<ColumnDef<StoredTransaction>[]>(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            Tanggal <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(row.original.date)}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
          <div className="flex flex-col max-w-[240px] sm:max-w-xs">
            <span className="text-xs font-bold text-foreground truncate">
              {row.original.description}
            </span>
            {row.original.notes && (
              <span className="text-[10px] text-muted-foreground truncate">
                {row.original.notes}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "Kategori",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: row.original.categoryColor }}
            />
            <span className="text-xs text-foreground font-medium">
              {row.original.categoryName}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "sourceType",
        header: "Sumber / Relasi",
        cell: ({ row }) => {
          switch (row.original.sourceType) {
            case "EMPLOYMENT_PAYROLL":
              return <Badge variant="default" className="text-[9px]">Gaji Kantor</Badge>;
            case "FREELANCE_MILESTONE":
              return <Badge variant="processing" className="text-[9px]">Milestone Freelance</Badge>;
            case "PROJECT_EXPENSE":
              return <Badge variant="destructive" className="text-[9px]">Biaya Proyek</Badge>;
            default:
              return <Badge variant="outline" className="text-[9px]">Manual</Badge>;
          }
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors justify-end w-full"
          >
            Nominal <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const isIncome = row.original.type === "INCOME";
          return (
            <div className="text-right">
              <span
                className={`text-xs sm:text-sm font-black tabular-nums tracking-tight ${
                  isIncome ? "text-neon" : "text-red-400"
                }`}
              >
                {isIncome ? "+" : "-"}
                {formatRupiah(row.original.amount)}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => {
                setSelectedTransaction(row.original);
                setDetailOpen(true);
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card-border/40 transition-colors"
              title="Lihat Detail"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(row.original.id, row.original.description)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-card-border/40 transition-colors"
              title="Hapus Transaksi"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [handleDelete]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Table Toolbar & Multi-filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-card border border-card-border">
        {/* Type Filter Pills */}
        <div className="inline-flex p-1 rounded-2xl bg-background border border-card-border">
          <button
            onClick={() => setTypeFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              typeFilter === "ALL"
                ? "bg-card-border/70 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Semua
          </button>
          <button
            onClick={() => setTypeFilter("INCOME")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              typeFilter === "INCOME"
                ? "bg-neon/15 text-neon shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setTypeFilter("EXPENSE")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              typeFilter === "EXPENSE"
                ? "bg-red-500/15 text-red-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Pengeluaran
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari transaksi..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 h-10 text-xs rounded-2xl"
          />
        </div>
      </div>

      {/* Table Canvas */}
      <div className="rounded-3xl border border-card-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-card-border bg-background/50"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-card-border/60">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-card-border/20 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-28 text-center text-xs text-muted-foreground"
                  >
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-card-border bg-background/30 text-xs text-muted-foreground">
          <span>
            Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
            {Math.max(1, table.getPageCount())}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Dialog */}
      <TransactionDetailDialog
        transaction={selectedTransaction}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
}
