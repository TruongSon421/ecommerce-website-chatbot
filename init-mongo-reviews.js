// MongoDB initialization script for ProductReview collection
// This script runs when MongoDB container starts

// Switch to products database
db = db.getSiblingDB('products');

// Create product_reviews collection if not exists
if (!db.getCollectionNames().includes('product_reviews')) {
    db.createCollection('product_reviews');
    print('Created product_reviews collection');
}

// Create indexes for better query performance
db.product_reviews.createIndex({ "productId": 1 });
print('Created index on productId');

db.product_reviews.createIndex({ "userId": 1 });
print('Created index on userId');

db.product_reviews.createIndex({ "userId": 1, "productId": 1, "color": 1 }, { unique: true });
print('Created unique compound index on userId, productId and color');

db.product_reviews.createIndex({ "isApproved": 1, "isVisible": 1 });
print('Created index on isApproved and isVisible');

db.product_reviews.createIndex({ "productId": 1, "isApproved": 1, "isVisible": 1 });
print('Created compound index on productId, isApproved, and isVisible');

db.product_reviews.createIndex({ "createdAt": -1 });
print('Created descending index on createdAt');

db.product_reviews.createIndex({ "rating": 1 });
print('Created index on rating');

db.product_reviews.createIndex({ "color": 1 });
print('Created index on color');

// Compound indexes for efficient queries
db.product_reviews.createIndex({ 
    "productId": 1, 
    "isApproved": 1, 
    "isVisible": 1, 
    "createdAt": -1 
});
print('Created compound index for product reviews query optimization');

db.product_reviews.createIndex({
    "productId": 1,
    "rating": 1,
    "isApproved": 1,
    "isVisible": 1
});
print('Created compound index for rating statistics');

print('MongoDB ProductReview indexes initialized successfully'); 