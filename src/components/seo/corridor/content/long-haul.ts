import type { CorridorContent } from "../types";

/**
 * North America, the United Kingdom and Australia.
 *
 * The settled-diaspora lanes: no direct flights, long-haul air with a
 * multi-week sea alternative that only earns its place on a relocation.
 * What separates them is the receiving border — US food and herbal
 * restrictions, UK import VAT on the declared value, Canadian winter and
 * bilingual labelling, Australian biosecurity.
 */
export const LONG_HAUL_CORRIDORS: CorridorContent[] = [
  {
    slug: "usa",
    region: "long-haul",
    summary:
      "Long-haul air with a connection, or multi-week sea through Kolkata. Nepal's largest settled diaspora, plus the handicraft and specialty-food export trade.",
    outbound: {
      title: "Shipping from Nepal to USA | Cargo and Courier to America",
      description:
        "Send parcels and commercial cargo from Nepal to the United States by air or sea. Food and herbal restrictions, export clearance, customs documents and delivery.",
      eyebrow: "Nepal to the USA",
      heading: "Shipping from Nepal to the United States",
      lede:
        "Two quite different shipments leave Kathmandu for America: a box for a student or a relative, and a commercial consignment of pashmina, handicrafts, tea or coffee for a US buyer. They travel the same long-haul air lanes and run into the same wall — American rules on food, plant material and anything that looks like a supplement.",
      serviceType: "International air freight and sea freight",
      audience: {
        title: "A settled diaspora, and the export trade that serves it",
        body:
          "The United States holds the largest settled Nepali population outside South Asia, across Texas, New York, Maryland, Virginia and California, with a steady student intake alongside it. Half of this lane is families and students. The other half is commercial: Nepali handicraft, textile and specialty-food producers selling to US retailers and online marketplaces, often shipping samples first and pallets later.",
      },
      goods: [
        "Pashmina, felt and woollen goods",
        "Handicrafts, singing bowls and metalwork",
        "Himalayan tea and specialty coffee",
        "Documents, transcripts and legal papers",
        "Personal parcels for students and family",
      ],
      modes: {
        air: "There is no direct flight between Nepal and the United States, so every air shipment connects — commonly through a Gulf hub, Delhi or an East Asian gateway — and clears US customs at the arrival airport.",
        surfaceLabel: "Sea freight",
        surface:
          "Road to Kolkata or Haldia, containerised there, then sailed to a US east- or west-coast port. Cheaper by a wide margin for volume and slower by a wider one.",
        speed:
          "Air is the practical choice for anything parcel-sized: days rather than weeks, with the exact figure set by the service you choose and by how quickly US customs releases the shipment. Sea freight is a multi-week commitment that makes sense for pallets, furniture or a household move and for almost nothing else.",
      },
      paperwork: [
        "A commercial invoice describing the goods in plain language — not 'gift' or 'sample'",
        "A packing list showing the contents of each carton",
        "A declared value that matches the invoice",
        "Shipper and recipient details with a working US phone number",
        "For commercial goods, the US importer's details for the customs entry",
      ],
      watchOut: {
        title: "Food, plant material and herbal products get examined",
        body:
          "US border agencies restrict meat and dairy, seeds and untreated plant material, and they regulate herbal and ayurvedic preparations and anything presented as a supplement or a remedy. Home-made pickles, loose spices in unmarked bags and jars packed at home are a recurring reason a parcel from Nepal is held or destroyed. Sealed, commercially packaged tea, coffee and dry snacks are generally fine. Tell us what is in the box before you seal it and we will say what can travel.",
      },
      arrival: {
        title: "What happens at the American end",
        body:
          "The shipment clears at the gateway airport or port and then moves onto a domestic network to the recipient's address. Duty and any broker fee are settled as part of that clearance. Who pays them depends on the terms agreed when you book, so settle that question before the shipment leaves rather than when it lands — it is the most common cause of an awkward phone call on this lane.",
      },
      faqs: [
        {
          question: "Can I send Nepali food to the United States?",
          answer:
            "Some of it. Sealed, commercially packaged dry goods such as tea, coffee and packaged snacks usually travel. Meat and dairy, home-cooked food, pickles in oil, seeds and fresh produce are the categories that get held. Send us a contents list before you pack and we will tell you what we can carry.",
        },
        {
          question: "Is air or sea freight better for shipping to the USA?",
          answer:
            "Air for anything parcel-sized and anything with a date on it. Sea only once the volume is large enough that a multi-week wait buys a saving worth having — a household move, a pallet of stock, furniture. The calculator on our pricing page compares the two for your actual weight and dimensions.",
        },
        {
          question: "Do I need an export licence from Nepal?",
          answer:
            "Ordinary personal parcels and most commercial goods do not. Antiques, religious artefacts, products from protected species and certain medicinal plants do need clearance from the relevant Nepali authority, and we will tell you if your goods fall into one of those categories before you commit to a shipment.",
        },
        {
          question: "How much will it cost?",
          answer:
            "It depends on weight, dimensions and service, so we quote it from the live tariff rather than publishing a number that would be wrong for most shipments. Price your actual box on our pricing page and we will confirm it in writing before it moves.",
        },
      ],
    },
    inbound: {
      title: "Shipping to Nepal from USA | Send Parcels Home from America",
      description:
        "Send parcels home to Nepal from the United States. What your family pays at Nepali customs, sending medicines, delivery to any district, and how to track it.",
      eyebrow: "The USA to Nepal",
      heading: "Shipping to Nepal from the United States",
      lede:
        "If you are in America sending something home — to parents in Pokhara, a brother in Biratnagar, a shop you still own in Kathmandu — you want the answers to two questions. What will the family have to pay when it arrives, and will it actually reach an address outside the valley. This page answers both, and refuses to invent a duty percentage for you.",
      serviceType: "International air freight, sea freight and delivery in Nepal",
      audience: {
        title: "The Nepali diaspora in America, sending to people who are older",
        body:
          "Most shipments on this lane start with someone who has settled in the United States and is sending something back. The pattern is distinctive: medicines, supplements and medical devices for ageing parents, a laptop for a student sibling, winter clothing, wedding gifts. The sender is usually the one paying, the recipient is often not confident in English or with paperwork, and the shipment is going somewhere a courier has never been. Alongside this runs a smaller commercial stream importing US equipment.",
      },
      goods: [
        "Medicines, supplements and medical devices",
        "Laptops, phones and other electronics",
        "Clothing, shoes and winter gear",
        "Baby and childcare items",
        "Documents and certificates",
      ],
      modes: {
        air: "Air freight connects through a Gulf or Asian hub into Tribhuvan International Airport in Kathmandu, where the shipment is customs-cleared before it moves onward.",
        surfaceLabel: "Sea freight",
        surface:
          "Sea to Kolkata or Haldia and then overland into Nepal. The route for a container of household goods when somebody is moving home for good — not for a parcel.",
        speed:
          "By air, days rather than weeks in transit, plus however long clearance at Kathmandu takes. Clearance is the step that varies, and it varies with the contents and the paperwork rather than with the airline. Sea freight is a multi-week route and we only recommend it for a full relocation.",
      },
      paperwork: [
        "An itemised invoice or receipt for each item, showing the price paid",
        "A packing list the recipient can show at customs",
        "The recipient's full name, Nepali mobile number and a landmark-based address",
        "A copy of the recipient's citizenship certificate or passport",
        "For medicines, the original packaging and a copy of the prescription",
      ],
      watchOut: {
        title: "The person in Nepal pays the duty, unless you arrange otherwise",
        body:
          "Nepal Customs assesses duty and VAT on goods arriving from abroad, based on how the item is classified and the value declared. Marking a parcel 'gift' does not exempt it from assessment. We will not quote you a percentage on this page, because it depends on the item and a wrong figure costs you real money — send us an itemised list and we will give you an estimate before you ship, and you can settle the charge from the US so that nobody at home is handed an unexpected bill.",
      },
      arrival: {
        title: "Getting it past Kathmandu",
        body:
          "Most people assume a parcel stops in the valley. It does not have to. Once cleared, we move shipments onward to district addresses across Nepal through our own domestic network — see the district pages under /courier for where we deliver. Give us a Nepali mobile number that is actually answered and a landmark rather than only a ward number: outside the valley the last mile is arranged on the phone, in Nepali, not from a street map.",
      },
      faqs: [
        {
          question: "Will my family in Nepal have to pay customs duty?",
          answer:
            "Usually yes. Nepal Customs assesses duty and VAT on the declared value of imported goods, including items sent as gifts, and the amount depends on what the item is. Send us the itemised list before you ship, we will estimate it, and you can arrange to cover the charge yourself rather than leaving it to the recipient.",
        },
        {
          question: "Can I send medicine to my parents in Nepal?",
          answer:
            "Ordinary over-the-counter medicines and supplements usually travel, provided they are in original packaging with the labelling intact and a copy of the prescription is included. Prescription drugs, controlled substances and anything needing cold storage are a different conversation — ask us before you buy, not after.",
        },
        {
          question: "Can you deliver outside Kathmandu?",
          answer:
            "Yes. After clearance in Kathmandu the shipment joins our domestic network for onward delivery to district addresses. A hill or far-western district takes longer than the valley, and delivery is coordinated by phone with the recipient, so the mobile number matters more than the written address.",
        },
        {
          question: "How does my family track the shipment?",
          answer:
            "Every shipment has a tracking number that works from any browser on our tracking page, and we send updates to the recipient's Nepali mobile at the main stages. You can follow the same number from the US, which is usually easier for everyone.",
        },
      ],
    },
  },
  {
    slug: "uk",
    region: "long-haul",
    summary:
      "Long-haul air into London and the regional airports, or sea to Felixstowe. Serves the Gurkha settlement towns and a large student and care-worker population.",
    outbound: {
      title: "Shipping from Nepal to UK | Cargo and Courier to Britain",
      description:
        "Send parcels and cargo from Nepal to the United Kingdom by air or sea. Declared value and import VAT, restricted food categories, and what the recipient has to do.",
      eyebrow: "Nepal to the UK",
      heading: "Shipping from Nepal to the United Kingdom",
      lede:
        "Britain has one of the oldest Nepali communities outside Nepal and one of the newest at the same time — Gurkha families settled around Aldershot and Folkestone for generations, and a student and care-worker population that has grown quickly in the big cities. Parcels from Nepal go to both, and the thing that decides how smoothly they land is the number you write on the invoice.",
      serviceType: "International air freight and sea freight",
      audience: {
        title: "Gurkha settlement towns, students, and the retail trade",
        body:
          "The established community is concentrated in the garrison towns — Aldershot, Farnborough, Ashford, Folkestone — where Gurkha families settled, and sends and receives a lot of family traffic. The newer population is in London, Manchester, Birmingham and the university cities: students, care workers and nurses. Running alongside both is a modest export trade in pashmina, cashmere and handicrafts to British retailers and market traders.",
      },
      goods: [
        "Pashmina and cashmere shawls",
        "Handicrafts, brassware and singing bowls",
        "Daura suruwal, saris and festival wear for weddings",
        "Academic transcripts and certified documents",
        "Himalayan tea and packaged specialty food",
      ],
      modes: {
        air: "No direct service operates, so air cargo connects through a Gulf hub or Delhi into London or a regional UK airport, and clears on arrival.",
        surfaceLabel: "Sea freight",
        surface:
          "Road to Kolkata or Haldia, then sea to Felixstowe, Southampton or London Gateway. Multi-week, and sensible only for commercial volume or a household move.",
        speed:
          "Air is days rather than weeks, with clearance and the UK domestic leg on top. Sea is a multi-week route. If a shipment is for a wedding or a term date, use air and leave margin — the UK end is reliable, but a shipment held for a charge query sits until somebody responds to it.",
      },
      paperwork: [
        "A commercial invoice with an honest declared value and a plain description",
        "A packing list for each carton",
        "The recipient's full name, UK address with postcode, and a mobile number",
        "An email address for the recipient, because charge notifications go there",
        "For commercial goods, the UK importer's details for the customs entry",
      ],
      watchOut: {
        title: "The declared value decides the import charge, and under-declaring makes it worse",
        body:
          "The UK raises import charges against the value declared on the invoice. Who settles them depends on the terms agreed when you book — sender or recipient — and that needs deciding before the shipment leaves. The temptation to write a low value is a false economy: an under-declared shipment attracts scrutiny, the charge gets recalculated anyway, and the recipient ends up dealing with it. Declare honestly and tell us which side is paying.",
      },
      arrival: {
        title: "What the recipient has to do",
        body:
          "After clearance the shipment moves onto a UK domestic network. Where charges are payable by the recipient, they are usually notified by text or email and the shipment waits until they respond — which is why we ask for an email address as well as a phone number. A shipment nobody answers for is a shipment sitting in a depot, and that is the most common delay on this lane.",
      },
      faqs: [
        {
          question: "Who pays the import charges, me or the person receiving it?",
          answer:
            "Whichever you choose at booking — but choose. UK import charges are raised against the declared value, and if nobody has agreed to pay them in advance the recipient gets a notification and the shipment waits. Tell us at booking and we will set the shipment up that way.",
        },
        {
          question: "Can I send Nepali food to the UK?",
          answer:
            "Sealed, commercially packaged dry goods such as tea, spices and snacks generally travel. Meat and dairy products are restricted on personal imports from outside the EU, and home-cooked food, pickles in oil and fresh produce are the usual reasons a parcel gets opened. Send us the contents list first.",
        },
        {
          question: "Can you ship a pashmina or a wedding outfit in time for a date?",
          answer:
            "Usually, by air, with margin. We will not promise a number of days on a public page because the honest answer depends on the service and on clearance. Tell us the date when you book and we will tell you what is realistic and what service it needs.",
        },
      ],
    },
    inbound: {
      title: "Shipping to Nepal from UK | Send Parcels and Household Goods Home",
      description:
        "Send parcels and household goods home to Nepal from Britain. Customs duty in Nepal, shipping personal effects when returning, and delivery to any district.",
      eyebrow: "The UK to Nepal",
      heading: "Shipping to Nepal from the United Kingdom",
      lede:
        "This corridor carries two things the others do not carry in the same proportion: ordinary parcels from students and care workers, and entire households going back. Gurkha families returning to Nepal after a working life in Britain ship furniture and possessions, not boxes, and that is a different service with different paperwork.",
      serviceType: "International air freight, sea freight and delivery in Nepal",
      audience: {
        title: "Students and care workers sending home, and families relocating",
        body:
          "The day-to-day traffic is what you would expect: people working or studying in Britain sending clothes, electronics, supplements and gifts to family in Nepal. The distinctive stream is relocation. Nepali families who settled in Britain — Gurkha pensioners in particular — move back, and when they do they ship the contents of a house by sea rather than a few boxes by air.",
      },
      goods: [
        "Clothes, shoes and gifts",
        "Laptops, phones and small electronics",
        "Supplements, baby products and medical items",
        "Books and study materials",
        "Household furniture and personal effects for a permanent return",
      ],
      modes: {
        air: "Air through a Gulf or Asian hub into Kathmandu, cleared at Tribhuvan International Airport. Right for parcels and anything urgent.",
        surfaceLabel: "Sea freight",
        surface:
          "Felixstowe, Southampton or London Gateway to Kolkata or Haldia, then overland into Nepal. This is the route for a household move, and it is a real option on this lane rather than a theoretical one.",
        speed:
          "Air is days plus clearance in Kathmandu. Sea is a multi-week commitment and needs planning around the date somebody actually flies home. Start a relocation conversation months ahead, not weeks.",
      },
      paperwork: [
        "An itemised list with the price paid for each item",
        "Receipts for electronics and anything high-value",
        "A full room-by-room inventory for a household relocation",
        "The recipient's full name, Nepali mobile number, district and a landmark",
        "A copy of the recipient's citizenship certificate or passport",
      ],
      watchOut: {
        title: "Used personal effects are assessed differently from new goods",
        body:
          "If you are moving back to Nepal, the shipment is not a parcel and should not be declared like one. Used household effects are documented with a detailed inventory and are assessed on a different basis from new goods — a correctly prepared inventory is worth real money at clearance, and a box labelled 'household items' is worth the opposite. We will go through the inventory with you before the container is packed, which is the only point at which it can be done properly.",
      },
      arrival: {
        title: "Clearance, then wherever home is",
        body:
          "Nepal Customs assesses duty and VAT on arrival, on the classification of the goods and the declared value — gifts included. We estimate it in advance from your list so you are not working it out at the counter. After release, parcels join our domestic network for delivery across the districts, and a household shipment is delivered to the address you are moving to. Our district coverage is listed under /courier.",
      },
      faqs: [
        {
          question: "I am moving back to Nepal. Can you ship my household goods?",
          answer:
            "Yes, by sea through Kolkata or Haldia and then overland. It needs a detailed room-by-room inventory, because used personal effects are assessed differently from new goods and the inventory is what proves it. Start the conversation months before you fly — this is not a booking that works at short notice.",
        },
        {
          question: "Will my family pay duty on a parcel from the UK?",
          answer:
            "Nepal Customs assesses duty and VAT on the declared value and the type of goods, and a gift label does not exempt it. Send us the itemised list before you ship, we will estimate the charge, and you can settle it from Britain so the recipient is not asked for it.",
        },
        {
          question: "Can you deliver outside Kathmandu?",
          answer:
            "Yes. After clearance, shipments move on our domestic network to district addresses across Nepal. Give us the district, the municipality, a landmark and a Nepali mobile number — outside the valley the delivery is arranged by phone with the recipient.",
        },
        {
          question: "How do we track it?",
          answer:
            "There is a tracking number for every shipment, usable from any browser on our tracking page, and we update the recipient's Nepali mobile at the main stages.",
        },
      ],
    },
  },
  {
    slug: "canada",
    region: "long-haul",
    summary:
      "Long-haul air into Toronto, Vancouver and Montreal, or sea to either coast. A young student and permanent-resident population, and a winter that affects the last mile.",
    outbound: {
      title: "Shipping from Nepal to Canada | Cargo and Courier",
      description:
        "Send parcels and cargo from Nepal to Canada by air or sea. Food and plant restrictions, bilingual labelling for commercial goods, winter delivery and documents.",
      eyebrow: "Nepal to Canada",
      heading: "Shipping from Nepal to Canada",
      lede:
        "Canada's Nepali population is young and recent — students and new permanent residents in Toronto, Calgary, Winnipeg and Edmonton rather than a community settled over generations. That shapes what gets sent: documents for credential assessments, warm clothing, and the things a new arrival has not replaced yet. It also means a lot of recipients live somewhere that winter reaches.",
      serviceType: "International air freight and sea freight",
      audience: {
        title: "Students, new permanent residents, and the paperwork that follows them",
        body:
          "This lane is defined by people in their first few years in Canada. They need documents from home — transcripts, degree certificates and attestations for educational credential assessment — and they need them to arrive intact and traceable. Families send winter woollens, festival wear, food and the small comforts of a house someone has just left. The commercial stream is smaller: Nepali handicrafts and textiles to Canadian retailers.",
      },
      goods: [
        "Academic transcripts, degree certificates and attested documents",
        "Pashmina, woollens and winter-appropriate clothing",
        "Festival and wedding wear",
        "Handicrafts and gifts",
        "Packaged tea, coffee and dry food",
      ],
      modes: {
        air: "Air cargo connects through a Gulf, European or East Asian hub into Toronto, Vancouver or Montreal, and clears at the arrival airport.",
        surfaceLabel: "Sea freight",
        surface:
          "Road to Kolkata or Haldia, then sea to Vancouver for the west or Montreal for the east. Multi-week, and only worth it for volume or a household move.",
        speed:
          "Air is days rather than weeks, plus clearance and the Canadian domestic leg. That domestic leg is the honest variable here: Canada is enormous and an address in the prairies or the north is a separate journey from the gateway city.",
      },
      paperwork: [
        "A commercial invoice with a plain-language description and declared value",
        "A packing list for each carton",
        "The recipient's full name, Canadian address with postal code and a phone number",
        "For documents, a traceable service and a note of what the documents are",
        "For commercial goods, the Canadian importer's details and bilingual product labelling",
      ],
      watchOut: {
        title: "Winter affects the last mile, not the flight",
        body:
          "Between December and March, delivery into prairie, northern and rural Canadian addresses can be delayed by weather after the shipment has already cleared customs. The flight is not the problem; the road at the far end is. If a parcel is meant to arrive for a date in winter, send it with more margin than the transit time suggests. Separately, commercial goods sold in Canada generally need bilingual English and French labelling — a requirement to resolve before manufacturing, not at the border.",
      },
      arrival: {
        title: "Clearance, then a very large country",
        body:
          "The shipment clears at Toronto, Vancouver or Montreal and then moves on a Canadian domestic network. Duty and any broker fee are settled at clearance, and who pays is set by the terms agreed when you book. Food and plant products are inspected on import — commercially packaged dry goods generally pass, while meat, dairy, seeds and untreated plant material are the categories that do not.",
      },
      faqs: [
        {
          question: "Can you send academic documents securely to Canada?",
          answer:
            "Yes, and it is one of the most common things we carry on this lane. Use a traceable air service, tell us what the documents are, and give us the recipient's phone number as well as the address. Credential assessment deadlines are real deadlines, so book with margin rather than at the last moment.",
        },
        {
          question: "Can I send Nepali food to Canada?",
          answer:
            "Sealed, commercially packaged dry goods such as tea, coffee, spices and snacks generally travel. Meat and dairy, seeds, fresh produce and untreated plant material are the categories that get held. Send us a contents list before you pack.",
        },
        {
          question: "Why is winter delivery slower?",
          answer:
            "Because the delay happens after customs, on the road. Weather affects delivery into prairie, northern and rural addresses between December and March, regardless of how quickly the shipment flew. If it has to arrive for a date, give it more room than the transit time alone would suggest.",
        },
      ],
    },
    inbound: {
      title: "Shipping to Nepal from Canada | Send Parcels Home",
      description:
        "Send parcels home to Nepal from Canada. What your family pays at Nepali customs, sending medicines and electronics, and delivery to districts outside Kathmandu.",
      eyebrow: "Canada to Nepal",
      heading: "Shipping to Nepal from Canada",
      lede:
        "Canada to Nepal is mostly students and recent permanent residents sending home, which gives it a particular rhythm: parcels around festivals, something substantial at the end of a term or a programme, and a steady flow of medicines and health products to parents who are not getting younger.",
      serviceType: "International air freight and delivery in Nepal",
      audience: {
        title: "A young diaspora sending back to older parents",
        body:
          "The senders here are typically in their twenties and thirties, several years into a life in Toronto, Calgary, Winnipeg or Vancouver, with parents still in Nepal — often outside Kathmandu. What they send reflects that: supplements and health products, electronics, winter clothing for the hills, and gifts timed to Dashain and Tihar. A smaller stream is returning students shipping their belongings at the end of a programme.",
      },
      goods: [
        "Vitamins, supplements and health products",
        "Laptops, phones and electronics",
        "Clothing and winter wear",
        "Baby and childcare items",
        "End-of-programme belongings for returning students",
      ],
      modes: {
        air: "Air from Toronto, Vancouver or Montreal through a Gulf or Asian hub into Kathmandu, cleared at Tribhuvan International Airport.",
        surfaceLabel: "Sea freight",
        surface:
          "Vancouver or Montreal to Kolkata or Haldia, then overland into Nepal. A multi-week route that only makes sense for a genuine relocation.",
        speed:
          "Air is days rather than weeks plus clearance in Kathmandu, which is the variable step. Add the district leg on top if the recipient is outside the valley, and add winter margin at the Canadian end if you are collecting from a rural address.",
      },
      paperwork: [
        "An itemised list with the price paid for each item",
        "Receipts for electronics and high-value goods",
        "Original packaging and a prescription copy for any medicine",
        "The recipient's full name, Nepali mobile number, district and a landmark",
        "A copy of the recipient's citizenship certificate or passport",
      ],
      watchOut: {
        title: "Supplements and health products need their labels intact",
        body:
          "Vitamins and health products are one of the most commonly sent categories on this lane and one of the most commonly repacked. Do not decant them, do not remove the outer box, and do not combine several bottles into one container to save space. Nepal Customs assesses what it can identify; an unlabelled bottle of capsules is a problem for whoever is standing at the counter. Keep everything sealed in its original packaging and send the receipts with the itemised list.",
      },
      arrival: {
        title: "Duty in Kathmandu, then the district",
        body:
          "Nepal Customs assesses duty and VAT on arrival, on the classification of the goods and the declared value, gifts included. We will estimate it from your itemised list before you ship so you can settle it from Canada instead of leaving it to your parents. After release the shipment joins our domestic network for delivery across the districts; our coverage is listed under /courier.",
      },
      faqs: [
        {
          question: "Can I send vitamins and supplements to my parents?",
          answer:
            "Usually yes, if they stay in their original sealed packaging with the labels intact and you send the receipts. Do not decant them or strip the outer boxes to save weight — an unidentifiable product is far harder to clear than a correctly labelled one.",
        },
        {
          question: "Will my family pay duty?",
          answer:
            "Nepal Customs assesses duty and VAT on the declared value and the type of goods, and a gift label is not an exemption. Send us the itemised list and we will estimate the charge before you ship, so you can cover it from Canada.",
        },
        {
          question: "Can you deliver outside Kathmandu?",
          answer:
            "Yes. Once cleared, the shipment moves on our domestic network to district addresses across Nepal. Give us the district, municipality, a landmark and a Nepali mobile number — the last mile outside the valley is arranged by phone with the recipient.",
        },
      ],
    },
  },
  {
    slug: "australia",
    region: "long-haul",
    summary:
      "Long-haul air into Sydney, Melbourne and Perth, or multi-week sea. The strictest biosecurity regime of any destination we ship to.",
    outbound: {
      title: "Shipping from Nepal to Australia | Cargo and Biosecurity Rules",
      description:
        "Send parcels and cargo from Nepal to Australia by air or sea. Australian biosecurity on timber, bamboo, food and plant material, plus documents and delivery.",
      eyebrow: "Nepal to Australia",
      heading: "Shipping from Nepal to Australia",
      lede:
        "Australia runs the strictest border of any destination on this site, and it is strict about exactly the things Nepal exports: wood, bamboo, cane, dried plant material and food. A shipment that declares those honestly usually gets through, sometimes after treatment. A shipment that does not declare them can be held, treated at your cost, or destroyed.",
      serviceType: "International air freight and sea freight",
      audience: {
        title: "Students and skilled migrants, and the festivals they keep",
        body:
          "Australia's Nepali population has grown fast and is concentrated in Sydney, Melbourne, Brisbane and Perth — students, graduates and skilled migrants rather than a long-settled community. The lane is busiest around Dashain, Tihar and wedding season, when festival wear, ritual items and handicrafts travel in volume. Those are precisely the goods that interest Australian biosecurity, which is why this page leads with it.",
      },
      goods: [
        "Festival and wedding wear, including daura suruwal and saris",
        "Pashmina, felt and woollen goods",
        "Handicrafts — with timber, cane and bamboo content declared",
        "Packaged tea, coffee and dry food",
        "Documents and certificates",
      ],
      modes: {
        air: "Air cargo connects through a Gulf or Southeast Asian hub into Sydney, Melbourne, Brisbane or Perth, and is inspected on arrival.",
        surfaceLabel: "Sea freight",
        surface:
          "Road to Kolkata or Haldia, then sea to Melbourne, Sydney or Fremantle. Multi-week, and subject to the same biosecurity inspection as air — sometimes more of it, because containers are a higher-risk pathway.",
        speed:
          "Air transit is days rather than weeks. What makes this lane unpredictable is not flying time but inspection: a shipment selected for biosecurity examination or treatment waits for it. An honest, detailed declaration is the single biggest thing you can do to keep that short.",
      },
      paperwork: [
        "A commercial invoice describing materials, not just products — say 'carved sal wood bowl', not 'handicraft'",
        "A packing list for each carton",
        "A declaration of any timber, bamboo, cane, seed or dried plant content",
        "The recipient's full name, Australian address and phone number",
        "Treatment certificates where the goods have already been treated",
      ],
      watchOut: {
        title: "Australian biosecurity is the strictest border you will ship into",
        body:
          "Timber, bamboo, cane, rattan, dried flowers, seeds, straw packing material, food and anything of animal origin are all inspected, and any of them can trigger mandatory treatment at the importer's cost or destruction if undeclared. Even packing material counts — straw and untreated wooden crates are a problem in their own right. The rule that works is simple: describe the material of every item on the invoice, declare anything organic, and let us tell you what needs treating before it ships rather than after it lands.",
      },
      arrival: {
        title: "Inspection first, delivery second",
        body:
          "Shipments are assessed for biosecurity risk on arrival and may be examined, treated or fumigated before release. Costs for treatment fall to the importer, so decide in advance who that is. Once released, the shipment moves on an Australian domestic network; addresses outside the main cities add a leg, and Western Australia and the Northern Territory add more.",
      },
      faqs: [
        {
          question: "Can I send wooden or bamboo handicrafts to Australia?",
          answer:
            "Often yes, but declare the material. Australia inspects timber, cane, bamboo and dried plant material and may require treatment before release; undeclared items can be held, treated at your cost, or destroyed. Tell us what each item is made of and we will say what it needs before it ships.",
        },
        {
          question: "Can I send Nepali food to Australia?",
          answer:
            "Sealed, commercially packaged dry goods sometimes travel, but Australia restricts far more food than most destinations. Meat and animal products, dairy, seeds, fresh produce and many dried plant items are prohibited or need a permit. Send us the exact contents before you pack — this is not a border where you guess.",
        },
        {
          question: "What happens if my shipment is selected for treatment?",
          answer:
            "It is treated or fumigated before release and the cost falls to the importer. It also adds time. An accurate declaration up front does not guarantee you avoid it, but a vague one makes it considerably more likely, and an undeclared organic item can mean destruction rather than treatment.",
        },
        {
          question: "How much will it cost to ship?",
          answer:
            "Freight depends on weight, dimensions and service, and we quote it from the live tariff on our pricing page. Biosecurity treatment, if it is required, is separate and is charged by the Australian authorities rather than by us — another reason to declare materials accurately and plan for the possibility.",
        },
      ],
    },
    inbound: {
      title: "Shipping to Nepal from Australia | Send Parcels Home",
      description:
        "Send parcels and belongings home to Nepal from Australia. Customs duty in Nepal, shipping at the end of a degree, and delivery to districts outside Kathmandu.",
      eyebrow: "Australia to Nepal",
      heading: "Shipping to Nepal from Australia",
      lede:
        "The Australian lane has a seasonality the others do not: it peaks when degrees finish. A graduating student with a furnished share house and a flight date is the characteristic shipment here, alongside the usual flow of supplements, electronics and gifts going home to family.",
      serviceType: "International air freight and delivery in Nepal",
      audience: {
        title: "Students finishing up, and a settled migrant population",
        body:
          "Australia has absorbed a large number of Nepali students over the past decade, and a good share of them eventually ship things home — either because they are returning, or because they have accumulated more than an airline will carry. Around that sits the ordinary diaspora pattern: skilled migrants in Sydney, Melbourne and Perth sending health products, electronics and gifts to parents, often to a district address rather than to Kathmandu.",
      },
      goods: [
        "Vitamins, supplements and health products",
        "Laptops, phones and electronics",
        "Clothes, shoes and gifts",
        "Baby products and childcare items",
        "End-of-degree belongings, shipped as personal effects",
      ],
      modes: {
        air: "Air from Sydney, Melbourne, Brisbane or Perth through a Gulf or Southeast Asian hub into Kathmandu, cleared at Tribhuvan International Airport.",
        surfaceLabel: "Sea freight",
        surface:
          "Melbourne, Sydney or Fremantle to Kolkata or Haldia, then overland into Nepal. Worth pricing when someone is shipping furniture and a household rather than boxes.",
        speed:
          "Air is days rather than weeks plus clearance in Kathmandu. Sea is a multi-week commitment. For an end-of-degree shipment the thing that matters is booking while you still have access to your things, not the transit time.",
      },
      paperwork: [
        "An itemised list with the price paid for each item",
        "Receipts for electronics and anything high-value",
        "Original sealed packaging and labels for supplements and health products",
        "An inventory, for used personal effects at the end of a stay",
        "The recipient's full name, Nepali mobile number, district and a landmark",
      ],
      watchOut: {
        title: "Book the end-of-degree shipment before the lease ends",
        body:
          "The pattern we see every year: a student finishes, the share house lease runs out, the flight is in a fortnight and everything needs to go somewhere. At that point the options are bad and expensive. Start a few weeks earlier and the same shipment is straightforward — used personal effects go with an inventory and are assessed differently from new goods, and if there is enough of it, sea freight is worth pricing against air.",
      },
      arrival: {
        title: "Clearance in Kathmandu, then wherever the family is",
        body:
          "Nepal Customs assesses duty and VAT on arrival, on the classification of the goods and the declared value, including on gifts. We estimate it in advance from your list so nobody is surprised. After release the shipment joins our domestic network for delivery to district addresses across Nepal — see /courier for coverage — and the handover outside the valley is arranged by phone with the recipient.",
      },
      faqs: [
        {
          question: "I am finishing my degree. Can you ship my things back to Nepal?",
          answer:
            "Yes. Used personal effects ship against an inventory and are assessed differently from new goods. A few boxes go by air; a flat's worth is worth pricing by sea. Book a few weeks before your lease ends rather than in the final days, when the options narrow and the cost rises.",
        },
        {
          question: "Will my family pay duty on what I send?",
          answer:
            "Nepal Customs assesses duty and VAT on the declared value and the type of goods, gifts included. Send us the itemised list and we will estimate the charge beforehand, and you can settle it from Australia rather than leaving it to whoever collects the shipment.",
        },
        {
          question: "Can you deliver to a district outside Kathmandu?",
          answer:
            "Yes. After clearance the shipment moves on our domestic network across the districts. Give us the district, municipality, a landmark and a Nepali mobile number; a hill or far-western address takes longer than the valley and is coordinated by phone.",
        },
      ],
    },
  },
];
