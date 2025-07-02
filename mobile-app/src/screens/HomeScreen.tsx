import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
  const [newPost, setNewPost] = useState('');
  const [posts] = useState([
    {
      id: 1,
      author: 'TechnoMaster',
      content: 'Just dropped a new underground set at Warehouse 23! The crowd was absolutely insane 🔥',
      timestamp: '2h ago',
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      author: 'DeepHouseDJ',
      content: 'Looking for collaboration opportunities in Bangalore. Any producers working on minimal techno?',
      timestamp: '4h ago',
      likes: 12,
      comments: 15,
    },
    {
      id: 3,
      author: 'BasslineKing',
      content: 'New track preview: https://soundcloud.com/basslineking/underground-vibes-preview',
      timestamp: '6h ago',
      likes: 36,
      comments: 22,
    },
  ]);

  const { colors } = useTheme();
  const { user } = useAuth();

  const handleCreatePost = () => {
    if (!newPost.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }
    Alert.alert('Success', 'Post created! (Demo mode)');
    setNewPost('');
  };

  const PostCard = ({ post }: any) => (
    <View style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.postHeader}>
        <Text style={[styles.authorName, { color: colors.text }]}>{post.author}</Text>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{post.timestamp}</Text>
      </View>
      <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={[styles.welcomeSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Welcome back, {user?.stageName || 'Artist'}!
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Connect with India's underground music community
          </Text>
        </View>

        {/* Create Post Section */}
        <View style={[styles.createPostSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Share with the community</Text>
          <TextInput
            style={[styles.postInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="What's happening in the underground scene?"
            placeholderTextColor={colors.textSecondary}
            value={newPost}
            onChangeText={setNewPost}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={[styles.postButton, { backgroundColor: colors.primary }]}
            onPress={handleCreatePost}
          >
            <Text style={styles.postButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="people" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>2.4K</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Members</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Upcoming Gigs</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="musical-notes" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>847</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tracks Shared</Text>
          </View>
        </View>

        {/* Recent Posts */}
        <View style={styles.postsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Feed</Text>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
  },
  createPostSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  postInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  postsSection: {
    marginBottom: 20,
  },
  postCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
  },
});