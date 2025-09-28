import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react-native';
import { useInventory } from '../../contexts/inventory-context';
import { useAuth } from '../../contexts/auth-context';
import { Product, Category, Supplier } from '../../types/inventory';
import Card from '../../components/ui/Card';

export default function InventoryScreen() {
  const { products, categories, suppliers, addProduct, deleteProduct, updateProduct } = useInventory();
  const { hasPermission } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [productName, setProductName] = useState('');
  const [productSku, setProductSku] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productSupplier, setProductSupplier] = useState('');

  const resetForm = () => {
    setProductName('');
    setProductSku('');
    setProductQuantity('');
    setProductPrice('');
    setProductCategory('');
    setProductSupplier('');
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'Unknown';
  const getSupplierName = (supplierId: string) => suppliers.find(s => s.id === supplierId)?.name || 'Unknown';

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) return { status: 'Out of Stock', color: '#ef4444', bgColor: '#fef2f2' };
    if (product.quantity <= product.minQuantity) return { status: 'Low Stock', color: '#f59e0b', bgColor: '#fffbeb' };
    return { status: 'In Stock', color: '#10b981', bgColor: '#ecfdf5' };
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
  if (!hasPermission('admin')) {
    Alert.alert('Permission Denied', 'Only admins can delete products');
    return;
  }

  Alert.alert(
    'Delete Product',
    `Are you sure you want to delete "${productName}"?`,
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteProduct(productId);
            Alert.alert('Deleted', `"${productName}" has been deleted successfully`);
          } catch (error) {
            console.error('Error deleting product:', error);
            Alert.alert('Error', 'Failed to delete the product. Please try again.');
          }
        } 
      },
    ]
  );
};


  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductSku(product.sku);
    setProductQuantity(product.quantity.toString());
    setProductPrice(product.price.toString());
    setProductCategory(product.categoryId);
    setProductSupplier(product.supplierId);
    setShowAddForm(true);
  };

  const handleSaveProduct = async () => {
    if (!productName || !productSku || !productQuantity || !productPrice || !productCategory || !productSupplier) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        ...editingProduct,
        name: productName,
        sku: productSku,
        quantity: parseInt(productQuantity, 10),
        price: parseFloat(productPrice),
        categoryId: productCategory,
        supplierId: productSupplier,
      });
      Alert.alert('Success', 'Product updated successfully');
    } else {
      await addProduct({
        name: productName,
        sku: productSku,
        quantity: parseInt(productQuantity, 10),
        price: parseFloat(productPrice),
        categoryId: productCategory,
        supplierId: productSupplier,
        description: '',
        minQuantity: 1,
        cost: 0,
      });
      Alert.alert('Success', 'Product added successfully');
    }

    resetForm();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Management</Text>
        <Text style={styles.subtitle}>{products.length} products in stock</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>
        {hasPermission('admin') && (
          <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setShowAddForm(true); }}>
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {showAddForm && (
        <Card style={{ marginHorizontal: 20, marginBottom: 16, padding: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Text>

          <TextInput placeholder="Product Name" style={styles.input} value={productName} onChangeText={setProductName} />
          <TextInput placeholder="SKU" style={styles.input} value={productSku} onChangeText={setProductSku} />
          <TextInput placeholder="Quantity" style={styles.input} value={productQuantity} onChangeText={setProductQuantity} keyboardType="numeric" />
          <TextInput placeholder="Price" style={styles.input} value={productPrice} onChangeText={setProductPrice} keyboardType="numeric" />

          <Text style={{ marginBottom: 4 }}>Category:</Text>
          <View style={styles.pickerContainer}>
            {categories.map(c => (
              <TouchableOpacity key={c.id} style={productCategory === c.id ? styles.selectedItem : styles.item} onPress={() => setProductCategory(c.id)}>
                <Text>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ marginBottom: 4 }}>Supplier:</Text>
          <View style={styles.pickerContainer}>
            {suppliers.map(s => (
              <TouchableOpacity key={s.id} style={productSupplier === s.id ? styles.selectedItem : styles.item} onPress={() => setProductSupplier(s.id)}>
                <Text>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSaveProduct}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{editingProduct ? 'Save Changes' : 'Add Product'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
            <Text style={{ color: '#64748b' }}>Cancel</Text>
          </TouchableOpacity>
        </Card>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredProducts.map(product => {
          const stockStatus = getStockStatus(product);

          return (
            <Card key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productSku}>SKU: {product.sku}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: stockStatus.bgColor }]}>
                  <Text style={[styles.statusText, { color: stockStatus.color }]}>{stockStatus.status}</Text>
                </View>
              </View>

              <View style={styles.productDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text>
                  <Text style={styles.detailValue}>{getCategoryName(product.categoryId)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Supplier:</Text>
                  <Text style={styles.detailValue}>{getSupplierName(product.supplierId)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={[styles.detailValue, { color: stockStatus.color }]}>{product.quantity} units</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValue}>${product.price.toFixed(2)}</Text>
                </View>
              </View>

              {product.quantity <= product.minQuantity && (
                <View style={styles.warningContainer}>
                  <AlertTriangle size={16} color="#f59e0b" />
                  <Text style={styles.warningText}>Stock is below minimum level ({product.minQuantity} units)</Text>
                </View>
              )}

            {hasPermission('admin') && (
  <View style={styles.actionButtons}>
    <TouchableOpacity
      style={styles.editButton}
      onPress={() => handleEditProduct(product)}
    >
      <Edit size={16} color="#2563eb" />
      <Text style={styles.editButtonText}>Edit</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleDeleteProduct(product.id, product.name)}
    >
      <Trash2 size={16} color="#ef4444" />
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  </View>
)}

            </Card>
          );
        })}

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No products found matching your search' : 'No products in inventory'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1e293b' },
  addButton: { backgroundColor: '#2563eb', borderRadius: 12, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  productCard: { marginBottom: 16, marginHorizontal: 20, padding: 16 },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  productInfo: { flex: 1 },
  productName: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  productSku: { fontSize: 14, color: '#64748b' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  productDetails: { gap: 8, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#1e293b', fontWeight: '600' },
  warningContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', padding: 12, borderRadius: 8, marginBottom: 16 },
  warningText: { fontSize: 12, color: '#92400e', marginLeft: 8, flex: 1 },
  actionButtons: { flexDirection: 'row', gap: 12 },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: 'center' },
  editButtonText: { fontSize: 14, color: '#2563eb', fontWeight: '600', marginLeft: 6 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: 'center' },
  deleteButtonText: { fontSize: 14, color: '#ef4444', fontWeight: '600', marginLeft: 6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 16, color: '#64748b', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, marginBottom: 10 },
  submitButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  cancelButton: { padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#64748b', marginBottom: 8 },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  item: { padding: 8, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 },
  selectedItem: { padding: 8, borderWidth: 1, borderColor: '#2563eb', backgroundColor: '#eff6ff', borderRadius: 8 },
});
