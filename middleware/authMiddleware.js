import jwt from 'jsonwebtoken';
import ResponseManager from '../utils/responseManager.js';
// import {decrypt} from "../../utils/encryptionUtils.js";

const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // const tokenDecrypt = decrypt(token)

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = { id: decoded.id };

      next(); 
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return ResponseManager.sendError(res, 401, 'UNAUTHORIZED', 'Not authorized, token failed');
    }
  }

  if (!token) {
    return ResponseManager.sendError(res, 401, 'UNAUTHORIZED', 'Not authorized, no token');
  }
};

export default authMiddleware;