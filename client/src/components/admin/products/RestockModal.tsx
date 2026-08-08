import { useEffect, useState } from "react";
import { Icon } from "../../ui/Icon";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { ProductImage } from "../../ui/ProductImage";
import type { Product } from "../../../types";

interface RestockModalProps {
  product: Product | null;
  onClose: () => void;
  onConfirm: (product: Product, newStock: number) => Promise<void>;
}

const PRESETS = [10, 25, 50, 100];

export const RestockModal = ({ product, onClose, onConfirm }: RestockModalProps) => {
  const [stock, setStock] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) setStock(product.stock || 0);
  }, [product]);

  if (!product) return null;

  const currentStock = product.stock || 0;

  const handleConfirm = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onConfirm(product, Math.max(0, stock));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!product}
      onClose={onClose}
      title="Restock Product"
      subtitle="Set the exact stock count"
      icon={<Icon name="inventory" className="text-lg" />}
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="blue" onClick={handleConfirm} loading={saving}>Update Stock</Button>
        </>
      }
    >
      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
        <ProductImage
          src={product.images && product.images.length > 0 ? product.images[0] : undefined}
          alt={product.name}
          className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700/80 shrink-0 bg-slate-100 dark:bg-slate-800"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{product.category || "General"}</p>
        </div>
        <span className="ml-auto px-2 py-0.5 rounded text-[11px] font-extrabold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shrink-0">
          {currentStock} in stock
        </span>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">New Stock Count</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStock((s) => Math.max(0, s - 1))}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0 flex items-center justify-center"
            disabled={saving}
          >
            <Icon name="remove" className="text-lg" />
          </button>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
            disabled={saving}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-lg font-black text-center rounded-xl px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20 transition"
          />
          <button
            onClick={() => setStock((s) => s + 1)}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0 flex items-center justify-center"
            disabled={saving}
          >
            <Icon name="add" className="text-lg" />
          </button>
        </div>

        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Quick Set</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((n) => (
              <button
                key={n}
                onClick={() => setStock(n)}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
