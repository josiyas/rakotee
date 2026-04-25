const Product = require('../models/Product');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function normalizeImageRefs(productLike) {
  if (!productLike) return productLike;
  const item = typeof productLike.toObject === 'function' ? productLike.toObject() : { ...productLike };
  const mapOne = (raw) => {
    const src = (raw || '').toString().trim();
    if (!src) return src;
    if (!src.startsWith('/products/') && !src.startsWith('products/')) return src;
    const filename = path.basename(src);
    const diskPath = path.join(__dirname, '..', '..', 'images', 'products', filename);
    if (fs.existsSync(diskPath)) return `/images/products/${filename}`;
    return src;
  };

  if (Array.isArray(item.images)) item.images = item.images.map(mapOne);
  if (item.image) item.image = mapOne(item.image);
  return item;
}

function hasAdminRole(user) {
  const role = (user && user.role) || '';
  return ['admin', 'superadmin', 'editor'].includes(role);
}

// Get all products (public)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products.map(normalizeImageRefs));
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get a single product by ID (public)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(normalizeImageRefs(product));
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create a new product (admin only)
exports.createProduct = async (req, res) => {
  try {
    if (!hasAdminRole(req.user)) {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    const {
      id,
      externalId,
      name,
      description,
      price,
      image,
      images,
      colors,
      sizes,
      variants,
      stock,
      category
    } = req.body;

    const extId = Number.isFinite(Number(externalId))
      ? Number(externalId)
      : (Number.isFinite(Number(id)) ? Number(id) : undefined);

    if (Number.isFinite(extId)) {
      const updated = await Product.findOneAndUpdate(
        { externalId: extId },
        {
          externalId: extId,
          name,
          description,
          price,
          image,
          images,
          colors,
          sizes,
          variants,
          stock,
          category,
          updatedAt: new Date()
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return res.status(201).json(updated);
    }

    const product = new Product({ name, description, price, image, images, colors, sizes, variants, stock, category });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update a product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    if (!hasAdminRole(req.user)) {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const maybeId = req.params.id;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(maybeId)) {
      product = await Product.findByIdAndUpdate(maybeId, { ...req.body, updatedAt: new Date() }, { new: true });
    } else {
      const extId = Number(maybeId);
      if (Number.isFinite(extId)) {
        product = await Product.findOneAndUpdate(
          { externalId: extId },
          { ...req.body, externalId: extId, updatedAt: new Date() },
          { new: true }
        );
      }
    }

    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete a product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    if (!hasAdminRole(req.user)) {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    const maybeId = req.params.id;
    let product = null;
    if (mongoose.Types.ObjectId.isValid(maybeId)) {
      product = await Product.findByIdAndDelete(maybeId);
    } else {
      const extId = Number(maybeId);
      if (Number.isFinite(extId)) {
        product = await Product.findOneAndDelete({ externalId: extId });
      }
    }
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
