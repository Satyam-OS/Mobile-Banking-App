import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  Bell,
  LogOut,
  Search,
  ChevronRight,
  Calendar,
  UserPlus,
  ClipboardList,
  Phone,
  MessageSquare,
  Menu,
  ArrowUpRight,
} from 'lucide-react-native';

export default function EmployeeDashboard({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const todayStats = [
    { label: 'KYC Pending', value: '12', icon: FileText, color: '#0EA5E9', bg: '#F0F9FF' },
    { label: 'Appointments', value: '8', icon: Calendar, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Completed', value: '23', icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Escalations', value: '2', icon: Clock, color: '#F43F5E', bg: '#FFF1F2' },
  ];

  const pendingTasks = [
    { type: 'kyc', customer: 'Amit Kumar', task: 'Video KYC Verification', time: '10:30 AM', priority: 'high' },
    { type: 'account', customer: 'Sneha Gupta', task: 'Account Activation', time: '11:00 AM', priority: 'medium' },
    { type: 'support', customer: 'Hritik Pandit', task: 'Document Re-verification', time: '11:30 AM', priority: 'low' },
    { type: 'call', customer: 'Meera Sharma', task: 'Callback Request', time: '12:00 PM', priority: 'medium' },
  ];

  const quickActions = [
    { icon: UserPlus, label: 'New KYC', color: '#38BDF8' },
    { icon: ClipboardList, label: 'Tasks', color: '#002D72' },
    { icon: Phone, label: 'Callbacks', color: '#0EA5E9' },
    { icon: MessageSquare, label: 'Support', color: '#0284C7' },
  ];

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: '#FFE4E6', text: '#BE123C' };
      case 'medium': return { bg: '#E0F2FE', text: '#0369A1' };
      case 'low': return { bg: '#D1FAE5', text: '#047857' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header - Navy & Sky Blue Professional Theme */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <TouchableOpacity style={styles.menuBtn}>
                <Menu size={24} color="#FFF" />
              </TouchableOpacity>
              <View>
                <Text style={styles.roleLabel}>NEXUS EMPLOYEE</Text>
                <Text style={styles.userName}>Hritik Pandit</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Bell size={20} color="#FFF" />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => navigation.navigate('Login')}
              >
                <LogOut size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search customer by name or ID..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.content}>
          {/* Today's Stats Grid */}
          <View style={styles.statsGrid}>
            {todayStats.map((stat, idx) => (
              <View key={idx} style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: stat.bg }]}>
                  <stat.icon size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Core Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CORE ACTIONS</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, idx) => (
                <TouchableOpacity key={idx} style={styles.actionItem}>
                  <View style={[styles.actionIconBox, { backgroundColor: action.color }]}>
                    <action.icon size={24} color="#FFF" />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Daily Productivity Card */}
          <View style={styles.productivityCard}>
            <Text style={styles.cardHeader}>DAILY PRODUCTIVITY</Text>
            <View style={styles.productivityRow}>
              <View style={styles.prodItem}>
                <View style={styles.prodValueRow}>
                  <ArrowUpRight size={16} color="#10B981" />
                  <Text style={[styles.prodValue, { color: '#10B981' }]}>23</Text>
                </View>
                <Text style={styles.prodLabel}>RESOLVED</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.prodItem}>
                <View style={styles.prodValueRow}>
                  <Clock size={16} color="#0EA5E9" />
                  <Text style={[styles.prodValue, { color: '#0EA5E9' }]}>12</Text>
                </View>
                <Text style={styles.prodLabel}>QUEUE</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.prodItem}>
                <View style={styles.prodValueRow}>
                  <Users size={16} color="#002D72" />
                  <Text style={[styles.prodValue, { color: '#002D72' }]}>35</Text>
                </View>
                <Text style={styles.prodLabel}>TOTAL</Text>
              </View>
            </View>
          </View>

          {/* Pending Queue */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>PENDING QUEUE</Text>
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>VIEW ALL</Text>
                <ChevronRight size={14} color="#0EA5E9" />
              </TouchableOpacity>
            </View>
            <View style={styles.queueList}>
              {pendingTasks.map((task, idx) => {
                const priority = getPriorityStyles(task.priority);
                return (
                  <TouchableOpacity key={idx} style={styles.taskCard}>
                    <View style={styles.taskIconBox}>
                      <Users size={20} color="#0EA5E9" />
                    </View>
                    <View style={styles.taskInfo}>
                      <View style={styles.taskHeader}>
                        <Text style={styles.customerName}>{task.customer}</Text>
                        <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
                          <Text style={[styles.priorityText, { color: priority.text }]}>{task.priority}</Text>
                        </View>
                      </View>
                      <Text style={styles.taskName}>{task.task}</Text>
                      <View style={styles.timeTag}>
                        <Clock size={12} color="#94A3B8" />
                        <Text style={styles.timeText}>{task.time}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Featured Appointment Card */}
          <View style={styles.appointmentCard}>
            <View style={styles.apptIconBox}>
              <Calendar size={24} color="#FFF" />
            </View>
            <View style={styles.apptInfo}>
              <Text style={styles.apptTag}>UP NEXT</Text>
              <Text style={styles.apptCustomer}>Amit Kumar</Text>
              <Text style={styles.apptTask}>VIDEO KYC SESSION</Text>
            </View>
            <View style={styles.apptTimeBox}>
              <Text style={styles.apptTimeLarge}>10:30</Text>
              <Text style={styles.apptTimeSmall}>AM</Text>
            </View>
          </View>

        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#002D72' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#002D72',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12 },
  roleLabel: { color: 'rgba(56, 189, 248, 0.8)', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  userName: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12 },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#38BDF8', borderWidth: 2, borderColor: '#002D72' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, height: 56, paddingHorizontal: 16, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600', color: '#002D72' },
  content: { paddingHorizontal: 24, marginTop: -25 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 12, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  statIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#002D72' },
  statLabel: { fontSize: 8, fontWeight: '900', color: '#94A3B8', textAlign: 'center', textTransform: 'uppercase' },
  section: { marginTop: 32 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#002D72', letterSpacing: 2, marginBottom: 16 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  actionItem: { alignItems: 'center', width: '22%' },
  actionIconBox: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 4, shadowOpacity: 0.1 },
  actionLabel: { fontSize: 10, fontWeight: '900', color: '#64748B', textAlign: 'center' },
  productivityCard: { backgroundColor: '#FFF', borderRadius: 28, padding: 20, marginTop: 32, elevation: 2 },
  cardHeader: { fontSize: 10, fontWeight: '900', color: '#002D72', letterSpacing: 1.5, marginBottom: 16 },
  productivityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prodItem: { alignItems: 'center', flex: 1 },
  prodValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  prodValue: { fontSize: 22, fontWeight: '900' },
  prodLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
  divider: { width: 1, height: 32, backgroundColor: '#F1F5F9' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { fontSize: 10, fontWeight: '900', color: '#0EA5E9' },
  queueList: { gap: 12 },
  taskCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 24, elevation: 2 },
  taskIconBox: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  taskInfo: { flex: 1 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  customerName: { fontSize: 14, fontWeight: '900', color: '#002D72' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  priorityText: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
  taskName: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  timeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  timeText: { fontSize: 10, fontWeight: '900', color: '#94A3B8' },
  appointmentCard: { flexDirection: 'row', backgroundColor: '#38BDF8', borderRadius: 32, padding: 20, marginTop: 32, alignItems: 'center', elevation: 10, shadowColor: '#38BDF8', shadowOpacity: 0.3 },
  apptIconBox: { width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  apptInfo: { flex: 1 },
  apptTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  apptCustomer: { fontSize: 16, fontWeight: '900', color: '#FFF' },
  apptTask: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  apptTimeBox: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 16, alignItems: 'center', minWidth: 60 },
  apptTimeLarge: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  apptTimeSmall: { fontSize: 8, fontWeight: '900', color: 'rgba(255,255,255,0.7)' },
});