const axios = require('axios');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { company_id } = req.query;

  if (!token) return res.status(401).json({ error: 'No token' });
  if (!company_id) return res.status(400).json({ error: 'company_id required' });

  try {
    // Usar us02 para tu región
    const response = await axios.get(
      'https://us02.api.procore.com/rest/v1.0/projects',
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Procore-Company-Id': company_id
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Projects error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
};
