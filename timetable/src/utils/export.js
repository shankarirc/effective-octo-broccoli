import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DAYS, TIME_SLOTS, IS_SCHOOL_DAY, SCHOOL_START, SCHOOL_END, getCellBlock, BLOCK_TYPES } from '../data/schedule';
import { getCellData } from './storage';

// Simple CSV export (opens in Excel/Sheets perfectly)
export async function exportWeekToCSV(week, timetableData, weekLabel) {
  const lines = [];

  // Header
  lines.push(`Anora's Timetable - ${weekLabel}`);
  lines.push('');

  // Day headers
  const header = ['Time', ...DAYS].map(d => `"${d}"`).join(',');
  lines.push(header);

  // Data rows — skip merged school rows (only show first)
  for (let si = 0; si < TIME_SLOTS.length; si++) {
    const row = [`"${TIME_SLOTS[si].time}"`];
    let skipRow = false;

    for (let di = 0; di < 7; di++) {
      const block = getCellBlock(di, si);
      const isSchoolDay = IS_SCHOOL_DAY[di];

      // Skip interior school rows in output
      if (isSchoolDay && block.type === BLOCK_TYPES.SCHOOL && si > SCHOOL_START && si <= SCHOOL_END) {
        if (di === 0) skipRow = true;
        row.push('""');
        continue;
      }

      if (block.type === BLOCK_TYPES.HW) {
        const cd = getCellData(timetableData, week, di, si);
        const subj = cd.subject || '';
        const done = cd.done ? '[DONE] ' : '';
        row.push(`"${done}${subj}"`);
      } else {
        row.push(`"${block.label.replace(/\n/g, ' ')}"`);
      }
    }

    if (!skipRow) lines.push(row.join(','));
  }

  const csv = lines.join('\n');
  const filename = `Anora_Week${week}_Timetable.csv`;
  const path = FileSystem.documentDirectory + filename;

  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, {
      mimeType: 'text/csv',
      dialogTitle: `Share Anora's Week ${week} Timetable`,
      UTI: 'public.comma-separated-values-text',
    });
  }
}
