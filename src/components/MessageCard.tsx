import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Message } from '../contracts/MessageBoard';
import { loadReactions, toggleReaction, summarizeReactions } from '../services/reactionService';
import { useWeb3 } from '../context/Web3Context';
import { theme } from '../theme';

// Simple emoji set for quick reactions
const EMOJI_SET = ['👍', '❤️', '😂', '🔥', '🎉', '😮'];

interface Props {
  message: Message;
  onOpenReplies?: () => void;
  style?: any;
}

export const MessageCard: React.FC<Props> = ({ message, style, onOpenReplies }) => {
  const { account } = useWeb3();
  const userId = account || 'local:' + (message.sender || 'unknown'); // fallback to sender or local id
  const [reactionMap, setReactionMap] = useState<Record<string, string[]>>(message.reactions || {});
  const [summary, setSummary] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const map = await loadReactions(message.id);
      if (mounted) {
        // merge stored map with any inline message.reactions (optional)
        const merged = { ...(message.reactions || {}), ...map };
        setReactionMap(merged);
        setSummary(summarizeReactions(merged, userId));
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [message.id, message.reactions, userId]);

  const handleToggle = async (reaction: string) => {
    const updated = await toggleReaction(message.id, reaction, userId);
    setReactionMap(updated);
    setSummary(summarizeReactions(updated, userId));
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.sender}>{message.sender}</Text>
        <Text style={styles.time}>{new Date(message.timestamp * 1000).toLocaleTimeString()}</Text>
      </View>

      <Text style={styles.content}>{message.content}</Text>

      {/* Reactions summary */}
      <View style={styles.reactionsRow}>
        {summary.map((r) => (
          <TouchableOpacity
            key={r.reaction}
            style={[styles.reactionButton, r.reactedByMe && styles.reacted]}
            onPress={() => handleToggle(r.reaction)}
          >
            <Text style={styles.reactionText}>
              {r.reaction} {r.count}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Quick add buttons */}
        <View style={styles.quickAdd}>
          {EMOJI_SET.map((e) => (
            <TouchableOpacity key={e} onPress={() => handleToggle(e)} style={styles.emojiButton}>
              <Text style={styles.emoji}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    marginVertical: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  sender: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  time: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  content: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  reactionButton: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 6,
  },
  reactionText: {
    color: theme.colors.text,
  },
  reacted: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  quickAdd: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  emojiButton: {
    padding: 6,
    marginRight: 6,
  },
  emoji: {
    fontSize: 16,
  },
});