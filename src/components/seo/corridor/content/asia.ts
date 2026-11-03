import type { CorridorContent } from "../types";

/**
 * East and Southeast Asia: Japan, South Korea and Malaysia.
 *
 * Mid-haul air lanes sitting between the Gulf and the long-haul West. Each
 * has a hard, checkable rule that defines it — Japanese quarantine, Korea's
 * personal customs clearance code, Malaysian food and halal screening — and
 * each has a different reason the Nepali population there exists.
 */
export const ASIA_CORRIDORS: CorridorContent[] = [
  {
    slug: "japan",
    region: "asia",
    summary:
      "Mid-haul air through East and Southeast Asian hubs, serving students, skilled workers and the Nepali restaurant trade in Tokyo and Osaka.",
    outbound: {
      title: "Courier from Nepal to Japan | Tokyo and Osaka Shipping",
      description:
        "Send parcels and cargo from Nepal to Japan by air. Japanese quarantine rules on food and plant material, address format requirements, and the documents you need.",
      eyebrow: "Nepal to Japan",
      heading: "Shipping from Nepal to Japan",
      lede:
        "Japan is a precise place to ship into. Quarantine on food, plants and animal products is enforced without discretion, and the delivery network routes on postal codes rather than on a courier working out where a building is. Get those two things right and this is a straightforward lane; get them wrong and the parcel does not arrive.",
      serviceType: "International air freight and express courier",
      audience: {
        title: "Students, skilled workers, and a real restaurant trade",
        body:
          "Nepal's community in Japan grew out of language schools and universities and now includes a substantial skilled-worker population. It also includes something unusual: a genuine Nepali and South Asian restaurant business, concentrated in Tokyo and the larger cities, which imports spices, lentils and dry ingredients commercially. Family parcels and restaurant supply travel the same lane with very different paperwork.",
      },
      goods: [
        "Packaged spices, lentils and dry ingredients, including commercial quantities for restaurants",
        "Clothes, including festival and wedding wear",
        "Documents, transcripts and certificates",
        "Handicrafts and gifts",
        "Tea and coffee",
      ],
      modes: {
        air: "Air cargo moves through Southeast and East Asian hubs — Bangkok, Kuala Lumpur, Hong Kong, Guangzhou — into Narita, Haneda or Kansai, and onto the Japanese domestic network from there.",
        surfaceLabel: "Sea freight",
        surface:
          "Road to Kolkata or Haldia, containerised, then sea to Yokohama, Kobe or Nagoya. A multi-week route that makes sense for restaurant stock and commercial volume, not for a family parcel.",
        speed:
          "Air is days rather than weeks in the air and on the ground, and Japanese domestic delivery is fast and dependable once the shipment is released. Quarantine inspection is the step that can add time, and it adds it to exactly the shipments that declared their contents loosely.",
      },
      paperwork: [
        "A commercial invoice with an accurate ingredient-level description for any food",
        "A packing list for each carton",
        "The recipient's name, the full postal code, and the address in Japanese order",
        "A Japanese mobile number",
        "For commercial food imports, the importer's details and any required notification",
      ],
      watchOut: {
        title: "Quarantine is a hard stop, not a negotiation",
        body:
          "Japan refuses meat and meat products at import — including dried, cured and vacuum-packed — along with many dairy items, fresh produce, seeds and untreated plant material. Quantity does not matter and 'it is for personal use' does not help. Commercially packaged dry spices, lentils, tea and sealed snacks are normally fine, provided the invoice describes the ingredients accurately rather than saying 'food'. A vague declaration on a food parcel is what turns a routine import into a destroyed one. This is not a slap on the wrist either: illegal animal or plant imports carry fines running to millions of yen and, in the worst cases, a prison term.",
      },
      arrival: {
        title: "The address has to be exactly right",
        body:
          "Japanese delivery runs on the postal code and a structured address: prefecture, city, ward, block and building, with the room number. Couriers do not improvise around a partial address, and they will not find a recipient from a name and a street. Give us the postal code, the address as the recipient writes it, and a Japanese mobile number. Redelivery is routine and well organised in Japan, but only once the shipment is in the system with a correct address.",
      },
      faqs: [
        {
          question: "Can I send Nepali food and spices to Japan?",
          answer:
            "Packaged dry goods — spices, lentils, tea, sealed snacks — generally travel, as long as the invoice lists the ingredients accurately. Meat and meat products in any form, most dairy, fresh produce, seeds and untreated plant material are refused at quarantine regardless of quantity. Send us the contents list before you pack.",
        },
        {
          question: "What address details do you need for Japan?",
          answer:
            "The full postal code, the address written in the Japanese order with the building and room number, the recipient's name, and a Japanese mobile. The domestic network routes on the postal code, so a missing or wrong one is the difference between next-day delivery and a shipment sitting in a depot.",
        },
        {
          question: "I run a restaurant in Japan. Can you ship ingredients commercially?",
          answer:
            "Yes, and it is a different process from a family parcel. Commercial food imports need the importer's details, accurate ingredient declarations and in some cases a notification before arrival. Sea freight becomes worth looking at once the volume justifies the wait. Talk to us about the first shipment in detail and the ones after it get easy.",
        },
        {
          question: "How much will it cost?",
          answer:
            "It depends on weight, dimensions and service, so we quote it from the live tariff. The calculator on our pricing page prices your actual shipment, and we confirm the figure before anything moves.",
        },
      ],
    },
    inbound: {
      title: "Shipping to Nepal from Japan | Tokyo to Nepal Cargo",
      description:
        "Send parcels, electronics and belongings home to Nepal from Japan. Customs duty in Nepal, how used goods are valued, and delivery to districts outside Kathmandu.",
      eyebrow: "Japan to Nepal",
      heading: "Shipping to Nepal from Japan",
      lede:
        "Japan to Nepal is mostly students and workers sending home, and the single most common surprise is valuation. Nepal Customs assesses an item on what it judges the goods to be worth, not on the price you happened to pay for it secondhand — which matters a great deal on a lane where so much of what people send is good-quality used equipment.",
      serviceType: "International air freight and import delivery to Nepal",
      audience: {
        title: "Students and workers sending home, and parts importers",
        body:
          "Most senders are Nepalis living in Japan: a student finishing a course, a worker on a skilled-worker visa, someone who has been there long enough to furnish a life and now wants part of it at home. There is also a long-standing commercial thread — Japanese vehicle parts, machinery and electronics are imported into Nepal in meaningful volume, new and used.",
      },
      goods: [
        "Cameras, electronics and computer equipment",
        "Vehicle parts and accessories",
        "Cosmetics and skincare",
        "Clothes, bags and gifts",
        "End-of-study belongings shipped home as personal effects",
      ],
      modes: {
        air: "Air into Kathmandu via an East or Southeast Asian hub, cleared at Tribhuvan International Airport before onward delivery.",
        surfaceLabel: "Sea freight",
        surface:
          "Yokohama, Kobe or Nagoya to Kolkata or Haldia, then overland into Nepal. The route for machinery, parts in volume, and the contents of a flat when someone goes home for good.",
        speed:
          "Air is days plus clearance; sea is a multi-week commitment. Clearance in Kathmandu is where used electronics and parts slow down, because the valuation conversation happens there.",
      },
      paperwork: [
        "An itemised list with what you actually paid for each item",
        "Receipts, including from recycle and secondhand shops",
        "Model and serial numbers for electronics and parts",
        "The recipient's full name, Nepali mobile number, district and a landmark",
        "A copy of the recipient's citizenship certificate",
      ],
      watchOut: {
        title: "Used goods are valued by customs, not by your receipt",
        body:
          "A camera or a laptop bought cheaply at a recycle shop is still assessed by Nepal Customs on its own view of what the item is worth. Keep the receipt and declare it honestly — it helps, and the alternative is worse — but do not budget on the basis of the price you paid. Send us the itemised list with models and serial numbers before you ship and we will give you a realistic estimate of the charge rather than a hopeful one.",
      },
      arrival: {
        title: "Clearance, then the district leg",
        body:
          "Shipments clear at Kathmandu and then move on our domestic network to district addresses. If the recipient is outside the valley, give us the district, the municipality, a landmark and a Nepali mobile number — the last mile is arranged by phone. Our coverage is listed under /courier.",
      },
      faqs: [
        {
          question: "I bought a used camera in Japan. What will my family pay in Nepal?",
          answer:
            "Duty and VAT assessed on Nepal Customs' valuation of the item, which is not necessarily the secondhand price you paid. Send us the model, the serial number and the receipt and we will estimate the charge before you ship, so the figure you plan around is a realistic one.",
        },
        {
          question: "Can you ship my things home when I finish my course?",
          answer:
            "Yes. Used personal effects are shipped with an inventory and assessed differently from new goods. For a few boxes, air is simplest; for the contents of a flat, sea freight through Yokohama or Kobe is worth pricing even though it takes weeks. Book before your last month, not during it.",
        },
        {
          question: "Can you deliver to my home district?",
          answer:
            "Yes — after clearance the shipment joins our domestic network for delivery across the districts. Give us the district, a landmark and a Nepali mobile number. Hill and far-western addresses take longer than the valley, and the handover is coordinated by phone.",
        },
      ],
    },
  },
  {
    slug: "south-korea",
    region: "asia",
    summary:
      "Mid-haul air into Incheon, built around the Employment Permit System workforce in Korea's industrial towns and the students in Seoul.",
    outbound: {
      title: "Courier from Nepal to South Korea | Seoul and Incheon Shipping",
      description:
        "Send parcels from Nepal to South Korea by air. The personal customs clearance code your recipient needs, delivery to industrial towns, and the documents required.",
      eyebrow: "Nepal to South Korea",
      heading: "Shipping from Nepal to South Korea",
      lede:
        "There is one detail on this lane worth getting right before anything else: Korea identifies an individual recipient by a personal customs clearance code when a parcel is imported for personal use. Get it from the person you are sending to before you book, and the rest of this corridor is straightforward.",
      serviceType: "International air freight and express courier",
      audience: {
        title: "EPS workers in the industrial towns, and students in Seoul",
        body:
          "Nepal is one of the countries that sends workers to Korea under the Employment Permit System, and those workers are not mostly in Seoul. They are in manufacturing, agriculture and fisheries around Ansan, Gimhae, Changwon and the smaller industrial towns, often on fixed-term contracts. Families send them Nepali food, clothes, medicine and documents. A separate student population in Seoul and the university cities uses the same lane for smaller, more frequent parcels.",
      },
      goods: [
        "Packaged Nepali food, spices and ready-to-cook items",
        "Clothes and festival wear",
        "Documents for visa, contract and licence renewals",
        "Medicines, where cleared in advance",
        "Gifts and small electronics",
      ],
      modes: {
        air: "Air cargo into Incheon through an East or Southeast Asian hub, then onto the Korean domestic network, which is fast and reliable once a shipment is released.",
        surfaceLabel: "Sea freight",
        surface:
          "Road to Kolkata or Haldia then sea to Busan. A multi-week route that only makes sense for commercial volume; almost nothing on this lane justifies it.",
        speed:
          "Air transit is days rather than weeks, and Korean domestic delivery after clearance is quick. The step that actually delays parcels here is not transport — it is a shipment arriving without the recipient's personal customs clearance code.",
      },
      paperwork: [
        "The recipient's personal customs clearance code — ask for it before you book",
        "A commercial invoice describing the contents and the declared value",
        "A packing list for each carton",
        "The recipient's full name as registered in Korea, with a Korean mobile number",
        "The full Korean address including the postal code",
      ],
      watchOut: {
        title: "No clearance code, no release",
        body:
          "Korea identifies individual recipients by a personal customs clearance code when goods are imported for personal use, in place of quoting a resident registration number. Other identifiers are accepted in some cases, but the code is the one that clears reliably. It is free, the recipient applies for it themselves, and it takes very little time — but a shipment that arrives without one waits at clearance until it is produced. Ask the person you are sending to for their code at the same time as you ask for their address. It is the most common reason a parcel to Korea sits still.",
      },
      arrival: {
        title: "Delivering to a factory town, not a city centre",
        body:
          "Many recipients live in employer-provided accommodation attached to a factory or a farm, in towns well outside Seoul. Give us the full address with the postal code, the employer or dormitory name, and a Korean mobile number. Shift patterns are common, so tell us if the recipient can only take a call at certain hours and we will pass it on.",
      },
      faqs: [
        {
          question: "What is the personal customs clearance code and do I really need it?",
          answer:
            "In practice, yes, for a parcel imported for personal use. Korea identifies individual recipients by this code rather than a resident registration number, and while other identifiers are sometimes accepted, the code is what clears without argument. The recipient applies for it themselves at no cost. Without it the shipment waits at clearance, so collect it before you book rather than chasing it afterwards.",
        },
        {
          question: "Can I send Nepali food to a worker in Korea?",
          answer:
            "Commercially packaged, sealed dry goods — spices, lentils, ready-to-cook packets, snacks — usually travel. Meat products, home-cooked food and fresh produce are the categories that get stopped. Send us the contents list and we will tell you what can go before you pack it.",
        },
        {
          question: "Can you deliver to a factory dormitory outside Seoul?",
          answer:
            "Yes, and most of what we carry on this lane goes to exactly that kind of address. Give us the postal code, the full address, the employer or dormitory name and a Korean mobile number, and tell us if the recipient works shifts.",
        },
      ],
    },
    inbound: {
      title: "Shipping to Nepal from South Korea | Seoul to Nepal Cargo",
      description:
        "Send parcels and belongings home to Nepal from Korea. End-of-contract shipping for EPS workers, customs duty in Nepal, and delivery to any district.",
      eyebrow: "South Korea to Nepal",
      heading: "Shipping to Nepal from South Korea",
      lede:
        "The defining shipment on this corridor is not a parcel, it is a contract ending. A worker finishing an Employment Permit System posting has several years of accumulated belongings in a dormitory and a flight date, and the sensible thing is to ship it rather than fight an airline baggage allowance. Book that before you fly, not after.",
      serviceType: "International air freight and import delivery to Nepal",
      audience: {
        title: "Workers finishing contracts, and students sending home",
        body:
          "Korea's Nepali population is largely on fixed-term work permits, which gives this lane a rhythm the others do not have: a steady trickle of gift parcels during the posting, and a substantial shipment at the end of it. Students add a similar pattern at the close of a degree. The goods reflect where people have been living — Korean electronics, appliances and cosmetics in quantity.",
      },
      goods: [
        "Electronics, phones and small appliances",
        "Cosmetics and skincare",
        "Kitchen equipment and household goods",
        "Clothes, bags and gifts",
        "End-of-contract belongings, shipped as unaccompanied personal effects",
      ],
      modes: {
        air: "Air from Incheon into Kathmandu via an Asian hub, cleared at Tribhuvan International Airport. Right for parcels and for a modest end-of-contract load.",
        surfaceLabel: "Sea freight",
        surface:
          "Busan to Kolkata or Haldia, then overland into Nepal. Worth pricing when somebody is shipping appliances and a household's worth of goods and has weeks rather than days.",
        speed:
          "Air is days plus clearance. Sea is a multi-week route. For an end-of-contract shipment the timing that matters is not the transit, it is whether the booking was made while you were still in Korea with access to your own belongings.",
      },
      paperwork: [
        "An inventory of used personal effects, item by item",
        "Receipts for electronics and anything high-value",
        "An itemised list with the price paid, for new goods",
        "The recipient's full name, Nepali mobile number, district and a landmark",
        "A copy of the recipient's citizenship certificate",
      ],
      watchOut: {
        title: "Arrange the end-of-contract shipment before your flight",
        body:
          "This is the practical failure on this lane. Belongings are in employer accommodation, the departure date is fixed, and once you have flown there is no straightforward way to get back into a dormitory to pack and hand over a shipment. Start the conversation a few weeks before you leave. Used personal effects are shipped against an inventory and assessed differently from new goods, so the paperwork is worth doing properly rather than in a rush on the last evening.",
      },
      arrival: {
        title: "Duty in Kathmandu, then onward to the district",
        body:
          "Nepal Customs assesses duty and VAT on arrival, on the classification of the goods and the declared value — including on gifts. We will estimate the charge from your list before you ship so there is no argument at the counter. After release, the shipment moves on our domestic network to district addresses; the coverage is under /courier, and a hill or far-western delivery takes longer than a valley one.",
      },
      faqs: [
        {
          question: "I am finishing my EPS contract. How do I ship my things home?",
          answer:
            "Contact us a few weeks before your flight. We ship used personal effects against an inventory, which is assessed differently from new goods. A few boxes go by air; a household's worth of appliances is worth pricing by sea through Busan. The thing that goes wrong is leaving it until after you have left Korea.",
        },
        {
          question: "Will my family pay duty on the shipment?",
          answer:
            "Duty and VAT are assessed by Nepal Customs on arrival, on the type of goods and the declared value. Send us the inventory or itemised list and we will estimate it beforehand, and you can settle the charge yourself rather than leaving it to whoever collects the shipment.",
        },
        {
          question: "Can you deliver outside Kathmandu?",
          answer:
            "Yes. Once cleared, the shipment goes onto our domestic network for delivery across the districts. Give us the district, municipality, a landmark and a Nepali mobile number — the last mile outside the valley is arranged by phone with the recipient.",
        },
        {
          question: "How do we track it?",
          answer:
            "Every shipment has a tracking number that works from any browser on our tracking page, and we send updates to the recipient's Nepali mobile at the main stages.",
        },
      ],
    },
  },
  {
    slug: "malaysia",
    region: "asia",
    summary:
      "Short-to-mid-haul air into Kuala Lumpur, serving one of the largest Nepali workforces abroad and a growing student population.",
    outbound: {
      title: "Courier from Nepal to Malaysia | Kuala Lumpur Parcel and Cargo",
      description:
        "Send parcels from Nepal to Malaysia by air into Kuala Lumpur. Food screening and halal requirements, delivery to factory hostels in Penang and Johor, and documents.",
      eyebrow: "Nepal to Malaysia",
      heading: "Shipping from Nepal to Malaysia",
      lede:
        "Malaysia holds one of the largest Nepali workforces anywhere, and it is not concentrated in the capital — it is in the electronics plants of Penang, the factories of Johor, the plantations and the security industry. The lane is short and well served; the thing to get right before you pack is food.",
      serviceType: "International air freight and express courier",
      audience: {
        title: "Workers across the manufacturing belt, and students",
        body:
          "Nepalis in Malaysia work in electronics manufacturing, plantations, construction, security and services, and most live in employer accommodation near the plant or site. Families send food from home, clothes for Dashain and Tihar, documents and medicine. A newer student population at Malaysian universities uses the same lane for smaller parcels, more often.",
      },
      goods: [
        "Packaged Nepali food, spices, lentils and snacks",
        "Clothes and festival wear",
        "Documents for permit and contract renewals",
        "Medicines, cleared with us in advance",
        "Gifts and small electronics",
      ],
      modes: {
        air: "Direct and one-stop services operate between Kathmandu and Kuala Lumpur, then onto the Malaysian domestic network including Penang, Johor and East Malaysia.",
        surfaceLabel: "Sea freight",
        surface:
          "Road to Kolkata or Haldia, then sea to Port Klang. A multi-week multimodal route that suits commercial volume rather than anything a family sends.",
        speed:
          "Air transit on this lane is short — days rather than weeks — and domestic delivery within peninsular Malaysia is quick. East Malaysia adds a leg. Food screening at import is the step that can slow a shipment, which is why the contents declaration matters more here than the routing does.",
      },
      paperwork: [
        "A commercial invoice with an accurate description, ingredient-level for food",
        "A packing list for each carton",
        "The recipient's full name, Malaysian mobile number and full address with postcode",
        "The employer and hostel name where the recipient lives in company accommodation",
        "For commercial food, the importer's details and any certification the product needs",
      ],
      watchOut: {
        title: "Food is screened, and commercial food needs more than an invoice",
        body:
          "Malaysia screens imported food and agricultural products, and a parcel declared simply as 'food' invites exactly the inspection you do not want. Describe the contents at ingredient level on the invoice. If you are shipping commercially rather than sending a family parcel, food products generally need certification arranged before import — halal certification among them for the categories that require it — and that is a step to resolve before the goods travel, not at the border. Screening is run by MAQIS, and halal certification is mandatory for meat and animal-based products specifically rather than for food in general — by a body JAKIM recognises, not any certificate at all.",
      },
      arrival: {
        title: "Factory hostels and plantation addresses",
        body:
          "Most recipients live in employer-provided hostels attached to a plant, site or estate. Give us the employer's name, the hostel name, the full address with the postcode, and a Malaysian mobile number — delivery is arranged by phone and shift work is normal, so tell us when the recipient can be reached. East Malaysia deliveries take longer than peninsular ones.",
      },
      faqs: [
        {
          question: "Can I send Nepali food to a worker in Malaysia?",
          answer:
            "Sealed, commercially packaged dry goods generally travel — spices, lentils, instant noodles, packaged snacks. Meat products, home-cooked food and fresh produce are the categories that get held. Describe the contents at ingredient level on the invoice rather than writing 'food', which is what triggers an inspection.",
        },
        {
          question: "Can you deliver to a factory hostel in Penang or Johor?",
          answer:
            "Yes, and that is where most of this lane goes. We need the employer's name, the hostel name, the full address with postcode and a Malaysian mobile. Shift patterns are normal, so let us know when the recipient can take a call.",
        },
        {
          question: "I want to send food commercially, not as a gift. What changes?",
          answer:
            "Quite a lot. Commercial food imports generally need the importer's details and certification arranged before the goods arrive, including halal certification for the product categories that require it. Sea freight through Port Klang also starts to make sense at that volume. Talk to us before the first shipment.",
        },
      ],
    },
    inbound: {
      title: "Shipping to Nepal from Malaysia | Kuala Lumpur to Nepal Cargo",
      description:
        "Send parcels and belongings home to Nepal from Malaysia. Shared consolidation for workers, customs duty in Nepal, and delivery to districts outside Kathmandu.",
      eyebrow: "Malaysia to Nepal",
      heading: "Shipping to Nepal from Malaysia",
      lede:
        "A lot of this lane is one worker sending one box, which is the most expensive way to ship anything. If several people from the same factory are sending to the same part of Nepal, it is usually worth combining the shipment — that is a service we run, and it is the most useful thing on this page.",
      serviceType: "International air freight, consolidation and delivery to Nepal",
      audience: {
        title: "Workers sending home, often several at once",
        body:
          "Nepali workers across the Malaysian manufacturing belt send home steadily rather than in one go: electronics bought in Penang, clothes, household goods, gifts before a festival. Because they live and work together, the senders on this lane are frequently colleagues from the same district, which makes consolidation genuinely practical here in a way it is not on most corridors. Students and returning workers add end-of-term and end-of-contract shipments.",
      },
      goods: [
        "Electronics and phone accessories",
        "Clothes, shoes and household goods",
        "Kitchen equipment and small appliances",
        "Gifts and food products for Dashain and Tihar",
        "End-of-contract belongings as unaccompanied effects",
      ],
      modes: {
        air: "Air from Kuala Lumpur into Kathmandu, cleared at Tribhuvan International Airport. Short sector, regular capacity, and the right choice for almost everything on this lane.",
        surfaceLabel: "Sea freight",
        surface:
          "Port Klang to Kolkata or Haldia, then overland into Nepal. Only worth it for a large consolidated load with weeks to spare.",
        speed:
          "Air transit is short. Clearance in Kathmandu and the onward district leg are what make up most of the elapsed time, and the district leg is the one people underestimate when they are aiming for a festival date.",
      },
      paperwork: [
        "An itemised list with the price paid for each item",
        "Receipts for electronics and high-value goods",
        "For a consolidated shipment, a separate list and recipient for each sender's portion",
        "Each recipient's full name, Nepali mobile number, district and a landmark",
        "A copy of each recipient's citizenship certificate",
      ],
      watchOut: {
        title: "Share a shipment instead of sending four small boxes",
        body:
          "Freight does not scale linearly with weight, so four colleagues each sending a small box pay considerably more between them than one combined shipment would cost. We can consolidate and then split the delivery to different recipients in Nepal, provided each portion comes with its own itemised list and its own recipient details. The paperwork discipline is the price of the saving: one undocumented box in a consolidated load slows the whole consignment at clearance.",
      },
      arrival: {
        title: "One clearance, several districts",
        body:
          "A consolidated shipment clears once in Kathmandu and then splits onto our domestic network for delivery to each recipient's district. Duty and VAT are assessed by Nepal Customs on classification and declared value, per portion — we will estimate it in advance from the lists so each sender knows what their share is. Our district coverage is listed under /courier.",
      },
      faqs: [
        {
          question: "Can several of us combine one shipment to Nepal?",
          answer:
            "Yes, and it is usually the cheapest way to do it from Malaysia. We consolidate the load, clear it once and then deliver each person's portion to their own recipient and district. Each portion needs its own itemised list and recipient details, which is what makes the customs side work.",
        },
        {
          question: "Will my family have to pay duty?",
          answer:
            "Nepal Customs assesses duty and VAT on arrival based on the type of goods and the declared value, gifts included. Send us the itemised list and we will estimate the charge in advance, and you can settle it from Malaysia rather than leaving it to the person collecting the shipment.",
        },
        {
          question: "Can you deliver to my district?",
          answer:
            "Yes. After clearance the shipment moves on our domestic network across the districts. Give us the district, municipality, a landmark and a Nepali mobile number; the handover outside the valley is arranged by phone, and a hill or far-western address takes longer than the valley.",
        },
        {
          question: "How long before Dashain should I send?",
          answer:
            "Earlier than the transit time suggests. The flight is short but clearance and the district leg both add time, and the weeks before Dashain are the busiest of the year on this lane. If the gift has to arrive by a date, talk to us well ahead rather than counting backwards from it.",
        },
      ],
    },
  },
];
