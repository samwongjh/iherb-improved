import React, { useState } from 'react';
import { X, Package, LogOut } from 'lucide-react';
import { OrderRecord } from '../types/catalog';

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  signedInUser: string | null;
  onSignIn: (name: string) => void;
  onSignOut: () => void;
  orders: OrderRecord[];
}

export const AccountModal: React.FC<AccountModalProps> = ({
  open,
  onClose,
  signedInUser,
  onSignIn,
  onSignOut,
  orders,
}) => {
  const [nameInput, setNameInput] = useState('Sam Wong');
  const [emailInput, setEmailInput] = useState('sam.wong.jh@gmail.com');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onSignIn(nameInput.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E7E9] bg-[#FAFBFC]">
          <h2 className="font-display text-base font-bold text-[#1A1D1E]">
            {signedInUser ? 'My iHerb Singapore Account' : 'Sign In to iHerb Singapore'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account modal"
            className="p-1.5 text-[#5A6266] hover:text-[#1A1D1E] rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {!signedInUser ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1D1E] mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-[#DDE1E4] rounded-md focus:border-[#458500] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1A1D1E] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-[#DDE1E4] rounded-md focus:border-[#458500] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full h-10 bg-[#458500] hover:bg-[#366a00] text-white text-sm font-bold rounded-md transition-colors cursor-pointer"
              >
                Continue
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#ECEFF1]">
                <div>
                  <p className="text-sm font-bold text-[#1A1D1E]">{signedInUser}</p>
                  <p className="text-xs text-[#5A6266]">Singapore · Currency: SGD</p>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A6266] hover:text-[#C93B2B] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-[#1A1D1E]">Recent Orders</h3>
                {orders.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#ECEFF1] text-center text-xs text-[#5A6266]">
                    No orders placed in this session yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {orders.map((ord) => (
                      <div
                        key={ord.orderNumber}
                        className="p-3 rounded-lg border border-[#E4E7E9] bg-[#FAFBFC] text-xs space-y-1"
                      >
                        <div className="flex justify-between font-bold text-[#1A1D1E]">
                          <span className="inline-flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-[#458500]" />
                            #{ord.orderNumber}
                          </span>
                          <span className="tabular-nums">SG${ord.totalSgd.toFixed(2)}</span>
                        </div>
                        <p className="text-[#458500] font-medium">{ord.status}</p>
                        <p className="text-[#5A6266]">
                          {ord.itemsCount} items · {ord.date}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
