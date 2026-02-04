const axios = require('axios');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { project_id, company_id } = req.query;
  
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const response = await axios.get(
      `https://api.procore.com/rest/v1.0/projects/${project_id}/rfis`,
      { headers: { 'Authorization': `Bearer ${token}`, 'Procore-Company-Id': company_id } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
};
