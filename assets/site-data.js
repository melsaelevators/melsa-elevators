/* Melsa Elevators — company details and clients shown on the public pages.
   Fill these in and the pages update automatically. Leave a field empty ("") to hide it. */
window.MELSA_SITE = {
  company: {
    phone: "02 2414 9833",   // landline
    mobile: "0100 525 2664",
    whatsapp: "201017765778", // international format, digits only (01017765778)
    email: "Milsalift@hotmail.com",
    address_en: "2 Ayoub Buildings, Hassan Aflaton St.",
    address_ar: "٢ عمارات أيوب، شارع حسن أفلاطون",
    mapsQuery: "30.0804633,31.3453222", // exact location of the office (from the Google Maps pin) // what to search on Google Maps
    hours_en: "",         // e.g. "Sat–Thu, 9:00–17:00"
    hours_ar: "",
    facebook: "",         // full link
    instagram: ""         // full link
  },

  /* Clients: { name_en, name_ar, logo: "assets/clients/xxx.png" (optional),
     cat: "hospitals" | "education" | "industry" | "construction" | "gov" | "business",
     photos: ["assets/projects/<client>/1.jpg", ...]  (project photos shown when the logo is tapped),
     text_en / text_ar: short description of the project (optional) } */
  clients: [
    { name_en: "Sonesta Hotels & Resorts", name_ar: "فنادق ومنتجعات سونستا", logo: "assets/clients/sonesta.png", cat: "business" },
    { name_en: "Administrative Control Authority", name_ar: "هيئة الرقابة الإدارية", logo: "assets/clients/aca.png", cat: "gov" },
    { name_en: "Al Rehab City Hall", name_ar: "جهاز مدينة الرحاب", logo: "assets/clients/rehab-city-hall.png", cat: "gov" },
    { name_en: "Al Maadi for Development & Construction", name_ar: "المعادي للتنمية والتعمير", logo: "assets/clients/al-maadi.png", cat: "construction" },
    { name_en: "Salam Specialized Hospital", name_ar: "مستشفى السلام التخصصي", logo: "assets/clients/salam-hospital.png", cat: "hospitals" },
    { name_en: "Al Zaitoun Specialized Hospital", name_ar: "مستشفى الزيتون التخصصي", logo: "assets/clients/zaitoun-hospital.png", cat: "hospitals" },
    { name_en: "El Nasr Mining Co.", name_ar: "شركة النصر للتعدين", logo: "assets/clients/el-nasr-mining.png", cat: "industry" },
    { name_en: "Heliopolis Co. for Chemical Industries", name_ar: "شركة هليوبوليس للصناعات الكيماوية", logo: "assets/clients/heliopolis-chemical.png", cat: "industry" },
    { name_en: "Middle East Glass (MEG)", name_ar: "ميدل إيست للزجاج", logo: "assets/clients/meg.png", cat: "industry" },
    { name_en: "United Glass Company", name_ar: "الشركة المتحدة للزجاج", logo: "assets/clients/united-glass.png", cat: "industry" },
    { name_en: "PIL", name_ar: "PIL", logo: "assets/clients/pil.png", cat: "business" },
    { name_en: "The Greek Campus", name_ar: "ذا جريك كامبس", logo: "assets/clients/geek-campus.png", cat: "education" },
    { name_en: "Al Seddik Community Development Association", name_ar: "جمعية الصديق لتنمية المجتمع", logo: "assets/clients/al-seddik.png", cat: "gov",
      photos: ["assets/projects/al-seddik/1.jpg?v=3"] },
    { name_en: "Italian Hospital Umberto I, Cairo", name_ar: "المستشفى الإيطالي أومبرتو الأول بالقاهرة", logo: "assets/clients/italian-hospital.png", cat: "hospitals" },
    { name_en: "Ain Shams University", name_ar: "جامعة عين شمس", logo: "assets/clients/ain-shams-university.png", cat: "education" },
    { name_en: "Al-Azhar University", name_ar: "جامعة الأزهر", logo: "assets/clients/al-azhar-university.png", cat: "education" },
    { name_en: "Canadian International College (CIC)", name_ar: "الكلية الكندية الدولية", logo: "assets/clients/cic.png", cat: "education" },
    { name_en: "The Arab Contractors", name_ar: "المقاولون العرب", logo: "assets/clients/arab-contractors.png", cat: "construction" },
    { name_en: "Consolidated Contractors Company (CCC)", name_ar: "شركة اتحاد المقاولين (CCC)", logo: "assets/clients/ccc.png", cat: "construction",
      photos: ["assets/projects/ccc/1.jpg?v=3", "assets/projects/ccc/2.jpg?v=3", "assets/projects/ccc/3.jpg?v=3"] },
    { name_en: "ACROW Misr", name_ar: "أكرو مصر", logo: "assets/clients/acrow.png", cat: "construction",
      photos: ["assets/projects/acrow/1.jpg?v=3", "assets/projects/acrow/2.jpg?v=3"] },
    { name_en: "ABB", name_ar: "ABB", logo: "assets/clients/abb.png", cat: "industry" },
    { name_en: "Ahmed El Sallab", name_ar: "أحمد السلاب", logo: "assets/clients/ahmed-el-sallab.png", cat: "business",
      photos: ["assets/projects/ahmed-el-sallab/1.jpg?v=3"] },
    { name_en: "Farm Cheese", name_ar: "فارم تشيز", logo: "assets/clients/farm-cheese.png", cat: "industry" },
    { name_en: "Syndicate of Applied Professions", name_ar: "نقابة التطبيقيين", logo: "assets/clients/applied-professions-syndicate.png", cat: "gov" },
    { name_en: "Syndicate of Commercial Professions", name_ar: "نقابة التجاريين", logo: "assets/clients/commercial-professions-syndicate.png", cat: "gov" }
  ]

};
