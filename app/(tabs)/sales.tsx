import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ShoppingCart, Calendar, DollarSign } from 'lucide-react-native';
import { useInventory } from '../../contexts/inventory-context';
import { useAuth } from '../../contexts/auth-context';
import { Product, Sale } from '../../types/inventory';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SalesScreen() {
  const { products, sales, recordSale } = useInventory();
  const { user, hasPermission } = useAuth();
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);

  const availableProducts = products.filter((p: Product) => p.quantity > 0);

  const handleRecordSale = async () => {
    if (!selectedProduct || !quantity) {
      Alert.alert('Error', 'Please select a product and enter quantity');
      return;
    }

    const product = products.find((p: Product) => p.id === selectedProduct);
    if (!product) {
      Alert.alert('Error', 'Product not found');
      return;
    }

    const saleQuantity = parseInt(quantity);
    if (saleQuantity <= 0 || saleQuantity > product.quantity) {
      Alert.alert('Error', `Invalid quantity. Available: ${product.quantity}`);
      return;
    }

    setLoading(true);
    try {
      await recordSale({
        productId: selectedProduct,
        quantity: saleQuantity,
        unitPrice: product.price,
        totalAmount: product.price * saleQuantity,
        customerName: customerName || undefined,
        userId: user?.id || '',
      });

      setShowSaleModal(false);
      setSelectedProduct('');
      setQuantity('');
      setCustomerName('');
      Alert.alert('Success', 'Sale recorded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProductName = (productId: string) => {
    const product = products.find((p: Product) => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const todaysSales = sales.filter((sale: Sale) => {
    const saleDate = new Date(sale.createdAt);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });

  const todaysRevenue = todaysSales.reduce((total: number, sale: Sale) => total + sale.totalAmount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales Management</Text>
        <Text style={styles.subtitle}>{sales.length} total sales recorded</Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <View style={styles.statIcon}>
            <ShoppingCart size={24} color="#2563eb" />
          </View>
          <Text style={styles.statValue}>{todaysSales.length}</Text>
          <Text style={styles.statLabel}>Today's Sales</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statIcon}>
            <DollarSign size={24} color="#10b981" />
          </View>
          <Text style={styles.statValue}>${todaysRevenue.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Today's Revenue</Text>
        </Card>
      </View>

      <View style={styles.actionContainer}>
        {hasPermission('staff') && (
          <Button
            title="Record New Sale"
            onPress={() => setShowSaleModal(true)}
            style={styles.recordButton}
          />
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Recent Sales</Text>
        
        {sales.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No sales recorded yet</Text>
          </View>
        ) : (
          sales
            .sort((a: Sale, b: Sale) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((sale: Sale) => (
              <Card key={sale.id} style={styles.saleCard}>
                <View style={styles.saleHeader}>
                  <Text style={styles.productName}>{getProductName(sale.productId)}</Text>
                  <Text style={styles.saleAmount}>${sale.totalAmount.toFixed(2)}</Text>
                </View>
                
                <View style={styles.saleDetails}>
                  <Text style={styles.saleDetail}>
                    Quantity: {sale.quantity} × ${sale.unitPrice.toFixed(2)}
                  </Text>
                  {sale.customerName && (
                    <Text style={styles.saleDetail}>Customer: {sale.customerName}</Text>
                  )}
                  <Text style={styles.saleDate}>{formatDate(sale.createdAt)}</Text>
                </View>
              </Card>
            ))
        )}
      </ScrollView>

      <Modal
        visible={showSaleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSaleModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record New Sale</Text>
            <TouchableOpacity onPress={() => setShowSaleModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Select Product</Text>
            <ScrollView style={styles.productList} showsVerticalScrollIndicator={false}>
              {availableProducts.map((product: Product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.productOption,
                    selectedProduct === product.id && styles.selectedProduct,
                  ]}
                  onPress={() => setSelectedProduct(product.id)}
                >
                  <Text style={styles.productOptionName}>{product.name}</Text>
                  <Text style={styles.productOptionDetails}>
                    ${product.price.toFixed(2)} • {product.quantity} available
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Input
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Enter quantity"
            />

            <Input
              label="Customer Name (Optional)"
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Enter customer name"
            />

            {selectedProduct && quantity && (
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Sale Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Product:</Text>
                  <Text style={styles.summaryValue}>
                    {getProductName(selectedProduct)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Quantity:</Text>
                  <Text style={styles.summaryValue}>{quantity}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Unit Price:</Text>
                  <Text style={styles.summaryValue}>
                    ${products.find((p: Product) => p.id === selectedProduct)?.price.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>
                    ${((products.find((p: Product) => p.id === selectedProduct)?.price || 0) * parseInt(quantity || '0')).toFixed(2)}
                  </Text>
                </View>
              </Card>
            )}

            <Button
              title="Record Sale"
              onPress={handleRecordSale}
              loading={loading}
              disabled={!selectedProduct || !quantity}
              style={styles.recordSaleButton}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  recordButton: {
    backgroundColor: '#10b981',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  saleCard: {
    marginBottom: 12,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  saleAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  saleDetails: {
    gap: 4,
  },
  saleDetail: {
    fontSize: 14,
    color: '#64748b',
  },
  saleDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cancelButton: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  productList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  productOption: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedProduct: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  productOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  productOptionDetails: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryCard: {
    backgroundColor: '#f1f5f9',
    marginVertical: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  recordSaleButton: {
    backgroundColor: '#10b981',
    marginTop: 20,
  },
});