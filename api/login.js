module.exports = (req, res) => {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    
    // Here, you should normally check the credentials against a database
    // For this example, we're using hardcoded credentials
    if (username === 'admin' && password === 'password') {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};