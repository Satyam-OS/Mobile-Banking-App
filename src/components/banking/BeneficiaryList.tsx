import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Plus, Star } from 'lucide-react-native';

interface Beneficiary {
  id: string;
  name: string;
  avatar?: string;
  isFavorite?: boolean;
}

const avatarColors = ['#A855F7', '#3B82F6', '#22C55E', '#F97316', '#EC4899', '#06B6D4', '#6366F1', '#F43F5E'];

const BeneficiaryAvatar = ({ beneficiary, onPress }: { beneficiary: Beneficiary; onPress?: () => void }) => {
  const colorIndex = beneficiary.name.length % avatarColors.length;
  const bgColor = avatarColors[colorIndex];
  const initials = beneficiary.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <TouchableOpacity onPress={onPress} style={styles.avatarItem} activeOpacity={0.7}>
      <View style={styles.relative}>
        <View style={[styles.avatarCircle, { backgroundColor: bgColor }]}>
          {beneficiary.avatar ? (
            <Image source={{ uri: beneficiary.avatar }} style={styles.image} />
          ) : (
            <Text style={styles.initialsText}>{initials}</Text>
          )}
        </View>
        {beneficiary.isFavorite && (
          <View style={styles.starBadge}>
            <Star size={10} color="#EAB308" fill="#EAB308" />
          </View>
        )}
      </View>
      <Text style={styles.nameText} numberOfLines={1}>
        {beneficiary.name.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );
};

export function BeneficiaryList({ 
  beneficiaries, 
  onBeneficiaryClick, 
  onAddNew 
}: { 
  beneficiaries: Beneficiary[]; 
  onBeneficiaryClick?: (b: Beneficiary) => void;
  onAddNew?: () => void;
}) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.listContainer}
    >
      {/* Add New Button */}
      <TouchableOpacity onPress={onAddNew} style={styles.avatarItem} activeOpacity={0.6}>
        <View style={styles.addButton}>
          <Plus size={24} color="#002D72" />
        </View>
        <Text style={[styles.nameText, { color: '#64748B' }]}>Add New</Text>
      </TouchableOpacity>

      {/* Beneficiary Avatars */}
      {beneficiaries.map((b) => (
        <BeneficiaryAvatar 
          key={b.id} 
          beneficiary={b} 
          onPress={() => onBeneficiaryClick?.(b)} 
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listContainer: { paddingVertical: 10, paddingHorizontal: 4 },
  avatarItem: { alignItems: 'center', marginRight: 20, width: 64 },
  relative: { position: 'relative' },
  avatarCircle: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: { width: 56, height: 56, borderRadius: 28 },
  initialsText: { color: 'white', fontSize: 16, fontWeight: '700' },
  starBadge: { 
    position: 'absolute', 
    top: 0, 
    right: 0, 
    backgroundColor: 'white', 
    borderRadius: 10, 
    padding: 2,
    elevation: 3 
  },
  nameText: { marginTop: 8, fontSize: 11, fontWeight: '600', color: '#002D72', textAlign: 'center' },
  addButton: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    borderWidth: 2, 
    borderColor: '#E0F2FE', 
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});