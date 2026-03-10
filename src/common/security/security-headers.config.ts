import { HelmetOptions } from 'helmet';

export const securityHeadersConfig: HelmetOptions = {
  // Ngăn XSS, chèn script từ bên ngoài
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },

  // Không gửi thông tin referrer quá mức
  referrerPolicy: {
    policy: 'no-referrer-when-downgrade',
  },

  // Ngăn MIME sniffing
  xContentTypeOptions: true,

  // Chống clickjacking
  frameguard: {
    action: 'deny',
  },

  // Chỉ chấp nhận HTTPS
  hsts: {
    maxAge: 31536000, // 1 năm
    includeSubDomains: true,
    preload: true,
  },

  // Không dùng DNS-prefetch
  dnsPrefetchControl: {
    allow: false,
  },
};
