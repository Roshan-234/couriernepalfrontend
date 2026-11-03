import type { CorridorContent } from "../types";

/**
 * The Gulf: UAE, Qatar and Saudi Arabia.
 *
 * Short-haul air lanes with a very specific reader. Outbound is a family in
 * Nepal sending to someone working abroad; inbound is that worker sending
 * home. The three differ in what trips people up — restricted medicines in
 * the UAE, addressing in Qatar, conformity and prohibited categories in
 * Saudi Arabia — and the copy is built around those differences.
 */
export const GULF_CORRIDORS: CorridorContent[] = [
  {
    slug: "uae",
    region: "gulf",
    summary:
      "A short, well-served air lane into Dubai and Abu Dhabi, used by migrant workers' families and by exporters treating Dubai as a distribution point.",
    outbound: {
      title: "Courier from Nepal to UAE | Dubai and Abu Dhabi Shipping",
      description:
        "Send parcels and cargo from Nepal to the UAE by air into Dubai and Abu Dhabi. Restricted medicines, attested documents, labour accommodation delivery and customs paperwork.",
      eyebrow: "Nepal to the UAE",
      heading: "Shipping from Nepal to the United Arab Emirates",
      lede:
        "Kathmandu to the Gulf is a short hop with regular cargo capacity, which makes the UAE one of the quickest and best-served destinations we ship to. Most boxes on this lane are going to someone working there — and the single biggest reason one gets held is medicine that is ordinary in Nepal and controlled in the Emirates.",
      serviceType: "International air freight and express courier",
      audience: {
        title: "Families sending to workers, and exporters using Dubai as a hub",
        body:
          "The UAE holds one of the largest Nepali working populations anywhere, spread across construction, hospitality, retail and security work in Dubai, Abu Dhabi and Sharjah. Families send the things that are expensive or unavailable there: Nepali food, clothes for a festival, replacement documents. The second stream is commercial — Dubai is a re-export hub, so Nepali exporters ship into it to reach buyers across the region.",
      },
      goods: [
        "Packaged Nepali food, spices and snacks",
        "Clothes and festival wear for Dashain and Tihar",
        "Attested educational and employment certificates",
        "Handicrafts, pashmina and tea for regional buyers",
        "Replacement documents and legal papers",
      ],
      modes: {
        air: "Direct services operate between Kathmandu and the Gulf, and the sector is short, so air is the normal choice on this lane for anything from an envelope to a pallet.",
        surfaceLabel: "Sea freight",
        surface:
          "Sea is multimodal and slow here: road to Kolkata or Haldia, containerised, then shipped to Jebel Ali. It only earns its place on a large, non-urgent consignment, which on this corridor is unusual.",
        speed:
          "Air on this lane is genuinely quick — usually days, not weeks — because the flight is short and the capacity is there. The variable is clearance at the UAE end, which depends on what is in the box. Sea is a multi-week route and we will say so plainly if you ask about it.",
      },
      paperwork: [
        "A commercial invoice naming the contents in plain language, with a declared value",
        "A packing list for each carton",
        "The recipient's full name as it appears on their Emirates ID or passport, and a UAE mobile number",
        "A prescription and prior approval for any medicine",
        "For commercial goods, the UAE importer's trade licence details",
      ],
      watchOut: {
        title: "Medicines that are ordinary here are controlled there",
        body:
          "This is the one to read twice. The UAE controls a range of preparations that sell over the counter in Nepal, including some common painkillers, cough and cold remedies and sedatives. Sending one without prior approval is not a parcel problem, it is a problem for the person receiving it. Tell us the exact name of the medicine and send the prescription before you book, and we will say whether it can travel and what approval it needs. Do not put medicine in a box unannounced. The UAE publishes its controlled and banned medicines list, and the preparations that catch people out are the ordinary ones — codeine, pseudoephedrine and pholcodine turn up in common painkillers and cough syrups sold over the counter here.",
      },
      arrival: {
        title: "Delivering to labour accommodation",
        body:
          "A lot of recipients on this lane do not live at a street address — they live in company accommodation with a camp or block name, and the delivery is arranged by phone rather than by map. Give us the employer's name, the accommodation or camp name, and a mobile number that is actually answered. That one detail saves more failed deliveries on this corridor than anything else.",
      },
      faqs: [
        {
          question: "Can I send medicine to a family member working in Dubai?",
          answer:
            "Only after we have checked it. Several medicines sold freely in Nepal are controlled in the UAE and need prior approval before import, and the consequences of sending one without it fall on the recipient. Send us the medicine name and the prescription before you book and we will tell you where it stands.",
        },
        {
          question: "Can I send Nepali food to the UAE?",
          answer:
            "Sealed, commercially packaged dry goods — spices, tea, instant noodles, packaged snacks — generally travel. Home-cooked food, meat, pickles in oil and fresh produce are the categories that get stopped. Alcohol is prohibited outright. Send us the contents list before you tape the box.",
        },
        {
          question: "My brother lives in a labour camp. Can you deliver there?",
          answer:
            "Yes, and it is routine for us. We need the employer's name, the accommodation or camp name and a working UAE mobile number. The driver will coordinate by phone, because these addresses are not reliably findable any other way.",
        },
        {
          question: "How much does it cost to send a parcel to Dubai?",
          answer:
            "It depends on weight, dimensions and the service you choose, so we quote from the live tariff rather than a published number. The calculator on our pricing page gives you a figure for your actual box, and we confirm it before the shipment moves.",
        },
      ],
    },
    inbound: {
      title: "Shipping to Nepal from UAE | Dubai to Nepal Cargo",
      description:
        "Send parcels and cargo home to Nepal from Dubai, Abu Dhabi and Sharjah. What your family pays at Nepali customs, restricted items, and delivery to any district.",
      eyebrow: "The UAE to Nepal",
      heading: "Shipping to Nepal from the United Arab Emirates",
      lede:
        "If you are working in the Emirates and sending something back to Dhading, Gorkha, Jhapa or anywhere else, you want to know two things: what your family will have to pay when it lands, and whether it will actually get past Kathmandu. Both answers are below, and neither of them is a percentage we are willing to invent.",
      serviceType: "International air freight and import delivery to Nepal",
      audience: {
        title: "Workers sending home, and traders buying in Dubai",
        body:
          "Most shipments on this lane are a Nepali worker in the Emirates sending something to the family: a phone for a sibling, a washing machine for the house, clothes and gifts before a festival, or the accumulated belongings of a finished contract. Running beside that is a commercial stream — Nepali traders buy in Dubai because it is a re-export hub, and ship the stock home.",
      },
      goods: [
        "Phones, laptops and consumer electronics",
        "Perfumes, cosmetics and watches",
        "Clothes, shoes and gifts before Dashain and Tihar",
        "Household appliances for the family home",
        "End-of-contract personal belongings",
      ],
      modes: {
        air: "Air into Kathmandu is the normal route and the short sector keeps it affordable. Shipments are cleared at Tribhuvan International Airport before they move onward.",
        surfaceLabel: "Sea freight",
        surface:
          "Jebel Ali to Kolkata or Haldia by sea, then overland into Nepal. Worth considering for a full household of goods when somebody is going home for good, and for very little else.",
        speed:
          "Air transit is short. The part that stretches is clearance in Kathmandu, which depends on the contents and on how well the shipment is documented — that is the step we can shorten for you, and the reason we ask for an itemised list rather than 'personal effects'.",
      },
      paperwork: [
        "An itemised list of contents with the price paid for each item",
        "Receipts or invoices for electronics and anything high-value",
        "The recipient's full name, Nepali mobile number and a landmark-based address",
        "A copy of the recipient's citizenship certificate or passport",
        "For an end-of-contract shipment, an inventory of the used personal effects",
      ],
      watchOut: {
        title: "Gold, jewellery and high-value electronics are the problem items",
        body:
          "Precious metals and jewellery are restricted on import into Nepal and cannot simply be packed in with the clothes — tell us before you book if there is any in the shipment. High-value electronics are not restricted but they are assessed carefully, so send the receipt and declare what you paid. An under-declared phone is the fastest way to turn a straightforward clearance into a long one, and the person standing at the counter in Kathmandu is your family, not you.",
      },
      arrival: {
        title: "Getting it out of the valley",
        body:
          "Nepal Customs assesses duty and VAT on arrival at Kathmandu, based on how the goods are classified and the value declared, and a parcel marked 'gift' is assessed the same way as any other. We will not quote a percentage here because it depends on the item and a wrong figure costs you money — send us the itemised list and we will estimate it before you ship, and you can choose to settle the charge yourself rather than leaving it to your parents. Once released, the shipment goes onto our domestic network for delivery to district addresses; see /courier for where we run.",
      },
      faqs: [
        {
          question: "Will my family have to pay customs duty in Nepal?",
          answer:
            "Usually yes. Nepal Customs assesses duty and VAT on the declared value of imported goods, and marking something as a gift does not exempt it. The amount depends on what the item is. Send us the itemised list before you ship, we will estimate the charge, and you can arrange to cover it from your end so nobody at home gets a surprise.",
        },
        {
          question: "Can you deliver to my village outside Kathmandu?",
          answer:
            "Yes. After clearance the shipment joins our domestic network for onward delivery across the districts. A hill or far-western address takes longer than one inside the valley, and the last mile is coordinated by phone with the recipient — so give us a Nepali mobile number that someone answers, and a landmark rather than only a ward number.",
        },
        {
          question: "I am finishing my contract. Can you ship my belongings home?",
          answer:
            "Yes, and book it before you fly rather than after. Used personal effects are documented with an inventory and assessed differently from new goods. If it is a household's worth, sea freight becomes worth discussing; for a few boxes, air is simpler.",
        },
        {
          question: "How does my family track the shipment?",
          answer:
            "Every shipment gets a tracking number that works from any browser on our tracking page, and we update the recipient's Nepali mobile at the main stages. You can follow the same number from the Emirates.",
        },
      ],
    },
  },
  {
    slug: "qatar",
    region: "gulf",
    summary:
      "A dense, short air lane into Doha, serving one of the most concentrated Nepali working populations anywhere.",
    outbound: {
      title: "Courier from Nepal to Qatar | Doha Parcel and Cargo",
      description:
        "Send parcels from Nepal to Qatar by air into Doha. Zone-and-street addressing, company accommodation delivery, restricted items and the documents a shipment needs.",
      eyebrow: "Nepal to Qatar",
      heading: "Shipping from Nepal to Qatar",
      lede:
        "Qatar is small, close and densely Nepali, which makes this one of the simplest lanes we run — right up to the moment somebody writes an address on the box. Qatari addresses are zone, street and building numbers, and a large share of recipients live in company accommodation rather than at an address at all.",
      serviceType: "International air freight and express courier",
      audience: {
        title: "Families sending to workers in Doha and the industrial cities",
        body:
          "Nepalis in Qatar work in construction, hospitality, facilities management, security and transport, and they are concentrated in Doha, the Industrial Area, Al Khor and Mesaieed rather than scattered across a large country. Almost everything on this lane is a family sending something personal: food from home, clothes before a festival, documents for a visa renewal, a replacement phone.",
      },
      goods: [
        "Packaged Nepali food, spices, pickles in sealed jars and snacks",
        "Clothes and festival wear",
        "Documents for visa and employment renewals",
        "Phone and small electronics replacements",
        "Prescription medicines, once cleared with us first",
      ],
      modes: {
        air: "Direct services run between Kathmandu and Doha, and the sector is short. Air handles everything on this lane from envelopes to consolidated cargo.",
        surfaceLabel: "Sea freight",
        surface:
          "Road to Kolkata or Haldia, then sea to Hamad Port. It is a long way round for a destination this close, and it only makes sense for bulky, non-urgent commercial volume.",
        speed:
          "Short flight, frequent capacity, so transit is typically days. What varies is clearance and then the last mile, which on this corridor is more often the slow part than the flight is.",
      },
      paperwork: [
        "A commercial invoice describing the contents and the declared value",
        "A packing list for each carton",
        "The recipient's full name as it appears on their Qatar ID, with a Qatari mobile number",
        "The zone, street and building number, or the employer and accommodation name",
        "A prescription for any medicine, checked with us before booking",
      ],
      watchOut: {
        title: "Qatari addresses are numbers, and many recipients have none",
        body:
          "Qatar addresses by zone number, street number and building number, not by street name — and the majority of recipients on this lane live in employer-provided accommodation where none of that is obvious from the outside. The fix is boring and it works: give us the employer's name, the accommodation or camp name, the zone and street numbers if the recipient knows them, and a Qatari mobile that is answered during the working day. Without the phone number, a correct address is still a failed delivery.",
      },
      arrival: {
        title: "Clearance in Doha, then a phone call",
        body:
          "The shipment clears at Hamad International and moves to local delivery. Our partner calls the recipient to arrange handover, because accommodation blocks and industrial-area addresses are not reliably deliverable unannounced. Shift work is normal here, so tell us if the recipient can only take a call at particular hours.",
      },
      faqs: [
        {
          question: "My brother lives in company accommodation. What address do I give you?",
          answer:
            "The employer's name, the accommodation or camp name, the zone and street numbers if he knows them, and his Qatari mobile number. The mobile matters most — delivery in the Industrial Area and the accommodation blocks is arranged by phone, not by looking for a door.",
        },
        {
          question: "Can I send homemade food or pickles to Qatar?",
          answer:
            "Sealed, commercially packaged dry food generally travels. Home-cooked food, meat products and anything in loose oil are the categories that get stopped, and alcohol is prohibited. Sealed commercial jars are usually fine; a container packed at home usually is not. Send us the contents list first.",
        },
        {
          question: "Can I send medicine to Qatar?",
          answer:
            "Check with us before you pack it. Several preparations that are sold over the counter in Nepal are controlled in the Gulf and need prior approval. Send the medicine name and the prescription and we will tell you whether it can travel.",
        },
      ],
    },
    inbound: {
      title: "Shipping to Nepal from Qatar | Doha to Nepal Cargo",
      description:
        "Send parcels and belongings home to Nepal from Doha. What your family pays at customs, end-of-contract shipments, and delivery to districts outside Kathmandu.",
      eyebrow: "Qatar to Nepal",
      heading: "Shipping to Nepal from Qatar",
      lede:
        "Of every corridor on this site, this is the one most likely to be a worker sending something to a family that is not in Kathmandu. That shapes everything: the questions are about what the family pays, how a box reaches a village address, and how somebody at home who does not read English finds out where it is.",
      serviceType: "International air freight and import delivery to Nepal",
      audience: {
        title: "Workers sending home, and workers coming home",
        body:
          "Almost all of this lane is personal. A worker in Doha sends gifts before Dashain, a phone for a child's schooling, clothes, or money's worth of household goods towards building a house. Then, at the end of a contract, the same person ships everything they have accumulated in one go before flying out. The second case needs planning, and most people leave it too late.",
      },
      goods: [
        "Phones, tablets and small electronics",
        "Clothes, shoes and gifts for Dashain and Tihar",
        "Kitchen and household goods for the family home",
        "Perfumes, chocolates and dates",
        "End-of-contract belongings, shipped as unaccompanied effects",
      ],
      modes: {
        air: "Direct air into Kathmandu, cleared at Tribhuvan International Airport. The default and, for most shipments on this lane, the only sensible choice.",
        surfaceLabel: "Sea freight",
        surface:
          "Hamad Port to Kolkata or Haldia, then overland into Nepal. Only relevant when someone is shipping a genuinely large volume of household goods and can wait weeks for it.",
        speed:
          "The flight is short. Clearance at Kathmandu and then the run out to a district address are what make up most of the elapsed time, and the district leg is the one nobody budgets for. Build in slack if the parcel is meant to arrive before a festival.",
      },
      paperwork: [
        "An itemised list with the price paid for each item",
        "Receipts for electronics and anything high-value",
        "The recipient's full name, Nepali mobile number, district and a landmark",
        "A copy of the recipient's citizenship certificate",
        "An inventory, if you are shipping used personal effects at the end of a contract",
      ],
      watchOut: {
        title: "Your family pays on arrival unless you arrange otherwise",
        body:
          "Nepal Customs assesses duty and VAT when the shipment lands, on the classification of the goods and the declared value, and a box marked 'gift' is assessed like any other. We will not publish a rate, because it depends on the item and a wrong number is money out of someone's pocket. Send us the itemised list before you ship: we will estimate the charge, and you can settle it from Doha so that your parents are not asked for cash they were not expecting.",
      },
      arrival: {
        title: "Reaching a district address, in Nepali",
        body:
          "Most shipments on this lane are not going to Kathmandu. After clearance we move them through our domestic network to the districts — the Terai towns, the hill districts, the far west. Give us the district, the municipality or VDC, a landmark, and a mobile number. Our drivers call in Nepali and arrange the handover by phone; a written address on its own is rarely enough outside the valley. The districts we cover are listed under /courier.",
      },
      faqs: [
        {
          question: "Will my parents have to pay anything when it arrives?",
          answer:
            "Usually there is duty and VAT to settle, assessed by Nepal Customs on the declared value and the type of goods. Send us the itemised list before you ship and we will estimate it — then you can pay it from Qatar rather than leaving your family to find the money at short notice.",
        },
        {
          question: "Can you deliver to my home district, not just Kathmandu?",
          answer:
            "Yes. After clearance the shipment goes onto our domestic network for delivery across the districts. Give us the district, municipality, a landmark and a Nepali mobile number — the last mile outside the valley is arranged by phone, in Nepali, with the person receiving it.",
        },
        {
          question: "I am going home at the end of my contract. When should I book?",
          answer:
            "Before you fly, not after. Shipping used personal effects needs an inventory and a little lead time, and arranging it from Nepal once your things are still in a Doha accommodation block is far harder. Talk to us a few weeks out.",
        },
        {
          question: "How will my family know where the parcel is?",
          answer:
            "We send tracking updates to the recipient's Nepali mobile at the main stages, and the tracking number works from any browser on our tracking page. You can watch the same number from Doha and tell them yourself if that is easier.",
        },
      ],
    },
  },
  {
    slug: "saudi-arabia",
    region: "gulf",
    summary:
      "Air into Riyadh, Jeddah and Dammam, across a country large enough that the domestic leg matters as much as the flight.",
    outbound: {
      title: "Courier from Nepal to Saudi Arabia | Riyadh and Jeddah Cargo",
      description:
        "Send parcels and commercial cargo from Nepal to Saudi Arabia by air. Prohibited categories, product conformity for commercial goods, and delivery beyond the main cities.",
      eyebrow: "Nepal to Saudi Arabia",
      heading: "Shipping from Nepal to Saudi Arabia",
      lede:
        "Saudi Arabia is both the strictest border in the Gulf about what may enter and the largest country in it by some distance. Those two facts drive this page: get the contents right before the box leaves Kathmandu, and remember that clearing customs at Jeddah is not the same as arriving at a worksite four hundred kilometres inland.",
      serviceType: "International air freight and express courier",
      audience: {
        title: "Families sending to workers, spread across a very large country",
        body:
          "Nepalis in Saudi Arabia work in construction, transport, domestic service, hospitality and increasingly on the large development projects, and they are not concentrated in one city the way they are in Qatar. Recipients are in Riyadh, Jeddah and Dammam, but also at project sites well away from any of them. Families send food, clothes, documents and medicine; a smaller commercial stream sends Nepali goods to Saudi importers.",
      },
      goods: [
        "Packaged Nepali food, spices and snacks",
        "Clothes and festival wear",
        "Attested educational and employment certificates",
        "Documents for visa and contract renewals",
        "Commercial consignments for Saudi importers",
      ],
      modes: {
        air: "Air cargo into Riyadh, Jeddah or Dammam, usually with one connection through another Gulf point. The sector is short by the standards of this site and capacity is reliable.",
        surfaceLabel: "Sea freight",
        surface:
          "Road to Kolkata or Haldia, then sea to Jeddah or Dammam. A multi-week route that suits bulk commercial cargo and nothing a family would send.",
        speed:
          "Air transit is short; clearance depends entirely on the contents; and then the Saudi domestic leg can add meaningful time if the recipient is away from a main city. Treat the inland delivery as a real part of the schedule rather than an afterthought.",
      },
      paperwork: [
        "A commercial invoice with an accurate, plain-language description and declared value",
        "A packing list for each carton",
        "The recipient's full name as shown on their iqama or passport, and a Saudi mobile number",
        "For commercial goods, the importer's details and a product conformity certificate",
        "Prior approval and a prescription for any medicine",
      ],
      watchOut: {
        title: "The prohibited list is long, and commercial goods need conformity first",
        body:
          "Alcohol in any form, pork products, and certain religious and printed material are prohibited outright, and the rules are enforced rather than nominal. Separately, and this is the one that catches first-time commercial shippers: many products need a conformity certificate arranged before they arrive, not after. A consignment that lands without it does not get a warning, it gets stuck. If you are shipping anything commercial, talk to us about conformity before you manufacture, let alone before you book. Conformity now runs through the SABER platform, which replaced the older SASO certificates, and customs wants a valid certificate rather than a pending one.",
      },
      arrival: {
        title: "The last few hundred kilometres",
        body:
          "After clearance at Riyadh, Jeddah or Dammam the shipment goes onto a domestic network. Saudi Arabia is large, and a recipient at a project site or a smaller inland town is a separate journey from the gateway city. Give us the city, the district and a Saudi mobile number, and tell us if the recipient is on a worksite rather than at a residential address.",
      },
      faqs: [
        {
          question: "What cannot I send to Saudi Arabia?",
          answer:
            "Alcohol in any form, pork products, and certain religious and printed materials are prohibited. Medicines need prior approval. Beyond that, the usual international restrictions on batteries, aerosols and flammable goods apply. Send us a contents list before you pack and we will go through it with you — this is not a border where you want to find out on arrival.",
        },
        {
          question: "I am shipping commercial goods. What do I need beyond an invoice?",
          answer:
            "In most cases a product conformity certificate arranged before the goods arrive, alongside the importer's details for the customs entry. It is a step that exists before shipping, not after, and a consignment that lands without it will sit. Speak to us early if this is your first commercial shipment on this lane.",
        },
        {
          question: "Can you deliver to a worksite outside Riyadh or Jeddah?",
          answer:
            "Yes, and you should tell us at booking that it is a worksite. Saudi Arabia is big enough that the domestic leg is a real part of the transit time, and site deliveries are coordinated by phone with the recipient or the site office.",
        },
      ],
    },
    inbound: {
      title: "Shipping to Nepal from Saudi Arabia | Jeddah and Riyadh to Nepal",
      description:
        "Send parcels and belongings home to Nepal from Saudi Arabia. Customs duty in Nepal, pilgrimage gifts, end-of-contract shipping and delivery to any district.",
      eyebrow: "Saudi Arabia to Nepal",
      heading: "Shipping to Nepal from Saudi Arabia",
      lede:
        "Two quite different senders use this lane: workers shipping gifts and belongings back to their families, and pilgrims returning from Makkah and Madinah who want to send dates, prayer items and zamzam water home. The second group needs to ask us first, because zamzam is not an ordinary parcel item.",
      serviceType: "International air freight and import delivery to Nepal",
      audience: {
        title: "Workers, and returning pilgrims",
        body:
          "The bulk of this corridor is Nepali workers in Riyadh, Jeddah, Dammam and the project sites sending things home — the same pattern as the other Gulf lanes, with the same end-of-contract shipments at the close of a posting. Overlaid on it is a seasonal pilgrimage stream: Nepali Muslims returning from Hajj and Umrah sending gifts ahead of themselves rather than fighting the baggage allowance.",
      },
      goods: [
        "Dates, prayer mats, caps and religious gifts",
        "Perfumes and attar",
        "Phones, electronics and watches",
        "Clothes and household goods",
        "End-of-contract personal belongings",
      ],
      modes: {
        air: "Air from Jeddah, Riyadh or Dammam into Kathmandu, usually with a Gulf connection, cleared at Tribhuvan International Airport.",
        surfaceLabel: "Sea freight",
        surface:
          "Jeddah or Dammam to Kolkata or Haldia by sea, then overland into Nepal. Relevant for a large household consignment and little else.",
        speed:
          "Air transit is short, Kathmandu clearance is the variable, and the run out to a district address is the leg people forget. If something is meant to arrive before a specific date, book with room to spare.",
      },
      paperwork: [
        "An itemised list with the price paid for each item",
        "Receipts for electronics and high-value goods",
        "The recipient's full name, Nepali mobile number, district and a landmark",
        "A copy of the recipient's citizenship certificate",
        "An inventory for used personal effects at the end of a contract",
      ],
      watchOut: {
        title: "Zamzam water is not an ordinary parcel item",
        body:
          "Zamzam water is carried under its own conditions and cannot simply be boxed in with the dates and the clothes. Ask us before you pack it and we will tell you what is possible on the service you are using. The same caution applies in reverse to anything liquid or decanted into unlabelled containers — it is the single most common reason a returning pilgrim's shipment gets opened.",
      },
      arrival: {
        title: "Duty in Kathmandu, then the district run",
        body:
          "Nepal Customs assesses duty and VAT on arrival based on how the goods are classified and the declared value, and 'gift' is not an exemption. Send us the itemised list before you ship and we will estimate the charge so you can settle it rather than leaving it to the family. After release the shipment joins our domestic network for delivery across the districts; the coverage is listed under /courier.",
      },
      faqs: [
        {
          question: "Can I send zamzam water home to Nepal?",
          answer:
            "Ask us before you pack it. It is carried under its own conditions rather than as an ordinary parcel item, and what is possible depends on the service. Tell us at booking and we will arrange it properly instead of having it pulled out at screening.",
        },
        {
          question: "Will my family pay duty on dates and gifts?",
          answer:
            "Nepal Customs assesses duty and VAT on imported goods including gifts, based on the type of item and the declared value. We will estimate it from your itemised list before you ship, and you can choose to pay the charge yourself so nobody at home is asked for it.",
        },
        {
          question: "Can you deliver outside Kathmandu?",
          answer:
            "Yes. Once cleared, the shipment moves on our domestic network to district addresses. Give us the district, municipality, a landmark and a Nepali mobile number, and expect a hill or far-western delivery to take longer than one in the valley.",
        },
      ],
    },
  },
];
