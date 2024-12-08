import { useCallback, useEffect, useState } from "react";
import { Task, TaskStatus } from "../types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd"
import { object } from "zod";

const boards: TaskStatus[] = [ // boards es un array de estados de tareas
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,  
]

type TaskState = {             // Estado de cada tarea
  [key in TaskStatus]: Task[]; // Se define como un objeto con las tareas de cada estado
};

interface DataKanbanProps {
  data: Task[];
}

export const DataKanban = ({ data }: DataKanbanProps) => {

  const [tasks, setTasks] = useState<TaskState>(() => { // Estado de las tareas tipo TaskState (status: Task[])

    const initialTasks: TaskState = { // Objeto con las tareas de cada estado. Se inicializa con un array vacio
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {                // En los argumentos de la funcion se pasan los datos de las tareas
      initialTasks[task.status].push(task); // Se agregan las tareas a cada estado
    })

    Object.keys(initialTasks).forEach((status) => {                                // Se obtienen las claves del objeto initialTasks(status)
      initialTasks[status as TaskStatus].sort((a, b) => a.position - b.position)   // Se ordenan las tareas por posición
    })

    return initialTasks;
  })

  return (
    <div>
      Data Kanban
    </div>
  )
}