import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateInviteCode(length: number) {
  const possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
  }
  return code
}

export function snakeCaseToTitleCase(str: string){
  return str.toLowerCase()
    .replace(/_/g, "")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
