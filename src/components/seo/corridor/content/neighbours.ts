import type { CorridorContent } from "../types";

/**
 * India and China: the two corridors with a land border.
 *
 * Everything else in the cluster is an air lane with a sea alternative. These
 * two are road lanes first, which changes the mode comparison, the paperwork
 * and the thing that goes wrong.
 */
export const NEIGHBOUR_CORRIDORS: CorridorContent[] = [
  {
    slug: "india",
    region: "neighbours",
    summary:
      "Road freight through Birgunj, Bhairahawa and Kakarbhitta, with air through Delhi when a date matters. Nepal's busiest trade lane in both directions.",
    outbound: {
      title: "Courier and Cargo from Nepal to India | Road and Air Freight",
      description:
        "Send parcels and commercial cargo from Nepal to India by road through Birgunj, Bhairahawa or Kakarbhitta, or by air via Delhi. Documents, GSTIN and e-way bill explained.",
      eyebrow: "Nepal to India",
      heading: "Shipping from Nepal to India",
      lede:
        "India is the only destination we serve where a truck is the normal answer and a plane is the exception. Consignments cross at a land customs office and continue on the Indian road network, which makes this the quickest lane we run and the one where a closed border, not a long flight, is what puts a shipment behind schedule.",
      serviceType: "Cross-border road freight and air freight",
      audience: {
        title: "Mostly trade, and a steady stream of students",
        body:
          "This corridor is dominated by commerce in a way none of the others are. Nepali exporters send handicrafts, textiles, herbs and agricultural produce to Indian buyers; manufacturers send machinery back across the border for repair; online sellers fulfil Indian orders. Alongside that sits a quieter personal lane — Nepali students at universities in Delhi, Pune, Bangalore and Manipal, and families spread across both sides of an open border.",
      },
      goods: [
        "Handicrafts, pashmina, felt and woollen goods",
        "Herbs, spices and agricultural produce",
        "Machinery and spare parts going for repair or resale",
        "E-commerce consignments for Indian buyers",
        "Documents, academic transcripts and legal papers",
      ],
      modes: {
        air: "Air cargo moves on the short Kathmandu–Delhi sector and feeds the Indian domestic network from there. It is the right choice for documents, high-value goods, perishables and anything with a fixed date.",
        surfaceLabel: "Road freight",
        surface:
          "The default. Consignments are trucked to Birgunj–Raxaul, Bhairahawa–Sunauli or Kakarbhitta–Panitanki, cleared at the land customs office on both sides, and continue by road to the Indian destination.",
        speed:
          "The fastest corridor on this site. Road movement to northern Indian cities is a matter of days rather than weeks, and air is quicker still. What varies is not the distance but the crossing: clearance at the land customs office, and the occasional closure for a strike, a festival or monsoon damage.",
      },
      paperwork: [
        "A commercial invoice describing the goods in plain language, with the declared value",
        "A packing list showing what is in each carton",
        "A certificate of origin where preference under the Nepal–India trade treaty is being claimed",
        "The Indian consignee's GSTIN for anything commercial",
        "An e-way bill for the road movement inside India after customs clearance, where the consignment value requires one. It is raised by the importer against their own GSTIN, not by the sender in Nepal, and cargo merely transiting India is treated differently - confirm which applies with your consignee",
      ],
      watchOut: {
        title: "The border sets the timetable, not the distance",
        body:
          "Land crossings close. A bandh, a festival, flooding on the approach roads or a queue at the customs yard will each add time that no amount of planning on the Nepali side removes. If a consignment has a hard deadline, book it by air through Delhi and treat the road option as the economical one rather than the predictable one. The other common delay is a missing GSTIN — without it a commercial consignment sits at the border instead of entering India.",
      },
      arrival: {
        title: "What happens on the Indian side",
        body:
          "The consignment is cleared by the importer or their agent at the crossing, then moves on the Indian road network to the delivery address. For commercial goods, Indian import taxes are assessed at entry and settled by the consignee, so the consignee needs to be ready with their registration details before the truck arrives rather than after.",
      },
      faqs: [
        {
          question: "Is road or air faster from Nepal to India?",
          answer:
            "Air, but usually not by as much as you would expect, because the flying time is short and most of the clock is spent in clearance and local delivery at both ends. Road is the sensible default for ordinary cargo. Choose air when the goods are high-value, fragile, perishable or tied to a date.",
        },
        {
          question: "What does my consignee in India need to provide?",
          answer:
            "For a commercial shipment, their GSTIN and the details for the customs entry, and an e-way bill for the road leg inside India where the value requires one. For a personal parcel, a full address and a mobile number that is answered. Get these before you book — a consignment held at the border for a missing number is the most common avoidable delay on this lane.",
        },
        {
          question: "Can I send herbs and medicinal plants to India?",
          answer:
            "Some, with clearance. Nepal regulates the export of certain medicinal and aromatic plants, and India regulates their import. Tell us the species and the quantity before you pack, and we will say what clearance is needed and whether it is obtainable.",
        },
        {
          question: "How much will it cost?",
          answer:
            "It depends on weight, dimensions, the crossing used and whether you ship by road or by air, so we quote it from the live tariff rather than publishing a figure that would be wrong for most consignments. The calculator on our pricing page works it out, and we confirm it in writing before anything moves.",
        },
      ],
    },
    inbound: {
      title: "Shipping to Nepal from India | Import Cargo and Parcels",
      description:
        "Import goods to Nepal from India by road through Birgunj, Bhairahawa or Kakarbhitta, or by air. Nepali customs documents, PAN requirements and delivery to any district.",
      eyebrow: "India to Nepal",
      heading: "Shipping to Nepal from India",
      lede:
        "More goods enter Nepal from India than from everywhere else combined, and most of it arrives on a truck. If you are an importer, this page is about keeping a consignment moving through the land customs office at Birgunj or Bhairahawa. If you have bought something from an Indian website and need it brought across, we handle that too.",
      serviceType: "Cross-border road freight and import clearance",
      audience: {
        title: "Importers first, online shoppers second",
        body:
          "This is the one inbound corridor that is not mainly about the diaspora. It is raw material for Nepali manufacturers, machinery and spares, pharmaceuticals, FMCG stock for shops, and inventory for e-commerce sellers. Underneath that sits a large personal lane: things bought on Indian shopping sites that will not deliver into Nepal, and parcels between family members living on both sides of the border.",
      },
      goods: [
        "Machinery, spare parts and industrial equipment",
        "Raw material and packaging for Nepali manufacturers",
        "Retail and FMCG stock for shops and distributors",
        "Purchases from Indian e-commerce sites",
        "Medicines and medical supplies for licensed importers",
      ],
      modes: {
        air: "Air freight into Kathmandu for urgent, high-value or temperature-sensitive goods. It skips the border queue entirely, which is sometimes worth more than the freight saving on the road.",
        surfaceLabel: "Road freight",
        surface:
          "The workhorse. Goods are collected in India, trucked to Raxaul, Sunauli or Panitanki, cleared at the Nepali land customs office, and delivered onward from there. Third-country cargo arriving at Kolkata or Haldia also enters Nepal this way.",
        speed:
          "Days rather than weeks once the paperwork is right, with the land customs office as the variable. Clearance is the step that stretches: a consignment with a complete file moves through quickly, one with a query sits. Air is faster and more predictable, and costs accordingly.",
      },
      paperwork: [
        "A commercial invoice and packing list from the Indian supplier",
        "The Nepali consignee's PAN for a commercial import",
        "The bank documents covering how the import was paid for",
        "An import licence or sectoral approval where the goods need one — medicines and food in particular",
        "For a personal parcel, the recipient's citizenship certificate or passport copy",
      ],
      watchOut: {
        title: "Customs clears you at the border, not in Kathmandu",
        body:
          "Unlike every other corridor here, an Indian import is assessed at the land customs office at the crossing, before it ever reaches the valley. That means the complete file — invoice, packing list, PAN, banking documents, any sectoral licence — has to be at the border with the truck, not emailed afterwards. Duty and VAT are assessed on how the goods are classified and on the declared value, and the amount depends entirely on the item, so we will not quote you a percentage. Send us the invoice and we will estimate it before you commit.",
      },
      arrival: {
        title: "From the border to your district",
        body:
          "After clearance, the consignment joins our domestic network for delivery anywhere we run — Kathmandu, the Terai towns near the crossings, and the hill districts beyond. Delivery into the Terai from Birgunj or Bhairahawa is short; a hill or far-western district adds time. Our district pages under /courier list where we deliver.",
      },
      faqs: [
        {
          question: "I bought something from an Indian website that will not ship to Nepal. Can you help?",
          answer:
            "Yes. Have it delivered to an Indian address we agree, and we will import it and deliver it to you in Nepal. Keep the order confirmation and the invoice showing what you paid — Nepal Customs assesses duty on the value, and an order with no paperwork is harder and slower to clear.",
        },
        {
          question: "What will I pay at Nepali customs?",
          answer:
            "Duty and VAT, assessed on the classification of the goods and their declared value. We cannot publish a rate here because it varies by item and a wrong number would cost you real money. Send us the invoice and an itemised list and we will give you an estimate before the goods move.",
        },
        {
          question: "Do I need a PAN to import from India?",
          answer:
            "For a commercial import, yes — the consignee's PAN is part of the customs file. A one-off personal parcel is handled against the recipient's citizenship certificate or passport instead. If you are not sure which side of that line your shipment falls on, ask us before you order.",
        },
      ],
    },
  },
  {
    slug: "china",
    region: "neighbours",
    summary:
      "Overland through Rasuwagadhi–Kerung when the Himalayan crossings are open, consolidated air from Guangzhou when they are not. The sourcing lane.",
    outbound: {
      title: "Shipping from Nepal to China | Air and Overland Freight",
      description:
        "Send parcels and cargo from Nepal to China by air via Guangzhou, Chengdu or Kunming, or overland through Rasuwagadhi–Kerung. Documents and border conditions explained.",
      eyebrow: "Nepal to China",
      heading: "Shipping from Nepal to China",
      lede:
        "Far less leaves Nepal for China than arrives from it, and what does go is usually either a personal parcel for a student or a modest commercial consignment of Nepali-made goods. The two land crossings sit high in the Himalaya and behave accordingly, so anything with a date on it goes by air.",
      serviceType: "International air freight and overland freight",
      audience: {
        title: "Students, and exporters testing a large market",
        body:
          "Nepal sends a substantial number of students to Chinese universities, particularly for medicine and engineering, and their families are the steadiest senders on this lane — documents, clothes, Nepali food. The commercial side is smaller but growing: handicrafts, pashmina, herbs, tea and coffee going to Chinese buyers, often in sample quantities first.",
      },
      goods: [
        "Parcels for Nepali students at Chinese universities",
        "Handicrafts, pashmina and felt goods",
        "Tea, coffee and packaged specialty food",
        "Herbs and aromatic plants, where export clearance allows",
        "Documents, transcripts and contracts",
      ],
      modes: {
        air: "Air cargo routes through Guangzhou, Chengdu, Kunming or Hong Kong and feeds the Chinese domestic network from there. This is the reliable option and the one we recommend whenever a deadline exists.",
        surfaceLabel: "Overland freight",
        surface:
          "Three crossings link the countries: Rasuwagadhi–Kerung (Gyirong), Tatopani–Zhangmu and Korala in Upper Mustang. All three climb through the high Himalaya, and all three are exposed to landslides, snow, flood damage and closure at short notice — Tatopani has been disrupted since the 2015 earthquake, and the Rasuwagadhi road has been cut by flooding more than once. Treat none of them as reliably open: overland is cheaper per kilo and genuinely unpredictable, so ask us which crossing is working before you plan around one.",
        speed:
          "By air, days rather than weeks. Overland is honestly unpredictable: a clear run is quick for the distance, and a closed crossing is not a delay of hours but of days or longer. We will tell you the current state of the border when you book rather than guess at it here.",
      },
      paperwork: [
        "A commercial invoice with a plain-language description and declared value",
        "A packing list for each carton",
        "The Chinese consignee's full name, identity details and mobile number",
        "For commercial goods, the consignee's customs registration in China",
        "Nepali export clearance for herbs, antiques or anything on a protected list",
      ],
      watchOut: {
        title: "Himalayan crossings are weather, not logistics",
        body:
          "Rasuwagadhi and Tatopani are mountain roads at altitude. Monsoon landslides, winter snow and occasional administrative closures take them out of service, sometimes with no warning and sometimes for a long stretch. Nobody can schedule around that reliably. If the shipment matters, pay for air; if it does not, overland is genuinely cheaper and you should budget slack rather than a date.",
      },
      arrival: {
        title: "What happens at the Chinese end",
        body:
          "The consignment is cleared at the arrival airport or at the Kerung land port and then moves on the Chinese domestic network. Personal imports need the recipient's real name and identity details to match the booking — a parcel addressed to a nickname or an incomplete name stalls at clearance. Give us the address in Chinese characters where you can.",
      },
      faqs: [
        {
          question: "Should I ship overland or by air to China?",
          answer:
            "Air, unless cost is the only thing that matters and the goods can wait indefinitely. The land crossings are cheaper per kilo but they close for weather and for other reasons, and there is no way to promise a date on them. We will tell you how the border is running when you book.",
        },
        {
          question: "Can I send Nepali food to a student in China?",
          answer:
            "Commercially packaged, sealed dry goods such as spices, tea, instant noodles and snacks usually travel. Meat, dairy, home-cooked food and fresh produce are the categories that get stopped. Give us a contents list before you seal the box and we will tell you what can go.",
        },
        {
          question: "What details do you need for the recipient in China?",
          answer:
            "Their full legal name as it appears on their identity document, a Chinese mobile number, and the address — in Chinese characters if possible. Chinese clearance for personal imports is matched against identity details, so an approximate name is a held parcel.",
        },
      ],
    },
    inbound: {
      title: "Shipping to Nepal from China | Import and Consolidation",
      description:
        "Import from Guangzhou, Yiwu and Shenzhen to Nepal by air or overland through Kerung. Supplier consolidation, Nepali customs duty and delivery to any district.",
      eyebrow: "China to Nepal",
      heading: "Shipping to Nepal from China",
      lede:
        "This is the sourcing corridor. Most of what moves on it is stock — electronics, hardware, garments, festival goods, machinery — bought from suppliers in Guangzhou, Yiwu and Shenzhen by Nepali shopkeepers, importers and online sellers. The two things that decide whether an order arrives on time are the state of the Kerung crossing and how close you are to the Lunar New Year.",
      serviceType: "Import freight, consolidation and customs clearance",
      audience: {
        title: "Importers, shopkeepers and online sellers",
        body:
          "Unlike the diaspora lanes, this corridor is overwhelmingly commercial. Buyers place orders with several Chinese suppliers at once, have them delivered to a consolidation point, and ship the combined load to Nepal. A smaller personal stream runs alongside it — Nepali students in China sending belongings home, and families sending gifts.",
      },
      goods: [
        "Consumer electronics, phones and accessories",
        "Hardware, tools and machinery parts",
        "Garments, footwear and textiles",
        "Festival and seasonal stock ahead of Dashain and Tihar",
        "Shop fittings, packaging and display material",
      ],
      modes: {
        air: "Consolidated air freight out of Guangzhou into Kathmandu. The option importers fall back on when the land route is shut or when a season is about to start without the stock.",
        surfaceLabel: "Overland and sea",
        surface:
          "Overland through Kerung into Rasuwagadhi carries the volume whenever that crossing is running, with Korala taking limited cargo and Tatopani largely out of use. The Himalayan roads are repeatedly cut by landslides and flooding, so the working crossing changes — we confirm which one is open at the time you book. For very large, non-urgent consignments, sea to Kolkata or Haldia followed by road into Nepal is cheaper again and slower again.",
        speed:
          "Overland through Kerung is reasonable when the border is running normally; sea-and-road is a multi-week commitment; air is days plus clearance. We will not put a number on the overland option, because the honest answer depends on a mountain road and on the queue at the land port on the day.",
      },
      paperwork: [
        "The supplier's commercial invoice and packing list for every order in the consolidation",
        "The Nepali consignee's PAN for a commercial import",
        "Bank documents covering the payment to the supplier",
        "Product-specific approvals where they apply — electrical goods, food, cosmetics",
        "A clear declared value per line, not one lump sum for the whole pallet",
      ],
      watchOut: {
        title: "Order before the Lunar New Year shutdown, not after",
        body:
          "Chinese factories and freight forwarders close for an extended period around the Lunar New Year, and capacity gets tight for weeks either side of it. Importers who place a Dashain or Tihar order late in that window do not lose days, they lose the season. Combine that with a Himalayan crossing that can shut for weather and the lesson is the same both times: on this lane, time buys you more than freight savings do.",
      },
      arrival: {
        title: "Clearance, then your district",
        body:
          "Goods are cleared either at the Rasuwagadhi land customs office or at Kathmandu airport, depending on the route. Nepal Customs assesses duty and VAT on the classification and the declared value — we will estimate it from your invoices before you ship, and we cannot responsibly quote a rate on a page like this. After release, the consignment goes onto our domestic network; see /courier for the districts we deliver to.",
      },
      faqs: [
        {
          question: "Can you consolidate orders from several Chinese suppliers?",
          answer:
            "Yes, and for most importers that is the point. Have each supplier deliver to the consolidation point we give you, and we combine the orders into one shipment to Nepal. Make sure each supplier sends their own invoice and packing list — a consolidated load declared as one unpriced lump is the slowest kind to clear.",
        },
        {
          question: "How far ahead should I order for Dashain?",
          answer:
            "Earlier than feels necessary, and earlier still if any part of the window overlaps the Lunar New Year shutdown in China. Between factory closures, freight capacity and a land crossing that can shut for weather, the realistic risk on this lane is seasonal rather than daily. Talk to us about timing before you place the order, not after.",
        },
        {
          question: "What will Nepal Customs charge on my import?",
          answer:
            "Duty and VAT, assessed on how the goods are classified and the value declared. It varies enough by product that publishing a figure here would mislead you. Send us the supplier invoices and we will give you an estimate before the goods leave China.",
        },
        {
          question: "Is the Kerung crossing open right now?",
          answer:
            "Ask us when you book — it is the one thing on this page that genuinely changes. The crossing is subject to weather, landslides and administrative closure, and we would rather tell you its actual state on the day than leave a claim on a web page that goes stale.",
        },
      ],
    },
  },
];
