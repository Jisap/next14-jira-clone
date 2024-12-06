"use client"


import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Task } from "../types";

export const columns: ColumnDef<Task>[] =  [
  {
    accessorKey: "name",
    header: "Task Name",
  },
]

