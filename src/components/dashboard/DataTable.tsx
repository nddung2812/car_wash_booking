"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

interface Column {
  key: string;
  label: string;
}

interface DataTableProps<T extends object> {
  columns: Column[];
  rows: T[];
  /**
   * Override how a single cell renders. Return `undefined` to fall back to the
   * built-in rendering for that column.
   */
  renderCell?: (col: Column, row: T) => ReactNode | undefined;
}

export default function DataTable<T extends object>({
  columns,
  rows,
  renderCell,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-3 px-4 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line/60 last:border-0 hover:bg-secondary/60">
              {columns.map((col) => {
                const custom = renderCell?.(col, row);
                const value = (row as Record<string, unknown>)[col.key];
                return (
                <td key={col.key} className="py-3 px-4 text-foreground">
                  {custom !== undefined ? (
                    custom
                  ) : col.key === "status" ? (
                    <Badge
                      variant={
                        value === "Completed"
                          ? "default"
                          : value === "Pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {String(value)}
                    </Badge>
                  ) : col.key === "amount" ? (
                    <span className="font-mono tabular-nums">${String(value)}</span>
                  ) : (
                    String(value)
                  )}
                </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
