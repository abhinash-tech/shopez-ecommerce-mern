const bcrypt = require('bcryptjs');

const users = [
  {
    name: 'Admin User',
    email: 'admin@shopez.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Vendor Electronics',
    email: 'vendor1@shopez.com',
    password: 'Password123!',
    role: 'vendor',
  },
  {
    name: 'Vendor Fashion',
    email: 'vendor2@shopez.com',
    password: 'Password123!',
    role: 'vendor',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123!',
    role: 'customer',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Password123!',
    role: 'customer',
  },
  {
    name: 'Michael Johnson',
    email: 'michael@example.com',
    password: 'Password123!',
    role: 'customer',
  },
  {
    name: 'Emily Davis',
    email: 'emily@example.com',
    password: 'Password123!',
    role: 'customer',
  },
  {
    name: 'David Wilson',
    email: 'david@example.com',
    password: 'Password123!',
    role: 'customer',
  },
  {
    name: 'Sarah Brown',
    email: 'sarah@example.com',
    password: 'Password123!',
    role: 'customer',
  },
  {
    name: 'James Taylor',
    email: 'james@example.com',
    password: 'Password123!',
    role: 'customer',
  }
];

module.exports = users;
