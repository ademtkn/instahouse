import type { Lang } from './i18n';

// The operator is a placeholder ("X") until the real company is registered.
// Keep this file as the single source of truth for the in-app legal texts.
// The texts are a product draft, not legal advice: a Kyrgyz lawyer should
// review them before the app is published. See HANDOFF.md.
export const LEGAL_COMPANY = 'X';
export const LEGAL_EMAIL = 'admin@instahouse.kg';
export const LEGAL_UPDATED = '14.11.2026';

export type LegalDocId = 'privacy' | 'terms';

export interface LegalSection {
  title: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  intro: string;
  sections: LegalSection[];
  footer: string;
}

type LegalSet = Record<LegalDocId, LegalDoc>;

const RU: LegalSet = {
  privacy: {
    title: 'Политика конфиденциальности',
    intro:
      'Эта Политика объясняет, какие данные InstaHouse собирает, зачем и как вы можете ими управлять. Оператор сервиса — X (далее «мы»), Бишкек, Кыргызская Республика. Контакт: admin@instahouse.kg.',
    sections: [
      {
        title: '1. Какие данные мы обрабатываем',
        body: [
          'Аккаунт: имя, номер телефона и необязательный e-mail.',
          'Действия в приложении: избранное, просмотренные объявления, выбранный язык, валюта цен и настройки уведомлений.',
          'Объявления о недвижимости: тип сделки (продажа или аренда), тип объекта (квартира, дом, дача, участок, коммерческое помещение), количество комнат, площадь, размер участка, этаж и этажность, год постройки, серия дома, состояние, документы, мебель, город и район, цена, фото и видео, телефон/WhatsApp продавца.',
          'Технические данные: тип устройства, версия операционной системы, журналы ошибок (когда будет подключена аналитика).',
          'Мы не получаем доступ к вашим контактам, галерее или геолокации без отдельного разрешения.',
        ],
      },
      {
        title: '2. Зачем мы это делаем',
        body: [
          'Чтобы создать аккаунт и синхронизировать избранное.',
          'Чтобы показать объявление и дать покупателям или арендаторам возможность связаться с продавцом.',
          'Чтобы сохранить выбранные язык и валюту и не спрашивать их каждый раз.',
          'Для безопасности, борьбы со спамом и мошенничеством, а также поддержки.',
          'Чтобы улучшать ленту и отправлять уведомления — только с вашего согласия.',
        ],
      },
      {
        title: '3. Правовые основания',
        body: [
          'Ваше согласие; исполнение договора; законные интересы (безопасность и улучшение сервиса); требования закона.',
          'Обработка регулируется Законом Кыргызской Республики «О персональных данных» (№ 58 от 2008 года, с изменениями 2022 года).',
        ],
      },
      {
        title: '4. Публичный телефон и WhatsApp',
        body: [
          'Если вы передаёте объявление, ваш телефон/WhatsApp показывается в объявлении и доступен всем пользователям. Мы публикуем его только с вашим отдельным согласием, которое вы подтверждаете при отправке объявления.',
          'Вы можете отозвать согласие, попросив удалить объявление или аккаунт. Объявление будет снято, но копии у третьих лиц (например, в WhatsApp или на скриншотах) мы контролировать не можем.',
        ],
      },
      {
        title: '5. Передача и хранение',
        body: [
          'Данные могут обрабатываться на серверах за пределами Кыргызстана (хостинг, CDN, база данных). Мы принимаем договорные и технические меры защиты.',
          'Аккаунт хранится до удаления. Объявление показывается 15 дней, затем снимается; данные удаляются или обезличиваются в разумный срок, если закон не требует иного.',
          'Пароли мы не храним: вход выполняется по одноразовому коду.',
        ],
      },
      {
        title: '6. Ваши права',
        body: [
          'Вы можете запросить доступ, исправление, удаление или ограничение обработки, отозвать согласие и подать жалобу в уполномоченный орган Кыргызской Республики.',
          `Запросы: ${LEGAL_EMAIL}. Мы отвечаем в срок, установленный законом.`,
        ],
      },
      {
        title: '7. Дети и изменения',
        body: [
          'Сервис не предназначен для лиц младше 18 лет.',
          'Мы можем обновлять Политику. Новая версия публикуется в приложении с датой вступления в силу.',
        ],
      },
    ],
    footer: `Оператор: ${LEGAL_COMPANY}, Бишкек, Кыргызская Республика. Контакт: ${LEGAL_EMAIL}. Дата: ${LEGAL_UPDATED}.`,
  },
  terms: {
    title: 'Пользовательское соглашение',
    intro:
      'Используя InstaHouse, вы соглашаетесь с этими условиями. Сервис соединяет продавцов и покупателей или арендаторов недвижимости; мы не участвуем в сделке и не принимаем платежи.',
    sections: [
      {
        title: '1. Сервис',
        body: [
          'InstaHouse — информационная площадка для объявлений о продаже и аренде недвижимости. Объявления публикует администрация по заявке продавца.',
          'Сервис бесплатный: платных размещений, комиссий и баннеров сейчас нет.',
        ],
      },
      {
        title: '2. Кто может пользоваться',
        body: [
          'Лица 18 лет и старше; достоверные данные; один аккаунт на человека; вы отвечаете за свой номер телефона.',
        ],
      },
      {
        title: '3. Объявления и контент',
        body: [
          'Продавец подтверждает, что фото и видео принадлежат ему, объект не находится под арестом или в споре, документы действительны, а площадь, этаж, год и состояние указаны верно.',
          'Запрещено: мошенничество, введение в заблуждение, скрытые обременения и дефекты, поддельные документы, незаконные объекты, оскорбления и спам.',
          'Мы можем отклонить или снять объявление. Срок показа — 15 дней.',
        ],
      },
      {
        title: '4. Связь и безопасность',
        body: [
          'Телефон/WhatsApp продавца виден покупателям с согласия продавца.',
          'Мы не гарантируем сделку, состояние объекта и личность продавца. Проверяйте документы (красная книга, ДДУ, кадастр), сверяйте площадь и этаж; не отправляйте предоплату.',
          `Жалобы: ${LEGAL_EMAIL}. Мы реагируем и можем заблокировать нарушителя.`,
        ],
      },
      {
        title: '5. Интеллектуальная собственность',
        body: [
          'Контент приложения принадлежит X и лицензиарам; фото продавца принадлежат продавцу. Размещая фото, вы даёте нам лицензию на их показ в сервисе.',
        ],
      },
      {
        title: '6. Ответственность',
        body: [
          'Сервис предоставляется «как есть». Мы не отвечаем за убытки от сделок, действия пользователей и перерывы в работе.',
          'Мы можем менять или приостанавливать работу сервиса.',
        ],
      },
      {
        title: '7. Изменения и применимое право',
        body: [
          'Условия могут меняться; новая версия публикуется в приложении.',
          'Применимое право — Кыргызская Республика. Споры рассматриваются судами Бишкека.',
        ],
      },
    ],
    footer: `Оператор: ${LEGAL_COMPANY}. Контакт: ${LEGAL_EMAIL}. Дата: ${LEGAL_UPDATED}.`,
  },
};

