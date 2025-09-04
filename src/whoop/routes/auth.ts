import { Router } from 'express';
import { generateAuthUrl, exchangeCodeForToken } from '../service.js';
import { setWhoopToken } from '../../tokenCache.js';

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
    
    const expiresAt = tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : undefined;
    setWhoopToken(tokens.access_token, tokens.refresh_token, expiresAt);
    
    res.json({
      message: 'Whoop OAuth successful! Token cached for testing.',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Failed to exchange code for token' });
  }
});

export default router;