import { useCallback, useEffect, useState } from "react";
import { Task, TaskStatus } from "../types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult
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
  onChange: (
    tasks: {
      $id:string;
      status: TaskStatus; 
      position:number;
    }[]
  ) => void;
}

export const DataKanban = ({ data, onChange }: DataKanbanProps) => { // Se reciben todas las tasks según status

  const [tasks, setTasks] = useState<TaskState>(() => {                              // Estado de las tareas tipo TaskState (status: Task[])

    const initialTasks: TaskState = {      // Objeto con las tareas de cada estado. Se inicializa con un array vacio
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {                                                         // Se recorren las tareas y
      initialTasks[task.status].push(task);                                          // se agregan en initialTasks, las tareas a cada estado
    })

    Object.keys(initialTasks).forEach((status) => {                                  // Se obtienen las claves del objeto initialTasks (status) y
      initialTasks[status as TaskStatus].sort((a, b) => a.position - b.position)     // se ordenan las tareas por posición
    })

    return initialTasks;                                                             // Al final el estado de Tasks se establece con initialTasks
  });

  useEffect(() => {                                                                  // Reinicialización del estado de tareas cuando cambian los datos de entrada (edit, delete, post de tareas)
    const newTasks: TaskState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {                                                          // Se recorren las tareas y
      newTasks[task.status].push(task);                                               // se agregan en initialTasks, las tareas a cada estado
    })

    Object.keys(newTasks).forEach((status) => {                                       // Se obtienen las claves del objeto initialTasks (status) y
      newTasks[status as TaskStatus].sort((a, b) => a.position - b.position)          // se ordenan las tareas por posición
    })

    setTasks(newTasks);                                                               // Al final el estado de Tasks se establece con initialTasks
  }, [data])

  const onDragEnd = useCallback((result: DropResult) => {                            // Esta función se ejecutará cuando se termine el arrastre y dará un resultado
    if (!result.destination) return;                                                  // Si no hay destino, no se hace nada

    
    const { source, destination } = result;                                           // Extraemos información de origen y destino del arrastre                 
    const sourceStatus = source.droppableId as TaskStatus;                            // Status de origen
    const destStatus = destination.droppableId as TaskStatus;                         // Status de destino  

    let updatesPayload: { $id: string; status: TaskStatus; position: number }[] = []; // Arreglo para almacenar las actualizaciones de tareas

    setTasks((prevTasks) => {                                                         // Actualización del estado de las tareas, para ello...

      const newTasks = { ...prevTasks };                                              // se crear una copia del estado anterior de tareas

      const sourceColumn = [...newTasks[sourceStatus]];                               // Obtenemos la columna de origen 
      const [movedTask] = sourceColumn.splice(source.index, 1);                       // y de ella eliminamos la tarea movida (source.index). [movedTask]   

      if(!movedTask) {
        console.error("No task found at the source index");                           // Se Valida que la tarea existe
        return prevTasks;
      }

      const updatedMovedTasks = sourceStatus !== destStatus                           // Si el status de origen es distinto del de destino 
        ? { ...movedTask, status: destStatus }                                        // Se actualiza el status de movedTask. ( updatedMovedTasks )
        : movedTask                                                                   // sino se deja como estaba

      newTasks[sourceStatus] = sourceColumn;                                          // Estado de tareas según status se actualiza con tareas de origen menos tarea movida (splice borro tarea)

      const destColumn = [...newTasks[destStatus]];                                   // Obtenemos la columna de destino 
      destColumn.splice(destination.index, 0, updatedMovedTasks);                     // e insertamos la tarea/s movida/s (destColumn)
      newTasks[destStatus] = destColumn;                                              // Estado de tareas según status se actualiza con destColumn (splice agrego tareas movidas)

      updatesPayload = []                                                             // Payload de actualizaciones de tareas

      updatesPayload.push({                                                           // Agregamos la tarea movida al payload de actualizaciones
        $id: updatedMovedTasks.$id,
        status: destStatus,
        position: Math.min((destination.index + 1) * 1000, 1_000_000)
      })

      newTasks[destStatus].forEach((task, index) => {                                // Recalcular posiciones de tareas en la columna de destino
        if (task && task.$id !== updatedMovedTasks.$id) {                            // recorre todas las tareas de la columna de destino si la tarea existe y no es la que se acaba de mover
          const newPosition = Math.min((index + 1) * 1000, 1_000_000);               // Se calcula la nueva posición basada en el nuevo índice
          if (task.position !== newPosition) {                                       // Compara si la posición actual es diferente de la nueva
            updatesPayload.push({                                                    // Si es diferente, agrega al updatesPayload para actualizar
              $id: task.$id,
              status: destStatus,
              position: newPosition
            })
          }
        }
      });

      if (sourceStatus !== destStatus) {                                             // Si la tarea cambia de columna, recalcular posiciones en la columna de origen
        newTasks[sourceStatus].forEach((task, index) => {                            // Recorre las tareas de la columna de origen
          if(task){
            const newPosition = Math.min((index + 1) * 1000, 1_000_000);             // Calcula una nueva posición basada en su índice actual
            if (task.position !== newPosition) {                                     // Compara la posición actual con la nueva posición
              updatesPayload.push({                                                  // Si son diferentes, agrega al updatesPayload
                $id: task.$id,
                status: sourceStatus,
                position: newPosition
              })
            }
          }
        })
      }

      return newTasks; // Devuelve las tareas actualizadas
    });

    
    onChange(updatesPayload)
  },[onChange])

  return (
    <DragDropContext
      onDragEnd={onDragEnd}
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
                    {provided.placeholder}
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