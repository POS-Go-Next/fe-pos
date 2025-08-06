// components/shared/DataTable.tsx
"use client";

import React, { ReactNode, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "./pagination";

export interface DataTableColumn<T = any> {
    key: string;
    label: string;
    width?: string;
    align?: "left" | "center" | "right";
    sortable?: boolean;
    render?: (value: any, row: T, index: number) => ReactNode;
    headerRender?: () => ReactNode;
}

export interface DataTableAction<T = any> {
    type: "add" | "delete" | "edit" | "view" | "custom";
    onClick: (row: T, index: number) => void;
    icon?: ReactNode;
    variant?: "default" | "destructive" | "outline" | "secondary";
    className?: string;
    tooltip?: string;
    show?: (row: T, index: number) => boolean;
    disabled?: (row: T, index: number) => boolean;
}

export interface DataTableSort {
    key: string;
    direction: "asc" | "desc";
}

interface DataTableProps<T = any> {
    columns: DataTableColumn<T>[];
    data: T[];
    actions?: DataTableAction<T>[];
    onRowClick?: (row: T, index: number) => void;
    selectedRowId?: string | number | null;
    className?: string;
    minWidth?: string;
    showHeader?: boolean;
    showActions?: boolean;
    actionsColumnWidth?: string;
    emptyMessage?: string;
    loading?: boolean;
    loadingRows?: number;
    searchable?: boolean;
    searchPlaceholder?: string;
    onSearch?: (query: string) => void;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        showPagination?: boolean;
    };
    sortable?: boolean;
    onSort?: (sort: DataTableSort) => void;
    defaultSort?: DataTableSort;
    selectable?: boolean;
    selectedRows?: (string | number)[];
    onSelectionChange?: (selectedIds: (string | number)[]) => void;
    striped?: boolean;
    bordered?: boolean;
    hover?: boolean;
    compact?: boolean;
}

