const axios = require('axios');

module.exports = async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }
  
  try {
    const clientId = process.env.PROCORE_CLIENT_ID;
    const clientSecret = process.env.PROCORE_CLIENT_SECRET;
    const redirectUri = `https://${req.headers.host}/api/auth/callback`;
    
    const tokenResponse = await axios.post('https://login.procore.com/oauth/token', {
      grant_type: 'authorization_code',
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    });
    
    const { access_token } = tokenResponse.data;
    res.redirect(`/?token=${access_token}`);
    
  } catch (error) {
    console.error('OAuth Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
