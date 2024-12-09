import { useCallback, useEffect, useState } from "react";
import { Task, TaskStatus } from "../types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd"
import KanbanColumnHeader from "./KanbanColumnHeader";
import { KanbanCard } from "./kanban-card";


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
    <DragDropContext
      onDragEnd={() => { }}
    >
      <div className="flex overflow-x-auto">
        {boards.map((board) => {
          return (
            <div
              key={board}
              className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]"
            >
              <KanbanColumnHeader
                board={board}
                taskCount={tasks[board].length}
              />
              <Droppable droppableId={board}>
                {(provided) => (                           // Provided es un objeto que la librería pasa a la función de renderizado de Droppable
                  <div
                    {...provided.droppableProps}           // Propiedades de área droppable. 
                    ref={provided.innerRef}                // Referencia del contenedor
                    className="min-h-[200px] py-1.5"
                  >
                    {tasks[board].map((task, index) => (   // Se iteran las tareas de cada estado
                      <Draggable                           // Draggable es un componente que se usa para mover elementos
                        key={task.$id}
                        draggableId={task.$id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}          // Referencia del elemento arrastrable
                            {...provided.draggableProps}     // Propiedades de área arrastrable
                            {...provided.dragHandleProps}    // Propiedades del área de agarre
                          >
                            <KanbanCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}