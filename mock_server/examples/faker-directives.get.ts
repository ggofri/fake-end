interface ProductWithFaker {
  /** @mock faker.number.int({ min: 1000, max: 9999 }) */
  id: number;
  
  /** @mock faker.commerce.productName() */
  name: string;
  
  /** @mock faker.number.float({ min: 10, max: 500, fractionDigits: 2 }) */
  price: number;
  
  /** @mock faker.helpers.arrayElement(["electronics", "clothing", "books", "sports"]) */
  category: string;
  
  /** @mock faker.datatype.boolean() */
  inStock: boolean;
  
  /** @mock faker.lorem.paragraph() */
  description: string;
  
  /** @mock faker.date.past().toISOString() */
  createdAt: string;
  
  /** @mock faker.internet.url() */
  website: string;
  
  /** @mock faker.image.avatar() */
  image: string;
  
  /** @mock faker.helpers.arrayElement(["low", "medium", "high"]) */
  priority: string;
}

export default ProductWithFaker;
