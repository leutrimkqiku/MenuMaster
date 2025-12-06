export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category?: string;
}

export interface Menu {
  id: string;
  title: string;
  isActive: boolean;
  products: Product[];
}

export interface Company {
  name: string;
  address: string;
  phone: string;
  currency: string;
  colorTheme: string; // hex code
}

export interface User {
  id: string;
  email: string;
  companyName: string;
}

// Global state container
export interface AppState {
  company: Company;
  menus: Menu[];
}