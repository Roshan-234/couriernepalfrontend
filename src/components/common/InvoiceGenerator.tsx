"use client";
export default function InvoiceGenerator() {
  return (
    <button
      type="button"
      className="action action-outline"
      onClick={() => window.print()}
    >
      Print shipment
    </button>
  );
}
