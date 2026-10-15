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
              return (
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold bg-[#25dd59]/15 text-[#25dd59] border border-[#25dd59]/30">
                  Gaji Kantor
                </span>
              );
            case "FREELANCE_MILESTONE":
              return (
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Milestone Freelance
                </span>
              );
            case "PROJECT_EXPENSE":
              return (
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold bg-[#e28460]/15 text-[#e28460] border border-[#e28460]/30">
                  Biaya Proyek
                </span>
              );
            default:
              return (
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold bg-muted text-muted-foreground border border-card-border">
                  Manual
                </span>
              );
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
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              title="Lihat Detail"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(row.original.id, row.original.description)}
              className="p-1.5 rounded-full text-muted-foreground hover:text-red-400 hover:bg-card transition-colors"
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-card-inner border border-card-border-subtle shadow-sm">
        {/* Type Filter Pills */}
        <div className="inline-flex p-1 rounded-full bg-card border border-card-border shadow-sm">
          <button
            onClick={() => setTypeFilter("ALL")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
              typeFilter === "ALL"
                ? "bg-card-border text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Semua
          </button>
          <button
            onClick={() => setTypeFilter("INCOME")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
              typeFilter === "INCOME"
                ? "bg-neon text-black font-extrabold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setTypeFilter("EXPENSE")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
              typeFilter === "EXPENSE"
                ? "bg-red-500/20 text-red-400 font-extrabold border border-red-500/30 shadow-sm"
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
            className="pl-10 h-10 text-xs rounded-full bg-card border border-card-border text-foreground placeholder:text-muted-foreground focus-visible:ring-neon/30"
          />
        </div>
      </div>

      {/* Table Canvas */}
      <div className="rounded-2xl border border-card-border-subtle bg-card-inner overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-card-border-subtle bg-card/60"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
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
            <tbody className="divide-y divide-card-border-subtle/60">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-card/40 transition-colors"
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-card-border-subtle bg-card/40 text-xs text-muted-foreground">
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
              className="h-8 px-3 rounded-full text-xs bg-card border border-card-border hover:bg-card/80"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-3 rounded-full text-xs bg-card border border-card-border hover:bg-card/80"
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
