import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function MemesScreen() {
  const [memePrompt, setMemePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [memes] = useState([
    {
      id: 1,
      title: 'When the drop hits at 3AM',
      imageUrl: 'https://via.placeholder.com/300x300/000000/FFFFFF?text=MEME+1',
      author: 'TechnoMaster',
      likes: 156,
      timestamp: '2h ago',
    },
    {
      id: 2,
      title: 'Underground vs Mainstream',
      imageUrl: 'https://via.placeholder.com/300x300/000000/FFFFFF?text=MEME+2',
      author: 'DeepHouseDJ',
      likes: 89,
      timestamp: '4h ago',
    },
    {
      id: 3,
      title: 'BPM too low vs BPM too high',
      imageUrl: 'https://via.placeholder.com/300x300/000000/FFFFFF?text=MEME+3',
      author: 'BasslineKing',
      likes: 203,
      timestamp: '6h ago',
    },
  ]);

  const { colors } = useTheme();

  const handleGenerateMeme = async () => {
    if (!memePrompt.trim()) {
      Alert.alert('Error', 'Please describe the meme you want to create');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate meme generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      Alert.alert('Success', 'Meme generated! (Demo mode)');
      setMemePrompt('');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate meme. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const MemeCard = ({ meme }: any) => (
    <View style={[styles.memeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Image source={{ uri: meme.imageUrl }} style={styles.memeImage} />
      <View style={styles.memeInfo}>
        <Text style={[styles.memeTitle, { color: colors.text }]}>{meme.title}</Text>
        <View style={styles.memeFooter}>
          <Text style={[styles.memeAuthor, { color: colors.textSecondary }]}>
            by {meme.author} • {meme.timestamp}
          </Text>
          <TouchableOpacity style={styles.likeButton}>
            <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.likeCount, { color: colors.textSecondary }]}>{meme.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        {/* Meme Generator Section */}
        <View style={[styles.generatorSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            AI Meme Generator
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Create underground music memes with AI
          </Text>
          
          <TextInput
            style={[styles.promptInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="Describe your meme idea (e.g., 'When someone asks if you like commercial EDM')"
            placeholderTextColor={colors.textSecondary}
            value={memePrompt}
            onChangeText={setMemePrompt}
            multiline
            numberOfLines={3}
          />
          
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: colors.primary }]}
            onPress={handleGenerateMeme}
            disabled={isGenerating}
          >
            <Ionicons 
              name={isGenerating ? "hourglass" : "sparkles"} 
              size={20} 
              color="#ffffff" 
            />
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Generating...' : 'Generate Meme'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Popular Templates */}
        <View style={styles.templatesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Popular Templates
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              'When the bass drops',
              'Underground vs Mainstream',
              'BPM struggles',
              'Studio life',
              'Gig preparation',
            ].map((template, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.templateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setMemePrompt(template)}
              >
                <Text style={[styles.templateText, { color: colors.text }]}>{template}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Community Memes */}
        <View style={styles.memesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Community Memes
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Latest from the underground scene
          </Text>
          
          {memes.map(meme => (
            <MemeCard key={meme.id} meme={meme} />
          ))}
        </View>

        {/* Meme Guidelines */}
        <View style={[styles.guidelinesSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.guidelinesTitle, { color: colors.text }]}>
            Community Guidelines
          </Text>
          <View style={styles.guidelinesList}>
            <Text style={[styles.guideline, { color: colors.textSecondary }]}>
              • Keep it underground music related
            </Text>
            <Text style={[styles.guideline, { color: colors.textSecondary }]}>
              • Respect fellow artists and DJs
            </Text>
            <Text style={[styles.guideline, { color: colors.textSecondary }]}>
              • No offensive or inappropriate content
            </Text>
            <Text style={[styles.guideline, { color: colors.textSecondary }]}>
              • Original content preferred
            </Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  generatorSection: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  templatesSection: {
    marginBottom: 24,
  },
  templateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  templateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  memesSection: {
    marginBottom: 24,
  },
  memeCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  memeImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#333',
  },
  memeInfo: {
    padding: 16,
  },
  memeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  memeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memeAuthor: {
    fontSize: 12,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontSize: 12,
  },
  guidelinesSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  guidelinesList: {
    gap: 8,
  },
  guideline: {
    fontSize: 14,
    lineHeight: 20,
  },
});