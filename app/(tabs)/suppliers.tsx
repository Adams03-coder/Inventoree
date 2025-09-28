import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, User } from 'lucide-react-native';
import { useInventory } from '../../contexts/inventory-context';
import { useAuth } from '../../contexts/auth-context';
import Card from '../../components/ui/Card';
import { Picker } from '@react-native-picker/picker';


export default function SuppliersScreen() {
  const { suppliers, products, addSupplier, deleteSupplier } = useInventory();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form states
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierAddress, setNewSupplierAddress] = useState('');

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSupplierProductCount = (supplierId: string) => {
    return products.filter(product => product.supplierId === supplierId).length;
  };

  const handleDeleteSupplier = (supplierId: string, supplierName: string) => {
    if (!hasPermission('admin')) {
      Alert.alert('Permission Denied', 'Only admins can delete suppliers');
      return;
    }

    const productCount = getSupplierProductCount(supplierId);
    if (productCount > 0) {
      Alert.alert(
        'Cannot Delete',
        `This supplier has ${productCount} product(s) associated with it. Please reassign or remove those products first.`
      );
      return;
    }

    Alert.alert(
      'Delete Supplier',
      `Are you sure you want to delete "${supplierName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSupplier(supplierId),
        },
      ]
    );
  };

  const handleAddSupplier = async () => {
    if (!newSupplierName || !newSupplierContact || !newSupplierEmail || !newSupplierPhone || !newSupplierAddress) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    await addSupplier({
      name: newSupplierName,
      contactPerson: newSupplierContact,
      email: newSupplierEmail,
      phone: newSupplierPhone,
      address: newSupplierAddress,
    });

    setNewSupplierName('');
    setNewSupplierContact('');
    setNewSupplierEmail('');
    setNewSupplierPhone('');
    setNewSupplierAddress('');
    setShowAddForm(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suppliers</Text>
        <Text style={styles.subtitle}>{suppliers.length} suppliers registered</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search suppliers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>
        {hasPermission('admin') && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddForm(!showAddForm)}>
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {showAddForm && (
        <Card style={{ marginHorizontal: 20, marginBottom: 16, padding: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Add New Supplier</Text>

          <TextInput
            placeholder="Supplier Name"
            style={styles.input}
            value={newSupplierName}
            onChangeText={setNewSupplierName}
          />
          <TextInput
            placeholder="Contact Person"
            style={styles.input}
            value={newSupplierContact}
            onChangeText={setNewSupplierContact}
          />
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={newSupplierEmail}
            onChangeText={setNewSupplierEmail}
          />
          <TextInput
            placeholder="Phone"
            style={styles.input}
            value={newSupplierPhone}
            onChangeText={setNewSupplierPhone}
          />
          <TextInput
            placeholder="Address"
            style={styles.input}
            value={newSupplierAddress}
            onChangeText={setNewSupplierAddress}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleAddSupplier}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Supplier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddForm(false)}>
            <Text style={{ color: '#64748b' }}>Cancel</Text>
          </TouchableOpacity>
        </Card>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredSuppliers.map((supplier) => {
          const productCount = getSupplierProductCount(supplier.id);

          return (
            <Card key={supplier.id} style={styles.supplierCard}>
              <View style={styles.supplierHeader}>
                <Text style={styles.supplierName}>{supplier.name}</Text>
                <View style={styles.productCountBadge}>
                  <Text style={styles.productCountText}>
                    {productCount} product{productCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <User size={16} color="#64748b" />
                  <Text style={styles.contactText}>{supplier.contactPerson}</Text>
                </View>

                <View style={styles.contactItem}>
                  <Mail size={16} color="#64748b" />
                  <Text style={styles.contactText}>{supplier.email}</Text>
                </View>

                <View style={styles.contactItem}>
                  <Phone size={16} color="#64748b" />
                  <Text style={styles.contactText}>{supplier.phone}</Text>
                </View>

                <View style={styles.contactItem}>
                  <MapPin size={16} color="#64748b" />
                  <Text style={styles.contactText}>{supplier.address}</Text>
                </View>
              </View>

              {hasPermission('admin') && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.editButton}>
                    <Edit size={16} color="#2563eb" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSupplier(supplier.id, supplier.name)}>
                    <Trash2 size={16} color="#ef4444" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        })}

        {filteredSuppliers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No suppliers found matching your search' : 'No suppliers registered'}
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
  scrollView: { flex: 1, paddingHorizontal: 20 },
  supplierCard: { marginBottom: 16, padding: 16 },
  supplierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  supplierName: { fontSize: 18, fontWeight: '600', color: '#1e293b', flex: 1 },
  productCountBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  productCountText: { fontSize: 12, color: '#2563eb', fontWeight: '600' },
  contactInfo: { gap: 12, marginBottom: 16 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactText: { fontSize: 14, color: '#64748b', flex: 1 },
  actionButtons: { flexDirection: 'row', gap: 12 },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: 'center' },
  editButtonText: { fontSize: 14, color: '#2563eb', fontWeight: '600', marginLeft: 6 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: 'center' },
  deleteButtonText: { fontSize: 14, color: '#ef4444', fontWeight: '600', marginLeft: 6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 16, color: '#64748b', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, marginBottom: 10 },
  submitButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  cancelButton: { padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#64748b' },
});