const KY: LegalSet = {
  privacy: {
    title: 'Купуялуулук политикасы',
    intro:
      'Бул документ InstaHouse кандай маалыматтарды чогултарын, эмне үчүн жана сиз аны кантип башкара аларыңызды түшүндүрөт. Оператор — X (мындан ары «биз»), Бишкек, Кыргыз Республикасы. Байланыш: admin@instahouse.kg.',
    sections: [
      {
        title: '1. Кандай маалыматтарды иштетебиз',
        body: [
          'Аккаунт: атыңыз, телефон номериңиз жана милдеттүү эмес e-mail.',
          'Колдонмодогу аракеттер: тандалмалар, көрүлгөн жарыялар, тандалган тил, баа валютасы жана билдирме жөндөөлөрү.',
          'Кыймылсыз мүлк жарыялары: бүтүм түрү (сатуу же ижара), объект түрү (батир, үй, дача, жер тилкеси, коммерциялык жай), бөлмөлөрдүн саны, аянты, тилкенин өлчөмү, кабаты жана кабат саны, курулган жылы, үйдүн сериясы, абалы, документтери, эмереги, шаары жана району, баасы, сүрөт жана видео, сатуучунун телефону/WhatsApp.',
          'Техникалык маалымат: түзмөк түрү, операциялык системанын версиясы, ката журналдары (аналитика кошулганда).',
          'Биз сиздин байланыштарыңызга, галереяңызга же геолокацияңызга өзүнчө уруксатсыз кирбейбиз.',
        ],
      },
      {
        title: '2. Эмне үчүн',
        body: [
          'Аккаунт түзүү жана тандалмаларды синхрондоо үчүн.',
          'Жарыяны көрсөтүү жана сатып алуучуларга же ижарага алуучуларга сатуучу менен байланышууга мүмкүндүк берүү үчүн.',
          'Тандалган тилди жана валютаны сактап, аларды ар жолу сурабаш үчүн.',
          'Коопсуздук, спам жана алдамчылык менен күрөшүү, колдоо үчүн.',
          'Лентаны жакшыртуу жана билдирмелерди жөнөтүү үчүн — сиздин макулдугуңуз менен гана.',
        ],
      },
      {
        title: '3. Укуктук негиздер',
        body: [
          'Сиздин макулдугуңуз; келишимди аткаруу; мыйзамдуу кызыкчылыктар (коопсуздук жана сервисти жакшыртуу); мыйзам талаптары.',
          'Иштетүү Кыргыз Республикасынын «Жеке маалыматтар жөнүндө» мыйзамына (2008-жыл, № 58, 2022-жылдагы өзгөртүүлөр менен) ылайык жүргүзүлөт.',
        ],
      },
      {
        title: '4. Ачык телефон жана WhatsApp',
        body: [
          'Эгер жарыя тапшырсаңыз, телефонуңуз/WhatsApp жарыяда көрсөтүлөт жана бардык колдонуучуларга жеткиликтүү болот. Биз аны жарыяны жөнөтүүдөгү өзүнчө макулдугуңуз менен гана жарыялайбыз.',
          'Макулдугуңузду жарыяны же аккаунтту өчүрүүнү сурап кайтарып алсаңыз болот. Жарыя алынат, бирок WhatsApp сыяктуу үчүнчү тараптардагы же скриншоттогу көчүрмөлөрдү көзөмөлдөй албайбыз.',
        ],
      },
      {
        title: '5. Берилүү жана сактоо',
        body: [
          'Маалыматтар Кыргызстандан тышкары серверлерде иштетилиши мүмкүн (хостинг, CDN, маалымат базасы). Биз келишимдик жана техникалык коргоо чараларын көрөбүз.',
          'Аккаунт өчүрүлгөнгө чейин сакталат. Жарыя 15 күн көрсөтүлөт, анан алынат; маалымат мыйзам талап кылбаса, акылга сыярлык мөөнөттө өчүрүлөт же анонимдештирилет.',
          'Сырсөздөрдү сактабайбыз: кирүү бир жолу колдонулуучу код менен.',
        ],
      },
      {
        title: '6. Сиздин укуктарыңыз',
        body: [
          'Кирүү, оңдоо, өчүрүү, чектөө, макулдукту кайтарып алуу жана Кыргыз Республикасынын ыйгарым укуктуу органына кайрылуу.',
          `Сурамдар: ${LEGAL_EMAIL}. Мыйзамда белгиленген мөөнөттө жооп беребиз.`,
        ],
      },
      {
        title: '7. Балдар жана өзгөртүүлөр',
        body: [
          'Сервис 18 жашка чейинкилер үчүн эмес.',
          'Политиканы жаңырта алабыз. Жаңы версия колдонмодо күчүнө кирген датасы менен жарыяланат.',
        ],
      },
    ],
    footer: `Оператор: ${LEGAL_COMPANY}, Бишкек, Кыргыз Республикасы. Байланыш: ${LEGAL_EMAIL}. Дата: ${LEGAL_UPDATED}.`,
  },
  terms: {
    title: 'Колдонуучу келишими',
    intro:
      'InstaHouse-ду колдонуу менен бул шарттарга макул болосуз. Сервис кыймылсыз мүлктү сатуучулар менен сатып алуучуларды же ижарага алуучуларды байланыштырат; биз бүтүмгө катышпайбыз жана төлөм кабыл албайбыз.',
    sections: [
      {
        title: '1. Сервис',
        body: [
          'InstaHouse — кыймылсыз мүлктү сатуу жана ижарага берүү жарыялары үчүн маалыматтык аянтча. Жарыяларды администрация сатуучунун өтүнүчү боюнча жарыялайт.',
          'Сервис акысыз: азыркы учурда акы төлөнүүчү жайгаштыруу, комиссия жана баннер жок.',
        ],
      },
      {
        title: '2. Ким колдонсо болот',
        body: [
          '18 жаш жана андан улуулар; так маалымат; бир адамга бир аккаунт; телефон номериңиз үчүн сиз жооп бересиз.',
        ],
      },
      {
        title: '3. Жарыялар жана контент',
        body: [
          'Сатуучу сүрөт жана видео өзүнүкү экенин, объект камоого алынбаганын же талаштын предмети эместигин, документтери жарактуу экенин, аянты, кабаты, жылы жана абалы туура көрсөтүлгөнүн тастыктайт.',
          'Тыюу салынат: алдамчылык, жаңылыштыруу, жашыруун милдеттенмелер жана кемчиликтер, жасалма документтер, мыйзамсыз объектилер, балакат жана спам.',
          'Биз жарыяны четке кага алабыз же алып сала алабыз. Көрсөтүү мөөнөтү — 15 күн.',
        ],
      },
      {
        title: '4. Байланыш жана коопсуздук',
        body: [
          'Сатуучунун телефону/WhatsApp сатып алуучуларга сатуучунун макулдугу менен көрүнөт.',
          'Биз бүтүмгө, объектинин абалына жана сатуучунун инсандыгына кепилдик бербейбиз. Документтерди (кызыл китеп, ДДУ, кадастр) текшериңиз, аянтын жана кабатын салыштырыңыз; алдын ала төлөм жөнөтпөңүз.',
          `Даттануу: ${LEGAL_EMAIL}. Жооп беребиз жана бузуучуну блоктой алабыз.`,
        ],
      },
      {
        title: '5. Интеллектуалдык менчик',
        body: [
          'Колдонмонун контенти X жана лицензиарларга таандык; сатуучунун сүрөттөрү сатуучуга таандык. Сүрөттөрдү жарыялоо менен бизге аларды сервисте көрсөтүү лицензиясын бересиз.',
        ],
      },
      {
        title: '6. Жоопкерчилик',
        body: [
          'Сервис «бар боюнча» берилет. Бүтүмдөн, колдонуучулардын аракетинен жана иштин үзгүлтүгүнөн келген зыян үчүн жооп бербейбиз.',
          'Сервистин ишин өзгөртө же токтото алабыз.',
        ],
      },
      {
        title: '7. Өзгөртүүлөр жана колдонулуучу укук',
        body: [
          'Шарттар өзгөрүшү мүмкүн; жаңы версия колдонмодо жарыяланат.',
          'Колдонулуучу укук — Кыргыз Республикасы. Талаштар Бишкек сотторунда каралат.',
        ],
      },
    ],
    footer: `Оператор: ${LEGAL_COMPANY}. Байланыш: ${LEGAL_EMAIL}. Дата: ${LEGAL_UPDATED}.`,
  },
};

