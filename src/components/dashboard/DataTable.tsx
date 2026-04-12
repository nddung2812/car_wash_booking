"use client";

import { Badge } from "@/components/ui/badge";

interface Column {
  key: string;
  label: string;
}

interface DataTableProps<T extends object = Record<string, unknown>> {
  columns: Column[];
  rows: T[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable({ columns, rows }: DataTableProps<any>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {columns.map((col) => (
              <th key={col.key} className="text-left py-3 px-4 font-medium text-gray-500">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4">
                  {col.key === "status" ? (
                    <Badge
                      variant={
                        row[col.key] === "Completed" ? "default" :
                        row[col.key] === "Pending" ? "secondary" : "destructive"
                      }
                    >
                      {String(row[col.key])}
                    </Badge>
                  ) : col.key === "amount" ? (
                    `$${row[col.key]}`
                  ) : (
                    String(row[col.key])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