function DataTable<T = any>({
    columns,
    data,
    actions = [],
    onRowClick,
    selectedRowId,
    className = "",
    minWidth = "100%",
    showHeader = true,
    showActions = true,
    actionsColumnWidth = "120px",
    emptyMessage = "No data available",
    loading = false,
    loadingRows = 5,
    searchable = false,
    searchPlaceholder = "Search...",
    onSearch,
    pagination,
    sortable = false,
    onSort,
    defaultSort,
    selectable = false,
    selectedRows = [],
    onSelectionChange,
    striped = false,
    bordered = false,
    hover = true,
    compact = false,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentSort, setCurrentSort] = useState<DataTableSort | null>(
        defaultSort || null
    );

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        onSearch?.(query);
    };

    const handleSort = (columnKey: string) => {
        if (!sortable || !onSort) return;

        let newSort: DataTableSort;
        if (currentSort?.key === columnKey) {
            newSort = {
                key: columnKey,
                direction: currentSort.direction === "asc" ? "desc" : "asc",
            };
        } else {
            newSort = {
                key: columnKey,
                direction: "asc",
            };
        }

        setCurrentSort(newSort);
        onSort(newSort);
    };

    const handleSelectAll = (checked: boolean) => {
        if (!selectable || !onSelectionChange) return;

        if (checked) {
            const allIds = data.map((row: any) => row.id);
            onSelectionChange(allIds);
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectRow = (rowId: string | number, checked: boolean) => {
        if (!selectable || !onSelectionChange) return;

        if (checked) {
            onSelectionChange([...selectedRows, rowId]);
        } else {
            onSelectionChange(selectedRows.filter((id) => id !== rowId));
        }
    };

    const getSortIcon = (columnKey: string) => {
        if (currentSort?.key !== columnKey) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
        }
        return currentSort.direction === "asc" ? (
            <ArrowUp className="w-4 h-4 text-blue-600" />
        ) : (
            <ArrowDown className="w-4 h-4 text-blue-600" />
        );
    };

    const renderLoadingSkeleton = () => (
        <>
            {Array.from({ length: loadingRows }).map((_, index) => (
                <tr
                    key={`loading-${index}`}
                    className="border-b border-gray-100"
                >
                    {selectable && (
                        <td className="p-3">
                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                    )}
                    {columns.map((column, colIndex) => (
                        <td
                            key={`loading-${index}-${colIndex}`}
                            className="p-3"
                        >
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                    ))}
                    {showActions && (
                        <td className="p-3">
                            <div className="flex justify-center">
                                <div className="h-7 w-7 bg-gray-200 rounded-full animate-pulse"></div>
                            </div>
                        </td>
                    )}
                </tr>
            ))}
        </>
    );

    const renderEmptyState = () => (
        <tr>
            <td
                colSpan={
                    columns.length +
                    (showActions ? 1 : 0) +
                    (selectable ? 1 : 0)
                }
                className="p-8 text-center text-gray-500"
            >
                {emptyMessage}
            </td>
        </tr>
    );

    const renderActionButtons = (row: T, index: number) => {
        const visibleActions = actions.filter(
            (action) => !action.show || action.show(row, index)
        );

        if (visibleActions.length === 0) return null;

        return (
            <div className="flex items-center justify-center gap-1">
                {visibleActions.map((action, actionIndex) => {
                    const isDisabled = action.disabled?.(row, index) || false;

                    return (
                        <Button
                            key={actionIndex}
                            variant={action.variant || "outline"}
                            size="sm"
                            className={`h-8 w-8 p-0 ${action.className || ""}`}
                            onClick={() =>
                                !isDisabled && action.onClick(row, index)
                            }
                            disabled={isDisabled}
                            title={action.tooltip}
                        >
                            {action.icon}
                        </Button>
                    );
                })}
            </div>
        );
    };

    const tableClasses = `
    w-full
    ${compact ? "text-sm" : ""}
    ${bordered ? "border border-gray-200" : ""}
    ${className}
  `;

    const rowClasses = (row: T, index: number) => {
        const isSelected =
            selectedRowId !== null &&
            selectedRowId !== undefined &&
            ((row as any).id === selectedRowId || index === selectedRowId);

        return `
      ${bordered ? "border-b border-gray-200" : "border-b border-gray-100"}
      ${onRowClick ? "cursor-pointer" : ""}
      ${isSelected ? "bg-blue-50" : ""}
      ${striped && index % 2 === 1 ? "bg-gray-50" : ""}
      ${hover && !isSelected ? "hover:bg-gray-50" : ""}
      transition-colors
    `;
    };

    return (
        <div
            className={`bg-white rounded-lg shadow-sm border border-gray-100 ${className}`}
        >
            {searchable && (
                <div className="p-4 border-b border-gray-200">
                    <Input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
            )}

            <div className="overflow-x-auto">
                <table className={tableClasses} style={{ minWidth }}>
                    {showHeader && (
                        <thead className="bg-gray-50">
                            <tr>
                                {selectable && (
                                    <th className="p-3 w-12">
                                        <input
                                            type="checkbox"
                                            checked={
                                                data.length > 0 &&
                                                selectedRows.length ===
                                                    data.length
                                            }
                                            onChange={(e) =>
                                                handleSelectAll(
                                                    e.target.checked
                                                )
                                            }
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                )}
                                {columns.map((column, index) => (
                                    <th
                                        key={column.key}
                                        className={`p-3 text-sm font-medium text-gray-700 ${
                                            column.align === "center"
                                                ? "text-center"
                                                : column.align === "right"
                                                ? "text-right"
                                                : "text-left"
                                        } ${
                                            column.width
                                                ? `w-[${column.width}]`
                                                : ""
                                        }`}
                                    >
                                        {column.headerRender ? (
                                            column.headerRender()
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {column.label}
                                                {sortable &&
                                                    column.sortable && (
                                                        <button
                                                            onClick={() =>
                                                                handleSort(
                                                                    column.key
                                                                )
                                                            }
                                                            className="hover:bg-gray-200 p-1 rounded"
                                                        >
                                                            {getSortIcon(
                                                                column.key
                                                            )}
                                                        </button>
                                                    )}
                                            </div>
                                        )}
                                    </th>
                                ))}
                                {showActions && (
                                    <th
                                        className={`p-3 text-sm font-medium text-gray-700 text-center w-[${actionsColumnWidth}]`}
                                    >
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                    )}

                    <tbody>
                        {loading
                            ? renderLoadingSkeleton()
                            : data.length === 0
                            ? renderEmptyState()
                            : data.map((row, index) => (
                                  <tr
                                      key={(row as any).id || index}
                                      className={rowClasses(row, index)}
                                      onClick={() => onRowClick?.(row, index)}
                                  >
                                      {selectable && (
                                          <td className="p-3">
                                              <input
                                                  type="checkbox"
                                                  checked={selectedRows.includes(
                                                      (row as any).id
                                                  )}
                                                  onChange={(e) =>
                                                      handleSelectRow(
                                                          (row as any).id,
                                                          e.target.checked
                                                      )
                                                  }
                                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                  onClick={(e) =>
                                                      e.stopPropagation()
                                                  }
                                              />
                                          </td>
                                      )}
                                      {columns.map((column) => (
                                          <td
                                              key={column.key}
                                              className={`p-3 ${
                                                  compact ? "py-2" : ""
                                              } ${
                                                  column.align === "center"
                                                      ? "text-center"
                                                      : column.align === "right"
                                                      ? "text-right"
                                                      : "text-left"
                                              }`}
                                          >
                                              {column.render
                                                  ? column.render(
                                                        (row as any)[
                                                            column.key
                                                        ],
                                                        row,
                                                        index
                                                    )
                                                  : (row as any)[column.key] ||
                                                    "-"}
                                          </td>
                                      ))}
                                      {showActions && (
                                          <td className="p-3 text-center">
                                              {renderActionButtons(row, index)}
                                          </td>
                                      )}
                                  </tr>
                              ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination?.showPagination && (
                <div className="p-4 border-t border-gray-200">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.onPageChange}
                        size="sm"
                    />
                </div>
            )}
        </div>
    );
}

export default DataTable;
