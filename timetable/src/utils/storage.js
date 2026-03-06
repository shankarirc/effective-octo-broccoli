import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'anora_timetable_v1';

// Load all saved data
export async function loadTimetableData() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

// Save all data
export async function saveTimetableData(data) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

// Key format: "week-dayIndex-slotIndex"
export function cellKey(week, dayIndex, slotIndex) {
  return `${week}-${dayIndex}-${slotIndex}`;
}

// Update a single cell's subject
export async function updateCellSubject(data, week, dayIndex, slotIndex, subject) {
  const key = cellKey(week, dayIndex, slotIndex);
  const updated = { ...data, [key]: { ...data[key], subject } };
  await saveTimetableData(updated);
  return updated;
}

// Toggle a cell's done state
export async function toggleCellDone(data, week, dayIndex, slotIndex) {
  const key = cellKey(week, dayIndex, slotIndex);
  const current = data[key] || {};
  const updated = { ...data, [key]: { ...current, done: !current.done } };
  await saveTimetableData(updated);
  return updated;
}

// Get cell data
export function getCellData(data, week, dayIndex, slotIndex) {
  return data[cellKey(week, dayIndex, slotIndex)] || { subject: '', done: false };
}
