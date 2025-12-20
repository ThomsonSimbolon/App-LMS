const { Category } = require('../models');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: categories } = await Category.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
      attributes: {
        include: [
          // Add course count (will be virtual for now, can optimize later)
        ]
      }
    });

    res.status(200).json({
      success: true,
      data: {
        categories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Create category (Admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Category name is required'
      });
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    // Check if slug already exists
    const existing = await Category.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      icon
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};
