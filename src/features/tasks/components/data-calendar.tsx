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
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css"

const locales = { //  Mapa de localizaciones, en este caso para el idioma inglés.
  "en-US": enUS
}

const localizer = dateFnsLocalizer({ // "localizador" para que el calendario sepa cómo manejar las fechas con la configuración de date-fns.
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

  const events = data.map((task) => ({ // Transforma las tareas (data) en un formato que entiende react-big-calendar
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    title: task.name,
    project: task.project,
    assignee: task.assignee,
    status: task.status,
    id: task.$id,
  }));

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => { // Permite navegar en el calendario a través de acciones predefinidas.
    if (action === "PREV") {
      setValue(subMonths(value, 1));
    } else if (action === "NEXT") {
      setValue(addMonths(value, 1));
    } else if (action === "TODAY") {
      setValue(new Date());
    }
  }

  return (
    <Calendar 
      localizer={localizer}
      date={value}
      events={events}
      views={["month"]}
      defaultView="month"
      toolbar
      showAllEvents
      className="h-full"
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) => localizer?.format(date, "EEE", culture) ?? "",
      }}
    />
  )
}