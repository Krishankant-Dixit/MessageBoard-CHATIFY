import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReactionMap = Record<string, string[]>; // reaction -> array of userIds

const STORAGE_PREFIX = 'chatify:reactions:'; // + messageId

async function getKey(messageId: string | number) {
  return `${STORAGE_PREFIX}${messageId}`;
}

/**
 * Load reactions for a message.
 */
export async function loadReactions(messageId: string | number): Promise<ReactionMap> {
  try {
    const key = await getKey(messageId);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw) as ReactionMap;
  } catch (err) {
    console.warn('loadReactions error', err);
    return {};
  }
}

/**
 * Save reactions map for a message.
 */
export async function saveReactions(messageId: string | number, map: ReactionMap) {
  try {
    const key = await getKey(messageId);
    await AsyncStorage.setItem(key, JSON.stringify(map));
  } catch (err) {
    console.warn('saveReactions error', err);
  }
}

/**
 * Toggle a reaction for a user. Adds the user if not present, removes if present.
 * Returns the updated ReactionMap.
 */
export async function toggleReaction(
  messageId: string | number,
  reaction: string,
  userId: string
): Promise<ReactionMap> {
  const map = await loadReactions(messageId);
  const users = map[reaction] || [];
  const idx = users.indexOf(userId);
  if (idx >= 0) {
    // remove
    users.splice(idx, 1);
  } else {
    users.push(userId);
  }
  if (users.length === 0) {
    delete map[reaction];
  } else {
    map[reaction] = users;
  }
  await saveReactions(messageId, map);
  return map;
}

/**
 * Utility: summarize map into [{reaction, count, reactedByMe}]
 */
export function summarizeReactions(map: ReactionMap, myUserId?: string) {
  return Object.entries(map).map(([reaction, users]) => ({
    reaction,
    count: users.length,
    reactedByMe: !!myUserId && users.includes(myUserId),
    users,
  }));
}