import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { useStoreNavigation } from "@/hooks/store-navigation";
import {
  selectInvoiceState,
  updateInvoiceDue,
  updateInvoiceDueThunk,
} from "@/store/features/invoiceSlice";
import { InvoiceDto } from "@/types/dto/invoiceDto";
import { X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export const InvoiceDueEditModal = ({
  openState,
  onClose,
  invoice,
  page,
}: {
  openState: boolean;
  onClose: () => void;
  invoice: InvoiceDto;
  page: number;
}) => {
  const { storeId } = useStoreNavigation();
  const dispatch = useDispatch();
  const { updateStatus } = useSelector(selectInvoiceState);
  const [input, setInput] = useState(String(invoice.dueAmount));

  const handleUpdate = () => {
    if (!storeId || !invoice._id || !input.trim()) return;
    const num_input = Number(input);
    if (num_input > invoice.dueAmount) {
      toast.warn("You can not pay more than due.");
      return;
    }

    dispatch(
      updateInvoiceDueThunk({
        storeId,
        invoiceId: invoice._id,
        paidAmount: num_input,
      }),
    )
      .unwrap()
      .then(() => {
        setInput("");
        dispatch(
          updateInvoiceDue({
            page,
            invoiceId: invoice._id,
            newDueAmount: invoice.dueAmount - num_input,
          }),
        );
        toast.success("Due updated");
        onClose();
      });
  };

  const isUpdating = updateStatus === "loading";

  return (
    <Modal openState={openState} onClose={onClose} className="space-y-6 w-100">
      <div className="flex gap-2 justify-between mb-6">
        <h3 className="text-lg">Update Due</h3>
        <Button variant="outline" className="p-2" onClick={onClose}>
          <X size={15} />
        </Button>
      </div>
      <div>
        <Label htmlFor="due-amount">Enter paid Amount</Label>
        <Input
          placeholder="Enter paid amount"
          type="number"
          id="due-amount"
          value={input}
          disabled={isUpdating}
          onChange={setInput}
        />
      </div>
      <div className="flex justify-end">
        <Button
          disabled={isUpdating}
          loading={isUpdating}
          onClick={handleUpdate}
        >
          Save changes
        </Button>
      </div>
    </Modal>
  );
};
