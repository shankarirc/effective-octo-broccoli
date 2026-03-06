import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Modal, FlatList,
} from 'react-native';
import { TIME_SLOTS, getCellBlock, BLOCK_TYPES, BLOCK_COLORS,
         SUBJECTS, SUBJECT_COLORS, DAYS, IS_SCHOOL_DAY } from '../data/schedule';
import { loadTimetableData, updateCellSubject, toggleCellDone, getCellData } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';

const CURRENT_WEEK = 1; // default week for today view

function getWeekDay() {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;   // convert to 0=Mon
}

function SubjectPicker({ visible, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Pick a Subject</Text>
          <FlatList
            data={['', ...SUBJECTS]}
            keyExtractor={i => i}
            renderItem={({ item }) => {
              const col = SUBJECT_COLORS[item] || SUBJECT_COLORS[''];
              return (
                <TouchableOpacity
                  style={[styles.subjectItem, { backgroundColor: col.bg, borderColor: col.border }]}
                  onPress={() => onSelect(item)}
                >
                  <Text style={[styles.subjectItemText, { color: col.text }]}>
                    {item || '— Clear —'}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function TimeBlock({ slot, slotIndex, dayIndex, cellData, onSubjectPress, onToggleDone, isSchoolMerged }) {
  const block = getCellBlock(dayIndex, slotIndex);
  const colors = BLOCK_COLORS[block.type] || BLOCK_COLORS.free;
  const subjectCol = SUBJECT_COLORS[cellData?.subject || ''] || SUBJECT_COLORS[''];

  if (isSchoolMerged) return null; // skip rows inside merged school block

  const isHW = block.type === BLOCK_TYPES.HW;
  const isDone = cellData?.done;
  const subject = cellData?.subject || '';

  return (
    <View style={[styles.blockRow, isDone && styles.blockDone]}>
      <Text style={styles.blockTime}>{slot.time}</Text>
      <View style={[styles.blockCard, { backgroundColor: isDone ? '#E8F5E9' : colors.bg, borderColor: isHW ? subjectCol.border : colors.border }]}>
        {isHW ? (
          <View style={styles.hwRow}>
            <TouchableOpacity onPress={() => onToggleDone(slotIndex)} style={styles.checkbox}>
              <Text style={styles.checkboxText}>{isDone ? '✅' : '⬜'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.hwSubjectBtn} onPress={() => onSubjectPress(slotIndex)}>
              <Text style={[styles.hwSubjectText, { color: subject ? subjectCol.text : '#AAAAAA' }]}>
                {subject || 'Tap to set subject…'}
              </Text>
              {isDone && <Text style={styles.doneTag}>DONE</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.blockLabel, { color: colors.text }]}>
            {block.label}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function TodayScreen() {
  const [data, setData] = useState({});
  const [pickerSlot, setPickerSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState(getWeekDay());
  const week = CURRENT_WEEK;

  useFocusEffect(useCallback(() => {
    loadTimetableData().then(setData);
  }, []));

  const today = getWeekDay();
  const dayLabel = DAYS[selectedDay];
  const isSchool = IS_SCHOOL_DAY[selectedDay];

  // Track school merge
  let schoolMergeShown = false;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6A0DAD" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Today's Schedule</Text>
        <Text style={styles.headerSub}>{new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</Text>
      </View>

      {/* Day selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayScrollContent}>
        {DAYS.map((d, i) => (
          <TouchableOpacity key={d} onPress={() => setSelectedDay(i)}
            style={[styles.dayChip, selectedDay === i && styles.dayChipActive, i === today && styles.dayChipToday]}>
            <Text style={[styles.dayChipText, selectedDay === i && styles.dayChipTextActive]}>
              {d.slice(0,3)}
            </Text>
            {i === today && <View style={styles.todayDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Day label */}
      <View style={styles.dayHeader}>
        <Text style={styles.dayHeaderText}>{dayLabel} {selectedDay === today ? '(Today)' : ''}</Text>
        <Text style={styles.dayHeaderSub}>{isSchool ? '🏫 School Day' : '🌟 Free Day'}</Text>
      </View>

      {/* Schedule */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {TIME_SLOTS.map((slot, si) => {
          const block = getCellBlock(selectedDay, si);
          const cellData = getCellData(data, week, selectedDay, si);

          // Merge school rows
          const isSchoolDay = IS_SCHOOL_DAY[selectedDay];
          if (isSchoolDay && block.type === BLOCK_TYPES.SCHOOL) {
            if (schoolMergeShown) return null;
            schoolMergeShown = true;
            // Show as one big merged block
            return (
              <View key={si} style={styles.blockRow}>
                <Text style={styles.blockTime}>8:00 AM</Text>
                <View style={[styles.blockCard, styles.schoolBlock, { borderColor: BLOCK_COLORS.school.border }]}>
                  <Text style={styles.schoolBlockText}>🏫 School</Text>
                  <Text style={styles.schoolBlockSub}>8:00 AM – 3:00 PM</Text>
                </View>
              </View>
            );
          }

          return (
            <TimeBlock
              key={si}
              slot={slot}
              slotIndex={si}
              dayIndex={selectedDay}
              cellData={cellData}
              isSchoolMerged={false}
              onSubjectPress={(sIdx) => setPickerSlot(sIdx)}
              onToggleDone={async (sIdx) => {
                const updated = await toggleCellDone(data, week, selectedDay, sIdx);
                setData(updated);
              }}
            />
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Subject picker */}
      <SubjectPicker
        visible={pickerSlot !== null}
        onSelect={async (subj) => {
          const updated = await updateCellSubject(data, week, selectedDay, pickerSlot, subj);
          setData(updated);
          setPickerSlot(null);
        }}
        onClose={() => setPickerSlot(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F9F0FF' },
  header:          { backgroundColor: '#6A0DAD', paddingTop: 44, paddingBottom: 14, paddingHorizontal: 20 },
  headerTitle:     { color: '#FFF', fontSize: 22, fontWeight: '800' },
  headerSub:       { color: '#E1BEE7', fontSize: 13, marginTop: 2 },
  dayScroll:       { backgroundColor: '#7B1FA2', maxHeight: 60 },
  dayScrollContent:{ paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  dayChip:         { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', minWidth: 48 },
  dayChipActive:   { backgroundColor: '#FF4081' },
  dayChipToday:    { borderWidth: 2, borderColor: '#FFD740' },
  dayChipText:     { color: '#E1BEE7', fontWeight: '700', fontSize: 13 },
  dayChipTextActive:{ color: '#FFF' },
  todayDot:        { width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFD740', marginTop: 2 },
  dayHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F3E5F5', borderBottomWidth: 1, borderBottomColor: '#E1BEE7' },
  dayHeaderText:   { fontSize: 16, fontWeight: '800', color: '#4A148C' },
  dayHeaderSub:    { fontSize: 12, color: '#7B1FA2', fontWeight: '600' },
  scroll:          { flex: 1 },
  scrollContent:   { paddingHorizontal: 14, paddingTop: 10 },
  blockRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  blockDone:       { opacity: 0.75 },
  blockTime:       { width: 68, fontSize: 11, color: '#7B1FA2', fontWeight: '700', textAlign: 'right', paddingRight: 10 },
  blockCard:       { flex: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5, minHeight: 40, justifyContent: 'center' },
  blockLabel:      { fontSize: 13, fontWeight: '600' },
  schoolBlock:     { paddingVertical: 16, backgroundColor: '#BBDEFB' },
  schoolBlockText: { fontSize: 16, fontWeight: '800', color: '#0D47A1', textAlign: 'center' },
  schoolBlockSub:  { fontSize: 12, color: '#1565C0', textAlign: 'center', marginTop: 2 },
  hwRow:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox:        { padding: 2 },
  checkboxText:    { fontSize: 20 },
  hwSubjectBtn:    { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hwSubjectText:   { fontSize: 13, fontWeight: '700' },
  doneTag:         { fontSize: 10, backgroundColor: '#E8F5E9', color: '#2E7D32', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, fontWeight: '800' },
  // Modal
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox:        { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalTitle:      { fontSize: 18, fontWeight: '800', color: '#4A148C', marginBottom: 14, textAlign: 'center' },
  subjectItem:     { padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1.5 },
  subjectItemText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  modalCancel:     { marginTop: 8, padding: 14, backgroundColor: '#F5F5F5', borderRadius: 10 },
  modalCancelText: { textAlign: 'center', fontWeight: '700', color: '#666', fontSize: 15 },
});
