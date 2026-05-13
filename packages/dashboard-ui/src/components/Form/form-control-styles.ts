import { cn } from "../../lib/utils";

const formControlBaseClassName = cn(
  "border-input bg-card text-foreground placeholder:text-muted-foreground",
  "hover:border-ring/30",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "aria-invalid:border-danger aria-invalid:bg-danger/5 aria-invalid:ring-danger/20",
  "disabled:bg-muted/60 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-100",
  "w-full min-w-0 max-w-full rounded-lg border text-sm shadow-xs transition-[background-color,border-color,color,box-shadow] outline-none"
);

const textControlClassName = cn(
  formControlBaseClassName,
  "flex min-h-9 px-3 py-2"
);

const textInputClassName = cn(formControlBaseClassName, "flex h-9 px-3 py-1");

const dateInputClassName = cn(
  textInputClassName,
  "block appearance-none [inline-size:100%] [max-inline-size:100%] [min-inline-size:0]",
  "[&::-webkit-date-and-time-value]:min-w-0 [&::-webkit-date-and-time-value]:text-left"
);

export {
  dateInputClassName,
  formControlBaseClassName,
  textControlClassName,
  textInputClassName
};
