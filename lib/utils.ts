import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function camelToTitleCase(camelCase: string): string {
  // Insert a space before each capital letter that follows a lowercase letter
  let spacedString = camelCase.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Insert a space before each capital letter that follows a capital letter only if the next character is lowercase
  spacedString = spacedString.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');

  // Capitalize the first letter of the entire string
  let titleCaseString = spacedString.charAt(0).toUpperCase() + spacedString.slice(1);

  // Ensure that sequences of uppercase letters remain uppercase
  titleCaseString = titleCaseString.replace(/ ([A-Z])([A-Z]+)/g, (match) => {
    return match.toUpperCase();
  });

  return titleCaseString;
}