// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// pages/api/hello.js

export default function handler(req, res) {
  // Cross-Origin Isolation 헤더 설정
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  
  res.status(200).json({ name: 'John Doe' });
}
