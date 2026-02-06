const axios = require('axios');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    // Primero obtener las compañías con los proyectos incluidos
    const response = await axios.get(
      'https://api.procore.com/rest/v1.0/me',
      { 
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('User data:', JSON.stringify(response.data));
    
    // Obtener proyectos directamente sin company_id
    const projectsResponse = await axios.get(
      'https://api.procore.com/rest/v1.0/projects',
      { 
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        params: {
          per_page: 100
        }
      }
    );
    
    console.log('Projects found:', projectsResponse.data.length);
    res.json(projectsResponse.data);
    
  } catch (error) {
    console.error('Error status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data));
    
    // Si falla, intentar con el company_id del query
    try {
      const company_id = req.query.company_id;
      if (company_id) {
        const fallbackResponse = await axios.get(
          'https://api.procore.com/rest/v1.0/projects',
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Procore-Company-Id': String(company_id)
            }
          }
        );
        console.log('Fallback projects found:', fallbackResponse.data.length);
        return res.json(fallbackResponse.data);
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError.response?.data);
    }
    
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
};
