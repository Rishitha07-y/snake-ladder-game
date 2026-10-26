// Snake & Ladder Game - Version 2.0 (2-4 players, names, tokens, move history, progress)
const SNAKES = {16:6,47:26,49:11,56:53,62:19,64:60,87:24,93:73,95:75,98:78};
const LADDERS = {2:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:99};
const COLORS = ['#e63946', '#1d7ae0', '#2a9d4a', '#f4a300'];
const ICONS = ['🐯', '🐼', '🦊', '🐸'];
const $ = id => document.getElementById(id);
const board = $('board'), svg = $('lines'), diceEl = $('dice'), statusEl = $('status');
const rollBtn = $('rollBtn'), info = $('info'), historyEl = $('history');
let names = [], pos = [], tokens = [], turn = 0, busy = false, history = [];
const wait = ms => new Promise(r => setTimeout(r, ms));

function xy(n) {
  n = Math.max(n, 1);
  const r = Math.floor((n - 1) / 10), c = r % 2 ? 9 - (n - 1) % 10 : (n - 1) % 10;
  return [c * 10 + 5, (9 - r) * 10 + 5];
}
function buildBoard() {
  for (let r = 9; r >= 0; r--) for (let c = 0; c < 10; c++) {
    const d = document.createElement('div'); d.className = 'cell';
    d.textContent = r % 2 ? r * 10 + 10 - c : r * 10 + c + 1; board.appendChild(d);
  }
  const line = (a, b, cls) => { const [x1, y1] = xy(+a), [x2, y2] = xy(+b);
    svg.insertAdjacentHTML('beforeend', `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`); };
  Object.entries(SNAKES).forEach(([a, b]) => line(a, b, 'snake'));
  Object.entries(LADDERS).forEach(([a, b]) => line(a, b, 'ladder'));
}
function place(i) {
  const [x, y] = xy(pos[i]);
  tokens[i].style.left = (x - 3 + (i % 2) * 3 - 1.5) + '%';
  tokens[i].style.top = (y - 3 + Math.floor(i / 2) * 3 - 1.5) + '%';
}
function addMove(text) {
  history.unshift(text); history = history.slice(0, 6);
  historyEl.innerHTML = history.map(h => `<li>${h}</li>`).join('');
}
function render() {
  statusEl.innerHTML = `${ICONS[turn]} <b style="color:${COLORS[turn]}">${names[turn]}</b>'s turn`;
  info.innerHTML = names.map((n, i) =>
    `<div class="p ${i === turn ? 'active' : ''}" style="color:${COLORS[i]}">${ICONS[i]} <b>${n}</b>: cell ${pos[i]}</div>`).join('');
  const lead = pos.indexOf(Math.max(...pos));
  $('leader').textContent = `Leader: ${names[lead]} (${pos[lead]}/100)`;
  $('bar').style.width = pos[lead] + '%';
}
function setupNames() {
  const n = +$('count').value;
  $('nameBox').innerHTML = Array.from({length: n}, (_, i) =>
    `<label>${ICONS[i]} Player ${i + 1} name</label><input id="n${i}" value="Player ${i + 1}" maxlength="14">`).join('');
}
function startGame() {
  const n = +$('count').value;
  names = Array.from({length: n}, (_, i) => $('n' + i).value.trim() || 'Player ' + (i + 1));
  $('setup').classList.add('hidden'); $('game').classList.remove('hidden');
  tokens.forEach(t => t.remove()); tokens = [];
  pos = names.map(() => 0); turn = 0; busy = false; history = [];
  historyEl.innerHTML = ''; diceEl.textContent = '🎲'; rollBtn.disabled = false;
  names.forEach((_, i) => { const t = document.createElement('div'); t.className = 'token';
    t.style.background = COLORS[i]; t.textContent = ICONS[i]; board.appendChild(t); tokens.push(t); place(i); });
  render();
}
async function roll() {
  if (busy) return; busy = true; rollBtn.disabled = true;
  const d = 1 + Math.floor(Math.random() * 6); diceEl.textContent = d;
  let note = `${names[turn]} rolled ${d}`;
  if (pos[turn] + d <= 100) {
    for (let k = 0; k < d; k++) { pos[turn]++; place(turn); await wait(250); }
    const dest = SNAKES[pos[turn]] || LADDERS[pos[turn]];
    if (dest) {
      const up = dest > pos[turn];
      note += up ? ` 🪜 ladder ${pos[turn]}→${dest}` : ` 🐍 snake ${pos[turn]}→${dest}`;
      await wait(400); pos[turn] = dest; place(turn); await wait(400);
    } else note += ` → cell ${pos[turn]}`;
  } else note += ' (needs exact roll to reach 100)';
  addMove(note);
  if (pos[turn] === 100) {
    render(); statusEl.textContent = `🎉 ${names[turn]} wins!`; addMove(`🏆 ${names[turn]} wins!`); return;
  }
  if (d === 6) addMove(`${names[turn]} gets another turn (rolled 6)`); else turn = (turn + 1) % names.length;
  render(); busy = false; rollBtn.disabled = false;
}
$('count').onchange = setupNames;
$('startBtn').onclick = startGame;
rollBtn.onclick = roll;
$('restartBtn').onclick = () => { $('game').classList.add('hidden'); $('setup').classList.remove('hidden'); };
buildBoard(); setupNames();
