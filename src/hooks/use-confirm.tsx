import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export const useConfirm = (
  title: string,
  message: string,
  variant: ButtonProps["variant"] = "primary",
):[() => JSX.Element, () => Promise<unknown>] => {

  // Estado de una promesa que se resuelve con un boolean cuando se confirma o se cierra el modal.
  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null >(null); 

  const confirm = () => {                   // Función que resuelve la promesa con un booleano proveniente handleConfirm o handleCancel
    return new Promise((resolve) => {       // handleConfirm y handleCancel se llaman desde el modal. Donde se use el resolve permitirá continuar con el flujo de la aplicación.
      setPromise({ resolve})
    })
  }

  const handleClose = () => {               // Función que resuelve la promesa con false
    setPromise(null)
  }

  const handleConfirm = () => {             // Función que llama a la función de confirmación
      promise?.resolve(true);
      handleClose();
  }

  const handleCancel = () => {              // Función que llama a la función de cancelación
    promise?.resolve(false);
    handleClose();
  }

  const ConfirmationDialog = () => (
    <ResponsiveModal
      open={promise !== null} // El modal se abre cuando la promesa se establece en true proveniente de la fn onDelete de cada componente
      onOpenChange={handleClose}
    >
      <Card className="w.full h-full border-none shadow-slate-200">
        <CardContent className="pt-8">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full lg:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant={variant}
              className="w-full lg:w-auto"
            >
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </ResponsiveModal>
  )

  return [ConfirmationDialog, confirm];
}