"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DottedSeparator from "@/components/dotted-separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

import { ArrowLeftIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Project } from "../types";
import { useConfirm } from "@/hooks/use-confirm";

import { useUpdateProject } from "../api/use-update-project";
import { updateProjectSchema } from "../schema";
import { updateWorkspaceSchema } from "@/features/workspaces/schemas";
import { useDeleteProject } from "../api/use-delete-project";


interface EditProjectFormProps {
  onCancel?: () => void;    // Cierra el modal y establece isOpen a false
  initialValues: Project;
}

export const EditProjectForm = ({ onCancel, initialValues }: EditProjectFormProps) => { // Formulario para crear un nuevo workspace con react-hook-form
  
  const router = useRouter();
  const { mutate, isPending } = useUpdateProject();
  const { mutate: deleteProject, isPending: isDeletingProject } = useDeleteProject();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Project", 
    "This action cannot be undone", 
    "destructive"
  );

  const inputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof updateProjectSchema>>({                   // Definición del form con react-hook-form
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl ?? "",                                      // Si la imagen es una URL se usa, sino utiliza un string vacío
    }
  });

  const handleDelete = async () => {  // Cuando se hace click en el boton de borrar -> se muestra el modal de confirmación
    const ok = await confirmDelete(); // y espera a que se resuelva la promesa
    if (!ok) return

    deleteProject({
      param: { projectId: initialValues.$id },
    }, {
      onSuccess: () => {
        window.location.href=`/workspaces/${initialValues.workspaceId}`
      }
    })
  };

  const onSubmmit = (values: z.infer<typeof updateProjectSchema>) => {          // El submit recibe los values del form y se valida con el esquema
    const finalValues = {                                                       // Se crea un objeto  
      ...values,                                                                // con los valores del form
      image: values.image instanceof File ? values.image : ""                   // y la imagen subida (sino existe (undefined) se usa un string vacío)
    }
    mutate({ 
      form: finalValues,
      param: { projectId: initialValues.$id },
    }, 
    // {                                                                           // Se envia el objeto a la mutation
    //   onSuccess: ({data}) => {                                                  // Si se obtuvo la data de la mutation se resetea el form
    //     form.reset();
    //     //router.push(`/workspaces/${data.$id}`)                                // Se redirige al nuevo workspace
    //   }
    // }
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    } else {
      form.setValue("image", undefined); 
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      
      <DeleteDialog />
   
      
      <Card className="w-full h-full border-none shadow-slate-200">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`)}
          >
            Back
            <ArrowLeftIcon  className="size-4 mr-2" />
          </Button>
          <CardTitle className="text-xl font-bold">
            { initialValues.name }
          </CardTitle>
        </CardHeader>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmmit)}> 
              <div className="flex flex-col gap-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="Enter workspace name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField 
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <div className="flex flex-col gap-y-2">
                      <div className="flex items-center gap-x-5">
                        {field.value ? (
                          <div className="size-[72px] relative rounded-md overflow-hidden">
                            <Image 
                              alt="logo"
                              fill
                              className="object-cover"
                              src={
                                field.value instanceof File
                                  ? URL.createObjectURL(field.value)
                                  : field.value ?? "/Page-not-found.png"     
                              }
                            />
                          </div>
                        ) : (
                          <Avatar className="size-[72px]">
                            <AvatarFallback>
                              <ImageIcon className="size-[36px] text-neutral-400"/>
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col">
                          <p className="text-sm">Project Icon</p>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG, GIF, max 1mb
                          </p>
                          <input 
                            type="file"
                            accept=".jpg, .png, .jpeg, .svg"
                            className="hidden"
                            ref={inputRef}
                            disabled={isPending}
                            onChange={handleImageChange}
                          />
                          {field.value ? (
                            <Button
                              type="button"
                              disabled={isPending}
                              variant="destructive"
                              size="xs"
                              className="w-fit mt-2"
                              onClick={() => {
                                field.onChange(null)
                                if (inputRef.current) {
                                  inputRef.current.value = ""
                                }
                              }}
                            >
                              Remove Image
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              disabled={isPending}
                              variant="tertiary"
                              size="xs"
                              className="w-fit mt-2"
                              onClick={() => inputRef.current?.click()} // al hacer click en el boton se establece el valor del input referenciado
                            >
                              Upload Image
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>
              <DottedSeparator  className="py-7"/>
              <div className="flex items-center justify-between">
                <Button 
                  type="button"
                  size="lg"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isPending}
                  className={cn(!onCancel && "invisible")} // Si no se pasa el onCancel, se oculta el boton
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full h-full border-none shadow-slate-200">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Deleting a project is a irreversible and will remove all associated data.
            </p>
            <DottedSeparator className="py-7" />
            <Button 
              className="mt-6 w-fit ml-auto"
              size="sm"
              variant="destructive"
              type="button"
              disabled={isPending || isDeletingProject}
              onClick={handleDelete}
            >
              Delete Project
            </Button>
          </div>
        </CardContent>
      </Card>

      
    </div>
  )
}