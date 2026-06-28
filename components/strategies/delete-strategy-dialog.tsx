"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Strategy } from "@/types"

export function DeleteStrategyDialog({
  strategy,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  strategy: Strategy | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <Dialog open={!!strategy} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar estrategia</DialogTitle>
          <DialogDescription>
            ¿Seguro que deseas eliminar{" "}
            <span className="font-medium text-foreground">{strategy?.name}</span>? Esta
            acción no se puede deshacer y dejará de monitorearse.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
