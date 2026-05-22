import type { Metadata } from "next";
import { CustomerListTable } from "@/components/modules/customers/CustomerListTable";
import { PageContainer } from "@/components/ui/PageContainer";

export const metadata: Metadata = {
  title: "Customers",
  description:
    "View, search, and manage customer records connected to your store's billing activity.",
};

export default function CustomersPage() {
  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Customers</h1>
        <p className="text-gray-600">View and manage all your Customers</p>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600 mb-1">Total Paid</p>
          <h2 className="text-gray-900 mb-2">$18,500.00</h2>
          <p className="text-green-600 text-sm">124 invoices</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600 mb-1">Pending Payment</p>
          <h2 className="text-gray-900 mb-2">$35,700.00</h2>
          <p className="text-amber-600 text-sm">86 invoices</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600 mb-1">Overdue</p>
          <h2 className="text-gray-900 mb-2">$6,100.00</h2>
          <p className="text-red-600 text-sm">18 invoices</p>
        </div>
      </div> */}

      <CustomerListTable />
    </PageContainer>
  );
}
