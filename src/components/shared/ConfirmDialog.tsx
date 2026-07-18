import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'success' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const variantConfig = {
  danger: { icon: XCircle, iconClass: 'text-red-500', btnVariant: 'destructive' as const },
  success: { icon: CheckCircle, iconClass: 'text-emerald-500', btnVariant: 'default' as const },
  warning: { icon: AlertTriangle, iconClass: 'text-amber-500', btnVariant: 'default' as const },
  info: { icon: Info, iconClass: 'text-blue-500', btnVariant: 'default' as const },
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'warning', onConfirm, onCancel, loading = false,
}) => {
  const { icon: Icon, iconClass, btnVariant } = variantConfig[variant];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-slate-100 ${iconClass}`}>
              <Icon size={24} />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={btnVariant} onClick={onConfirm} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
