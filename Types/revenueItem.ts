export type RevenueItem = {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage: string;
  };
  course?: {
    _id: string;
    title: string;
    price: number;
    discount: number;
    status: string;
    createdBy: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  assigment?: {
    _id: string;
    title: string;
    budget: number | string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    status: string;
  };
  amount: number;
  currency: string;
  paymentMethod: string;
  stripeSessionId: string;
  status: string;
  userFree: number;
  adminFree: number;
  createdAt: string;
  updatedAt: string;
  stripePaymentIntentId?: string;
  paymentDate?: string;
};
