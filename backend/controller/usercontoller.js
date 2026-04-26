const db = require('../config/db');

const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch users' });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch user' });
  }
};

const createUser = async (req, res) => {
  const { firstname,lastname, email, subject , message} = req.body;
  if (!firstname || !lastname || !email || !subject || !message) {
    return res.status(400).json({ error: 'Firstname, lastname, email, subject, and message are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO users (firstname, lastname, email, subject, message) VALUES (?, ?, ?, ?, ?)',
      [firstname, lastname, email, subject, message]
    );
    res.status(201).json({ id: result.insertId, firstname, lastname, email, subject , message});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create user' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, subject , message } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE users SET firstname = ?, lastname = ?, email = ?, subject = ?, message = ? WHERE user_id = ?',
      [firstname, lastname , email, subject, message, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to update user' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to delete user' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
