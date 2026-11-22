// Google İşletme Profili'ndeki gerçek yorumlar. Sadece Google'da gerçekten yazılmış yorumları ekle;
// metni olduğu gibi kopyala, kendimiz yazmıyoruz ve değiştirmiyoruz.
// Liste boşken ana sayfadaki "Yorumlar" bölümü hiç gösterilmez.
//
// Örnek kayıt:
//   { name: 'Ayşe K.', text: 'Yorumun tam metni...', date: 'Ekim 2026' },
//
// name: Google'da görünen ad (istersen soyadı baş harfiyle kısalt)
// date: isteğe bağlı, "Ay Yıl" biçiminde
export const reviews = [
  {
    name: 'Emirhan Varol',
    text: 'Karadeniz bölgesindeki en iyi dövmecilerden biri. Müthiş bir titizlik ve profesyonellikle işini en ince ayrıntısına kadar özenle yapan genç bir dövme sanatçısı. Çok da tecrübeli. Şiddetle tavsiye ederim.',
  },
  {
    name: 'Yusuf can Parlak',
    text: 'Uzun zamandır dövmelerimi ve piercinglerimi inkfade de yaptırıyorum yapılan işlemlerden çok ama çok memnunum herkezde gerçekten rahatlıkla tavsiye ederim',
  },
  {
    name: 'Ruveyda Kabalar',
    text: 'Ellerinize sağlık! Yazı çok zarif ve ince işlenmiş. Çizgiler temiz, konumu da çok estetik duruyor. Sonuçtan çok memnun kaldım, kesinlikle tavsiye ederim!',
  },
  {
    name: 'sudem',
    text: 'Stüdyo gerçekten çok şık ve temiz, gönül rahatlığıyla gelip dövmelerinizi ve piercinglerinizi yaptırabilirsiniz. Ulaş Bey de tasarım ve sanatçılığıyla 1 numara. Başarılarınızın devamını dileriz ve emekleriniz için de teşekkür ederiz.',
  },
  {
    name: 'Rana Kirpitci',
    text: 'Tüm piercinglerimi burada yaptırıyorum asla acı hissetmiyorum. İlgileri de çok iyi. Dövme konusunda da çok iyiler. Tüm arkadaslarimi buraya öneriyorum…',
  },
  {
    name: 'Ozcan Korkmaz',
    text: 'Hijyen ve müşterilere olan tutumu harika, gönül rahatlığı ile işlem yaptırabilirsiniz.',
  },
];


/** "Tüm yorumları Google'da gör" bağlantısı: Google aramasında işletmenin yorum panelini açar. */
export const reviewsUrl = 'https://www.google.com/search?q=inkfade+tattoo&hl=tr#sv=CAESzQEKuQEStgEKd0FERGJXZVlDcFMySDNabG5WOWFiX0xTS3FKcXdqUE1ISjJKMVNlZXBrR1FZMU9RRnJ1NlFsS0pIa01URjNOLWNOWWZFRDhsTVRra2NRejRQcmRsYWZIU2Utc3dZZHdWLVIwamg4QnZJbFNQSDFyalRfX0FYX3ZzEhdCcmNDYS1Md0NMZW94YzhQazZtbWlRWRoiQUhOMEU3Rjl1SXhoZURabVU5RktUaU5uejRZNFpWVHh3URIEODA1MRoBMyoAMAA4AUAAGAAgsJXqnws6AEoCEAE';
