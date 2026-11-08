// Piercing uygulamaları. "jewel": önizlemede çizilecek takı (ring = halka, stud = taş/top).
// İyileşme süreleri genel ortalamalardır; stüdyonun kendi verdiği sürelerle güncellenebilir.
export const groups = [
  {
    name: 'Kulak',
    items: [
      { name: 'Lob', time: '6–8 hafta', jewel: 'stud', label: 'Lob · top' },
      { name: 'Helix', time: '6–12 ay', jewel: 'ring', label: 'Helix · halka' },
      { name: 'Tragus', time: '6–12 ay', jewel: 'stud', label: 'Tragus · top' },
      { name: 'Conch', time: '6–12 ay', jewel: 'ring', label: 'Conch · halka' },
      { name: 'Rook', time: '6–12 ay', jewel: 'ring', label: 'Rook · halka' },
    ],
  },
  {
    name: 'Yüz',
    items: [
      { name: 'Burun kanadı', time: '4–6 ay', jewel: 'stud', label: 'Burun · taş' },
      { name: 'Septum', time: '2–3 ay', jewel: 'ring', label: 'Septum · halka' },
      { name: 'Kaş', time: '2–3 ay', jewel: 'ring', label: 'Kaş · halka' },
      { name: 'Dudak', note: 'Labret', time: '2–3 ay', jewel: 'stud', label: 'Dudak · labret' },
    ],
  },
  {
    name: 'Vücut',
    items: [{ name: 'Göbek', time: '6–12 ay', jewel: 'stud', label: 'Göbek · taş' }],
  },
];
