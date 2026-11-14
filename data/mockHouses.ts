import type { Listing, Photo } from '../types/listing';
import { mediaUrl } from '../utils/media';
import { hoursAgo } from '../utils/time';

// Demo catalogue: 13 apartments, 13 houses, 12 plots, 12 dachas (дачи / yazlık ev).
// At least one listing sits in each of the 15 cities in constants/cities.ts, so
// every city chip in the filter and the seller form has something to show.
// Prices are indicative regional demo numbers, not a market survey; series and
// districts follow the Kyrgyz market. Every number is the test line from
// constants/config.ts, so the call buttons stay safe to try.
const PHONE = '+996502001903';

const shots = (...files: string[]): Photo[] => files.map((file) => ({ uri: mediaUrl(file) }));

const panel = shots('apt-1.jpg', 'apt-2.jpg', 'apt-4.jpg');
const elite = shots('apt-3.jpg', 'apt-4.jpg', 'apt-1.jpg');
const khr = shots('apt-2.jpg', 'apt-1.jpg', 'apt-4.jpg');
const cottage = shots('house-1.jpg', 'house-2.jpg', 'house-4.jpg');
const brick = shots('house-4.jpg', 'house-2.jpg', 'house-3.jpg');
const yard = shots('house-3.jpg', 'house-2.jpg', 'house-4.jpg');
const shore = shots('land-1.jpg', 'land-3.jpg', 'land-2.jpg');
const chuy = shots('land-3.jpg', 'land-2.jpg', 'land-4.jpg');
const valley = shots('land-4.jpg', 'land-2.jpg', 'land-3.jpg');
const garden = shots('dacha-2.jpg', 'dacha-3.jpg', 'dacha-1.jpg');
const foothill = shots('dacha-3.jpg', 'dacha-2.jpg', 'dacha-1.jpg');
const lakehouse = shots('dacha-4.jpg', 'dacha-1.jpg', 'dacha-3.jpg');

type Ad = Omit<Listing, 'sellerPhone' | 'whatsappPhone'>;

const ad = (row: Ad): Listing => ({ ...row, sellerPhone: PHONE, whatsappPhone: PHONE });

