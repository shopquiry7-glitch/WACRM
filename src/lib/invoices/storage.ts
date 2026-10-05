import type { Invoice, InvoiceStats } from '@/types/invoices';
import { INITIAL_INVOICES, SALES_TEAM, createRandomizedInvoices } from './mock-data';

const STORAGE_KEY = 'wacrm_invoices_data_v4';

export function getStoredInvoices(): Invoice[] {
  if (typeof window === 'undefined') return INITIAL_INVOICES;
  try {
    // Clear out old dummy data from v2 and v3
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('wacrm_invoices_data_v2');
      localStorage.removeItem('wacrm_invoices_data_v3');
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createRandomizedInvoices();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = createRandomizedInvoices();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch (err) {
    console.error('Failed to load invoices from storage:', err);
    return createRandomizedInvoices();
  }
}

export function resetToRandomInvoices(): Invoice[] {
  const fresh = createRandomizedInvoices();
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  }
  return fresh;
}

export function clearAllInvoices(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear storage:', err);
  }
}

export function saveAllInvoices(invoices: Invoice[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  } catch (err) {
    console.error('Failed to persist invoices to storage:', err);
  }
}

export function generateReferenceNumber(type: 'invoice' | 'quotation' | 'receipt'): string {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hex = Math.random().toString(16).substring(2, 6).toUpperCase();

  const prefix = type === 'invoice' ? 'INV' : type === 'quotation' ? 'QT' : 'REC';
  return `TRJ-${prefix}-${yy}${mm}${dd}-${hex}`;
}

export function calculateInvoiceStats(invoices: Invoice[]): InvoiceStats {
  const actualInvoices = invoices.filter((inv) => inv.type === 'invoice');
  const quotations = invoices.filter((inv) => inv.type === 'quotation');
  const receipts = invoices.filter((inv) => inv.type === 'receipt');

  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let totalOverdue = 0;

  for (const inv of actualInvoices) {
    totalInvoiced += inv.totalAmount;
    totalPaid += inv.paidAmount || (inv.status === 'paid' ? inv.totalAmount : 0);

    if (inv.status === 'overdue') {
      totalOverdue += inv.totalAmount - (inv.paidAmount || 0);
    } else if (inv.status === 'sent' || inv.status === 'partial' || inv.status === 'draft') {
      totalPending += inv.totalAmount - (inv.paidAmount || 0);
    }
  }

  return {
    totalInvoiced,
    totalPaid,
    totalPending,
    totalOverdue,
    invoiceCount: actualInvoices.length,
    quotationCount: quotations.length,
    receiptCount: receipts.length,
  };
}

export function convertQuotationToInvoice(
  quotation: Invoice,
  existingList: Invoice[]
): { newInvoice: Invoice; updatedList: Invoice[] } {
  const newRef = generateReferenceNumber('invoice');
  const newId = `inv-${Date.now()}`;

  const newInvoice: Invoice = {
    ...quotation,
    id: newId,
    type: 'invoice',
    referenceNumber: newRef,
    status: 'sent',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    notes: `Converted from Quotation #${quotation.referenceNumber}. ${quotation.notes || ''}`,
  };

  const updatedQuotation: Invoice = {
    ...quotation,
    status: 'accepted',
    convertedInvoiceId: newId,
  };

  const updatedList = [
    newInvoice,
    ...existingList.map((item) => (item.id === quotation.id ? updatedQuotation : item)),
  ];

  saveAllInvoices(updatedList);
  return { newInvoice, updatedList };
}

export function createReceiptFromPaidInvoice(
  invoice: Invoice,
  existingList: Invoice[],
  paymentMethod: 'bank_transfer' | 'credit_card' | 'cash' | 'stripe' | 'wire' | 'paypal' = 'bank_transfer',
  transactionId?: string
): { newReceipt: Invoice; updatedList: Invoice[] } {
  const recRef = generateReferenceNumber('receipt');
  const recId = `rec-${Date.now()}`;
  const nowStr = new Date().toISOString();
  const dateStr = nowStr.split('T')[0];

  const newReceipt: Invoice = {
    id: recId,
    referenceNumber: recRef,
    type: 'receipt',
    title: `Payment Receipt: ${invoice.title || invoice.referenceNumber}`,
    clientName: invoice.clientName,
    companyName: invoice.companyName,
    clientEmail: invoice.clientEmail,
    clientPhone: invoice.clientPhone,
    clientAddress: invoice.clientAddress,
    taxNumber: invoice.taxNumber,
    currency: invoice.currency,
    subtotal: invoice.subtotal,
    taxRate: invoice.taxRate,
    taxAmount: invoice.taxAmount,
    discountAmount: invoice.discountAmount,
    totalAmount: invoice.totalAmount,
    paidAmount: invoice.totalAmount,
    status: 'paid',
    issueDate: dateStr,
    dueDate: dateStr,
    createdAt: nowStr,
    salesPerson: invoice.salesPerson || SALES_TEAM[0],
    linkedInvoiceRef: invoice.referenceNumber,
    paymentMethod,
    transactionId: transactionId || `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    items: [
      {
        id: `it-${Date.now()}`,
        description: `Full Settlement for Invoice #${invoice.referenceNumber} - ${invoice.title || 'Services'}`,
        quantity: 1,
        unitPrice: invoice.totalAmount,
        total: invoice.totalAmount,
      },
    ],
    notes: `Official payment receipt. Settlement confirmed via ${paymentMethod.replace('_', ' ').toUpperCase()}.`,
    paymentTerms: 'Settled in Full',
  };

  const updatedInvoice: Invoice = {
    ...invoice,
    status: 'paid',
    paidAmount: invoice.totalAmount,
  };

  const updatedList = [
    newReceipt,
    ...existingList.map((item) => (item.id === invoice.id ? updatedInvoice : item)),
  ];

  saveAllInvoices(updatedList);
  return { newReceipt, updatedList };
}
