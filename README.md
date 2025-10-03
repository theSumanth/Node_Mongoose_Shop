# Node Mongoose Shop

A basic Node.js application that demonstrates CRUD operations (Create, Read, Update, Delete) using MongoDB via Mongoose. The project allows users to manage products, add items to a cart, and place orders.

## Features

- **Product Management:** Add, view, update, and delete products.
- **Cart Operations:** Add products to your cart and review cart contents.
- **Order Placement:** Place orders for items in your cart.
- **MongoDB Integration:** Uses Mongoose for data modeling and interaction.

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Language:** JavaScript

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/theSumanth/node-mongoose-shop.git
   cd node-mongoose-shop
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up MongoDB:**
   - Ensure MongoDB is running locally or provide a connection string in your `.env` or configuration file.

4. **Run the application:**
   ```bash
   npm start
   ```
   The app will typically run on [http://localhost:3000](http://localhost:3000).

## Usage

- Access the API endpoints to manage products, cart, and orders.
- Use tools like Postman or curl to test the API.

## API Endpoints (Example)

> **Note:** Actual endpoints may vary. Review routes in the source code for exact paths.

- **Products**
  - `GET /products` — List all products
  - `POST /products` — Add new product
  - `PUT /products/:id` — Update product
  - `DELETE /products/:id` — Delete product

- **Cart**
  - `POST /cart/add` — Add product to cart
  - `GET /cart` — View cart items

- **Orders**
  - `POST /orders` — Place an order for cart items
  - `GET /orders` — View placed orders

## Contributing

Contributions are welcome! Please fork the repository and create a pull request.

## License

This project is for educational purposes. No license specified.

## Author

Made by [theSumanth](https://github.com/theSumanth)
