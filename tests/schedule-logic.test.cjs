const test = require('node:test');
const assert = require('node:assert/strict');
const {getWeekNumber, getDayName, getLessonState, formatLessonTitle, formatDaySummary, hasKnownValue} = require('../schedule-logic.js');
const now = (h, m) => new Date(2026, 8, 5, h, m);
const entries = [{time:'13:30-15:00'}, {time:'15:10-16:40'}];
const status = (h,m,week=1,day='СУББОТА') => getLessonState(entries,week,day,now(h,m));

test('last lesson starts at 15:10 and ends only at 16:40', () => {
  assert.equal(status(15,9).kind,'upcoming');
  assert.equal(status(15,9).remaining,1);
  assert.equal(status(15,10).kind,'live');
  assert.equal(status(15,10).remaining,90);
  assert.equal(status(16,39).kind,'live');
  assert.equal(status(16,40).kind,'finished');
});
test('before lessons, between lessons, and during the first lesson', () => {
  assert.equal(status(9,0).kind,'upcoming');
  assert.equal(status(14,0).kind,'live');
  assert.equal(status(14,0).entry.time,'13:30-15:00');
  assert.equal(status(15,0).kind,'upcoming');
  assert.equal(status(15,0).remaining,10);
});
test('another week or another day is a preview, without live progress', () => {
  assert.equal(status(15,10,2).kind,'preview');
  assert.equal(status(15,10,1,'ПОНЕДЕЛЬНИК').kind,'preview');
});
test('empty day explicitly replaces the prior lesson', () => {
  assert.deepEqual(getLessonState([],1,'ЧЕТВЕРГ',now(15,10)),{kind:'empty'});
});
test('calendar week changes on Monday, including a year boundary', () => {
  assert.equal(getWeekNumber(new Date(2026,7,31)),1);
  assert.equal(getWeekNumber(new Date(2026,8,6)),1);
  assert.equal(getDayName(new Date(2026,8,6)),'ВОСКРЕСЕНЬЕ');
  assert.equal(getWeekNumber(new Date(2026,8,7)),2);
  assert.equal(getWeekNumber(new Date(2026,8,14)),1);
  assert.equal(getWeekNumber(new Date(2026,7,30)),2);
  assert.notEqual(getWeekNumber(new Date(2026,11,28)),getWeekNumber(new Date(2027,0,4)));
});
test('summary keeps the start time once and uses Russian plurals', () => {
  const slots=Array.from({length:4},(_,i)=>({time:['09:40-11:10','11:30-13:00','13:30-15:00','15:10-16:40'][i]}));
  assert.equal(formatDaySummary(slots),'4 пары · 09:40–16:40');
  assert.equal(formatDaySummary([slots[0]]),'1 пара · 09:40–11:10');
  assert.match(formatDaySummary(Array(5).fill(slots[0])),/^5 пар /);
  assert.match(formatDaySummary(Array(11).fill(slots[0])),/^11 пар /);
  assert.equal(formatDaySummary([]),'Нет занятий');
});
test('long title is shortened without discarding its full original', () => {
  const full='Общий физический практикум (Механика, Молекулярная физика, Электричество и магнетизм, Оптика, Атомная физика) (лаб.р.)';
  assert.deepEqual(formatLessonTitle(full),{short:'Общий физический практикум',kind:'Лабораторная',expandable:true,full});
  assert.equal(formatLessonTitle('Программирование (лекц.)').kind,'Лекция');
  assert.equal(formatLessonTitle('Электричество и магнетизм (пр.)').expandable,false);
});
test('unknown departments are suppressed, valid values preserved', () => {
  for(const value of ['',null,'Не указана',' не указан ']) assert.equal(hasKnownValue(value),false);
  assert.equal(hasKnownValue('Технической физики'),true);
});

test('upcoming exams exclude historical records and include today', () => {
  const {getUpcomingExams} = require('../schedule-logic.js');
  const exams=[{date:'19.01.2026'},{date:'06.09.2026'},{date:'05.09.2026'},{date:'31.02.2026'}];
  assert.deepEqual(getUpcomingExams(exams,now(15,10)).map(item=>item.date),['05.09.2026','06.09.2026']);
});
