interface CreateProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  createdAt: string;
  message: string;
}

export default CreateProductResponse;