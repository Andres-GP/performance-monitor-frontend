"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Strategy } from "@/types";
import { useI18n } from "@/lib/i18n/context";

export function DeleteStrategyDialog({
  strategy,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  strategy: Strategy | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const { dict, t } = useI18n();

  return (
    <Dialog open={!!strategy} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.strategyDelete.title}</DialogTitle>
          <DialogDescription>
            {t(dict.strategyDelete.description, { name: strategy?.name || "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending
              ? dict.strategyDelete.deleting
              : dict.strategyDelete.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
