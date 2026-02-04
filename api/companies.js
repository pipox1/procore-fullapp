const axios = require('axios');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    const response = await axios.get('https://api.procore.com/rest/v1.0/companies', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
};
