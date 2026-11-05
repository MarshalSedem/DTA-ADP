/**
 * Twi (Asante) strings for the marketplace and payments modules.
 *
 * STATUS: NEEDS REVIEW — every string below is a machine-drafted translation
 * and must be checked by a native Twi speaker before release. Each line is
 * marked `// needs review`; delete the marker once a reviewer approves that
 * string, so `grep "needs review"` shows what is left.
 *
 * Notes for the reviewer:
 * - Disease names are kept in English (as commonly used by extension services);
 *   please confirm or supply local names.
 * - The sample districts (Ho West, Kpando, Hohoe, Afadzato South) are in the
 *   Volta Region, where Ewe is widely spoken — Ewe may be needed as well.
 * - Placeholders like {count} and {disease} must stay exactly as written.
 */
import type { Dictionary } from './index';

export const TWI_REVIEW_STATUS = 'needs-review' as const;

export const tw: Dictionary = {
  common: {
    verified: 'Wɔasɔ ahwɛ', // needs review
    sampleDataTitle: 'Nhwɛsoɔ nsɛm', // needs review
    sampleDataBody: 'Adetɔnfoɔ, adetɔfoɔ, nneɛma ne ɛboɔ a ɛwɔ ha yi yɛ nhwɛsoɔ ma sɔhwɛ. Ɛnyɛ nokorɛ.', // needs review
    offlineTitle: 'Wonni intanɛt', // needs review
    offlineBody: 'Yɛrekyerɛ nsɛm a ɛwɔ wo fon yi so. Biribiara a woyɛ no, yɛkora so na yɛde bɛkɔ bere a intanɛt bɛba bio.', // needs review
    language: 'Kasa', // needs review
    languageSheetTitle: 'Paw kasa', // needs review
    languageSheetBody: 'Eyi sesa gua ne sika tua afã no. Seesei deɛ, afã a aka no wɔ Borɔfo kasa mu.', // needs review
    twiDraftNote: 'Twi nsɛm yi yɛ nhyehyɛeɛ kɛkɛ; ɛsɛ sɛ obi a ɔka Twi hwɛ mu.', // needs review
    save: 'Kora so', // needs review
    cancel: 'Gyae', // needs review
  },
  diseases: {
    'fall-armyworm': 'Fall armyworm', // needs review (local name?)
    'early-blight': 'Early blight', // needs review (local name?)
  },
  crops: {
    Maize: 'Aburo', // needs review
    Rice: 'Ɛmo', // needs review
    Tomato: 'Ntoosi', // needs review
    Cassava: 'Bankye', // needs review
    Cocoa: 'Kookoo', // needs review
  },
  marketplace: {
    diagnosisLink: 'Hwehwɛ adetɔnfoɔ ma {disease}', // needs review
    list: {
      eyebrow: 'Gua', // needs review
      title: 'Adetɔnfoɔ a wɔasɔ wɔn ahwɛ', // needs review
      description: 'Wɔasɔ adetɔnfoɔ a wɔwɔ ha nyinaa ahwɛ. Toto akatua a wɔde nneɛma bɛba ne berɛ a ɛbɛgye ho ansa na woatɔ.', // needs review
      filterTitle: 'Nneɛma ma {disease}', // needs review
      filterBody: 'Yɛrekyerɛ adetɔnfoɔ a wɔtɔn nneɛma ma {disease}, sɛdeɛ wo nhwehwɛmu kyerɛ.', // needs review
      filterCaution: 'Bisa kuayɛ adwumayɛni (extension officer) ma ɔnsi so dua ansa na woatɔ anaa wode aduro biara agu so.', // needs review
      showAll: 'Kyerɛ adetɔnfoɔ nyinaa', // needs review
      emptyTitle: 'Yɛnhunuu adetɔnfoɔ a wɔasɔ wɔn ahwɛ', // needs review
      emptyBody: 'Seesei, adetɔnni biara a wɔasɔ no ahwɛ ntɔn nneɛma ma ɔhaw yi.', // needs review
      location: '{town}, {district} · {km} km fi ha', // needs review
      delivery: {
        one: 'Wɔde bɛba {fee} · da {count}', // needs review
        other: 'Wɔde bɛba {fee} · nna {count}', // needs review
      },
      productCount: {
        one: 'Adeɛ {count}', // needs review
        other: 'Nneɛma {count}', // needs review
      },
      matchingCount: {
        one: 'Adeɛ {count} ma {disease}', // needs review
        other: 'Nneɛma {count} ma {disease}', // needs review
      },
      verifiedOnlyNote: 'Adetɔnfoɔ a mpɔtam kuayɛ adwumayɛbea asɔ wɔn ahwɛ nko ara na yɛkyerɛ wɔn.', // needs review
      openDealer: 'Bue {name}', // needs review
      buyersEntryTitle: 'Wopɛ sɛ wotɔn wo nnɔbaeɛ?', // needs review
      buyersEntryBody: 'Hwɛ adetɔfoɔ a wɔasɔ wɔn ahwɛ, sɛdeɛ sika a ɛbɛka wo nsa wɔ akwantuo akatua akyi te.', // needs review
    },
    buyers: {
      headerTitle: 'Adetɔfoɔ', // needs review
      eyebrow: 'Adetɔfoɔ hwehwɛ', // needs review
      title: '{crop} adetɔfoɔ a wɔyɛ papa', // needs review
      description: 'Yɛahyehyɛ wɔn sɛdeɛ sika a ɛbɛka wo nsa wɔ akwantuo akatua akyi te, ɛnyɛ ɛboɔ kɛseɛ a wɔbɔ no.', // needs review
      cropLabel: 'Wo nnɔbaeɛ', // needs review
      howTitle: 'Sɛdeɛ yɛhyehyɛ adetɔfoɔ', // needs review
      howBody: 'Deɛ ɛbɛka wo nsa = ɛboɔ a wɔde ma wo yi akwantuo akatua a wobɛtua. Adetɔni a ɔdi kan no na ɔma wo sika pii sene obiara ma kilo 100.', // needs review
      rank: '#{rank}', // needs review
      rankBest: '#{rank} · Ne nyinaa mu papa', // needs review
      highestHeadline: 'Ɛboɔ a ɛkɔ soro sene biara', // needs review
      buyerMeta: '{type} · {market}, {district}', // needs review
      offer: 'Ɛboɔ ma kilo 100', // needs review
      transport: 'Akwantuo (nsusuiɛ)', // needs review
      net: 'Deɛ ɛbɛka wo nsa ma kilo 100', // needs review
      minBags: {
        one: 'Ɔtɔ kotoku {count} (kilo 100) anaa deɛ ɛboro saa', // needs review
        other: 'Ɔtɔ nkotokuo {count} (kilo 100 biara) anaa deɛ ɛboro saa', // needs review
      },
      emptyTitle: 'Adetɔfoɔ a wɔasɔ wɔn ahwɛ nni hɔ mmom', // needs review
      emptyBody: 'Adetɔni biara a wɔasɔ no ahwɛ mmɔɔ ɛboɔ mma nnɔbaeɛ yi mmom.', // needs review
      footnote: 'Akwantuo akatua yɛ nsusuiɛ, na ɛboɔ betumi asesa.', // needs review
      compareMarkets: 'Toto gua so ɛboɔ ho', // needs review
      types: {
        aggregator: 'Nnɔbaeɛ boaboafoɔ', // needs review
        processor: 'Nnɔbaeɛ nsakrafoɔ', // needs review
        trader: 'Dwadini', // needs review
      },
    },
    detail: {
      headerTitle: 'Adetɔnni', // needs review
      notFoundTitle: 'Yɛnhunuu adetɔnni no', // needs review
      notFoundBody: 'Ebia adetɔnni yi nni ha bio.', // needs review
      notVerifiedBadge: 'Wɔnsɔɔ no nhwɛɛ mmom', // needs review
      notVerifiedTitle: 'Wɔda so resɔ adetɔnni yi ahwɛ', // needs review
      notVerifiedBody: 'Worentumi ntɔ adeɛ mfi adetɔnni hɔ wɔ app yi so kɔsi sɛ wɔbɛsɔ no ahwɛ.', // needs review
      verificationTitle: 'Deɛ enti a wɔasɔ adetɔnni yi ahwɛ', // needs review
      verifiedBy: 'Deɛ ɔsɔɔ hwɛeɛ', // needs review
      verifiedOn: 'Da a wɔsɔɔ hwɛeɛ', // needs review
      reference: 'Nkyerɛkyerɛmu nɔma', // needs review
      deliveryTitle: 'Nneɛma a wɔde bɛba', // needs review
      deliveryFee: 'Akatua a wɔde bɛba', // needs review
      deliveryTime: 'Berɛ a ɛbɛgye', // needs review
      deliveryDays: {
        one: 'Da {count}', // needs review
        other: 'Nna {count}', // needs review
      },
      productsTitle: 'Nneɛma', // needs review
      productsHint: 'Mia adeɛ bi so na hwɛ ne ɛboɔ nyinaa.', // needs review
      unitPrice: '{price} · {unit}', // needs review
      forDisease: 'Ma {disease}', // needs review
      matchesDiagnosis: 'Ɛne wo nhwehwɛmu hyia', // needs review
      inStock: 'Ɛwɔ hɔ', // needs review
      outOfStock: 'Asa', // needs review
      selected: 'Woapaw', // needs review
      continue: 'Kɔ so ne adeɛ yi', // needs review
      categories: {
        cropProtection: 'Nnɔbaeɛ ho banbɔ', // needs review
        seed: 'Aba', // needs review
        fertiliser: 'Fɛtilaesa', // needs review
      },
    },
    breakdown: {
      title: 'Ɛboɔ mu nkyekyɛmu', // needs review
      item: 'Adeɛ no ɛboɔ ({price} × {count})', // needs review
      delivery: 'Akatua a wɔde bɛba', // needs review
      total: 'Ne nyinaa', // needs review
      note: 'Akatua biara nhintaw mu. Eyi ne sika nyinaa a wobɛtua.', // needs review
    },
  },
  payments: {
    noRealMoneyTitle: 'Nhwɛsoɔ: ɛnyɛ sika ankasa', // needs review
    noRealMoneyBody: 'Eyi yɛ sika tua nhwɛsoɔ a ɛde nhwɛsoɔ nsɛm di dwuma. Yɛntua sika biara, na yɛmfa wo nsɛm ankasa mma obiara.', // needs review
    methods: {
      mobileMoney: 'Mobile money (nhwɛsoɔ)', // needs review
      cashOnDelivery: 'Tua bere a nneɛma no aba (nhwɛsoɔ)', // needs review
    },
    sync: {
      savedOnPhone: 'Yɛakora so wɔ fon yi so', // needs review
      synced: 'Yɛde akɔ', // needs review
      syncingTitle: 'Yɛde rekɔ…', // needs review
      syncingBody: 'Yɛde sika tua a yɛakora so wɔ fon yi so rekɔ.', // needs review
      pendingTitle: {
        one: 'Sika tua {count} wɔ fon yi so', // needs review
        other: 'Sika tua {count} wɔ fon yi so', // needs review
      },
      pendingBody: 'Yɛde bɛkɔ ankasa bere a intanɛt bɛba.', // needs review
    },
    review: {
      headerTitle: 'Hwɛ wo adetɔ mu', // needs review
      eyebrow: 'Sika tua nhwɛsoɔ · anammɔn 1 wɔ 2 mu', // needs review
      title: 'Hwɛ wo adetɔ mu', // needs review
      fromDealer: 'Efi {dealer}', // needs review
      quantity: 'Dodoɔ', // needs review
      decrease: 'Yi baako fi mu', // needs review
      increase: 'Fa baako ka ho', // needs review
      continue: 'Kɔ so', // needs review
      unavailableTitle: 'Worentumi ntɔ adeɛ yi', // needs review
      unavailableBody: 'Ebia asa, anaa wɔnsɔɔ adetɔnni no nhwɛɛ.', // needs review
    },
    confirm: {
      headerTitle: 'Si sika tua no so dua', // needs review
      eyebrow: 'Sika tua nhwɛsoɔ · anammɔn 2 wɔ 2 mu', // needs review
      title: 'Si sika tua nhwɛsoɔ no so dua', // needs review
      youPay: 'Wobɛtua', // needs review
      toDealer: 'ama {dealer}', // needs review
      itemLine: '{product} × {count}', // needs review
      methodLabel: 'Ɔkwan a wobɛfa so atua (nhwɛsoɔ)', // needs review
      confirm: 'Si sika tua nhwɛsoɔ no so dua', // needs review
      failed: 'Yɛantumi ankora sika tua no so. Yɛsrɛ wo, san sɔ hwɛ.', // needs review
    },
    receipt: {
      headerTitle: 'Tua krataa', // needs review
      title: 'Sika tua nhwɛsoɔ no awie', // needs review
      subtitle: 'Yɛantua sika biara.', // needs review
      receiptNumber: 'Tua krataa nɔma', // needs review
      date: 'Da', // needs review
      dealer: 'Adetɔnni', // needs review
      item: 'Adeɛ', // needs review
      itemValue: '{product} · {unit}', // needs review
      method: 'Ɔkwan a wofaa so tuaeɛ', // needs review
      status: 'Tebea', // needs review
      done: 'Awie', // needs review
      back: 'San kɔ me sika ho nsɛm', // needs review
      notFoundTitle: 'Yɛnhunuu tua krataa no', // needs review
      notFoundBody: 'Tua krataa yi nni fon yi so.', // needs review
    },
    ledger: {
      eyebrow: 'Sika tua nhwɛsoɔ', // needs review
      title: 'Me sika ho nsɛm', // needs review
      description: 'Sika tua nhwɛsoɔ biara a woyɛ no wɔ ha. Sika ankasa biara nni mu.', // needs review
      summary: {
        one: 'Sika tua {count} · {total} nyinaa', // needs review
        other: 'Sika tua {count} · {total} nyinaa', // needs review
      },
      emptyTitle: 'Sika tua biara nni ha mmom', // needs review
      emptyBody: 'Sika tua nhwɛsoɔ a wobɛyɛ afi adetɔnni krataa so bɛba ha.', // needs review
      openReceipt: 'Bue tua krataa {number}', // needs review
      rowMeta: '{number} · {date}', // needs review
    },
  },
  weather: {
    cardTitle: 'Ewiem tebea nnawɔtwe yi', // needs review
    forDistrict: 'Ewiem tebea wɔ {district}', // needs review
    today: 'Ɛnnɛ', // needs review
    tomorrow: 'Ɔkyena', // needs review
    weekdays: {
      sun: 'Kwasiada', // needs review
      mon: 'Dwoada', // needs review
      tue: 'Benada', // needs review
      wed: 'Wukuada', // needs review
      thu: 'Yawoada', // needs review
      fri: 'Fiada', // needs review
      sat: 'Memeneda', // needs review
    },
    tempRange: '{max}° / {min}°', // needs review
    nowTemp: '{temp}°', // needs review
    rainChance: 'Nsuo bɛtɔ: {percent}%', // needs review
    rainAmount: 'Nsuo {mm} mm', // needs review
    rainBoth: 'Nsuo bɛtɔ: {percent}% · {mm} mm', // needs review
    todaySummary: '{range} · {rain}', // needs review
    chanceShort: '{percent}%', // needs review
    noRainData: 'Nsuo ho nsɛm nni hɔ', // needs review
    viewForecast: 'Hwɛ nnafua 7 ewiem tebea', // needs review
    updated: 'Yɛyɛɛ no foforɔ {time}', // needs review
    offlineCached: 'Wonni intanɛt. Yɛrekyerɛ ewiem tebea a ɛfiri {time}.', // needs review
    staleCached: 'Yɛantumi anyɛ no foforɔ. Yɛrekyerɛ ewiem tebea a ɛfiri {time}.', // needs review
    loading: 'Yɛrenya ewiem tebea…', // needs review
    errorTitle: 'Yɛantumi annya ewiem tebea', // needs review
    errorBody: 'Hwɛ wo intanɛt na san sɔ hwɛ.', // needs review
    retry: 'San sɔ hwɛ', // needs review
    consentTitle: 'Hwɛ ewiem tebea ma wo afuo', // needs review
    consentBody: 'Sɛ yɛbɛkyerɛ ewiem tebea a, AgriTrust de wo mpɔtam beaeɛ ({district}) bɛmena Open-Meteo, ewiem tebea dwumadie a wontua hwee. Yɛremfa wo din ne wo fon nɔma mma da.', // needs review
    consentAccept: 'Kyerɛ ewiem tebea', // needs review
    turnOff: 'Dum ewiem tebea', // needs review
    attribution: 'Weather data by Open-Meteo.com', // needs review (licence credit; keep in English)
    pageHeader: 'Ewiem tebea', // needs review
    pageEyebrow: 'Ewiem tebea nkɔmhyɛ', // needs review
    pageTitle: 'Nnafua 7 ewiem tebea', // needs review
    pageDescription: 'Ewiem tebea ma {district}. Ewiem tebea betumi asesa, enti hwɛ bio ansa na woadua, wopete aduro anaa wotwa nnɔbaeɛ.', // needs review
    privacyNote: 'Wo mpɔtam beaeɛ nko ara na yɛde mena Open-Meteo. Wobɛtumi adum yei berɛ biara.', // needs review
    conditions: {
      clear: 'Ewiem ho tew', // needs review
      mainlyClear: 'Ewiem ho tew kakra', // needs review
      partlyCloudy: 'Mununkum kakra', // needs review
      cloudy: 'Mununkum', // needs review
      fog: 'Bɔ', // needs review
      drizzle: 'Nsuo nketewa', // needs review
      rain: 'Nsuo', // needs review
      heavyRain: 'Nsuo kɛseɛ', // needs review
      showers: 'Nsuo a ɛtɔ ntɛm', // needs review
      thunderstorm: 'Aprannaa ne nsuo', // needs review
      other: 'Ewiem tebea ahodoɔ', // needs review
    },
  },
};
