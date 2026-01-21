export interface Customer {
  client_id: string;
  nom: string;
  prenom: string;
  adresse: string;
  email: string;
  type: string;
  telephone?: string;
  date_creation?: Date;
}

export interface CustomerDetails extends Customer {
  contracts?: Contract[];
  bills?: Bill[];
}

export interface Contract {
  contract_id: string;
  customer_id?: string;
  customer_name?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'cancel_requested' | string;
}

export interface Service {
  service_id: string;
  name: string;
  type: string;
  price: number;
  status?: string;  included_quantity?: number;}

export interface Offer {
  offre_id: string;
  name: string;
  description: string;
  price: number;
  status?: string;
}

export interface Bill {
  facture_id: string;
  client_id: string;
  consom_appel: number;
  consom_sms: number;
  consom_internet: number;
  paid: boolean;
  somme_tot: number;
  total_paid?: number;
  balance_due?: number;
  period_start?: string;
  period_end?: string;
  issue_date?: string;
  due_date?: string;
  paid_date?: string;
  status?: string;
  date_facture?: Date;
  date_echeance?: Date;
}

export interface BillDetails extends Bill {
  customer?: Customer;
  isPaid: boolean;
  isCalculated: boolean;
}

export interface InvoiceLine {
  line_id: string;
  facture_id: string;
  service_id?: string;
  service_name?: string;
  quantity: number;
  unit_price: number;
  amount: number;
  description?: string;
}
