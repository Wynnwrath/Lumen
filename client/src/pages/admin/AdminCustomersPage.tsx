import { useState } from "react";
import { Icon } from "../../components/common/Icon";
import { dataService } from "../../services/dataService";
import type { CustomerData } from "../../types";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { SearchInput } from "../../components/common/SearchInput";
import { EmptyState } from "../../components/common/EmptyState";

export const AdminCustomersPage = () => {
  const [customers] = useState<CustomerData[]>(dataService.getCustomers());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

  const filtered = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800/90 shadow-sm flex items-center gap-3 rounded-none">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by customer name or email..." />
      </div>

      {/* Customers Section: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      <div className="space-y-4">
        {/* Mobile View: High-Density Customer Cards */}
        <div className="block md:hidden space-y-3">
          {filtered.length === 0 ? (
            <EmptyState text="No customers found matching your search." className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium rounded-none" />
          ) : (
            filtered.map((c) => (
              <div
                key={c._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs rounded-none"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-12 h-12 rounded-full object-cover bg-slate-200 shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {c.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">{c.email}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                      c.tier.includes("VIP")
                        ? "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                        : c.tier.includes("Pro")
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {c.tier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs rounded-none">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Lifetime Spend</span>
                    <span className="font-mono font-extrabold text-slate-900 dark:text-white text-xs">
                      ${c.totalSpent.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Purchases</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {c.totalOrders} Orders
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Joined: {c.registeredAt}</span>
                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition shadow-xs"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Multi-Column Table (screen >= md) */}
        <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden rounded-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Tier Status</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-10 h-10 rounded-full object-cover bg-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[11px] text-slate-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${c.tier.includes("VIP")
                            ? "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                            : c.tier.includes("Pro")
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                      >
                        {c.tier}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {c.totalOrders} Orders
                    </td>
                    <td className="p-4 font-mono font-extrabold text-slate-900 dark:text-white">
                      ${c.totalSpent.toFixed(2)}
                    </td>
                    <td className="p-4 text-slate-500 font-medium">{c.registeredAt}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 1-to-1 Customer Detailed Profile Modal (admin-customers.html parity) */}
      <Modal
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer ? selectedCustomer.name : ""}
        subtitle={selectedCustomer ? selectedCustomer.email : undefined}
        icon={selectedCustomer ? <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-full h-full object-cover" /> : undefined}
        headerIconClassName="w-11 h-11 rounded-full border-2 border-blue-600 overflow-hidden"
        className="max-w-2xl"
        footer={<Button onClick={() => setSelectedCustomer(null)}>Close Profile</Button>}
      >
        {selectedCustomer && (
          <>
            {/* Summary Stats Strip */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Account Status
                </p>
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${selectedCustomer.tier.includes("VIP")
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      : selectedCustomer.tier.includes("Pro")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                >
                  {selectedCustomer.tier}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Total Orders
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedCustomer.totalOrders}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Lifetime Spend
                </p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  ${selectedCustomer.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Contact Info Details */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Icon name="badge" className="text-blue-600 text-sm" />
                <span>Contact & Address Info</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 font-medium">Phone Number:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedCustomer.phone}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Shipping Address:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedCustomer.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Account Details */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Icon name="event" className="text-blue-600 text-sm" />
                <span>Account Registration</span>
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Registered Date:</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedCustomer.registeredAt}
                </p>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
