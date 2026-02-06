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

    // Crear los datos como form-urlencoded
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', redirectUri);

    const tokenResponse = await axios.post(
      'https://login.procore.com/oauth/token',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token } = tokenResponse.data;
    res.redirect(`/?token=${access_token}`);

  } catch (error) {
    console.error('OAuth Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Authentication failed', details: error.response?.data });
  }
};


