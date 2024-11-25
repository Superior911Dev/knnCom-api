// backend/utils/authHelpers.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to find a user by username
const findUserByUsername = async (username) => {
  return await prisma.user.findUnique({
    where: { username },
  });
};

// Helper to create a new user
const createUser = async (username, password) => {
  return await prisma.user.create({
    data: { username, password },
  });
};

module.exports = { findUserByUsername, createUser };
