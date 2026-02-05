const axios = require('axios');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    const response = await axios.get('https://api.procore.com/rest/v1.0/companies', {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Companies response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Companies error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
};
