import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react-native';
import { useInventory } from '../../contexts/inventory-context';
import Card from '../../components/ui/Card';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { products, sales, categories, getTotalInventoryValue, getSalesAnalytics, getLowStockProducts } = useInventory();
  const [selectedPeriod] = useState(30); // last 30 days

  const salesAnalytics = getSalesAnalytics(selectedPeriod);
  const totalInventoryValue = getTotalInventoryValue();
  const lowStockProducts = getLowStockProducts();

  // Category distribution
  const categoryStats = categories.map(category => {
    const categoryProducts = products.filter(p => p.categoryId === category.id);
    const totalValue = categoryProducts.reduce((sum, p) => sum + p.quantity * p.cost, 0);
    const totalQuantity = categoryProducts.reduce((sum, p) => sum + p.quantity, 0);
    return {
      name: category.name,
      color: category.color || '#2563eb',
      productCount: categoryProducts.length,
      totalValue,
      totalQuantity,
      percentage: products.length > 0 ? (categoryProducts.length / products.length) * 100 : 0,
    };
  }).sort((a, b) => b.totalValue - a.totalValue);

  // Monthly sales trend (last 6 months)
  const monthlySales = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= monthStart && saleDate <= monthEnd;
    });

    const revenue = monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    monthlySales.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      revenue,
      salesCount: monthSales.length,
    });
  }

  const maxRevenue = Math.max(...monthlySales.map(m => m.revenue));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports & Analytics</Text>
        <Text style={styles.subtitle}>Business insights and performance metrics</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Card style={styles.metricCard}>
            <View style={styles.metricIcon}><Package size={24} color="#2563eb" /></View>
            <Text style={styles.metricValue}>{products.length}</Text>
            <Text style={styles.metricLabel}>Total Products</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={styles.metricIcon}><DollarSign size={24} color="#10b981" /></View>
            <Text style={styles.metricValue}>UGX{totalInventoryValue.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Inventory Value</Text>
          </Card>
        </View>

        <View style={styles.metricsContainer}>
          <Card style={styles.metricCard}>
            <View style={styles.metricIcon}><TrendingUp size={24} color="#8b5cf6" /></View>
            <Text style={styles.metricValue}>{salesAnalytics.totalSales}</Text>
            <Text style={styles.metricLabel}>Sales (30 days)</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={styles.metricIcon}><BarChart3 size={24} color="#f59e0b" /></View>
            <Text style={styles.metricValue}>UGX{salesAnalytics.totalRevenue.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Revenue (30 days)</Text>
          </Card>
        </View>

        {/* Sales Trend */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Sales Trend (Last 6 Months)</Text>
          <View style={styles.chart}>
            {monthlySales.map((month, index) => {
              const barHeight = maxRevenue > 0 ? (month.revenue / maxRevenue) * 120 : 0;
              return (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, { height: barHeight || 4, backgroundColor: month.revenue > 0 ? '#2563eb' : '#e2e8f0' }]} />
                  </View>
                  <Text style={styles.barLabel}>{month.month}</Text>
                  <Text style={styles.barValue}>UGX{month.revenue.toFixed(0)}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Category Distribution */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Inventory by Category</Text>
          <View style={styles.categoryList}>
            {categoryStats.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <View style={styles.categoryStats}>
                  <Text style={styles.categoryValue}>{category.productCount} products</Text>
                  <Text style={styles.categoryPercentage}>{category.percentage.toFixed(1)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card style={styles.alertCard}>
            <Text style={styles.alertTitle}>Low Stock Alert</Text>
            <Text style={styles.alertDescription}>
              {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} need restocking
            </Text>
            {lowStockProducts.slice(0, 5).map(product => (
              <View key={product.id} style={styles.lowStockItem}>
                <Text style={styles.lowStockName}>{product.name}</Text>
                <Text style={styles.lowStockQuantity}>{product.quantity} / {product.minQuantity} min</Text>
              </View>
            ))}
            {lowStockProducts.length > 5 && (
              <Text style={styles.moreItems}>+{lowStockProducts.length - 5} more items need attention</Text>
            )}
          </Card>
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
  scrollView: { flex: 1, paddingHorizontal: 20 },
  metricsContainer: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  metricCard: { flex: 1, alignItems: 'center', paddingVertical: 20 },
  metricIcon: { marginBottom: 12 },
  metricValue: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  metricLabel: { fontSize: 12, color: '#64748b', textAlign: 'center' },
  chartCard: { marginBottom: 16 },
  chartTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 20 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingHorizontal: 10 },
  chartBar: { alignItems: 'center', flex: 1 },
  barContainer: { height: 120, justifyContent: 'flex-end', marginBottom: 8 },
  bar: { width: 20, borderRadius: 2, minHeight: 4 },
  barLabel: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  barValue: { fontSize: 10, color: '#94a3b8' },
  categoryList: { gap: 16 },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  categoryColor: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  categoryName: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
  categoryStats: { alignItems: 'flex-end' },
  categoryValue: { fontSize: 14, color: '#64748b' },
  categoryPercentage: { fontSize: 12, color: '#94a3b8' },
  alertCard: { backgroundColor: '#fffbeb', borderLeftWidth: 4, borderLeftColor: '#f59e0b', marginBottom: 16, padding: 16 },
  alertTitle: { fontSize: 16, fontWeight: '600', color: '#92400e', marginBottom: 8 },
  alertDescription: { fontSize: 14, color: '#92400e', marginBottom: 16 },
  lowStockItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  lowStockName: { fontSize: 14, color: '#92400e', fontWeight: '500', flex: 1 },
  lowStockQuantity: { fontSize: 12, color: '#a16207' },
  moreItems: { fontSize: 12, color: '#a16207', fontStyle: 'italic', textAlign: 'center', marginTop: 8 },
});
