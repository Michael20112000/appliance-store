import type { ProductCondition } from "../src/generated/prisma/client";

export type CatalogSeedItem = {
  slug: string;
  title: string;
  brand: string;
  priceUah: number;
  condition: ProductCondition;
  description: string;
};

export type CategoryCatalogSeed = {
  categorySlug: string;
  products: CatalogSeedItem[];
};

/** Реалістичний каталог б/у техніки; кількість по категоріях різна для органічного вигляду. */
export const CATEGORY_CATALOG: CategoryCatalogSeed[] = [
  {
    categorySlug: "pralni-mashyny",
    products: [
      {
        slug: "samsung-ww90t554daw",
        title: "Samsung WW90T554DAW",
        brand: "Samsung",
        priceUah: 14500,
        condition: "LIKE_NEW",
        description:
          "Пральна машина Samsung 9 кг, інверторний Direct Drive, парова обробка Hygiene Steam. Енергоклас A+++. Повний цикл перевірено, без протікань. Рік випуску ~2021.",
      },
      {
        slug: "bosch-wau28ph9ua",
        title: "Bosch WAU28PH9UA",
        brand: "Bosch",
        priceUah: 13200,
        condition: "GOOD",
        description:
          "Bosch Serie 6, завантаження 8 кг, 1400 об/хв. AntiVibration, SpeedPerfect. Легкі подряпини на кришці, технічно справна.",
      },
      {
        slug: "lg-f4v5ryp2t",
        title: "LG F4V5RYP2T",
        brand: "LG",
        priceUah: 11800,
        condition: "GOOD",
        description:
          "LG 8 кг, технологія AI DD, парова функція Steam. Тиха робота, дисплей і помпа в нормі. Підходить для квартири.",
      },
      {
        slug: "indesit-iwsc-6105",
        title: "Indesit IWSC 6105",
        brand: "Indesit",
        priceUah: 6900,
        condition: "FAIR",
        description:
          "Класика 6 кг, 1000 об/хв. Проста й надійна модель. Є косметичний знос корпусу, барабан без люфту.",
      },
      {
        slug: "whirlpool-fscr-12440",
        title: "Whirlpool FSCR 12440",
        brand: "Whirlpool",
        priceUah: 10900,
        condition: "GOOD",
        description:
          "Whirlpool 12 кг, 6-й відчуттєвий двигун Zen. Для великої родини. Перевірені підшипники та ремень.",
      },
      {
        slug: "electrolux-ew7f447wq",
        title: "Electrolux EW7F447WQ",
        brand: "Electrolux",
        priceUah: 12400,
        condition: "LIKE_NEW",
        description:
          "Electrolux 7 кг, парова програма VapourCare, відкладений старт. Майже не використовувалась після переїзду.",
      },
      {
        slug: "samsung-ww70t3020bw",
        title: "Samsung WW70T3020BW",
        brand: "Samsung",
        priceUah: 9800,
        condition: "GOOD",
        description:
          "Компактна 7 кг, EcoBubble, швидка програма 15 хв. Ідеально під гардеробну або ванну.",
      },
      {
        slug: "bosch-wan28290ua",
        title: "Bosch WAN28290UA",
        brand: "Bosch",
        priceUah: 8700,
        condition: "FAIR",
        description:
          "Bosch 8 кг, базові програми cotton/synthetic. Працює рівно, потребує лише легкого прибирання фільтра.",
      },
      {
        slug: "lg-f2j5hs2w",
        title: "LG F2J5HS2W",
        brand: "LG",
        priceUah: 7600,
        condition: "GOOD",
        description:
          "LG 6,5 кг, Smart Diagnosis, компресор Direct Drive. Тихий віджим, без вібрацій на 1000 об/хв.",
      },
      {
        slug: "indesit-iwud-4105",
        title: "Indesit IWUD 4105",
        brand: "Indesit",
        priceUah: 5200,
        condition: "FAIR",
        description:
          "Вузька модель 4 кг для студії. Економічна, займає мало місця. Косметика середня, мотор ок.",
      },
      {
        slug: "samsung-ww80ta046ax",
        title: "Samsung WW80TA046AX",
        brand: "Samsung",
        priceUah: 11200,
        condition: "GOOD",
        description:
          "8 кг, AddWash, EcoBubble. Зручно додавати речі під час циклу. Дверцята без тріщин.",
      },
      {
        slug: "electrolux-ew6f421wq",
        title: "Electrolux EW6F421WQ",
        brand: "Electrolux",
        priceUah: 9400,
        condition: "LIKE_NEW",
        description:
          "6 кг, Time Manager, захист від дитячих змін. Мало намотаних годин, як нова з вітрини outlet.",
      },
    ],
  },
  {
    categorySlug: "kholodylnyky",
    products: [
      {
        slug: "samsung-rb38t603dsa",
        title: "Samsung RB38T603DSA",
        brand: "Samsung",
        priceUah: 18900,
        condition: "LIKE_NEW",
        description:
          "Двокамерний No Frost 367 л, інверторний компресор Digital Inverter. SpaceMax, металевий охолоджувач. Майже без слідів використання.",
      },
      {
        slug: "bosch-kgn39vi35",
        title: "Bosch KGN39VI35",
        brand: "Bosch",
        priceUah: 17500,
        condition: "GOOD",
        description:
          "Bosch Serie 4, 366 л, VitaFresh зона для овочів. Рівномірна температура, ущільнювачі м'які.",
      },
      {
        slug: "lg-gbb62pzgsn",
        title: "LG GBB62PZGSN",
        brand: "LG",
        priceUah: 16200,
        condition: "GOOD",
        description:
          "LG 384 л, Linear Cooling, DoorCooling+. Тихий, енергоефективний. Перевірено термостат і вентилятор.",
      },
      {
        slug: "indesit-lr8-s1-w-ua",
        title: "Indesit LR8 S1 W UA",
        brand: "Indesit",
        priceUah: 11400,
        condition: "GOOD",
        description:
          "Двокамерний 339 л, система Total No Frost. Зручні полиці, лоток для яєць цілий.",
      },
      {
        slug: "whirlpool-w7-821o-ua",
        title: "Whirlpool W7 821O UA",
        brand: "Whirlpool",
        priceUah: 14800,
        condition: "LIKE_NEW",
        description:
          "6th Sense, 368 л, адаптивне охолодження. Мінімальний знос, підходить для сім'ї з 3–4 осіб.",
      },
      {
        slug: "electrolux-ens6te19s",
        title: "Electrolux ENS6TE19S",
        brand: "Electrolux",
        priceUah: 13900,
        condition: "GOOD",
        description:
          "Electrolux 367 л, TwinTech, зона свіжості. Компресор працює м'яко, без шуму ночами.",
      },
      {
        slug: "samsung-rl38t663dsa",
        title: "Samsung RL38T663DSA",
        brand: "Samsung",
        priceUah: 12800,
        condition: "FAIR",
        description:
          "Компактний двокамерний ~290 л. Є подряпина на боковій панелі, холод і мороз стабільні.",
      },
      {
        slug: "bosch-kin86afe0",
        title: "Bosch KIN86AFE0",
        brand: "Bosch",
        priceUah: 21500,
        condition: "LIKE_NEW",
        description:
          "Вбудовуваний 259 л + морозилка 87 л, No Frost. Для кухні під фасад, стан відмінний.",
      },
      {
        slug: "lg-gbc22sqysn",
        title: "LG GBC22SQYSN",
        brand: "LG",
        priceUah: 9800,
        condition: "FAIR",
        description:
          "Однокамерний 217 л, ручна розморозка морозилки. Економний варіант для дачі або оренди.",
      },
      {
        slug: "indesit-its-4200-w",
        title: "Indesit ITS 4200 W",
        brand: "Indesit",
        priceUah: 8900,
        condition: "GOOD",
        description:
          "Однокамерний 326 л, великий холодильник без морозилки. Зручно під напої та заготовки.",
      },
      {
        slug: "samsung-rs68n8241sl",
        title: "Samsung RS68N8241SL",
        brand: "Samsung",
        priceUah: 28900,
        condition: "GOOD",
        description:
          "Side-by-Side 617 л, дозатор води, All-Around Cooling. Потужна модель для великої кухні.",
      },
      {
        slug: "electrolux-lnt3lf18s",
        title: "Electrolux LNT3LF18S",
        brand: "Electrolux",
        priceUah: 15600,
        condition: "GOOD",
        description:
          "Двокамерний 310 л, Low Frost. Легке обслуговування, клас A+.",
      },
      {
        slug: "whirlpool-w7-831t-ua",
        title: "Whirlpool W7 831T UA",
        brand: "Whirlpool",
        priceUah: 16700,
        condition: "LIKE_NEW",
        description:
          "343 л, 6th Sense Fresh Control. Мало часу в експлуатації, ущільнювачі як нові.",
      },
      {
        slug: "bosch-kgv36vl30u",
        title: "Bosch KGV36VL30U",
        brand: "Bosch",
        priceUah: 11900,
        condition: "FAIR",
        description:
          "Класика 326 л, LowFrost. Косметика на дверцятах, технічно охолоджує стабільно −18/+4.",
      },
    ],
  },
  {
    categorySlug: "morozylni-kamery",
    products: [
      {
        slug: "indesit-df-5200-w",
        title: "Indesit DF 5200 W",
        brand: "Indesit",
        priceUah: 11200,
        condition: "GOOD",
        description:
          "Морозильна камера 223 л, 4 ящики, клас A+. Рівномірний мороз, компресор без стукоту.",
      },
      {
        slug: "whirlpool-cf-55-2k",
        title: "Whirlpool CF 55 2K",
        brand: "Whirlpool",
        priceUah: 13400,
        condition: "LIKE_NEW",
        description:
          "Ларь 500 л, швидке заморожування Fast Freeze. Для заготовок і великої родини. Мало використовувався.",
      },
      {
        slug: "electrolux-lut6nf18w",
        title: "Electrolux LUT6NF18W",
        brand: "Electrolux",
        priceUah: 10800,
        condition: "GOOD",
        description:
          "Вертикальна 245 л, No Frost. Зручні корзини, дверцята з петлями в нормі.",
      },
      {
        slug: "samsung-rz32m7110sa",
        title: "Samsung RZ32M7110SA",
        brand: "Samsung",
        priceUah: 14900,
        condition: "GOOD",
        description:
          "316 л, All-Around Cooling, металевий охолоджувач. Тиха робота, енергоклас A+.",
      },
      {
        slug: "bosch-gsn36ai30u",
        title: "Bosch GSN36AI30U",
        brand: "Bosch",
        priceUah: 12600,
        condition: "GOOD",
        description:
          "Bosch 324 л, No Frost, SuperFreezing. Перевірено термодатчики та ущільнювач.",
      },
      {
        slug: "lg-gc-b459plqm",
        title: "LG GC-B459PLQM",
        brand: "LG",
        priceUah: 11800,
        condition: "FAIR",
        description:
          "347 л, Smart Inverter Compressor. Легкі сліди на корпусі, мороз тримає −24 без нарастання льоду.",
      },
      {
        slug: "indesit-ds-4160-w",
        title: "Indesit DS 4160 W",
        brand: "Indesit",
        priceUah: 8900,
        condition: "FAIR",
        description:
          "Компактна 157 л, 3 ящики. Для квартири або дачі. Економічна, проста в обслуговуванні.",
      },
      {
        slug: "whirlpool-cf-16-2k",
        title: "Whirlpool CF 16 2K",
        brand: "Whirlpool",
        priceUah: 7600,
        condition: "GOOD",
        description:
          "Ларь 400 л, механічне керування. Надійний варіант для підвалу або гаража.",
      },
      {
        slug: "electrolux-lut3nf20w",
        title: "Electrolux LUT3NF20W",
        brand: "Electrolux",
        priceUah: 10200,
        condition: "LIKE_NEW",
        description:
          "198 л, Low Frost. Майже новий після короткого використання в орендній квартирі.",
      },
      {
        slug: "samsung-rz-21-f-ww",
        title: "Samsung RZ21F WW",
        brand: "Samsung",
        priceUah: 9400,
        condition: "GOOD",
        description:
          "206 л, Power Freeze. Компактна вертикальна, вміщається на кухні поруч із холодильником.",
      },
    ],
  },
  {
    categorySlug: "televizory",
    products: [
      {
        slug: "samsung-ue55au7172u",
        title: 'Samsung UE55AU7172U 55"',
        brand: "Samsung",
        priceUah: 14200,
        condition: "GOOD",
        description:
          "55\" 4K UHD, Crystal Display, HDR. Smart TV Tizen, Wi‑Fi. Без засвітів, пульт і ніжка в комплекті.",
      },
      {
        slug: "lg-55nano756qa",
        title: 'LG 55NANO756QA 55"',
        brand: "LG",
        priceUah: 15800,
        condition: "LIKE_NEW",
        description:
          "55\" NanoCell 4K, α5 Gen5 AI, webOS 22. Яскраві кольори, мало годин роботи.",
      },
      {
        slug: "samsung-ue43tu7092u",
        title: 'Samsung UE43TU7092U 43"',
        brand: "Samsung",
        priceUah: 8900,
        condition: "GOOD",
        description:
          "43\" 4K, HDR10+, Ambient Mode. Підійде для спальні чи кухні. Рівномірна підсвітка.",
      },
      {
        slug: "lg-43ur78006lk",
        title: 'LG 43UR78006LK 43"',
        brand: "LG",
        priceUah: 9200,
        condition: "GOOD",
        description:
          "43\" UHD, webOS, Magic Remote. Перевірено HDMI і Bluetooth, без битих пікселів.",
      },
      {
        slug: "samsung-ue65cu7172u",
        title: 'Samsung UE65CU7172U 65"',
        brand: "Samsung",
        priceUah: 22400,
        condition: "GOOD",
        description:
          "65\" Crystal UHD, великий екран для вітальні. Підтримка AirPlay, голосовий асистент.",
      },
      {
        slug: "lg-50uq75006lf",
        title: 'LG 50UQ75006LF 50"',
        brand: "LG",
        priceUah: 11400,
        condition: "FAIR",
        description:
          "50\" 4K, є легка подряпина на рамці (не на матриці). Картинка чиста, Smart TV працює.",
      },
      {
        slug: "samsung-ue32t5302au",
        title: 'Samsung UE32T5302AU 32"',
        brand: "Samsung",
        priceUah: 5400,
        condition: "GOOD",
        description:
          "32\" Full HD Smart TV. Компактний для кухні чи дитячої. Легкий, настінне кріплення VESA.",
      },
      {
        slug: "lg-32lq63006la",
        title: 'LG 32LQ63006LA 32"',
        brand: "LG",
        priceUah: 5100,
        condition: "FAIR",
        description:
          "32\" HD Ready, webOS. Базовий Smart TV для дачі. Пульт є, звук нормальний для розміру.",
      },
      {
        slug: "samsung-ue50au7172u",
        title: 'Samsung UE50AU7172U 50"',
        brand: "Samsung",
        priceUah: 11800,
        condition: "LIKE_NEW",
        description:
          "50\" 4K, майже не використовувався — купили більший. Коробка відсутня, екран ідеальний.",
      },
      {
        slug: "lg-65nano806qa",
        title: 'LG 65NANO806QA 65"',
        brand: "LG",
        priceUah: 24900,
        condition: "GOOD",
        description:
          "65\" NanoCell, 4K 120Hz на HDMI 2.1 (ігри/консоль). Перевірено порти та Wi‑Fi.",
      },
      {
        slug: "samsung-ue40tu7092u",
        title: 'Samsung UE40TU7092U 40"',
        brand: "Samsung",
        priceUah: 7200,
        condition: "GOOD",
        description:
          "40\" 4K UHD, універсальний розмір для невеликої вітальні. Енергоспоживання помірне.",
      },
    ],
  },
  {
    categorySlug: "plyty",
    products: [
      {
        slug: "bosch-hks-640-ua",
        title: "Bosch HKS 640 UA",
        brand: "Bosch",
        priceUah: 8900,
        condition: "GOOD",
        description:
          "Електрична плита 60 см, 4 конфорки, духовка знизу. Склокерамічна поверхня без тріщин, решітки цілі.",
      },
      {
        slug: "indesit-is-5v4phw-ua",
        title: "Indesit IS 5V4PHW UA",
        brand: "Indesit",
        priceUah: 11200,
        condition: "GOOD",
        description:
          "Комбінована плита: газова варильна + електрична духовка. Wok-гора, запалювання електронне.",
      },
      {
        slug: "whirlpool-acmt-4700-ix",
        title: "Whirlpool ACMT 4700 IX",
        brand: "Whirlpool",
        priceUah: 13400,
        condition: "LIKE_NEW",
        description:
          "Газова 60 см, нержавіюча сталь, духовка з газ-контролем. Мало експлуатувалась на дачі.",
      },
      {
        slug: "electrolux-ekc-6461-aox",
        title: "Electrolux EKC 6461 AOX",
        brand: "Electrolux",
        priceUah: 9800,
        condition: "GOOD",
        description:
          "Електроплита з конвекцією в духовці, таймер. Всі конфорки нагріваються рівномірно.",
      },
      {
        slug: "gorenje-ec5111wg",
        title: "Gorenje EC5111WG",
        brand: "Gorenje",
        priceUah: 7600,
        condition: "FAIR",
        description:
          "Бюджетна електроплита 50 см, 4 зони. Косметичний знос, духовка тримає температуру.",
      },
      {
        slug: "bosch-hga-120-ua",
        title: "Bosch HGA 120 UA",
        brand: "Bosch",
        priceUah: 10200,
        condition: "GOOD",
        description:
          "Газова 60 см, емальована решітка, духовка з підсвіткою. Перевірено газ-контроль і запалювання.",
      },
      {
        slug: "indesit-is-5g0khw-ua",
        title: "Indesit IS 5G0KHW UA",
        brand: "Indesit",
        priceUah: 8400,
        condition: "GOOD",
        description:
          "Газова плита з кришкою-грилем. Зручна для кухні без окремої варильної поверхні.",
      },
      {
        slug: "whirlpool-gw-642-ix",
        title: "Whirlpool GW 642 IX",
        brand: "Whirlpool",
        priceUah: 11900,
        condition: "GOOD",
        description:
          "Газова 60 см, духовка з вертелом. Нержавіючий фасад, легко мити.",
      },
      {
        slug: "electrolux-ekg-6110-ox",
        title: "Electrolux EKG 6110 OX",
        brand: "Electrolux",
        priceUah: 9100,
        condition: "FAIR",
        description:
          "Електроплита, склокераміка з легкими слідами від посуду. Функціонал повний.",
      },
      {
        slug: "gorenje-gi-6321-wx",
        title: "Gorenje GI6321WX",
        brand: "Gorenje",
        priceUah: 12800,
        condition: "LIKE_NEW",
        description:
          "Індукційна варильна з електричною духовкою (комбо-плита). Швидкий нагрів, майже новий стан.",
      },
    ],
  },
  {
    categorySlug: "dukhovi-shafy",
    products: [
      {
        slug: "bosch-hba-573bs0",
        title: "Bosch HBA573BS0",
        brand: "Bosch",
        priceUah: 12400,
        condition: "GOOD",
        description:
          "Вбудовувана 71 л, 7 режимів, Pyrolysis (самоочистка). Телескопічні направляючі, дисплей працює.",
      },
      {
        slug: "electrolux-eoc-6h71-zx",
        title: "Electrolux EOC6H71ZX",
        brand: "Electrolux",
        priceUah: 11200,
        condition: "GOOD",
        description:
          "72 л, конвекція, SteamBake. Сенсорне керування, скло дверей без тріщин.",
      },
      {
        slug: "whirlpool-akz-962-ix",
        title: "Whirlpool AKZ962IX",
        brand: "Whirlpool",
        priceUah: 9800,
        condition: "FAIR",
        description:
          "65 л, 6th Sense, гриль. Легкий наліт на склі всередині, нагрів рівномірний.",
      },
      {
        slug: "gorenje-bo-671-e01xk",
        title: "Gorenje BO671E01XK",
        brand: "Gorenje",
        priceUah: 8900,
        condition: "GOOD",
        description:
          "67 л, AquaClean, клас A. Тихий вентилятор, термощуп у комплекті.",
      },
      {
        slug: "bosch-hba-534bs0",
        title: "Bosch HBA534BS0",
        brand: "Bosch",
        priceUah: 10200,
        condition: "LIKE_NEW",
        description:
          "71 л, 3D гарячий повітря, LED підсвітка. Мало використовувалась після ремонту кухні.",
      },
      {
        slug: "electrolux-eob-6s31-x",
        title: "Electrolux EOB6S31X",
        brand: "Electrolux",
        priceUah: 7600,
        condition: "GOOD",
        description:
          "Компактна 56 л, механічне керування. Для невеликої кухні або дачі.",
      },
      {
        slug: "whirlpool-akp-738-ix",
        title: "Whirlpool AKP738IX",
        brand: "Whirlpool",
        priceUah: 8400,
        condition: "GOOD",
        description:
          "73 л, Forced Air, нержавіючий фасад. Перевірено ТЕН і термостат.",
      },
      {
        slug: "gorenje-bo-637-e36xg",
        title: "Gorenje BO637E36XG",
        brand: "Gorenje",
        priceUah: 11800,
        condition: "LIKE_NEW",
        description:
          "77 л, піролітична очистка, HomeMade shape. Преміум-рівень за розумною ціною б/у.",
      },
      {
        slug: "bosch-hba-5780s0",
        title: "Bosch HBA5780S0",
        brand: "Bosch",
        priceUah: 10900,
        condition: "GOOD",
        description:
          "71 л, AutoPilot 10 програм. Зручна для випічки та запікання.",
      },
      {
        slug: "electrolux-eob-7s31-x",
        title: "Electrolux EOB7S31X",
        brand: "Electrolux",
        priceUah: 9400,
        condition: "FAIR",
        description:
          "72 л, гриль + вентилятор. Косметика на ручці, функції всі робочі.",
      },
      {
        slug: "whirlpool-akp-462-ix",
        title: "Whirlpool AKP462IX",
        brand: "Whirlpool",
        priceUah: 6900,
        condition: "FAIR",
        description:
          "65 л, базові режими bake/grill. Економ-варіант для оренди.",
      },
      {
        slug: "gorenje-bo-658-a01bg",
        title: "Gorenje BO658A01BG",
        brand: "Gorenje",
        priceUah: 13200,
        condition: "GOOD",
        description:
          "77 л, піца-режим, швидкий розігрів. Чорне скло, сучасний вигляд.",
      },
      {
        slug: "bosch-hba-536bs0",
        title: "Bosch HBA536BS0",
        brand: "Bosch",
        priceUah: 8700,
        condition: "GOOD",
        description:
          "60 л, 3D Hotair. Стандартний нішевий розмір 60 см.",
      },
    ],
  },
  {
    categorySlug: "varylni-poverkhni",
    products: [
      {
        slug: "bosch-pue-611bb5e",
        title: "Bosch PUE611BB5E",
        brand: "Bosch",
        priceUah: 6200,
        condition: "GOOD",
        description:
          "Індукційна 60 см, 4 зони, PowerBoost. Скло ціле, сенсор реагує чітко.",
      },
      {
        slug: "electrolux-ehh-6240-isk",
        title: "Electrolux EHH6240ISK",
        brand: "Electrolux",
        priceUah: 5800,
        condition: "GOOD",
        description:
          "Індукція 60 см, таймер, блокування від дітей. Підходить під стандартну нішу.",
      },
      {
        slug: "whirlpool-pwp-750-ix",
        title: "Whirlpool PWP750IX",
        brand: "Whirlpool",
        priceUah: 4900,
        condition: "FAIR",
        description:
          "Газова 75 см, 5 конфорок, нержавійка. Запалювання працює на всіх зонах.",
      },
      {
        slug: "gorenje-ct-641-ax",
        title: "Gorenje CT641AX",
        brand: "Gorenje",
        priceUah: 4100,
        condition: "GOOD",
        description:
          "Газова 60 см, 4 конфорки, емальовані решітки. Надійна для щоденного готування.",
      },
      {
        slug: "bosch-pgh-6b5b90r",
        title: "Bosch PGH6B5B90R",
        brand: "Bosch",
        priceUah: 8900,
        condition: "LIKE_NEW",
        description:
          "Комбінована 90 см: газ + індукція, FlexInduction. Топова модель, стан відмінний.",
      },
      {
        slug: "electrolux-egh-6343-nsk",
        title: "Electrolux EGH6343NSK",
        brand: "Electrolux",
        priceUah: 5400,
        condition: "GOOD",
        description:
          "Газова 60 см, чавунні решітки, авто-підпал. Стабильне полум'я.",
      },
      {
        slug: "whirlpool-pwl-610-ix",
        title: "Whirlpool PWL610IX",
        brand: "Whirlpool",
        priceUah: 4600,
        condition: "GOOD",
        description:
          "Електрична склокераміка 60 см, 4 Hi-Light зони. Для кухні без газу.",
      },
      {
        slug: "gorenje-ec-641-ax",
        title: "Gorenje EC641AX",
        brand: "Gorenje",
        priceUah: 3800,
        condition: "FAIR",
        description:
          "Електрична 60 см, 4 зони. Легкі подряпини на склі, нагрів рівномірний.",
      },
      {
        slug: "bosch-pkn-611f-17e",
        title: "Bosch PKN611F17E",
        brand: "Bosch",
        priceUah: 5100,
        condition: "GOOD",
        description:
          "Електрична 60 см, рамковий дизайн. Інтеграція в стільницю.",
      },
      {
        slug: "electrolux-ehi-6450-foe",
        title: "Electrolux EHI6450FOE",
        brand: "Electrolux",
        priceUah: 5900,
        condition: "LIKE_NEW",
        description:
          "Індукція 60 см, Hob2Hood (сумісність з витяжкою Electrolux). Мало часу в роботі.",
      },
      {
        slug: "whirlpool-pwm-628-ix",
        title: "Whirlpool PWM628IX",
        brand: "Whirlpool",
        priceUah: 4400,
        condition: "GOOD",
        description:
          "Склокераміка 60 см, 6-й відчуттєвий контроль потужності. Зручні слайдери.",
      },
    ],
  },
  {
    categorySlug: "susharky-dlya-odyahu",
    products: [
      {
        slug: "bosch-wtr-85v90ua",
        title: "Bosch WTR85V90UA",
        brand: "Bosch",
        priceUah: 16800,
        condition: "LIKE_NEW",
        description:
          "Тепловий насос 8 кг, енергоклас A+++. SelfCleaning condenser. Майже новий після року використання.",
      },
      {
        slug: "samsung-dv90ta040ae",
        title: "Samsung DV90TA040AE",
        brand: "Samsung",
        priceUah: 15200,
        condition: "GOOD",
        description:
          "9 кг, OptimalDry, сенсор вологості. Тиха, економна сушка бавовни та синтетики.",
      },
      {
        slug: "electrolux-ew6h-527sa",
        title: "Electrolux EW6H527SA",
        brand: "Electrolux",
        priceUah: 12400,
        condition: "GOOD",
        description:
          "7 кг, конденсаційна з тепловим насосом. DelicateCare для делікатних тканин.",
      },
      {
        slug: "whirlpool-bt-h-719-ua",
        title: "Whirlpool BT H 719 UA",
        brand: "Whirlpool",
        priceUah: 9800,
        condition: "GOOD",
        description:
          "7 кг, 6th Sense, програми для рушників і джинсу. Фільтр пуху чистий.",
      },
      {
        slug: "lg-rc-9066-a3",
        title: "LG RC9066A3",
        brand: "LG",
        priceUah: 11200,
        condition: "GOOD",
        description:
          "9 кг, Dual Inverter Heat Pump. Знижений шум, Dual Open Door (зручне завантаження).",
      },
      {
        slug: "bosch-wtg-8640-ua",
        title: "Bosch WTG8640UA",
        brand: "Bosch",
        priceUah: 8900,
        condition: "FAIR",
        description:
          "8 кг, конденсаційна. Косметика на панелі, сушить рівномірно, сенсор працює.",
      },
      {
        slug: "samsung-dv80t5220aw",
        title: "Samsung DV80T5220AW",
        brand: "Samsung",
        priceUah: 10200,
        condition: "GOOD",
        description:
          "8 кг, OptimalDry + Hygiene Care. Підходить для алергіків (високотемпературна програма).",
      },
      {
        slug: "electrolux-ew7h-489sa",
        title: "Electrolux EW7H489SA",
        brand: "Electrolux",
        priceUah: 13400,
        condition: "LIKE_NEW",
        description:
          "9 кг, GentleCare барабан, тепловий насос. Мало циклів, як з showroom.",
      },
      {
        slug: "whirlpool-ft-m-118-ua",
        title: "Whirlpool FT M 118 UA",
        brand: "Whirlpool",
        priceUah: 7200,
        condition: "FAIR",
        description:
          "8 кг, вентиляційна (відвід повітря). Для приміщення з вентиляцією. Потужна сушка.",
      },
      {
        slug: "lg-rh-90-9-avc",
        title: "LG RH90V9AVC",
        brand: "LG",
        priceUah: 14500,
        condition: "GOOD",
        description:
          "9 кг, EcoHybrid (тепловий насос + конвекція). Швидкі програми Express Cycle.",
      },
      {
        slug: "bosch-wtr-88t90ua",
        title: "Bosch WTR88T90UA",
        brand: "Bosch",
        priceUah: 17600,
        condition: "GOOD",
        description:
          "9 кг, Home Connect, AutoDry сенсори. Преміум-сегмент за ціною б/у.",
      },
      {
        slug: "samsung-dv90bb-5245",
        title: "Samsung DV90BB5245",
        brand: "Samsung",
        priceUah: 15900,
        condition: "LIKE_NEW",
        description:
          "9 кг, AI Dry, SmartThings. Інверторний компресор, низьке споживання.",
      },
    ],
  },
  {
    categorySlug: "telephony",
    products: [
      {
        slug: "samsung-galaxy-s21-128",
        title: "Samsung Galaxy S21 128GB",
        brand: "Samsung",
        priceUah: 8900,
        condition: "GOOD",
        description:
          "Galaxy S21 6.2\", 8/128 ГБ, 120 Гц AMOLED. Акумулятор ~86%, без блокувань. Перевірено Face ID і камери.",
      },
      {
        slug: "iphone-12-64",
        title: "Apple iPhone 12 64GB",
        brand: "Apple",
        priceUah: 11200,
        condition: "GOOD",
        description:
          "iPhone 12, 5G, Super Retina XDR. iCloud вийдено, Find My вимкнено. Комплект: кабель USB‑C.",
      },
      {
        slug: "xiaomi-redmi-note-12-128",
        title: "Xiaomi Redmi Note 12 128GB",
        brand: "Xiaomi",
        priceUah: 5400,
        condition: "LIKE_NEW",
        description:
          "Redmi Note 12, AMOLED 120 Гц, 50 Мп. 5000 mAh, зарядка 33 Вт. Майже не використовувався.",
      },
      {
        slug: "samsung-galaxy-a54-256",
        title: "Samsung Galaxy A54 256GB",
        brand: "Samsung",
        priceUah: 9800,
        condition: "LIKE_NEW",
        description:
          "Galaxy A54 5G, IP67, OIS 50 Мп. 4 роки оновлень Android. Стан як новий.",
      },
      {
        slug: "iphone-11-128",
        title: "Apple iPhone 11 128GB",
        brand: "Apple",
        priceUah: 7600,
        condition: "FAIR",
        description:
          "iPhone 11, подвійна камера. Подряпини на рамці, дисплей чистий. Батарея ~82%.",
      },
      {
        slug: "xiaomi-poco-x5-pro-256",
        title: "Xiaomi POCO X5 Pro 256GB",
        brand: "Xiaomi",
        priceUah: 6900,
        condition: "GOOD",
        description:
          "POCO X5 Pro, Snapdragon 778G, NFC. AMOLED 120 Гц — для ігор і медіа.",
      },
      {
        slug: "samsung-galaxy-s22-256",
        title: "Samsung Galaxy S22 256GB",
        brand: "Samsung",
        priceUah: 12400,
        condition: "GOOD",
        description:
          "Компактний S22 6.1\", потужна нічна зйомка. Перевірено дисплей, динаміки, кнопки.",
      },
      {
        slug: "iphone-13-128",
        title: "Apple iPhone 13 128GB",
        brand: "Apple",
        priceUah: 14800,
        condition: "LIKE_NEW",
        description:
          "iPhone 13, Cinematic mode, A15. Екран без подряпин, готовий до переносу даних.",
      },
      {
        slug: "xiaomi-13t-256",
        title: "Xiaomi 13T 256GB",
        brand: "Xiaomi",
        priceUah: 10200,
        condition: "GOOD",
        description:
          "13T з Leica Optics, 67 Вт зарядка, 144 Гц AMOLED. Dolby Atmos.",
      },
      {
        slug: "samsung-galaxy-z-flip4",
        title: "Samsung Galaxy Z Flip4",
        brand: "Samsung",
        priceUah: 13500,
        condition: "GOOD",
        description:
          "Складний Z Flip4, Cover Screen. Шарнір і складка без дефектів — перевірено.",
      },
      {
        slug: "iphone-se-2022-64",
        title: "Apple iPhone SE 2022 64GB",
        brand: "Apple",
        priceUah: 6200,
        condition: "GOOD",
        description:
          "iPhone SE 3 gen, Touch ID, A15 Bionic. Компактний iOS для тих, хто не хоче великий екран.",
      },
    ],
  },
];

/** Демо-товари для e2e (CAT-07, sold PDP). Slug не змінювати. */
export const DEMO_STATUS_PRODUCTS = [
  {
    slug: "samsung-kholodylnyk-sold-demo-sold",
    title: "Samsung Холодильник SOLD demo",
    brand: "Samsung",
    priceUah: 8900,
    condition: "GOOD" as const,
    status: "SOLD" as const,
    categorySlug: "kholodylnyky",
    description: "Проданий товар для тестів CAT-07.",
  },
  {
    slug: "bosch-kholodylnyk-sold-demo-2-sold",
    title: "Bosch Холодильник SOLD demo 2",
    brand: "Bosch",
    priceUah: 7200,
    condition: "FAIR" as const,
    status: "SOLD" as const,
    categorySlug: "kholodylnyky",
    description: "Другий проданий товар для тестів.",
  },
  {
    slug: "lg-kholodylnyk-draft-demo-draft",
    title: "LG Холодильник DRAFT demo",
    brand: "LG",
    priceUah: 6500,
    condition: "LIKE_NEW" as const,
    status: "DRAFT" as const,
    categorySlug: "kholodylnyky",
    description: "Чернетка — не показується в публічному каталозі.",
  },
] as const;
