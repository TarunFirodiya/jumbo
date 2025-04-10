
import { LucideProps } from "lucide-react";

export function SquareFootage(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 15h18" />
      <path d="M9 3v12" />
      <path d="m14 15-5-5" />
    </svg>
  );
}
