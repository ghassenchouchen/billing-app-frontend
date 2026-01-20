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
  contrat_id: string;
  client_id: string;
  offre_id: string;
  date_debut: Date;
  date_fin?: Date;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Service {
  service_id: string;
  nom: string;
  description: string;
  prix: number;
  type: 'call' | 'sms' | 'data';
}

export interface Offer {
  offre_id: string;
  nom: string;
  description: string;
  prix_mensuel: number;
  duree_engagement: number;
  services: Service[];
}

export interface Bill {
  facture_id: string;
  client_id: string;
  consom_appel: number;
  consom_sms: number;
  consom_internet: number;
  paid: boolean;
  somme_tot: number;
  date_facture?: Date;
  date_echeance?: Date;
}

export interface BillDetails extends Bill {
  customer?: Customer;
  isPaid: boolean;
  isCalculated: boolean;
}
