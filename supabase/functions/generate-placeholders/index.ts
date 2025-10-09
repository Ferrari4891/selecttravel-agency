import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const regionData = {
  "North America": {
    countries: [
      { name: "United States", cities: ["Albuquerque", "Anaheim", "Anchorage", "Arlington", "Atlanta", "Aurora", "Austin", "Bakersfield", "Baltimore", "Baton Rouge", "Boise", "Boston", "Buffalo", "Chandler", "Charlotte", "Chesapeake", "Chicago", "Chula Vista", "Cincinnati", "Cleveland", "Colorado Springs", "Columbus", "Corpus Christi", "Dallas", "Denver", "Detroit", "Durham", "El Paso", "Fort Wayne", "Fort Worth", "Fremont", "Fresno", "Garland", "Gilbert", "Glendale", "Greensboro", "Henderson", "Hialeah", "Honolulu", "Houston", "Irvine", "Irving", "Jacksonville", "Jersey City", "Kansas City", "Las Vegas", "Laredo", "Lexington", "Lincoln", "Long Beach", "Los Angeles", "Louisville", "Lubbock", "Madison", "Memphis", "Mesa", "Miami", "Milwaukee", "Minneapolis", "Nashville", "Newark", "New Orleans", "New York", "Norfolk", "North Las Vegas", "Oakland", "Oklahoma City", "Omaha", "Orlando", "Philadelphia", "Phoenix", "Pittsburgh", "Plano", "Portland", "Raleigh", "Reno", "Richmond", "Riverside", "Sacramento", "San Antonio", "San Diego", "San Jose", "Santa Ana", "Scottsdale", "Seattle", "St. Louis", "St. Paul", "St. Petersburg", "Stockton", "Tampa", "Toledo", "Tucson", "Tulsa", "Virginia Beach", "Wichita", "Winston-Salem"].sort() },
      { name: "Canada", cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Mississauga", "Winnipeg", "Quebec City", "Hamilton"] },
      { name: "Mexico", cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Zapopan", "Mérida", "San Luis Potosí"] },
      { name: "Guatemala", cities: ["Guatemala City", "Mixco", "Villa Nueva", "Petapa", "San Juan Sacatepéquez", "Quetzaltenango", "Villa Canales", "Escuintla", "Chinautla", "Chimaltenango"] },
      { name: "Costa Rica", cities: ["San José", "Cartago", "Alajuela", "Puntarenas", "Heredia", "Limón", "Desamparados", "San Isidro", "Curridabat", "San Vicente"] },
      { name: "Jamaica", cities: ["Kingston", "Spanish Town", "Portmore", "May Pen", "Old Harbour", "Mandeville", "Savanna-la-Mar", "Ocho Rios", "Linstead", "Half Way Tree"] },
      { name: "Panama", cities: ["Panama City", "San Miguelito", "Tocumen", "David", "Arraiján", "Colón", "La Chorrera", "Pacora", "Penonome", "Santiago"] },
      { name: "Honduras", cities: ["Tegucigalpa", "San Pedro Sula", "Choloma", "La Ceiba", "El Progreso", "Choluteca", "Comayagua", "Puerto Cortés", "La Lima", "Danlí"] },
      { name: "El Salvador", cities: ["San Salvador", "Soyapango", "Santa Ana", "San Miguel", "Mejicanos", "Santa Tecla", "Apopa", "Delgado", "Ilopango", "Cojutepeque"] },
      { name: "Nicaragua", cities: ["Managua", "León", "Masaya", "Matagalpa", "Chinandega", "Granada", "Estelí", "Tipitapa", "Jinotepe", "Diriamba"] }
    ]
  },
  "Europe": {
    countries: [
      { name: "United Kingdom", cities: ["London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds", "Sheffield", "Edinburgh", "Bristol", "Cardiff"] },
      { name: "France", cities: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Montpellier", "Strasbourg", "Bordeaux", "Lille"] },
      { name: "Germany", cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen"] },
      { name: "Italy", cities: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania"] },
      { name: "Spain", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao"] },
      { name: "Netherlands", cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Tilburg", "Almere", "Breda", "Nijmegen"] },
      { name: "Poland", cities: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin", "Białystok"] },
      { name: "Portugal", cities: ["Lisbon", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", "Almada", "Funchal", "Coimbra", "Setúbal", "Agualva-Cacém"] },
      { name: "Sweden", cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg", "Jönköping", "Norrköping"] },
      { name: "Norway", cities: ["Oslo", "Bergen", "Stavanger", "Trondheim", "Drammen", "Fredrikstad", "Kristiansand", "Sandnes", "Tromsø", "Sarpsborg"] }
    ]
  },
  "Asia": {
    countries: [
      { name: "Japan", cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Kobe", "Nagoya", "Sapporo", "Fukuoka", "Hiroshima", "Sendai"] },
      { name: "China", cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Xi'an", "Nanjing", "Wuhan", "Tianjin"] },
      { name: "India", cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"] },
      { name: "South Korea", cities: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan", "Changwon", "Goyang"] },
      { name: "Thailand", cities: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Hat Yai", "Nakhon Ratchasima", "Udon Thani", "Khon Kaen", "Nakhon Si Thammarat", "Chiang Rai"] },
      { name: "Vietnam", cities: ["Ho Chi Minh City", "Hanoi", "Danang", "Can Tho", "Bien Hoa", "Hue", "Nha Trang", "Buon Ma Thuot", "Vung Tau", "Nam Dinh"] },
      { name: "Indonesia", cities: ["Jakarta", "Surabaya", "Medan", "Bandung", "Bekasi", "Palembang", "Tangerang", "Makassar", "South Tangerang", "Batam"] },
      { name: "Malaysia", cities: ["Kuala Lumpur", "George Town", "Ipoh", "Shah Alam", "Petaling Jaya", "Johor Bahru", "Seremban", "Kuala Terengganu", "Kota Kinabalu", "Klang"] },
      { name: "Singapore", cities: ["Singapore", "Jurong East", "Woodlands", "Tampines", "Sengkang", "Hougang", "Yishun", "Bedok", "Punggol", "Ang Mo Kio"] },
      { name: "Philippines", cities: ["Manila", "Quezon City", "Caloocan", "Davao", "Cebu City", "Zamboanga", "Antipolo", "Pasig", "Taguig", "Valenzuela"] }
    ]
  },
  "South America": {
    countries: [
      { name: "Brazil", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"] },
      { name: "Argentina", cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Tucumán", "La Plata", "Mar del Plata", "Salta", "Santa Fe", "San Juan"] },
      { name: "Colombia", cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira", "Santa Marta", "Ibagué"] },
      { name: "Chile", cities: ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco", "Rancagua", "Talca", "Arica", "Chillán"] },
      { name: "Peru", cities: ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Iquitos", "Cusco", "Chimbote", "Huancayo", "Tacna"] },
      { name: "Venezuela", cities: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana", "San Cristóbal", "Maturín", "Ciudad Bolívar", "Cumana"] },
      { name: "Ecuador", cities: ["Guayaquil", "Quito", "Cuenca", "Santo Domingo", "Machala", "Durán", "Manta", "Portoviejo", "Ambato", "Riobamba"] },
      { name: "Bolivia", cities: ["Santa Cruz", "El Alto", "La Paz", "Cochabamba", "Sucre", "Tarija", "Potosí", "Sacaba", "Quillacollo", "Oruro"] },
      { name: "Paraguay", cities: ["Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Capiatá", "Lambaré", "Fernando de la Mora", "Limpio", "Ñemby", "Encarnación"] },
      { name: "Uruguay", cities: ["Montevideo", "Salto", "Ciudad de la Costa", "Paysandú", "Las Piedras", "Rivera", "Maldonado", "Tacuarembó", "Melo", "Mercedes"] }
    ]
  },
  "Africa & Middle East": {
    countries: [
      { name: "South Africa", cities: ["Cape Town", "Johannesburg", "Durban", "Pretoria", "Port Elizabeth", "Pietermaritzburg", "Benoni", "Tembisa", "East London", "Vereeniging"] },
      { name: "Egypt", cities: ["Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Mansoura", "El Mahalla El Kubra", "Tanta"] },
      { name: "Nigeria", cities: ["Lagos", "Kano", "Ibadan", "Kaduna", "Port Harcourt", "Benin City", "Maiduguri", "Zaria", "Aba", "Jos"] },
      { name: "Kenya", cities: ["Nairobi", "Mombasa", "Nakuru", "Eldoret", "Kisumu", "Thika", "Malindi", "Kitale", "Garissa", "Kakamega"] },
      { name: "UAE", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Khor Fakkan", "Dibba Al-Fujairah"] },
      { name: "Saudi Arabia", cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Buraidah", "Khamis Mushait", "Hofuf"] },
      { name: "Morocco", cities: ["Casablanca", "Rabat", "Fez", "Marrakech", "Agadir", "Tangier", "Meknes", "Oujda", "Kenitra", "Tetouan"] },
      { name: "Turkey", cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Adana", "Gaziantep", "Konya", "Antalya", "Kayseri", "Mersin"] },
      { name: "Israel", cities: ["Jerusalem", "Tel Aviv", "Haifa", "Rishon LeZion", "Petah Tikva", "Ashdod", "Netanya", "Beer Sheva", "Holon", "Bnei Brak"] },
      { name: "Jordan", cities: ["Amman", "Zarqa", "Irbid", "Russeifa", "Wadi as-Sir", "Aqaba", "Madaba", "Sahab", "Mafraq", "Jerash"] },
      { name: "Lebanon", cities: ["Beirut", "Tripoli", "Sidon", "Tyre", "Nabatieh", "Zahle", "Baalbek", "Jounieh", "Byblos", "Aley"] },
      { name: "Qatar", cities: ["Doha", "Al Rayyan", "Umm Salal", "Al Khor", "Al Wakrah", "Dukhan", "Mesaieed", "Lusail", "Al Shamal", "Al Daayen"] }
    ]
  },
  "Oceania": {
    countries: [
      { name: "Australia", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Newcastle", "Canberra", "Sunshine Coast", "Wollongong", "Woolgoolga", "Coffs Harbour"] },
      { name: "New Zealand", cities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Napier-Hastings", "Dunedin", "Palmerston North", "Nelson", "Rotorua"] }
    ]
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting placeholder generation...');

    // Get a test user_id to associate with placeholders
    const { data: users, error: userError } = await supabaseClient
      .from('profiles')
      .select('user_id')
      .limit(1);

    if (userError || !users || users.length === 0) {
      throw new Error('No users found in profiles table');
    }

    const userId = users[0].user_id;
    console.log('Using user_id:', userId);

    const businessTypes = [
      { category: 'eat', subcategory: 'restaurant', type: 'Fine Dining' },
      { category: 'eat', subcategory: 'restaurant', type: 'Casual Dining' },
      { category: 'eat', subcategory: 'cafe', type: 'Coffee Shop' },
      { category: 'eat', subcategory: 'fastfood', type: 'Fast Food' },
      { category: 'drink', subcategory: 'bar', type: 'Cocktail Bar' },
      { category: 'drink', subcategory: 'bar', type: 'Sports Bar' },
      { category: 'drink', subcategory: 'pub', type: 'Traditional Pub' },
      { category: 'drink', subcategory: 'lounge', type: 'Lounge' },
      { category: 'drink', subcategory: 'nightclub', type: 'Nightclub' },
      { category: 'drink', subcategory: 'brewery', type: 'Brewery' }
    ];

    const tiers = [
      'firstclass', 'firstclass', 'firstclass',
      'premium', 'premium', 'premium',
      'basic', 'basic', 'basic', 'basic'
    ];

    let totalCreated = 0;
    const batchSize = 100;
    let currentBatch: any[] = [];

    // Iterate through all regions, countries, and cities
    for (const [regionName, regionObj] of Object.entries(regionData)) {
      for (const country of regionObj.countries) {
        for (const city of country.cities) {
          // Create 10 entries per city
          for (let i = 0; i < 10; i++) {
            const businessType = businessTypes[i % businessTypes.length];
            const tier = tiers[i];

            const business = {
              user_id: userId,
              business_name: 'BOUNCE BEACH',
              business_type: `${businessType.category} - ${businessType.subcategory}`,
              business_category: businessType.category,
              business_subcategory: businessType.subcategory,
              business_specific_type: businessType.type,
              description: `Test placeholder business for ${city}, ${country.name}`,
              city: city,
              country: country.name,
              address: `Test Address, ${city}`,
              phone: '+1-555-0100',
              email: 'placeholder@bouncebeach.com',
              website: 'https://bouncebeach.com',
              status: 'approved',
              subscription_tier: tier,
              subscription_status: 'active',
              wheelchair_access: true,
              pet_friendly: true,
              outdoor_seating: true
            };

            currentBatch.push(business);

            // Insert in batches
            if (currentBatch.length >= batchSize) {
              const { error } = await supabaseClient
                .from('businesses')
                .insert(currentBatch);

              if (error) {
                console.error('Batch insert error:', error);
              } else {
                totalCreated += currentBatch.length;
                console.log(`Created ${totalCreated} placeholders so far...`);
              }

              currentBatch = [];
            }
          }
        }
      }
    }

    // Insert remaining batch
    if (currentBatch.length > 0) {
      const { error } = await supabaseClient
        .from('businesses')
        .insert(currentBatch);

      if (error) {
        console.error('Final batch insert error:', error);
      } else {
        totalCreated += currentBatch.length;
      }
    }

    console.log(`Placeholder generation complete. Total created: ${totalCreated}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully created ${totalCreated} placeholder businesses`,
        totalCreated
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
