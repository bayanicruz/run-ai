import { Router } from 'express';
import { generateAuthUrl, exchangeCodeForToken } from '../service.js';
import { setStravaToken } from '../../tokenCache.js';

const router = Router();

router.get('/auth/strava', (req, res) => {
  const redirectUri = `http://localhost:${process.env.PORT || 3000}/callback/strava`;
  const authUrl = generateAuthUrl(redirectUri);
  res.redirect(authUrl);
});

router.get('/callback/strava', async (req, res) => {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code missing' });
  }
  
  try {
    const tokens = await exchangeCodeForToken(code);
    
    setStravaToken(tokens.access_token, tokens.refresh_token, tokens.expires_at);
    
    res.json({
      message: 'Strava OAuth successful! Token cached for testing.',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Failed to exchange code for token' });
  }
});

export default router;