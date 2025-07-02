import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function NewsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [news] = useState([
    {
      id: 1,
      title: 'Techno Festival Season 2025: What to Expect in India',
      summary: 'Underground techno festivals are making a comeback with new venues across major Indian cities...',
      source: 'Electronic Music India',
      timestamp: '2h ago',
      category: 'festivals',
      imageUrl: 'https://via.placeholder.com/300x200/000000/FFFFFF?text=NEWS+1',
      url: 'https://example.com/news1',
    },
    {
      id: 2,
      title: 'Bangalore\'s Underground Scene: New Venues Opening',
      summary: 'Three new underground venues have opened in Koramangala and HSR Layout, promising authentic techno experiences...',
      source: 'Bangalore Beat',
      timestamp: '4h ago',
      category: 'venues',
      imageUrl: 'https://via.placeholder.com/300x200/000000/FFFFFF?text=NEWS+2',
      url: 'https://example.com/news2',
    },
    {
      id: 3,
      title: 'Rising Indian Techno Artists to Watch in 2025',
      summary: 'Meet the underground artists pushing boundaries in minimal techno and deep house from Mumbai to Chennai...',
      source: 'Underground Artists Weekly',
      timestamp: '6h ago',
      category: 'artists',
      imageUrl: 'https://via.placeholder.com/300x200/000000/FFFFFF?text=NEWS+3',
      url: 'https://example.com/news3',
    },
    {
      id: 4,
      title: 'New Music Production Studios Launch in Delhi',
      summary: 'State-of-the-art studios equipped with latest analog gear open doors to underground producers...',
      source: 'Studio News India',
      timestamp: '8h ago',
      category: 'production',
      imageUrl: 'https://via.placeholder.com/300x200/000000/FFFFFF?text=NEWS+4',
      url: 'https://example.com/news4',
    },
  ]);

  const { colors } = useTheme();

  const categories = [
    { key: 'all', label: 'All News' },
    { key: 'festivals', label: 'Festivals' },
    { key: 'venues', label: 'Venues' },
    { key: 'artists', label: 'Artists' },
    { key: 'production', label: 'Production' },
  ];

  const filteredNews = news.filter(article => {
    if (selectedCategory === 'all') return true;
    return article.category === selectedCategory;
  });

  const handleReadMore = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Could not open article');
    }
  };

  const NewsCard = ({ article }: any) => (
    <TouchableOpacity
      style={[styles.newsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleReadMore(article.url)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: article.imageUrl }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          <Text style={[styles.newsTitle, { color: colors.text }]} numberOfLines={2}>
            {article.title}
          </Text>
          <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
        </View>
        
        <Text style={[styles.newsSummary, { color: colors.textSecondary }]} numberOfLines={3}>
          {article.summary}
        </Text>
        
        <View style={styles.newsFooter}>
          <Text style={[styles.newsSource, { color: colors.textSecondary }]}>
            {article.source}
          </Text>
          <Text style={[styles.newsTimestamp, { color: colors.textSecondary }]}>
            {article.timestamp}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.filterTab,
              {
                backgroundColor: selectedCategory === category.key ? colors.primary : colors.surface,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text style={[
              styles.filterText,
              {
                color: selectedCategory === category.key ? '#ffffff' : colors.text,
              }
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Underground Music News
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Latest from India's electronic music scene
          </Text>
        </View>

        {/* Featured Article */}
        {filteredNews.length > 0 && (
          <View style={styles.featuredSection}>
            <Text style={[styles.featuredLabel, { color: colors.primary }]}>FEATURED</Text>
            <NewsCard article={filteredNews[0]} />
          </View>
        )}

        {/* Recent Articles */}
        <View style={styles.articlesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Articles
          </Text>
          {filteredNews.slice(1).map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => Alert.alert('Refresh', 'News refreshed! (Demo mode)')}
        >
          <Ionicons name="refresh" size={20} color={colors.primary} />
          <Text style={[styles.refreshText, { color: colors.primary }]}>
            Refresh News
          </Text>
        </TouchableOpacity>

        {/* News Sources */}
        <View style={[styles.sourcesSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sourcesTitle, { color: colors.text }]}>
            Our News Sources
          </Text>
          <View style={styles.sourcesList}>
            {[
              'Electronic Music India',
              'Bangalore Beat',
              'Underground Artists Weekly',
              'Studio News India',
              'Techno Times',
              'House Music Herald',
            ].map((source, index) => (
              <Text key={index} style={[styles.sourceItem, { color: colors.textSecondary }]}>
                • {source}
              </Text>
            ))}
          </View>
        </View>
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
  featuredSection: {
    marginBottom: 32,
  },
  featuredLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  articlesSection: {
    marginBottom: 24,
  },
  newsCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#333',
  },
  newsContent: {
    padding: 16,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    fontWeight: '500',
  },
  newsTimestamp: {
    fontSize: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  refreshText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sourcesSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  sourcesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sourcesList: {
    gap: 6,
  },
  sourceItem: {
    fontSize: 14,
  },
});