'use strict';

function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function isMonth(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value)) return false;
  const month = Number(value.slice(5));
  return month >= 1 && month <= 12;
}

function cleanGuestName(value) {
  if (typeof value !== 'string') return null;
  const name = value.trim().replace(/\s+/g, ' ');
  if (name.length < 1 || name.length > 80) return null;
  return name;
}

function cleanNote(value) {
  if (value == null || value === '') return '';
  if (typeof value !== 'string') return null;
  const note = value.trim();
  if (note.length > 500) return null;
  return note;
}

module.exports = { isIsoDate, isMonth, cleanGuestName, cleanNote };
