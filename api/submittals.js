const axios = require('axios');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { project_id, company_id } = req.query;

  if (!token) return res.status(401).json({ error: 'No token' });
  if (!project_id || !company_id) {
    return res.status(400).json({ error: 'project_id and company_id required' });
  }

  try {
    const response = await axios.get(
      `https://api.procore.com/rest/v1.0/projects/${project_id}/submittals`,
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Procore-Company-Id': String(company_id)
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Submittals error:', error.response?.data);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || error.message
    });
  }
};
