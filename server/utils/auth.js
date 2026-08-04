const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

async function comparePassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

// Bcrypt-hash a new password using the shared cost factor (12 rounds — matches
// the Admin Portal so hashes are interchangeable across portals).
async function hashPassword(plain) {
  return bcrypt.hash(String(plain), env.bcryptRounds || 12);
}

function signAccess(claims) {
  return jwt.sign(claims, env.jwt.accessSecret, { expiresIn: env.jwt.accessTtl });
}

function signRefresh(claims) {
  return jwt.sign(claims, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshTtl });
}

function verifyAccess(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefresh(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

module.exports = { comparePassword, hashPassword, signAccess, signRefresh, verifyAccess, verifyRefresh };
