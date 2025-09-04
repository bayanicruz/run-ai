import { Router } from 'express';
import { generateAuthUrl, exchangeCodeForToken } from '../services/stravaService.js';

const router = Router();

router.get('/auth', (req, res) => {
  const redirectUri = `http://localhost:${process.env.PORT || 3000}/callback`;
  const authUrl = generateAuthUrl(redirectUri);
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code missing' });
  }
  
  try {
    const tokens = await exchangeCodeForToken(code);
    
    res.json({
      message: 'OAuth successful! Copy this access token to your .env file:',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Failed to exchange code for token' });
  }
});

export default router;