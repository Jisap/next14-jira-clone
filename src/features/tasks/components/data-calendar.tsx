import { Task } from "../types";
import { 
  addMonths, 
  format, 
  getDay, 
  parse, 
  startOfWeek, 
  subMonths 
} from "date-fns";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { enUS } from "date-fns/locale";
import { useState } from "react";
import { start } from "repl";

const locales = {
  "en-US": enUS
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface DataCalendarProps {
  data: Task[]
}

export const DataCalendar = ({ data }: DataCalendarProps) => {

  const [value, setValue] = useState(
    data.length > 0 ? new Date(data[0].dueDate) : new Date()
  );

  const events = data.map((task) => ({
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    title: task.name,
    project: task.project,
    assignee: task.assignee,
    status: task.status,
  }))

  return (
    <div>

    </div>
  )
}