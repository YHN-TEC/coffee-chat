"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Badge, Button, Input } from "@/components/ui";
import { cn, parseCommaSeparated } from "@/lib/utils";

export function TagSelector({
  label,
  options,
  value,
  onChange,
  placeholder = "输入自定义标签，按回车添加",
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (nextValue: string[]) => void;
  placeholder?: string;
}) {
  const [customValue, setCustomValue] = useState("");
  const normalized = useMemo(() => Array.from(new Set(value)), [value]);

  const toggle = (item: string) => {
    if (normalized.includes(item)) {
      onChange(normalized.filter((valueItem) => valueItem !== item));
      return;
    }
    onChange([...normalized, item]);
  };

  const addCustom = () => {
    const parsed = parseCommaSeparated(customValue);
    if (!parsed.length) return;
    onChange(Array.from(new Set([...normalized, ...parsed])));
    setCustomValue("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => toggle(item)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition",
              normalized.includes(item)
                ? "border-[#5b3620] bg-[#5b3620] text-white"
                : "border-[#d9c1ad] bg-white text-[#6b4a36] hover:bg-[#f7efe4]",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={customValue}
          onChange={(event) => setCustomValue(event.target.value)}
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addCustom}>
          添加标签
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-[#5e4130]">{label}</p>
        <div className="flex flex-wrap gap-2">
          {normalized.length ? (
            normalized.map((item) => (
              <Badge key={item} className="gap-1 bg-[#fff1df] text-[#7b4b2e]">
                {item}
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  className="rounded-full p-0.5 hover:bg-[#f2d7b6]"
                  title={`移除 ${item}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-[#9b7f69]">还没有选择标签</p>
          )}
        </div>
      </div>
    </div>
  );
}
