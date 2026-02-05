const axios = require('axios');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    // Primero obtener el company_id
    const companiesRes = await axios.get(
      'https://api.procore.com/rest/v1.0/companies',
      { 
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const companyId = companiesRes.data[0].id;
    console.log('Company ID:', companyId);

    // Usar v1.0 con company_id como query parameter
    const response = await axios.get(
      `https://api.procore.com/rest/v1.0/projects?company_id=${companyId}`,
      { 
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Projects found:', response.data.length);
    res.json(response.data);
  } catch (error) {
    console.error('Error status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data));
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
};
