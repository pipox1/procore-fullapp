const axios = require('axios');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    // Obtener la lista de compañías primero
    const companiesRes = await axios.get(
      'https://api.procore.com/rest/v1.0/companies',
      { 
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // El ID real está en la respuesta - necesitamos el ID largo
    const company = companiesRes.data[0];
    console.log('Company full data:', JSON.stringify(company));
    
    // Probar con el ID de la compañía
    const companyId = company.id;
    console.log('Using company_id:', companyId);

    const response = await axios.get(
      `https://api.procore.com/rest/v1.1/companies/${companyId}/projects`,
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
