import { Router } from 'express';
import { generateAuthUrl, exchangeCodeForToken } from '../service.js';

const router = Router();

router.get('/auth/whoop', (req, res) => {
  const redirectUri = `http://localhost:${process.env.PORT || 3000}/callback/whoop`;
  const authUrl = generateAuthUrl(redirectUri);
  console.log('Redirecting to Whoop OAuth URL:', authUrl);
  res.redirect(authUrl);
});

router.get('/callback/whoop', async (req, res) => {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code missing' });
  }
  
  try {
    const tokens = await exchangeCodeForToken(code);
    
    res.json({
      message: 'Whoop OAuth successful! Copy this access token to your .env file:',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Failed to exchange code for token' });
  }
});

export default router;