import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function GigsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [gigs] = useState([
    {
      id: 1,
      title: 'Underground Warehouse Sessions',
      venue: 'Warehouse 23, Koramangala',
      date: '2025-01-05',
      time: '10:00 PM',
      dj: 'TechnoMaster & DeepHouseDJ',
      price: '₹800',
      genre: 'Techno',
      status: 'upcoming',
    },
    {
      id: 2,
      title: 'Minimal Monday',
      venue: 'The Box, HSR Layout',
      date: '2025-01-08',
      time: '9:00 PM',
      dj: 'MinimalKing',
      price: '₹600',
      genre: 'Minimal',
      status: 'upcoming',
    },
    {
      id: 3,
      title: 'House Music Revolution',
      venue: 'Club Infinity, MG Road',
      date: '2025-01-12',
      time: '11:00 PM',
      dj: 'HouseVibes & GrooveMaster',
      price: '₹1200',
      genre: 'House',
      status: 'upcoming',
    },
    {
      id: 4,
      title: 'New Year Techno Blast',
      venue: 'Skybar, UB City',
      date: '2024-12-31',
      time: '11:00 PM',
      dj: 'BasslineKing',
      price: '₹2000',
      genre: 'Techno',
      status: 'past',
    },
  ]);

  const { colors } = useTheme();

  const filters = [
    { key: 'all', label: 'All Events' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past Events' },
    { key: 'techno', label: 'Techno' },
    { key: 'house', label: 'House' },
  ];

  const filteredGigs = gigs.filter(gig => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'upcoming' || selectedFilter === 'past') {
      return gig.status === selectedFilter;
    }
    return gig.genre.toLowerCase() === selectedFilter;
  });

  const handleRSVP = (gigId: number) => {
    Alert.alert('RSVP', 'Event saved to your calendar! (Demo mode)');
  };

  const GigCard = ({ gig }: any) => (
    <View style={[styles.gigCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.gigHeader}>
        <Text style={[styles.gigTitle, { color: colors.text }]}>{gig.title}</Text>
        <View style={[styles.genreTag, { backgroundColor: colors.primary }]}>
          <Text style={styles.genreText}>{gig.genre}</Text>
        </View>
      </View>
      
      <View style={styles.gigDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{gig.venue}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {new Date(gig.date).toLocaleDateString()} at {gig.time}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{gig.dj}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{gig.price}</Text>
        </View>
      </View>

      {gig.status === 'upcoming' && (
        <TouchableOpacity
          style={[styles.rsvpButton, { backgroundColor: colors.primary }]}
          onPress={() => handleRSVP(gig.id)}
        >
          <Text style={styles.rsvpButtonText}>RSVP</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              {
                backgroundColor: selectedFilter === filter.key ? colors.primary : colors.surface,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              {
                color: selectedFilter === filter.key ? '#ffffff' : colors.text,
              }
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Gigs List */}
      <ScrollView style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedFilter === 'all' ? 'All Events' : 
             selectedFilter === 'upcoming' ? 'Upcoming Gigs' :
             selectedFilter === 'past' ? 'Past Events' :
             `${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Events`}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            {filteredGigs.length} events found
          </Text>
        </View>

        {filteredGigs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No events found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Try adjusting your filters or check back later
            </Text>
          </View>
        ) : (
          filteredGigs.map(gig => (
            <GigCard key={gig.id} gig={gig} />
          ))
        )}

        {/* Add Event Button */}
        <TouchableOpacity
          style={[styles.addEventButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => Alert.alert('Add Event', 'Event creation form would open here (Demo mode)')}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
          <Text style={[styles.addEventText, { color: colors.primary }]}>
            Promote Your Event
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  gigCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  gigHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gigTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  genreTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gigDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  rsvpButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rsvpButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 20,
  },
  addEventText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});