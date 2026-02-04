module.exports = (req, res) => {
  const clientId = process.env.PROCORE_CLIENT_ID;
  const redirectUri = `https://${req.headers.host}/api/auth/callback`;
  
  const authUrl = `https://login.procore.com/oauth/authorize?` +
    `client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  res.redirect(authUrl);
};
