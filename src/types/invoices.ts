export type InvoiceType = 'invoice' | 'quotation' | 'receipt';

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid'
  | 'partial'
  | 'overdue'
  | 'accepted'
  | 'cancelled';

export type InvoiceCurrency = 'AED' | 'SAR' | 'USD' | 'PKR' | 'EUR' | 'GBP';

export interface SalesPerson {
  id: string;
  name: string;
  displayName: string;
  role: string;
  email: string;
  avatar?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  inclusions?: string;
}

export interface Invoice {
  id: string;
  referenceNumber: string;
  type: InvoiceType;
  title: string;
  clientName: string;
  companyName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress?: string;
  taxNumber?: string;

  currency: InvoiceCurrency;
  subtotal: number;
  taxRate: number; // percentage e.g. 5
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;

  status: InvoiceStatus;

  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  createdAt: string; // ISO

  salesPerson: SalesPerson;
  items: InvoiceItem[];
  notes?: string;
  paymentTerms?: string;

  // Specific to Quotation
  validUntil?: string;
  convertedInvoiceId?: string;

  // Specific to Receipt
  linkedInvoiceRef?: string;
  paymentMethod?: 'bank_transfer' | 'credit_card' | 'cash' | 'stripe' | 'wire' | 'paypal';
  transactionId?: string;
}

export interface InvoiceStats {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  invoiceCount: number;
  quotationCount: number;
  receiptCount: number;
}

export interface InvoiceFilterState {
  search: string;
  status: string;
  salesPersonId: string;
  currency: string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'name';
}
