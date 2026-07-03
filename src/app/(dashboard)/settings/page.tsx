"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Shop {
  name: string; address: string; city: string; state: string;
  pincode: string; phone: string; email: string; gstin: string;
  bankName: string; bankAcc: string; bankIfsc: string; upiId: string;
}

interface User {
  id: string; name: string; email: string; role: string; phone: string | null; isActive: boolean;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const [tab, setTab] = useState<"shop" | "users">("shop");
  const [shop, setShop] = useState<Shop>({
    name: "Srihari Silvers", address: "Ammapet Main Road", city: "Salem",
    state: "Tamil Nadu", pincode: "636001", phone: "9952797597",
    email: "", gstin: "", bankName: "", bankAcc: "", bankIfsc: "", upiId: "",
  });
  const [shopSaving, setShopSaving] = useState(false);
  const [shopSuccess, setShopSuccess] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "SALES", phone: "" });
  const [userSaving, setUserSaving] = useState(false);
  const [userError, setUserError] = useState("");

  useEffect(() => {
    fetch("/api/shop").then(r => r.json()).then(d => { if (d) setShop(d); });
    if (isAdmin) fetch("/api/users").then(r => r.json()).then(setUsers);
  }, [isAdmin]);

  async function saveShop(e: React.FormEvent) {
    e.preventDefault();
    setShopSaving(true);
    await fetch("/api/shop", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(shop) });
    setShopSaving(false);
    setShopSuccess(true);
    setTimeout(() => setShopSuccess(false), 3000);
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setUserError("");
    setUserSaving(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    });
    const d = await res.json();
    if (res.ok) {
      setShowUserForm(false);
      setUserForm({ name: "", email: "", password: "", role: "SALES", phone: "" });
      fetch("/api/users").then(r => r.json()).then(setUsers);
    } else {
      setUserError(d.error || "Failed to add user");
    }
    setUserSaving(false);
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-700">Admin Access Required</h2>
        <p className="text-slate-400 mt-1">Settings are only accessible to admin users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage shop profile and user accounts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 w-fit">
        <button onClick={() => setTab("shop")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "shop" ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
          Shop Profile
        </button>
        <button onClick={() => setTab("users")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "users" ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
          Users & Access
        </button>
      </div>

      {tab === "shop" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-5">Shop Profile</h2>
          <form onSubmit={saveShop}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-slate-600 mb-1">Shop Name *</label>
                <input type="text" value={shop.name} onChange={(e) => setShop({...shop, name: e.target.value})} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-600 mb-1">Address *</label>
                <input type="text" value={shop.address} onChange={(e) => setShop({...shop, address: e.target.value})} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">City</label>
                <input type="text" value={shop.city} onChange={(e) => setShop({...shop, city: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">State</label>
                <input type="text" value={shop.state} onChange={(e) => setShop({...shop, state: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Pincode</label>
                <input type="text" value={shop.pincode} onChange={(e) => setShop({...shop, pincode: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Phone *</label>
                <input type="tel" value={shop.phone} onChange={(e) => setShop({...shop, phone: e.target.value})} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Email</label>
                <input type="email" value={shop.email} onChange={(e) => setShop({...shop, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">GSTIN</label>
                <input type="text" value={shop.gstin} onChange={(e) => setShop({...shop, gstin: e.target.value})}
                  placeholder="15-digit GSTIN"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">UPI ID</label>
                <input type="text" value={shop.upiId} onChange={(e) => setShop({...shop, upiId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>

              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                <p className="text-sm font-semibold text-slate-700 mb-3">Bank Details (for invoices)</p>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Bank Name</label>
                <input type="text" value={shop.bankName} onChange={(e) => setShop({...shop, bankName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Account Number</label>
                <input type="text" value={shop.bankAcc} onChange={(e) => setShop({...shop, bankAcc: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">IFSC Code</label>
                <input type="text" value={shop.bankIfsc} onChange={(e) => setShop({...shop, bankIfsc: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <button type="submit" disabled={shopSaving}
                className="bg-amber-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-70">
                {shopSaving ? "Saving..." : "Save Shop Profile"}
              </button>
              {shopSuccess && <span className="text-emerald-600 text-sm font-medium">Saved successfully!</span>}
            </div>
          </form>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">User Accounts</h2>
            <button onClick={() => setShowUserForm(true)}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add User
            </button>
          </div>

          {showUserForm && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Add New User</h3>
              <form onSubmit={addUser}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Full Name *</label>
                    <input type="text" value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Email *</label>
                    <input type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Password *</label>
                    <input type="password" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Role *</label>
                    <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                      <option value="SALES">Sales Staff (Limited Access)</option>
                      <option value="ADMIN">Admin (Full Access)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Phone</label>
                    <input type="tel" value={userForm.phone} onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                </div>

                {/* Role Capabilities */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg border ${userForm.role === "ADMIN" ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Admin Access Includes:</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>✓ All sales & billing</li>
                      <li>✓ Purchase management</li>
                      <li>✓ Inventory management</li>
                      <li>✓ Reports & analytics</li>
                      <li>✓ Settings & users</li>
                      <li>✓ Expenses management</li>
                    </ul>
                  </div>
                  <div className={`p-3 rounded-lg border ${userForm.role === "SALES" ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"}`}>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Sales Access Includes:</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>✓ Create new bills</li>
                      <li>✓ View sales history</li>
                      <li>✓ View/add customers</li>
                      <li>✓ View silver rates</li>
                      <li>✗ No purchase access</li>
                      <li>✗ No reports access</li>
                    </ul>
                  </div>
                </div>

                {userError && <p className="text-red-600 text-sm mt-3">{userError}</p>}
                <div className="flex gap-3 mt-4">
                  <button type="submit" disabled={userSaving}
                    className="bg-amber-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-70">
                    {userSaving ? "Creating..." : "Create User"}
                  </button>
                  <button type="button" onClick={() => setShowUserForm(false)}
                    className="border border-slate-300 text-slate-600 px-4 py-2.5 rounded-lg text-sm hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Phone</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Role</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-800">{u.name}</td>
                    <td className="px-5 py-3 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3 text-slate-500">{u.phone || "-"}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === "ADMIN"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
