"use client";

import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup, // ← importa el grupo
} from "@/components/ui/dropdown-menu";
import { locales, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function LanguageSelector() {
  const { locale, setLocale, dict } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={dict.language.label}
            title={dict.language.label}
            className="cursor-pointer"
          />
        }
      >
        <Globe className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuGroup>
          {" "}
          {/* ← agrupa label + items */}
          <DropdownMenuLabel>{dict.language.label}</DropdownMenuLabel>
          {/* Opcional: si quieres el separador dentro del grupo, ponlo aquí */}
          <DropdownMenuSeparator />
          {locales.map((code: Locale) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setLocale(code)}
              className="justify-between"
            >
              <span>{dict.language[code]}</span>
              <Check
                className={cn(
                  "size-4",
                  code === locale ? "opacity-100" : "opacity-0",
                )}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
