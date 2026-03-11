const AppError = require('../errors/AppError');
const { verifyAccessToken } = require('../utils/tokens');
const userRepository = require('../../modules/auth/auth.repository');

function extractBearerToken(req) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

async function authenticate(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new AppError('Authentication token is required', 401);
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      throw new AppError('Invalid or expired authentication token', 401);
    }

    if (payload.type !== 'access') {
      throw new AppError('Invalid authentication token type', 401);
    }

    const userId = Number(payload.sub);
    if (Number.isNaN(userId)) {
      throw new AppError('Invalid authentication token subject', 401);
    }

    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError('Account is inactive or no longer exists', 401);
    }

    if (payload.tokenVersion !== user.tokenVersion) {
      throw new AppError('Session is no longer valid. Please login again.', 401);
    }

    req.auth = {
      userId: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
      user,
    };

    next();
  } catch (err) {
    next(err);
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return next(new AppError('Authentication is required', 401));
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.auth.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
