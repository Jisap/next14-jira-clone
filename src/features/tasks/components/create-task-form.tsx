"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createProjectSchema } from "../schema";
import { useCreateProject } from "../api/use-create-project";
import { useWorkspaceId } from "@/features/workspaces/hook/use-workspace-id";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DottedSeparator from "@/components/dotted-separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";


interface CreateProjectFormProps {
  onCancel?: () => void; // Cierra el modal y establece isOpen a false
}

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProps) => { // Formulario para crear un nuevo proyecto con react-hook-form
  
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { mutate, isPending } = useCreateProject();

  const inputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof createProjectSchema>>({                    // Definición del form con react-hook-form
    resolver: zodResolver(createProjectSchema.omit({workspaceId: true})),
    defaultValues: {
      name: "",
    }
  });

  const onSubmmit = (values: z.infer<typeof createProjectSchema>) => {           // El submit recibe los values del form y se valida con el esquema
    const finalValues = {                                                        // Se crea un objeto con los valores del form, la imagen subida y el workspaceId
      ...values,
      image: values.image instanceof File ? values.image : "",
      workspaceId
    }
    mutate({ form: finalValues }, {                                              // Se envia el objeto a la mutation
      onSuccess: ({data}) => {                                                   // Si se obtuvo la data de la mutation
        form.reset();
        router.push(`/workspaces/${workspaceId}/projects/${data.$id}`)
      }
    });
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  }

  return (
    <Card className="w-full h-full border-none shadow-slate-200">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new project
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
                        placeholder="Enter project name"
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
                                : field.value
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
                              if(inputRef.current){
                                inputRef.current.value = ""
                              }
                            }}
                          >
                            Remove Image
                          </Button>
                        ):(
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
                Create Project
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}