// components/shared/ReusableTable.tsx
"use client";

import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";

export interface TableColumn {
    key: string;
    label: string;
    width?: string;
    align?: "left" | "center" | "right";
    render?: (value: any, row: any, index: number) => ReactNode;
}

export interface TableAction {
    type: "add" | "delete" | "edit" | "custom";
    onClick: (row: any, index: number) => void;
    icon?: ReactNode;
    variant?: "default" | "destructive" | "outline";
    className?: string;
    tooltip?: string;
    show?: (row: any, index: number) => boolean;
}

interface ReusableTableProps {
    columns: TableColumn[];
    data: any[];
    actions?: TableAction[];
    onRowClick?: (row: any, index: number) => void;
    selectedRowId?: number | string | null;
    className?: string;
    minWidth?: string;
    showHeader?: boolean;
    showActions?: boolean;
    actionsColumnWidth?: string;
    emptyMessage?: string;
    loading?: boolean;
    loadingRows?: number;
}

const ReusableTable: React.FC<ReusableTableProps> = ({
    columns,
    data,
    actions = [],
    onRowClick,
    selectedRowId,
    className = "",
    minWidth = "1230px",
    showHeader = true,
    showActions = true,
    actionsColumnWidth = "120px",
    emptyMessage = "No data available",
    loading = false,
    loadingRows = 5,
}) => {
    const renderLoadingSkeleton = () => (
        <>
            {Array.from({ length: loadingRows }).map((_, index) => (
                <tr
                    key={`loading-${index}`}
                    className="border-b border-gray-100"
                >
                    {columns.map((column, colIndex) => (
                        <td
                            key={`loading-${index}-${colIndex}`}
                            className="p-3"
                        >
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                    ))}
                    {showActions && (
                        <td className="p-3 pr-[140px]">
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
                colSpan={columns.length + (showActions ? 1 : 0)}
                className="p-8 text-center text-gray-500"
            >
                {emptyMessage}
            </td>
        </tr>
    );

    const renderActionButtons = (row: any, index: number) => {
        const visibleActions = actions.filter(
            (action) => !action.show || action.show(row, index)
        );

        return (
            <div className="flex items-center justify-center gap-2">
                {visibleActions.map((action, actionIndex) => {
                    let buttonContent: ReactNode;
                    let buttonVariant: "default" | "destructive" | "outline" =
                        "default";
                    let buttonClassName = "h-7 w-7 p-0 rounded-full";

                    switch (action.type) {
                        case "add":
                            buttonContent = action.icon || <Plus size={14} />;
                            buttonClassName += " bg-blue-500 hover:bg-blue-600";
                            break;
                        case "delete":
                            buttonContent = action.icon || <Trash size={14} />;
                            buttonVariant = "destructive";
                            buttonClassName += " bg-red-500 hover:bg-red-600";
                            break;
                        case "edit":
                            buttonContent = action.icon || (
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                </svg>
                            );
                            buttonClassName +=
                                " bg-yellow-500 hover:bg-yellow-600";
                            break;
                        case "custom":
                            buttonContent = action.icon;
                            buttonVariant = action.variant || "default";
                            buttonClassName =
                                action.className || buttonClassName;
                            break;
                    }

                    return (
                        <Button
                            key={actionIndex}
                            variant={buttonVariant}
                            size="sm"
                            className={buttonClassName}
                            onClick={() => action.onClick(row, index)}
                            title={action.tooltip}
                        >
                            {buttonContent}
                        </Button>
                    );
                })}
            </div>
        );
    };

    const tableStyle = {
        minWidth: minWidth,
    };

    return (
        <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}
        >
            <div className="relative">
                <div className="overflow-x-auto rounded-2xl">
                    <table className="w-full" style={tableStyle}>
                        {showHeader && (
                            <thead>
                                <tr className="bg-gray-100">
                                    {columns.map((column, index) => {
                                        const alignClass =
                                            column.align === "center"
                                                ? "text-center"
                                                : column.align === "right"
                                                ? "text-right"
                                                : "text-left";
                                        const widthClass = column.width
                                            ? { width: column.width }
                                            : {};
                                        const firstColumnClass =
                                            index === 0 ? "rounded-tl-2xl" : "";

                                        return (
                                            <th
                                                key={column.key}
                                                className={`${alignClass} p-3 text-sm font-medium text-gray-600 ${firstColumnClass}`}
                                                style={widthClass}
                                            >
                                                {column.label}
                                            </th>
                                        );
                                    })}
                                    {showActions && (
                                        <th
                                            className="text-center p-3 text-sm font-medium text-gray-600 rounded-tr-2xl"
                                            style={{
                                                width: actionsColumnWidth,
                                            }}
                                        >
                                            Action
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
                                : data.map((row, index) => {
                                      const isSelected =
                                          selectedRowId !== null &&
                                          selectedRowId !== undefined &&
                                          (row.id === selectedRowId ||
                                              index === selectedRowId);

                                      const rowClassName = `border-b border-gray-100 transition-colors ${
                                          onRowClick ? "cursor-pointer" : ""
                                      } ${
                                          isSelected
                                              ? "bg-blue-50"
                                              : index % 2 === 1
                                              ? "bg-gray-50/30 hover:bg-blue-50"
                                              : "hover:bg-blue-50"
                                      }`;

                                      return (
                                          <tr
                                              key={row.id || index}
                                              onClick={() =>
                                                  onRowClick?.(row, index)
                                              }
                                              className={rowClassName}
                                          >
                                              {columns.map((column) => {
                                                  const alignClass =
                                                      column.align === "center"
                                                          ? "text-center"
                                                          : column.align ===
                                                            "right"
                                                          ? "text-right"
                                                          : "text-left";

                                                  return (
                                                      <td
                                                          key={column.key}
                                                          className={`p-3 text-sm ${alignClass}`}
                                                      >
                                                          {column.render
                                                              ? column.render(
                                                                    row[
                                                                        column
                                                                            .key
                                                                    ],
                                                                    row,
                                                                    index
                                                                )
                                                              : row[
                                                                    column.key
                                                                ] || "-"}
                                                      </td>
                                                  );
                                              })}
                                              {showActions && (
                                                  <td className="p-3 text-center pr-[140px]">
                                                      {renderActionButtons(
                                                          row,
                                                          index
                                                      )}
                                                  </td>
                                              )}
                                          </tr>
                                      );
                                  })}
                        </tbody>
                    </table>
                </div>

                {showActions && !loading && data.length > 0 && (
                    <div className="absolute top-0 right-0 w-16 bg-white shadow-lg">
                        {showHeader && (
                            <div className="bg-gray-100 p-3 text-sm font-medium text-gray-600 text-center border-b border-gray-200 rounded-tr-2xl">
                                Action
                            </div>
                        )}

                        {data.map((row, index) => {
                            const isLastRow = index === data.length - 1;
                            const actionRowClassName = `p-4 border-b border-gray-100 flex items-center justify-center gap-2 ${
                                index % 2 === 1 ? "bg-gray-50/30" : ""
                            } ${isLastRow ? "rounded-br-2xl border-b-0" : ""}`;

                            return (
                                <div
                                    key={`action-${row.id || index}`}
                                    className={actionRowClassName}
                                >
                                    {renderActionButtons(row, index)}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReusableTable;
