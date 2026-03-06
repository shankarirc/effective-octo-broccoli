// ─────────────────────────────────────────────────────────────────────────────
// Anora's Timetable – schedule definition
// ─────────────────────────────────────────────────────────────────────────────

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const IS_SCHOOL_DAY = [true, true, true, true, true, false, false];

export const SUBJECTS = [
  'Math',
  'English',
  'Biology',
  'Spanish',
  'Social Studies',
  'Other',
];

export const SUBJECT_COLORS = {
  'Math':          { bg: '#FFE0B2', text: '#E65100', border: '#FFB74D' },
  'English':       { bg: '#E8F5E9', text: '#2E7D32', border: '#81C784' },
  'Biology':       { bg: '#E3F2FD', text: '#1565C0', border: '#64B5F6' },
  'Spanish':       { bg: '#FCE4EC', text: '#880E4F', border: '#F48FB1' },
  'Social Studies':{ bg: '#FFF9C4', text: '#F57F17', border: '#FFF176' },
  'Other':         { bg: '#F3E5F5', text: '#6A1B9A', border: '#CE93D8' },
  '':              { bg: '#FFFFFF', text: '#999999', border: '#E0E0E0' },
};

// Block types
export const BLOCK_TYPES = {
  SCHOOL:    'school',
  HW:        'hw',        // editable homework block
  COLLEGE:   'college',
  GUITAR:    'guitar',
  SWIM:      'swim',
  MORNING:   'morning',
  SLEEP:     'sleep',
  FREE:      'free',
  ARRIVE:    'arrive',
};

export const BLOCK_COLORS = {
  school:   { bg: '#BBDEFB', text: '#0D47A1', border: '#90CAF9', label: '🏫 School'   },
  hw:       { bg: '#FFFFFF', text: '#333333', border: '#CE93D8', label: '📚 Homework'  },
  college:  { bg: '#FFF9C4', text: '#795548', border: '#FFF176', label: '🎓 College Crest' },
  guitar:   { bg: '#C8E6C9', text: '#1B5E20', border: '#A5D6A7', label: '🎸 Guitar'   },
  swim:     { bg: '#E1F5FE', text: '#01579B', border: '#81D4FA', label: '🏊 Swimming'  },
  morning:  { bg: '#FFF8E1', text: '#795548', border: '#FFE082', label: '☀️ Morning'   },
  sleep:    { bg: '#EDE7F6', text: '#4527A0', border: '#B39DDB', label: '😴 Sleep'     },
  free:     { bg: '#F5F5F5', text: '#757575', border: '#E0E0E0', label: '⭐ Free'      },
  arrive:   { bg: '#FFF3E0', text: '#E65100', border: '#FFCC80', label: '🏠 Home'      },
};

// ── Time slots ────────────────────────────────────────────────────────────────
// tag: used to determine what goes in each cell per day
export const TIME_SLOTS = [
  { time: '6:00 AM',  tag: 'morning' },
  { time: '6:30 AM',  tag: 'morning' },
  { time: '7:00 AM',  tag: 'morning' },
  { time: '7:30 AM',  tag: 'morning' },
  { time: '8:00 AM',  tag: 'school'  },  // school block starts here
  { time: '9:00 AM',  tag: 'school'  },
  { time: '10:00 AM', tag: 'school'  },
  { time: '11:00 AM', tag: 'school'  },
  { time: '12:00 PM', tag: 'school'  },
  { time: '1:00 PM',  tag: 'school'  },
  { time: '2:00 PM',  tag: 'school'  },  // school block ends here
  { time: '3:00 PM',  tag: 'arrive'  },
  { time: '3:30 PM',  tag: 'hw'      },
  { time: '4:00 PM',  tag: 'hw'      },
  { time: '4:30 PM',  tag: 'hw'      },
  { time: '5:00 PM',  tag: 'hw'      },
  { time: '5:30 PM',  tag: 'hw'      },
  { time: '6:00 PM',  tag: 'hw'      },
  { time: '6:30 PM',  tag: 'hw'      },
  { time: '7:00 PM',  tag: 'evening' },
  { time: '7:30 PM',  tag: 'evening' },
  { time: '8:00 PM',  tag: 'evening' },
  { time: '8:30 PM',  tag: 'evening' },
  { time: '9:00 PM',  tag: 'sleep'   },
  { time: '9:30 PM',  tag: 'sleep'   },
];

export const SCHOOL_START = 4;  // index of 8:00 AM
export const SCHOOL_END   = 10; // index of 2:00 PM

// ── Fixed blocks: keyed by "dayIndex-timeSlotIndex" ──────────────────────────
// dayIndex: 0=Mon … 6=Sun
// Overrides what goes in a cell
export const FIXED_BLOCKS = {
  // Thursday College Crest 7:30 PM (day 3, slot index 20)
  '3-20': { type: BLOCK_TYPES.COLLEGE, label: 'College Crest Program' },
  // Friday Guitar 7:30 PM (day 4, slot 20)
  '4-20': { type: BLOCK_TYPES.GUITAR, label: 'Guitar Class' },
  // Saturday Guitar 7:30 PM (day 5, slot 20)
  '5-20': { type: BLOCK_TYPES.GUITAR, label: 'Guitar Class' },
  // Saturday Swimming (afternoon hw slots 14-18 + evening)
  '5-14': { type: BLOCK_TYPES.SWIM, label: 'Swimming' },
  '5-15': { type: BLOCK_TYPES.SWIM, label: 'Swimming' },
  '5-16': { type: BLOCK_TYPES.SWIM, label: 'Swimming' },
  // Sunday Swimming
  '6-14': { type: BLOCK_TYPES.SWIM, label: 'Swimming' },
  '6-15': { type: BLOCK_TYPES.SWIM, label: 'Swimming' },
  '6-16': { type: BLOCK_TYPES.SWIM, label: 'Swimming' },
};

// ── Derive what block goes in a given cell ────────────────────────────────────
export function getCellBlock(dayIndex, slotIndex) {
  const slot = TIME_SLOTS[slotIndex];
  const isSchoolDay = IS_SCHOOL_DAY[dayIndex];
  const isWeekend = dayIndex >= 5;

  // Fixed override first
  const key = `${dayIndex}-${slotIndex}`;
  if (FIXED_BLOCKS[key]) return FIXED_BLOCKS[key];

  // School block (merge school hours into one)
  if (isSchoolDay && slotIndex >= SCHOOL_START && slotIndex <= SCHOOL_END) {
    return { type: BLOCK_TYPES.SCHOOL, label: 'School\n8:00 AM – 3:00 PM' };
  }

  if (slot.tag === 'arrive' && isSchoolDay) {
    return { type: BLOCK_TYPES.ARRIVE, label: 'Arrive Home / Snack' };
  }

  if (slot.tag === 'hw' && !isWeekend) {
    return { type: BLOCK_TYPES.HW, label: '' }; // editable
  }

  if (slot.tag === 'morning') {
    return {
      type: BLOCK_TYPES.MORNING,
      label: slotIndex <= 1 ? 'Morning Routine' : 'Breakfast / Prep',
    };
  }

  if (slot.tag === 'sleep') {
    return { type: BLOCK_TYPES.SLEEP, label: '😴 Sleep' };
  }

  return { type: BLOCK_TYPES.FREE, label: isWeekend ? 'Free Day ⭐' : '' };
}
