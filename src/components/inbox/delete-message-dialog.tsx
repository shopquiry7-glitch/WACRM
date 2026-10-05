"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteForEveryone: () => void;
  onDeleteForMe: () => void;
  count?: number;
}

export function DeleteMessageDialog({
  open,
  onOpenChange,
  onDeleteForEveryone,
  onDeleteForMe,
  count = 1,
}: DeleteMessageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[340px] w-[90vw] rounded-[28px] border border-[#2a3942] bg-[#182229] p-6 shadow-2xl gap-0 text-white focus:outline-none focus-visible:outline-none [&>button]:hidden">
        <DialogTitle className="text-xl font-normal text-[#e9edef] pb-6 text-left">
          {count > 1 ? `Delete ${count} messages?` : "Delete message?"}
        </DialogTitle>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              onDeleteForEveryone();
              onOpenChange(false);
            }}
            className="w-full rounded-full border-2 border-[#00a884] bg-transparent py-2.5 px-4 text-center text-[15px] font-medium text-[#f15c6d] transition-all hover:bg-[#00a884]/10 active:scale-[0.98] outline-none cursor-pointer"
          >
            Delete for everyone
          </button>

          <button
            type="button"
            onClick={() => {
              onDeleteForMe();
              onOpenChange(false);
            }}
            className="w-full rounded-full border border-[#2a3942] bg-[#202c33] py-2.5 px-4 text-center text-[15px] font-medium text-[#00a884] transition-all hover:bg-[#2a3942] active:scale-[0.98] outline-none cursor-pointer"
          >
            Delete for me
          </button>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-full border-none bg-transparent py-2.5 px-4 text-center text-[15px] font-medium text-[#00a884] transition-all hover:bg-[#202c33]/50 active:scale-[0.98] outline-none cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
