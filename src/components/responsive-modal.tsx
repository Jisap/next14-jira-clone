
import { useMedia } from 'react-use';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import  {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer';

interface ResponsiveModalProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: ( open: boolean ) => void;
}

export const ResponsiveModal = ( {
  children,
  open,
  onOpenChange,
}: ResponsiveModalProps ) => {

  const isDesktop = useMedia( '(min-width: 1024px)' );

  if(isDesktop){
    return (
      <Dialog 
        open={open}                 // Valor de isOpen 
        onOpenChange={onOpenChange} // El componente Dialog permite usar setIsOpen sin argumentos para cambiar el valor de isOpen
      >
        <DialogContent className='w-full sm:max-w-lg p-0 border-none overflow-y-auto hide-scrollbar max-h-[85vh]'>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent>
        <div className='overflow-y-auto hide-scrollbar max-h-[85vh]'>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}