const TR: LegalSet = {
  privacy: {
    title: 'Gizlilik Politikası',
    intro:
      "Bu politika, InstaHouse'ın hangi verileri topladığını, neden topladığını ve bunları nasıl yönetebileceğinizi açıklar. Hizmetin işletmecisi X'tir (bundan sonra “biz”), Bişkek, Kırgızistan. İletişim: admin@instahouse.kg.",
    sections: [
      {
        title: '1. İşlediğimiz veriler',
        body: [
          'Hesap: ad, telefon numarası ve isteğe bağlı e-posta.',
          'Uygulama içi etkileşim: favoriler, görüntülenen ilanlar, seçilen dil, fiyat para birimi ve bildirim tercihleri.',
          'Gayrimenkul ilanları: işlem türü (satılık veya kiralık), mülk türü (daire, ev, yazlık, arsa, ticari alan), oda sayısı, metrekare, arsa büyüklüğü, kat ve kat sayısı, yapım yılı, bina serisi, durum, tapu belgeleri, eşya, şehir ve semt, fiyat, fotoğraf ve video, satıcının telefonu/WhatsApp’ı.',
          'Teknik veriler: cihaz türü, işletim sistemi sürümü, hata kayıtları (analitik eklendiğinde).',
          'Rehberinize, galerinize veya konumunuza ayrı izin olmadan erişmeyiz.',
        ],
      },
      {
        title: '2. Neden işliyoruz',
        body: [
          'Hesap oluşturmak ve favorileri senkronize etmek için.',
          'İlanı göstermek ve alıcıların veya kiracıların satıcıyla iletişim kurmasını sağlamak için.',
          'Seçilen dili ve para birimini saklayıp her seferinde sormamak için.',
          'Güvenlik, spam ve dolandırıcılıkla mücadele ve destek için.',
          'Akışı iyileştirmek ve bildirim göndermek için — yalnızca onayınızla.',
        ],
      },
      {
        title: '3. Hukuki dayanak',
        body: [
          'Açık rızanız; sözleşmenin ifası; meşru menfaatler (güvenlik ve hizmeti geliştirme); yasal yükümlülükler.',
          "İşleme, Kırgız Cumhuriyeti Kişisel Verilerin Korunması Kanunu'na (2008, No. 58; 2022 değişiklikleri) tabidir.",
        ],
      },
      {
        title: '4. Herkese açık telefon ve WhatsApp',
        body: [
          'İlan verirseniz telefon/WhatsApp numaranız ilanda gösterilir ve tüm kullanıcılar görebilir. Bunu yalnızca ilan gönderirken verdiğiniz ayrı rızayla yayınlarız.',
          'Rızanızı geri çekebilir, ilanın veya hesabın silinmesini isteyebilirsiniz. İlan kaldırılır; ancak WhatsApp gibi üçüncü taraflardaki veya ekran görüntülerindeki kopyaları kontrol edemeyiz.',
        ],
      },
      {
        title: '5. Aktarım ve saklama',
        body: [
          'Veriler Kırgızistan dışındaki sunucularda işlenebilir (barındırma, CDN, veritabanı). Sözleşmesel ve teknik koruma önlemleri alırız.',
          'Hesap, silinene kadar saklanır. İlan 15 gün gösterilir, sonra kaldırılır; veriler yasal bir zorunluluk yoksa makul sürede silinir veya anonimleştirilir.',
          'Şifre saklamayız: giriş tek kullanımlık kod ile yapılır.',
        ],
      },
      {
        title: '6. Haklarınız',
        body: [
          'Erişim, düzeltme, silme, kısıtlama, rızayı geri çekme ve Kırgız Cumhuriyeti’nin yetkili kurumuna şikâyet.',
          `Talepler: ${LEGAL_EMAIL}. Yasada belirtilen sürede yanıtlarız.`,
        ],
      },
      {
        title: '7. Çocuklar ve değişiklikler',
        body: [
          'Hizmet 18 yaşından küçükler için değildir.',
          'Politikayı güncelleyebiliriz. Yeni sürüm, yürürlük tarihiyle uygulamada yayınlanır.',
        ],
      },
    ],
    footer: `İşletmeci: ${LEGAL_COMPANY}, Bişkek, Kırgızistan. İletişim: ${LEGAL_EMAIL}. Tarih: ${LEGAL_UPDATED}.`,
  },
  terms: {
    title: 'Kullanım Şartları',
    intro:
      "InstaHouse'u kullanarak bu şartları kabul etmiş olursunuz. Hizmet, gayrimenkul satıcıları ile alıcıları veya kiracıları buluşturur; biz satışa taraf değiliz ve ödeme almayız.",
    sections: [
      {
        title: '1. Hizmet',
        body: [
          'InstaHouse, satılık ve kiralık gayrimenkul ilanları için bir bilgi platformudur. İlanları yönetim, satıcının talebi üzerine yayınlar.',
          'Hizmet ücretsizdir; şu an ücretli yayın, komisyon ve reklam yoktur.',
        ],
      },
      {
        title: '2. Kimler kullanabilir',
        body: [
          '18 yaş ve üzeri; doğru bilgi; kişi başına bir hesap; telefon numaranızdan siz sorumlusunuz.',
        ],
      },
      {
        title: '3. İlanlar ve içerik',
        body: [
          'Satıcı, fotoğraf ve videonun kendisine ait olduğunu, mülkün hacizli veya ihtilaflı olmadığını, belgelerin geçerli olduğunu, metrekare, kat, yıl ve durumun doğru yazıldığını kabul eder.',
          'Yasak: dolandırıcılık, yanıltma, gizlenmiş ipotek veya kusur, sahte belge, yasa dışı mülk, hakaret ve spam.',
          'İlanı reddedebilir veya kaldırabiliriz. Gösterim süresi 15 gündür.',
        ],
      },
      {
        title: '4. İletişim ve güvenlik',
        body: [
          'Satıcının telefon/WhatsApp numarası, satıcının rızasıyla alıcılara görünür.',
          'Satışa, mülkün durumuna veya satıcının kimliğine garanti vermeyiz. Belgeleri (tapu, müteahhit sözleşmesi, kadastro) kontrol edin, metrekare ve katı karşılaştırın; ön ödeme göndermeyin.',
          `Şikâyet: ${LEGAL_EMAIL}. Yanıt verir ve ihlalde bulunan hesabı engelleyebiliriz.`,
        ],
      },
      {
        title: '5. Fikri mülkiyet',
        body: [
          "Uygulama içeriği X'e ve lisans verenlere aittir; satıcı fotoğrafları satıcıya aittir. Fotoğrafları yayınlayarak bize hizmette gösterme lisansı verirsiniz.",
        ],
      },
      {
        title: '6. Sorumluluk',
        body: [
          "Hizmet “olduğu gibi” sunulur. Satışlardan, kullanıcı davranışlarından ve kesintilerden doğan zararlardan sorumlu değiliz.",
          'Hizmeti değiştirebilir veya askıya alabiliriz.',
        ],
      },
      {
        title: '7. Değişiklikler ve uygulanacak hukuk',
        body: [
          'Şartlar değişebilir; yeni sürüm uygulamada yayınlanır.',
          'Uygulanacak hukuk Kırgız Cumhuriyeti’dir. Uyuşmazlıklarda Bişkek mahkemeleri yetkilidir.',
        ],
      },
    ],
    footer: `İşletmeci: ${LEGAL_COMPANY}. İletişim: ${LEGAL_EMAIL}. Tarih: ${LEGAL_UPDATED}.`,
  },
};

export const LEGAL: Record<Lang, LegalSet> = { ru: RU, ky: KY, tr: TR };
