const axios = require('axios');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const company_id = req.query.company_id;

  console.log('Projects request - company_id received:', company_id);

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  if (!company_id) {
    return res.status(400).json({ error: 'company_id is required' });
  }

  try {
    // Primero obtener las compañías para conseguir el ID correcto
    const companiesResponse = await axios.get(
      'https://api.procore.com/rest/v1.0/companies',
      { 
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Companies data:', JSON.stringify(companiesResponse.data));
    
    // Usar el primer company_id de la respuesta
    const realCompanyId = companiesResponse.data[0]?.id;
    console.log('Using company ID:', realCompanyId);

    const response = await axios.get(
      'https://api.procore.com/rest/v1.0/projects',
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Procore-Company-Id': String(realCompanyId)
        }
      }
    );
    console.log('Projects found:', response.data.length);
    res.json(response.data);
  } catch (error) {
    console.error('Projects error status:', error.response?.status);
    console.error('Projects error data:', JSON.stringify(error.response?.data));
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
};
