// Ulaş Hakan'ın dövme fotoğrafları. Yeni fotoğraf eklemek için:
// 1) Görseli src/assets/works/ altına <ad>.webp (büyük) ve <ad>-sm.webp (küçük) olarak koy,
// 2) aşağıya iki import satırı ve works listesine bir kayıt ekle,
// 3) portfolio.js'te istediğin kategorinin works listesine adını yaz.
// pos: kırpılan kartlarda görselin hangi bölgesinin görüneceği (yatay% dikey%).

import zeus from '../assets/works/zeus.webp';
import zeusSm from '../assets/works/zeus-sm.webp';
import basmelek from '../assets/works/basmelek.webp';
import basmelekSm from '../assets/works/basmelek-sm.webp';
import melekKafatasi from '../assets/works/melek-kafatasi.webp';
import melekKafatasiSm from '../assets/works/melek-kafatasi-sm.webp';
import vampir from '../assets/works/vampir.webp';
import vampirSm from '../assets/works/vampir-sm.webp';
import misir from '../assets/works/misir.webp';
import misirSm from '../assets/works/misir-sm.webp';
import anubis from '../assets/works/anubis.webp';
import anubisSm from '../assets/works/anubis-sm.webp';
import ozgurluk from '../assets/works/ozgurluk.webp';
import ozgurlukSm from '../assets/works/ozgurluk-sm.webp';
import catlakHeykel from '../assets/works/catlak-heykel.webp';
import catlakHeykelSm from '../assets/works/catlak-heykel-sm.webp';
import catrina from '../assets/works/catrina.webp';
import catrinaSm from '../assets/works/catrina-sm.webp';
import kartalKaplan from '../assets/works/kartal-kaplan.webp';
import kartalKaplanSm from '../assets/works/kartal-kaplan-sm.webp';
import gotham from '../assets/works/gotham.webp';
import gothamSm from '../assets/works/gotham-sm.webp';
import hannya from '../assets/works/hannya.webp';
import hannyaSm from '../assets/works/hannya-sm.webp';
import fooDogKoi from '../assets/works/foo-dog-koi.webp';
import fooDogKoiSm from '../assets/works/foo-dog-koi-sm.webp';
import kirikHeykel from '../assets/works/kirik-heykel.webp';
import kirikHeykelSm from '../assets/works/kirik-heykel-sm.webp';
import balance from '../assets/works/balance.webp';
import balanceSm from '../assets/works/balance-sm.webp';
import spiderman from '../assets/works/spiderman.webp';
import spidermanSm from '../assets/works/spiderman-sm.webp';
import lale from '../assets/works/lale.webp';
import laleSm from '../assets/works/lale-sm.webp';
import gul from '../assets/works/gul.webp';
import gulSm from '../assets/works/gul-sm.webp';
import denizanasi from '../assets/works/denizanasi.webp';
import denizanasiSm from '../assets/works/denizanasi-sm.webp';

export const works = {
  'zeus': { title: 'Zeus', place: 'Ön kol', pos: '50% 30%', lg: zeus.src, sm: zeusSm.src },
  'basmelek': { title: 'Başmelek', place: 'Tam kol', pos: '50% 22%', lg: basmelek.src, sm: basmelekSm.src },
  'melek-kafatasi': { title: 'Melek & Kafatası', place: 'Tam kol', pos: '45% 25%', lg: melekKafatasi.src, sm: melekKafatasiSm.src },
  'vampir': { title: 'Vampir & Kafatası', place: 'Bacak', pos: '50% 35%', lg: vampir.src, sm: vampirSm.src },
  'misir': { title: 'Mısır', place: 'Bacak', pos: '50% 35%', lg: misir.src, sm: misirSm.src },
  'anubis': { title: 'Anubis', place: 'Baldır', pos: '55% 30%', lg: anubis.src, sm: anubisSm.src },
  'ozgurluk': { title: 'Özgürlük Heykeli', place: 'Baldır', pos: '50% 40%', lg: ozgurluk.src, sm: ozgurlukSm.src },
  'catlak-heykel': { title: 'Çatlak Heykel', place: 'Baldır', pos: '45% 30%', lg: catlakHeykel.src, sm: catlakHeykelSm.src },
  'catrina': { title: 'Catrina', place: 'Üst kol', pos: '50% 35%', lg: catrina.src, sm: catrinaSm.src },
  'kartal-kaplan': { title: 'Kartal & Kaplan', place: 'Ön kol', pos: '50% 40%', lg: kartalKaplan.src, sm: kartalKaplanSm.src },
  'gotham': { title: 'Gotham', place: 'Tam bacak', pos: '50% 20%', lg: gotham.src, sm: gothamSm.src },
  'hannya': { title: 'Hannya', place: 'Üst kol', pos: '58% 38%', lg: hannya.src, sm: hannyaSm.src },
  'foo-dog-koi': { title: 'Foo Dog & Koi', place: 'Üst kol', pos: '55% 30%', lg: fooDogKoi.src, sm: fooDogKoiSm.src },
  'kirik-heykel': { title: 'Kırık Heykel', place: 'Ön kol', pos: '40% 45%', lg: kirikHeykel.src, sm: kirikHeykelSm.src },
  'balance': { title: 'Balance', place: 'Baldır', pos: '50% 50%', lg: balance.src, sm: balanceSm.src },
  'spiderman': { title: 'Spider-Man', place: 'Kol', pos: '55% 40%', lg: spiderman.src, sm: spidermanSm.src },
  'lale': { title: 'Lale', place: 'Ön kol', pos: '42% 50%', lg: lale.src, sm: laleSm.src },
  'gul': { title: 'Gül', place: 'Ön kol', pos: '50% 45%', lg: gul.src, sm: gulSm.src },
  'denizanasi': { title: 'Denizanası', place: 'Arka kol', pos: '50% 40%', lg: denizanasi.src, sm: denizanasiSm.src },
};
