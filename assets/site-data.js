/* Melsa Elevators — company details, clients and projects shown on the public pages.
   Fill these in and the pages update automatically. Leave a field empty ("") to hide it. */
window.MELSA_SITE = {
  company: {
    phone: "",            // e.g. "+20 100 000 0000"
    whatsapp: "",         // international format, digits only, e.g. "201000000000"
    email: "",            // e.g. "info@melsaelevators.com"
    address_en: "",
    address_ar: "",
    mapsQuery: "",        // what to search on Google Maps, e.g. "Melsa Elevators, Nasr City, Cairo"
    hours_en: "",         // e.g. "Sat–Thu, 9:00–17:00"
    hours_ar: "",
    facebook: "",         // full link
    instagram: ""         // full link
  },

  /* Clients: { name_en, name_ar, logo: "assets/clients/xxx.png" (optional) } */
  clients: [],

  /* Projects: { title_en, title_ar, place_en, place_ar, type: "Residential|Villa|Hospital|Mall|Office|Hotel|Factory",
                 year: "2025", photos: ["assets/projects/xxx.jpg", ...], text_en, text_ar } */
  projects: []
};
