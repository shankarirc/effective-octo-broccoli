import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, FlatList, StatusBar,
} from 'react-native';
import {
  TIME_SLOTS, DAYS, DAY_SHORT, getCellBlock, BLOCK_TYPES, BLOCK_COLORS,
  SUBJECTS, SUBJECT_COLORS, IS_SCHOOL_DAY, SCHOOL_START, SCHOOL_END,
} from '../data/schedule';
import { loadTimetableData, updateCellSubject, toggleCellDone, getCellData } from '../utils/storage';
import { exportWeekToCSV } from '../utils/export';
import { useFocusEffect } from '@react-navigation/native';

const NUM_WEEKS = 4;
const START_DATE = new Date('2026-03-10T00:00:00');

function getWeekLabel(week) {
  const s = new Date(START_DATE);
  s.setDate(s.getDate() + (week - 1) * 7);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(s)} – ${fmt(e)}`;
}

function SubjectPicker({ visible, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>📚 Pick Subject</Text>
          <FlatList
            data={['', ...SUBJECTS]}
            keyExtractor={i => i}
            numColumns={2}
            columnWrapperStyle={{ gap: 8 }}
            renderItem={({ item }) => {
              const col = SUBJECT_COLORS[item] || SUBJECT_COLORS[''];
              return (
                <TouchableOpacity
                  style={[styles.subjectChip, { backgroundColor: col.bg, borderColor: col.border, flex: 1 }]}
                  onPress={() => onSelect(item)}
                >
                  <Text style={[styles.subjectChipText, { color: col.text }]}>
                    {item || '✕ Clear'}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function WeekScreen() {
  const [week, setWeek] = useState(1);
  const [data, setData] = useState({});
  const [pickerInfo, setPickerInfo] = useState(null); // {dayIndex, slotIndex}
  const [exporting, setExporting] = useState(false);

  useFocusEffect(useCallback(() => {
    loadTimetableData().then(setData);
  }, []));

  // Build display rows: skip interior school rows, show merged school block once per day
  const displayRows = [];
  const schoolShownPerDay = Array(7).fill(false);

  for (let si = 0; si < TIME_SLOTS.length; si++) {
    let showRow = false;
    for (let di = 0; di < 7; di++) {
      const block = getCellBlock(di, si);
      if (IS_SCHOOL_DAY[di] && block.type === BLOCK_TYPES.SCHOOL) {
        if (!schoolShownPerDay[di] && si === SCHOOL_START) {
          schoolShownPerDay[di] = true;
          showRow = true;
        }
      } else {
        showRow = true;
      }
    }
    if (showRow || si === SCHOOL_START) displayRows.push(si);
  }

  const uniqueRows = [...new Set(displayRows)];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6A0DAD" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗓 Weekly Timetable</Text>

        {/* Week selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScroll} contentContainerStyle={styles.weekScrollContent}>
          {Array.from({ length: NUM_WEEKS }, (_, i) => i + 1).map(w => (
            <TouchableOpacity key={w} onPress={() => setWeek(w)}
              style={[styles.weekChip, week === w && styles.weekChipActive]}>
              <Text style={[styles.weekChipText, week === w && styles.weekChipTextActive]}>
                Wk {w}
              </Text>
              <Text style={[styles.weekChipSub, week === w && styles.weekChipSubActive]}>
                {getWeekLabel(w).split('–')[0].trim()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.weekLabelRow}>
          <Text style={styles.weekLabel}>Week {week}  ·  {getWeekLabel(week)}</Text>
          <TouchableOpacity
            style={[styles.exportBtn, exporting && styles.exportBtnDisabled]}
            onPress={async () => {
              setExporting(true);
              await exportWeekToCSV(week, data, `Week ${week} – ${getWeekLabel(week)}`);
              setExporting(false);
            }}
            disabled={exporting}
          >
            <Text style={styles.exportBtnText}>{exporting ? '…' : '⬇ Export'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table */}
      <ScrollView style={styles.tableScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            {/* Day header row */}
            <View style={styles.tableHeaderRow}>
              <View style={[styles.timeCell, styles.tableHeaderCell]}>
                <Text style={styles.tableHeaderText}>Time</Text>
              </View>
              {DAYS.map((d, di) => (
                <View key={d} style={[styles.dayCell, styles.tableHeaderCell, di >= 5 && styles.weekendHeaderCell]}>
                  <Text style={[styles.tableHeaderText, di >= 5 && styles.weekendHeaderText]}>{d.slice(0,3)}</Text>
                  <Text style={[styles.tableHeaderDate, di >= 5 && styles.weekendHeaderText]}>
                    {(() => {
                      const s = new Date(START_DATE);
                      s.setDate(s.getDate() + (week - 1) * 7 + di);
                      return s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    })()}
                  </Text>
                </View>
              ))}
            </View>

            {/* Data rows */}
            {uniqueRows.map((si) => {
              const slot = TIME_SLOTS[si];
              return (
                <View key={si} style={styles.tableRow}>
                  <View style={styles.timeCell}>
                    <Text style={styles.timeCellText}>{slot.time}</Text>
                  </View>
                  {DAYS.map((_, di) => {
                    const block = getCellBlock(di, si);
                    const cd = getCellData(data, week, di, si);
                    const isSchoolMergeRow = IS_SCHOOL_DAY[di] && block.type === BLOCK_TYPES.SCHOOL && si > SCHOOL_START;

                    if (isSchoolMergeRow) {
                      return <View key={di} style={[styles.dayCell, { backgroundColor: '#BBDEFB', borderColor: '#90CAF9' }]} />;
                    }

                    const colors = BLOCK_COLORS[block.type] || BLOCK_COLORS.free;
                    const subCol = SUBJECT_COLORS[cd.subject || ''] || SUBJECT_COLORS[''];
                    const isHW = block.type === BLOCK_TYPES.HW;
                    const isSchoolFull = IS_SCHOOL_DAY[di] && block.type === BLOCK_TYPES.SCHOOL && si === SCHOOL_START;

                    return (
                      <TouchableOpacity
                        key={di}
                        style={[
                          styles.dayCell,
                          { backgroundColor: isHW ? (cd.done ? '#E8F5E9' : (cd.subject ? subCol.bg : '#FFF')) : colors.bg,
                            borderColor: isHW ? subCol.border : colors.border },
                          isSchoolFull && styles.schoolCell,
                          cd.done && styles.doneCell,
                        ]}
                        onPress={() => isHW && setPickerInfo({ dayIndex: di, slotIndex: si })}
                        onLongPress={() => isHW && toggleCellDone(data, week, di, si).then(setData)}
                        disabled={!isHW}
                      >
                        {isHW ? (
                          <View>
                            <Text style={[styles.hwCellText, { color: cd.subject ? subCol.text : '#CCCCCC' }]}>
                              {cd.subject || '+ subject'}
                            </Text>
                            {cd.done && <Text style={styles.doneBadge}>✓</Text>}
                          </View>
                        ) : (
                          <Text style={[styles.cellText, { color: colors.text }]} numberOfLines={isSchoolFull ? 2 : 2}>
                            {block.label}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Tap homework blocks to set subject  ·  Long-press to mark done</Text>
          <View style={styles.legendItems}>
            {Object.entries(BLOCK_COLORS).map(([key, val]) => (
              <View key={key} style={[styles.legendItem, { backgroundColor: val.bg, borderColor: val.border }]}>
                <Text style={[styles.legendItemText, { color: val.text }]}>{val.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Subject picker */}
      {pickerInfo && (
        <SubjectPicker
          visible={true}
          onSelect={async (subj) => {
            const { dayIndex, slotIndex } = pickerInfo;
            const updated = await updateCellSubject(data, week, dayIndex, slotIndex, subj);
            setData(updated);
            setPickerInfo(null);
          }}
          onClose={() => setPickerInfo(null)}
        />
      )}
    </View>
  );
}

const COL_W = 100;
const TIME_W = 68;

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#F9F0FF' },
  header:            { backgroundColor: '#6A0DAD', paddingTop: 44, paddingBottom: 10, paddingHorizontal: 16 },
  headerTitle:       { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 10 },
  weekScroll:        { maxHeight: 56 },
  weekScrollContent: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  weekChip:          { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  weekChipActive:    { backgroundColor: '#FF4081' },
  weekChipText:      { color: '#E1BEE7', fontWeight: '700', fontSize: 13 },
  weekChipTextActive:{ color: '#FFF' },
  weekChipSub:       { color: '#CE93D8', fontSize: 10 },
  weekChipSubActive: { color: '#FFB3C6' },
  weekLabelRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  weekLabel:         { color: '#E1BEE7', fontSize: 12, fontWeight: '600' },
  exportBtn:         { backgroundColor: '#FF4081', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  exportBtnDisabled: { backgroundColor: '#888' },
  exportBtnText:     { color: '#FFF', fontWeight: '800', fontSize: 13 },
  tableScroll:       { flex: 1 },
  tableHeaderRow:    { flexDirection: 'row' },
  tableHeaderCell:   { backgroundColor: '#7B1FA2', borderColor: '#9C27B0', borderWidth: 0.5 },
  weekendHeaderCell: { backgroundColor: '#4A148C' },
  tableHeaderText:   { color: '#FFF', fontWeight: '800', fontSize: 11, textAlign: 'center' },
  weekendHeaderText: { color: '#CE93D8' },
  tableHeaderDate:   { color: '#E1BEE7', fontSize: 9, textAlign: 'center' },
  timeCell:          { width: TIME_W, borderWidth: 0.5, borderColor: '#E0E0E0', backgroundColor: '#F3E5F5', justifyContent: 'center', alignItems: 'center', minHeight: 36 },
  timeCellText:      { fontSize: 10, color: '#6A1B9A', fontWeight: '700', textAlign: 'center' },
  tableRow:          { flexDirection: 'row' },
  dayCell:           { width: COL_W, borderWidth: 0.5, borderColor: '#E0E0E0', backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', minHeight: 36, padding: 4 },
  schoolCell:        { minHeight: 80 },
  doneCell:          { opacity: 0.7 },
  cellText:          { fontSize: 10, textAlign: 'center', fontWeight: '600' },
  hwCellText:        { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  doneBadge:         { fontSize: 14, textAlign: 'center', color: '#2E7D32' },
  legend:            { margin: 14, backgroundColor: '#FFF', borderRadius: 12, padding: 12, elevation: 1 },
  legendTitle:       { fontSize: 11, color: '#7B1FA2', fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  legendItems:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  legendItem:        { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  legendItemText:    { fontSize: 10, fontWeight: '700' },
  // Modal
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox:          { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalTitle:        { fontSize: 18, fontWeight: '800', color: '#4A148C', marginBottom: 14, textAlign: 'center' },
  subjectChip:       { padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1.5, alignItems: 'center' },
  subjectChipText:   { fontSize: 14, fontWeight: '700' },
  cancelBtn:         { marginTop: 4, padding: 14, backgroundColor: '#F5F5F5', borderRadius: 12 },
  cancelText:        { textAlign: 'center', fontWeight: '700', color: '#666', fontSize: 14 },
});
