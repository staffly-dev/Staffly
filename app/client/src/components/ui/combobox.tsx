"use client";

import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Combobox({
  initialValues,
  placeholder,
  searchPlaceholder,
  onValueChange,
}: {
  initialValues: string[];
  placeholder: string;
  searchPlaceholder: string;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [selected, setSelected] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleSelect = (value: string) => {
    setSelected(value);
    onValueChange(value);
    if (!values.includes(value)) {
      setValues([...values, value]);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="font-normal" asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal text-sm"
        >
          {selected ?? placeholder}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command className="">
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList className="max-h-[230px] p-0 overflow-y-auto">
            {values
              .filter((val) =>
                val.toLowerCase().includes(inputValue.toLowerCase())
              )
              .map((val) => (
                <CommandItem
                  className="cursor-pointer hover:bg-hrms-gray/10 focus:bg-hrms-gray/10"
                  key={val}
                  onSelect={() => handleSelect(val)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      val === selected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {val}
                </CommandItem>
              ))}
            {inputValue &&
              !values.some(
                (val) => val.toLowerCase() === inputValue.toLowerCase()
              ) && (
                <CommandItem
                  onSelect={() => handleSelect(inputValue)}
                  className="text-blue-500 cursor-pointer hover:bg-gray-100"
                >
                  Add &quot;{inputValue}&quot;
                </CommandItem>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
