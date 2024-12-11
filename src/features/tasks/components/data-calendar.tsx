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
import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const locales = {                    //  Mapa de localizaciones, en este caso para el idioma inglés.
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

interface CustomToolbarProps {
  date: Date
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void
}

const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => {
  return(
    <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
      <Button
        onClick={() => onNavigate("PREV")}
        variant="secondary"
        size="icon"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto">
        <CalendarIcon className="size-4 mr-2" />
        <p className="text-sm">{format(date, "MMMM yyyy")}</p>
      </div>
      <Button
        onClick={() => onNavigate("NEXT")}
        variant="secondary"
        size="icon"className="flex items-center"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  )
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
      components={{
        eventWrapper: ({ event }) => (
          <EventCard 
            id={event.id}
            title={event.title}
            project={event.project}
            assignee={event.assignee}
            status={event.status}
          />
        ),
        toolbar: () => (
          <CustomToolbar 
            date={value}
            onNavigate={handleNavigate}
          />
        )
      }}
    />
  )
}