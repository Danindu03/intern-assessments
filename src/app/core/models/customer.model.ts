export type CustomerType = 'Shipper' | 'Consignee' | 'Freight forwarder' | 'Agent';

export const CUSTOMER_TYPES: CustomerType[] = ['Shipper', 'Consignee', 'Freight forwarder', 'Agent'];

export interface Customer {
  customerId: number;
  customerCode: string;
  customerName: string;
  customerType: CustomerType;
  country: string;
  email: string;
  phone: string | null;
  creditLimit: number | null;
  isActive: boolean;
}

/** What the form sends when creating or updating. */
export type CustomerPayload = Omit<Customer, 'customerId' | 'isActive'>;
