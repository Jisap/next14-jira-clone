import { cn } from "@/lib/utils";



interface DottedSeparatorProps {
  className?: string
  color?: string
  height?: string
  dotSize?: string
  gapSize?: string
  direction?: "horizontal" | "vertical"
}


export const DottedSeparator = ({ 
  className, 
  color = "#d4d4d8", 
  height = "2px", 
  dotSize = "2px", 
  gapSize = "6px", 
  direction = "horizontal" 
}: DottedSeparatorProps) => {

    const isHorizontal = direction === "horizontal"

  return (
    <div className={cn(
      isHorizontal 
        ? "w-full flex items-center"            // Si el separador es horizontal, ocupa el ancho total del contenedor y se centra horizontalmente
        : "h-full flex flex-col items-center",  // Si el separador es vertical, ocupa el alto total del contenedor y se centra verticalmente
      className
    )}>
      <div 
        className={isHorizontal ? "flex-grow" : "flex-grow-0"}
        style={{
          width: isHorizontal ? "100%" : height,
          height: isHorizontal ? height : "100%",
          backgroundImage: `radial-gradient(circle, ${color} 25%, transparent 25%)`,
          backgroundSize: isHorizontal 
            ? `${parseInt(dotSize) + parseInt(gapSize)}px ${height}`  // El ancho de cada bloque es la suma del dotSize (tamaño del punto) más el gapSize (espacio entre puntos). Cada bloque = () punto + espacio
            : `${height} ${parseInt(dotSize) + parseInt(gapSize)}px`,
          backgroundRepeat: isHorizontal ? "repeat-x" : "repeat-y",
          backgroundPosition: "center",
        }}  
      />
    </div>
  )
}

export default DottedSeparator

// BackgroundSize define el tamaño de un patrón de fondo en cada repetición.
// Este patrón se compone de "cuadrículas" (o bloques) que se repetirán en la dirección especificada, 
// creando un diseño continuo.