export const mockHouses: Listing[] = [
  // —— Apartments (13): 8 sale, 5 rent ——
  ad({
    id: 'apt-01', dealType: 'sale', type: 'apartment', rooms: 3, areaM2: 92, floor: 7, totalFloors: 10,
    yearBuilt: 2021, series: 'elite', condition: 'euro', documents: 'ddu', furnished: false,
    priceUsd: 128000, oldPriceUsd: 139000, city: 'Bişkek', district: 'Асанбай',
    views: 186, likes: 24, photos: elite, sellerName: 'Айбек Токтосунов', sellerType: 'owner', createdAt: hoursAgo(3),
  }),
  ad({
    id: 'apt-02', dealType: 'sale', type: 'apartment', rooms: 2, areaM2: 54, floor: 4, totalFloors: 9,
    yearBuilt: 1986, series: '105', condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 62000, city: 'Bişkek', district: '12 мкр',
    views: 940, likes: 61, photos: panel, sellerName: 'Нургуль Сатыбалдиева', sellerType: 'owner', createdAt: hoursAgo(2 * 24),
  }),
  ad({
    id: 'apt-03', dealType: 'sale', type: 'apartment', rooms: 1, areaM2: 34, floor: 3, totalFloors: 5,
    yearBuilt: 1974, series: 'khrushchevka', condition: 'cosmetic', documents: 'redBook', furnished: false,
    priceUsd: 27000, city: 'Kara-Balta', district: 'Микрорайон',
    views: 1210, likes: 44, photos: khr, sellerName: 'Сергей Ким', sellerType: 'agent', createdAt: hoursAgo(6 * 24),
  }),
  ad({
    id: 'apt-04', dealType: 'sale', type: 'apartment', rooms: 2, areaM2: 68, floor: 9, totalFloors: 16,
    yearBuilt: 2024, series: 'elite', condition: 'pso', documents: 'ddu', furnished: false,
    priceUsd: 89000, city: 'Bişkek', district: 'Южные ворота',
    views: 410, likes: 19, photos: elite, sellerName: 'Эрлан Бекболотов', sellerType: 'agent', createdAt: hoursAgo(1 * 24),
  }),
  ad({
    id: 'apt-05', dealType: 'sale', type: 'apartment', rooms: 2, areaM2: 48, floor: 2, totalFloors: 5,
    yearBuilt: 1968, series: 'khrushchevka', condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 47000, city: 'Bişkek', district: 'Восток-5',
    views: 760, likes: 28, photos: khr, sellerName: 'Айгуль Маматова', sellerType: 'owner', createdAt: hoursAgo(9 * 24),
  }),
  ad({
    id: 'apt-06', dealType: 'sale', type: 'apartment', rooms: 3, areaM2: 78, floor: 5, totalFloors: 9,
    yearBuilt: 2016, series: '106', condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 54000, city: 'Oş', district: 'Амир-Тимур',
    views: 530, likes: 33, photos: panel, sellerName: 'Бахтияр Юлдашев', sellerType: 'owner', createdAt: hoursAgo(4 * 24),
  }),
  ad({
    id: 'apt-07', dealType: 'sale', type: 'apartment', rooms: 4, areaM2: 112, floor: 6, totalFloors: 12,
    yearBuilt: 2019, series: 'elite', condition: 'euro', documents: 'redBook', furnished: true,
    priceUsd: 156000, city: 'Bişkek', district: 'Джал',
    views: 880, likes: 72, photos: elite, sellerName: 'Динара Асанова', sellerType: 'agent', createdAt: hoursAgo(11 * 24),
  }),
  ad({
    id: 'apt-08', dealType: 'sale', type: 'apartment', rooms: 2, areaM2: 51, floor: 3, totalFloors: 5,
    yearBuilt: 1992, series: '105', condition: 'cosmetic', documents: 'redBook', furnished: false,
    priceUsd: 32000, city: 'Celalabad', district: 'Центр',
    views: 290, likes: 11, photos: panel, sellerName: 'Жаныбек Осмонов', sellerType: 'owner', createdAt: hoursAgo(8 * 24),
  }),
  ad({
    id: 'apt-09', dealType: 'rent', type: 'apartment', rooms: 2, areaM2: 58, floor: 5, totalFloors: 9,
    yearBuilt: 2008, series: 'elite', condition: 'euro', documents: 'redBook', furnished: true,
    priceUsd: 750, city: 'Bişkek', district: 'Ибраимова',
    views: 640, likes: 40, photos: elite, sellerName: 'Алина Пак', sellerType: 'agent', createdAt: hoursAgo(18),
  }),
  ad({
    id: 'apt-10', dealType: 'rent', type: 'apartment', rooms: 1, areaM2: 36, floor: 2, totalFloors: 5,
    yearBuilt: 1978, series: 'khrushchevka', condition: 'good', documents: 'redBook', furnished: true,
    priceUsd: 320, city: 'Bişkek', district: '8 мкр',
    views: 1500, likes: 55, photos: khr, sellerName: 'Максат Жумабаев', sellerType: 'owner', createdAt: hoursAgo(3 * 24),
  }),
  ad({
    id: 'apt-11', dealType: 'rent', type: 'apartment', rooms: 3, areaM2: 95, floor: 11, totalFloors: 14,
    yearBuilt: 2022, series: 'elite', condition: 'euro', documents: 'redBook', furnished: true,
    priceUsd: 980, oldPriceUsd: 1100, city: 'Bişkek', district: 'Асанбай',
    views: 720, likes: 48, photos: elite, sellerName: 'Ольга Соколова', sellerType: 'agent', createdAt: hoursAgo(5 * 24),
  }),
  ad({
    id: 'apt-12', dealType: 'rent', type: 'apartment', rooms: 2, areaM2: 52, floor: 4, totalFloors: 9,
    yearBuilt: 2014, series: '105', condition: 'good', documents: 'redBook', furnished: true,
    priceUsd: 280, city: 'Oş', district: 'Сулайман-Тоо',
    views: 410, likes: 17, photos: panel, sellerName: 'Назира Абдуллаева', sellerType: 'owner', createdAt: hoursAgo(7 * 24),
  }),
  ad({
    id: 'apt-13', dealType: 'rent', type: 'apartment', rooms: 1, areaM2: 32, floor: 2, totalFloors: 4,
    yearBuilt: 1984, series: 'khrushchevka', condition: 'cosmetic', documents: 'redBook', furnished: false,
    priceUsd: 180, city: 'Karakol', district: 'Центр',
    views: 220, likes: 8, photos: khr, sellerName: 'Чынгыз Калыков', sellerType: 'owner', createdAt: hoursAgo(12 * 24),
  }),

  // —— Houses (13): 8 sale, 5 rent ——
  ad({
    id: 'house-01', dealType: 'sale', type: 'house', rooms: 6, areaM2: 220, landSotka: 8,
    yearBuilt: 2018, series: 'individual', condition: 'euro', documents: 'redBook', furnished: false,
    priceUsd: 185000, city: 'Bişkek', district: 'Арча-Бешик',
    views: 990, likes: 81, photos: cottage, sellerName: 'Руслан Мамытов', sellerType: 'owner', createdAt: hoursAgo(8),
  }),
  ad({
    id: 'house-02', dealType: 'sale', type: 'house', rooms: 5, areaM2: 180, landSotka: 6,
    yearBuilt: 2015, series: 'individual', condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 142000, oldPriceUsd: 155000, city: 'Bişkek', district: 'Кок-Жар',
    views: 1340, likes: 66, photos: cottage, sellerName: 'Гульнара Исаева', sellerType: 'agent', createdAt: hoursAgo(2 * 24),
  }),
  ad({
    id: 'house-03', dealType: 'sale', type: 'house', rooms: 4, areaM2: 140, landSotka: 6,
    yearBuilt: 2012, series: 'individual', condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 89000, city: 'Bişkek', district: 'Ак-Орго',
    views: 610, likes: 29, photos: brick, sellerName: 'Азамат Рыскулов', sellerType: 'owner', createdAt: hoursAgo(5 * 24),
  }),
  ad({
    id: 'house-04', dealType: 'sale', type: 'house', rooms: 5, areaM2: 160, landSotka: 8,
    yearBuilt: 2009, series: 'individual', condition: 'cosmetic', documents: 'redBook', furnished: false,
    priceUsd: 45000, city: 'Batken', district: 'Центр',
    views: 480, likes: 22, photos: yard, sellerName: 'Махабат Токтогулова', sellerType: 'owner', createdAt: hoursAgo(10 * 24),
  }),
  ad({
    id: 'house-05', dealType: 'sale', type: 'house', rooms: 4, areaM2: 130, landSotka: 7,
    yearBuilt: 2004, series: 'individual', condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 32000, city: 'Sülüktü', district: 'Центр',
    views: 260, likes: 14, photos: brick, sellerName: 'Дмитрий Орлов', sellerType: 'owner', createdAt: hoursAgo(7 * 24),
  }),
  ad({
    id: 'house-06', dealType: 'sale', type: 'house', rooms: 4, areaM2: 120, landSotka: 6,
    yearBuilt: 1998, series: 'individual', condition: 'cosmetic', documents: 'redBook', furnished: false,
    priceUsd: 39000, city: 'Tokmok', district: 'Центр',
    views: 190, likes: 9, photos: brick, sellerName: 'Бакыт Омуралиев', sellerType: 'owner', createdAt: hoursAgo(13 * 24),
  }),
  ad({
    id: 'house-07', dealType: 'sale', type: 'house', rooms: 4, areaM2: 110, landSotka: 10,
    yearBuilt: 1995, series: 'individual', condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 34000, city: 'Narın', district: 'Центр',
    views: 140, likes: 6, photos: brick, sellerName: 'Жылдыз Назарова', sellerType: 'owner', createdAt: hoursAgo(4 * 24),
  }),
  ad({
    id: 'house-08', dealType: 'sale', type: 'house', rooms: 3, areaM2: 95, landSotka: 8,
    yearBuilt: 2001, series: 'individual', condition: 'cosmetic', documents: 'redBook', furnished: false,
    priceUsd: 28000, city: 'Talas', district: 'Центр',
    views: 110, likes: 5, photos: brick, sellerName: 'Таалайбек Садыков', sellerType: 'owner', createdAt: hoursAgo(9 * 24),
  }),
  ad({
    id: 'house-09', dealType: 'rent', type: 'house', rooms: 4, areaM2: 150, landSotka: 6,
    yearBuilt: 2016, series: 'individual', condition: 'euro', documents: 'redBook', furnished: true,
    priceUsd: 900, city: 'Bişkek', district: 'Байтик',
    views: 540, likes: 31, photos: cottage, sellerName: 'Асель Кыдырбаева', sellerType: 'agent', createdAt: hoursAgo(1 * 24),
  }),
  ad({
    id: 'house-10', dealType: 'rent', type: 'house', rooms: 3, areaM2: 110, landSotka: 5,
    yearBuilt: 2010, series: 'individual', condition: 'good', documents: 'redBook', furnished: true,
    priceUsd: 550, city: 'Bişkek', district: 'Джал',
    views: 380, likes: 18, photos: brick, sellerName: 'Тимур Алиев', sellerType: 'agent', createdAt: hoursAgo(6 * 24),
  }),
  ad({
    id: 'house-11', dealType: 'rent', type: 'house', rooms: 3, areaM2: 100, landSotka: 4,
    yearBuilt: 2006, series: 'individual', condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 280, city: 'Oş', district: 'Манас',
    views: 210, likes: 7, photos: yard, sellerName: 'Шахноза Каримова', sellerType: 'owner', createdAt: hoursAgo(11 * 24),
  }),
  ad({
    id: 'house-12', dealType: 'rent', type: 'house', rooms: 3, areaM2: 90, landSotka: 6,
    yearBuilt: 2000, series: 'individual', condition: 'cosmetic', documents: 'redBook', furnished: true,
    priceUsd: 220, city: 'Karakol', district: 'Центр',
    views: 160, likes: 6, photos: brick, sellerName: 'Елена Васильева', sellerType: 'owner', createdAt: hoursAgo(3 * 24),
  }),
  ad({
    id: 'house-13', dealType: 'rent', type: 'house', rooms: 5, areaM2: 190, landSotka: 8,
    yearBuilt: 2019, series: 'individual', condition: 'euro', documents: 'redBook', furnished: true,
    priceUsd: 1200, city: 'Bişkek', district: 'Орто-Сай',
    views: 430, likes: 27, photos: cottage, sellerName: 'Нурлан Исаев', sellerType: 'agent', createdAt: hoursAgo(8 * 24),
  }),

  // —— Land (12): 10 sale, 2 rent. areaM2 is the plot. ——
  ad({
    id: 'land-01', dealType: 'sale', type: 'land', rooms: 0, areaM2: 600, landSotka: 6,
    condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 28000, city: 'Bişkek', district: 'Лебединовка',
    views: 350, likes: 15, photos: chuy, sellerName: 'Канат Бекбаев', sellerType: 'owner', createdAt: hoursAgo(14),
  }),
  ad({
    id: 'land-02', dealType: 'sale', type: 'land', rooms: 0, areaM2: 600, landSotka: 6,
    condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 72000, city: 'Bişkek', district: 'Арча-Бешик',
    views: 820, likes: 36, photos: chuy, sellerName: 'Марина Ким', sellerType: 'agent', createdAt: hoursAgo(2 * 24),
  }),
  ad({
    id: 'land-03', dealType: 'sale', type: 'land', rooms: 0, areaM2: 800, landSotka: 8,
    condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 45000, city: 'Bişkek', district: 'Ак-Ордо',
    views: 470, likes: 20, photos: chuy, sellerName: 'Данияр Усенов', sellerType: 'owner', createdAt: hoursAgo(6 * 24),
  }),
  ad({
    id: 'land-04', dealType: 'sale', type: 'land', rooms: 0, areaM2: 1000, landSotka: 10,
    condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 22000, city: 'Bişkek', district: 'Новопокровка',
    views: 300, likes: 12, photos: chuy, sellerName: 'Алмаз Токтогулов', sellerType: 'owner', createdAt: hoursAgo(11 * 24),
  }),
  ad({
    id: 'land-05', dealType: 'sale', type: 'land', rooms: 0, areaM2: 1000, landSotka: 10,
    condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 125000, city: 'Çolpon-Ata', district: 'Бостери, первая линия',
    views: 1100, likes: 74, photos: shore, sellerName: 'Санжар Айтматов', sellerType: 'agent', createdAt: hoursAgo(1 * 24),
  }),
  ad({
    id: 'land-06', dealType: 'sale', type: 'land', rooms: 0, areaM2: 800, landSotka: 8,
    condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 68000, oldPriceUsd: 78000, city: 'Çolpon-Ata', district: 'Кара-Ой',
    views: 640, likes: 29, photos: shore, sellerName: 'Айпери Сулайманова', sellerType: 'owner', createdAt: hoursAgo(4 * 24),
  }),
  ad({
    id: 'land-07', dealType: 'sale', type: 'land', rooms: 0, areaM2: 600, landSotka: 6,
    condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 9000, city: 'Uzgen', district: 'Центр',
    views: 180, likes: 7, photos: valley, sellerName: 'Улугбек Рахимов', sellerType: 'owner', createdAt: hoursAgo(8 * 24),
  }),
  ad({
    id: 'land-08', dealType: 'sale', type: 'land', rooms: 0, areaM2: 1200, landSotka: 12,
    condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 11000, city: 'Bazar-Korgon', district: 'Центр',
    views: 150, likes: 4, photos: valley, sellerName: 'Мирлан Жолдошев', sellerType: 'owner', createdAt: hoursAgo(12 * 24),
  }),
  ad({
    id: 'land-09', dealType: 'sale', type: 'land', rooms: 0, areaM2: 800, landSotka: 8,
    condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 12000, city: 'Kızıl-Kiya', district: 'Центр',
    views: 240, likes: 13, photos: shore, sellerName: 'Виктор Назаров', sellerType: 'owner', createdAt: hoursAgo(3 * 24),
  }),
  ad({
    id: 'land-10', dealType: 'sale', type: 'land', rooms: 0, areaM2: 600, landSotka: 6,
    condition: 'good', documents: 'none', furnished: false,
    priceUsd: 14000, city: 'Kant', district: 'Садовое общество',
    views: 95, likes: 3, photos: chuy, sellerName: 'Чолпон Абдыкадырова', sellerType: 'owner', createdAt: hoursAgo(14 * 24),
  }),
  ad({
    id: 'land-11', dealType: 'rent', type: 'land', rooms: 0, areaM2: 600, landSotka: 6,
    condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 350, city: 'Bişkek', district: 'Кок-Жар',
    views: 80, likes: 2, photos: chuy, sellerName: 'Ильяс Мамбетов', sellerType: 'agent', createdAt: hoursAgo(5 * 24),
  }),
  ad({
    id: 'land-12', dealType: 'rent', type: 'land', rooms: 0, areaM2: 1000, landSotka: 10,
    condition: 'good', documents: 'redBook', furnished: false,
    priceUsd: 500, city: 'Çolpon-Ata', district: 'Чок-Тал',
    views: 130, likes: 6, photos: shore, sellerName: 'Айдана Сапарбекова', sellerType: 'owner', createdAt: hoursAgo(9 * 24),
  }),

  // —— Dachas (12): 7 sale, 5 summer rents. дача / yazlık ev. ——
  ad({
    id: 'dacha-01', dealType: 'sale', type: 'dacha', rooms: 3, areaM2: 72, landSotka: 8,
    yearBuilt: 2008, series: 'individual', condition: 'good', documents: 'redBook', furnished: true,
    priceUsd: 56000, city: 'Bişkek', district: 'Ала-Арча',
    views: 510, likes: 34, photos: foothill, sellerName: 'Болотбек Алымов', sellerType: 'owner', createdAt: hoursAgo(2 * 24),
  }),
  ad({
    id: 'dacha-02', dealType: 'sale', type: 'dacha', rooms: 2, areaM2: 48, landSotka: 6,
    yearBuilt: 1996, series: 'individual', condition: 'cosmetic', documents: 'redBook', furnished: false,
    priceUsd: 34000, city: 'Bişkek', district: 'Беш-Күнгей',
    views: 270, likes: 11, photos: garden, sellerName: 'Светлана Юрченко', sellerType: 'owner', createdAt: hoursAgo(7 * 24),
  }),
  ad({
    id: 'dacha-03', dealType: 'sale', type: 'dacha', rooms: 4, areaM2: 90, landSotka: 10,
    yearBuilt: 2014, series: 'individual', condition: 'good', documents: 'redBook', furnished: true,
    priceUsd: 74000, city: 'Bişkek', district: 'Чон-Арык',
    views: 430, likes: 26, photos: garden, sellerName: 'Кубатбек Жээнбеков', sellerType: 'owner', createdAt: hoursAgo(1 * 24),
  }),
  ad({
    id: 'dacha-04', dealType: 'sale', type: 'dacha', rooms: 3, areaM2: 80, landSotka: 8,
    yearBuilt: 2011, series: 'individual', condition: 'euro', documents: 'redBook', furnished: true,
    priceUsd: 98000, city: 'Çolpon-Ata', district: 'Бостери',
    views: 860, likes: 58, photos: lakehouse, sellerName: 'Айжан Молдогазиева', sellerType: 'owner', createdAt: hoursAgo(6),
  }),
  ad({
    id: 'dacha-05', dealType: 'sale', type: 'dacha', rooms: 4, areaM2: 110, landSotka: 12,
    yearBuilt: 2017, series: 'individual', condition: 'euro', documents: 'redBook', furnished: true,
    priceUsd: 135000, oldPriceUsd: 149000, city: 'Çolpon-Ata', district: 'Кара-Ой',
    views: 1020, likes: 69, photos: lakehouse, sellerName: 'Андрей Ли', sellerType: 'agent', createdAt: hoursAgo(3 * 24),
  }),
  ad({
    id: 'dacha-06', dealType: 'sale', type: 'dacha', rooms: 2, areaM2: 42, landSotka: 6,
    yearBuilt: 1988, series: 'individual', condition: 'cosmetic', documents: 'none', furnished: false,
    priceUsd: 22000, city: 'Karakol', district: 'Семеновка',
    views: 160, likes: 5, photos: garden, sellerName: 'Нурайым Токтосунова', sellerType: 'owner', createdAt: hoursAgo(10 * 24),
  }),
  ad({
    id: 'dacha-07', dealType: 'sale', type: 'dacha', rooms: 3, areaM2: 65, landSotka: 8,
    yearBuilt: 2003, series: 'individual', condition: 'good', documents: 'redBook', furnished: true,
    priceUsd: 48000, city: 'Bişkek', district: 'Чункурчак',
    views: 240, likes: 16, photos: foothill, sellerName: 'Медер Сагынбаев', sellerType: 'owner', createdAt: hoursAgo(13 * 24),
  }),
  ad({
    id: 'dacha-08', dealType: 'rent', type: 'dacha', rooms: 3, areaM2: 75, landSotka: 8,
    yearBuilt: 2012, series: 'individual', condition: 'euro', documents: 'redBook', furnished: true,
    priceUsd: 850, city: 'Çolpon-Ata', district: 'Кош-Көл',
    views: 690, likes: 41, photos: lakehouse, sellerName: 'Жанна Ким', sellerType: 'agent', createdAt: hoursAgo(11),
  }),
  ad({
    id: 'dacha-09', dealType: 'rent', type: 'dacha', rooms: 2, areaM2: 50, landSotka: 6,
    yearBuilt: 2005, series: 'individual', condition: 'good', documents: 'redBook', furnished: true,
    priceUsd: 480, city: 'Çolpon-Ata', district: 'Бостери',
    views: 540, likes: 23, photos: lakehouse, sellerName: 'Талгат Омуров', sellerType: 'owner', createdAt: hoursAgo(6 * 24),
  }),
  ad({
    id: 'dacha-10', dealType: 'rent', type: 'dacha', rooms: 2, areaM2: 46, landSotka: 6,
    yearBuilt: 1999, series: 'individual', condition: 'good', documents: 'redBook', furnished: true,
    priceUsd: 320, city: 'Bişkek', district: 'Ала-Арча',
    views: 210, likes: 9, photos: garden, sellerName: 'Бурул Абдылдаева', sellerType: 'owner', createdAt: hoursAgo(4 * 24),
  }),
  ad({
    id: 'dacha-11', dealType: 'rent', type: 'dacha', rooms: 3, areaM2: 70, landSotka: 10,
    yearBuilt: 2001, series: 'individual', condition: 'cosmetic', documents: 'redBook', furnished: true,
    priceUsd: 250, city: 'Karakol', district: 'Григорьевка',
    views: 175, likes: 8, photos: garden, sellerName: 'Пётр Иванов', sellerType: 'owner', createdAt: hoursAgo(8 * 24),
  }),
  ad({
    id: 'dacha-12', dealType: 'rent', type: 'dacha', rooms: 4, areaM2: 95, landSotka: 8,
    yearBuilt: 2016, series: 'individual', condition: 'euro', documents: 'redBook', furnished: true,
    priceUsd: 620, city: 'Bişkek', district: 'Таш-Мойнок',
    views: 300, likes: 19, photos: foothill, sellerName: 'Айнура Касымова', sellerType: 'agent', createdAt: hoursAgo(11 * 24),
  }),
];
