const crypto = require('crypto');
 
function issueCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}
 
function requireCsrf(req, res, next) {
  const headerToken = req.headers['x-csrf-token'];
  if (!headerToken || headerToken !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Token CSRF inválido o ausente' });
  }
  next();
}
 
module.exports = { issueCsrfToken, requireCsrf };
